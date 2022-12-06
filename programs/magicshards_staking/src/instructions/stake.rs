use anchor_lang::prelude::*;
use anchor_spl::{ associated_token::AssociatedToken, token::{ Mint, Token, TokenAccount } };

use crate::{ error::*, state::*, utils::* };

#[derive(Accounts)]
pub struct Stake<'info> {
  #[account(mut)]
  pub farm: Account<'info, Farm>,

  #[account(
        mut,
        has_one = farm,
        has_one = owner,
        seeds = [
            Farmer::PREFIX,
            farm.key().as_ref(),
            owner.key().as_ref()
        ],
        bump,
    )]
  pub farmer: Account<'info, Farmer>,

  pub gem_mint: Account<'info, Mint>,

  #[account(has_one = farm)]
  pub whitelist_proof: Account<'info, WhitelistProof>,

  #[account(
    init_if_needed,
    payer = owner,
    associated_token::mint = gem_mint,
    associated_token::authority = farmer
  )]
  pub farmer_vault: Box<Account<'info, TokenAccount>>,

  #[account(
        mut,
        associated_token::mint = gem_mint,
        associated_token::authority = owner,
    )]
  pub gem_owner_ata: Box<Account<'info, TokenAccount>>,

  #[account(
    init_if_needed,
    payer = owner,
    space = 8 + StakeReceipt::LEN,
    seeds = [StakeReceipt::PREFIX, farmer.key().as_ref(), gem_mint.key().as_ref()],
    bump
  )]
  pub stake_receipt: Account<'info, StakeReceipt>,

  #[account(has_one = farm)]
  pub lock: Account<'info, Lock>,

  #[account(mut)]
  pub owner: Signer<'info>,

  pub rent: Sysvar<'info, Rent>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
}

impl Stake<'_> {
  pub fn lock_gem(&self, amount: u64) -> Result<()> {
    if amount == 0 {
      return Ok(());
    }
    let cpi_ctx = transfer_spl_ctx(
      self.gem_owner_ata.to_account_info(),
      self.farmer_vault.to_account_info(),
      self.owner.to_account_info(),
      self.token_program.to_account_info()
    );

    anchor_spl::token::transfer(cpi_ctx, amount)
  }
}

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, Stake<'info>>,
  amount: u64,
  level: u8
) -> Result<()> {
  let whitelist_proof = &ctx.accounts.whitelist_proof;

  WhitelistProof::validate(
    whitelist_proof,
    &ctx.accounts.gem_mint,
    ctx.program_id,
    ctx.remaining_accounts
  )?;

  if let WhitelistType::Buff = whitelist_proof.ty {
    msg!("Cannot stake a buff NFT.");
    return err!(StakingError::InvalidWhitelistType);
  }

  // Lock the nft to the farmer account.
  ctx.accounts.lock_gem(amount)?;

  let now_ts = now_ts()?;

  let decimals = 2;
  let emission = level_emission(level, decimals)?;
  let factor = ctx.accounts.lock.bonus_factor;
  let base_rate = (amount as f64) * (ctx.accounts.whitelist_proof.reward_rate + (emission as f64));
  let reward_rate = calculate_reward_rate(base_rate, factor as f64)?;

  let stake_receipt = &mut ctx.accounts.stake_receipt;

  if stake_receipt.farmer == Pubkey::default() {
    **stake_receipt = StakeReceipt {
      end_ts: None,
      start_ts: now_ts,
      lock: ctx.accounts.lock.key(),
      farmer: ctx.accounts.farmer.key(),
      mint: ctx.accounts.gem_mint.key(),
      buff: None,
      reward_rate,
      amount,
    };
  } else {
    // Receipt account already existed.
    // We're either trying to stake an NFT again, or just trying to stake more fungible tokens.
    match stake_receipt.end_ts {
      // This gem has already been unstaked.
      Some(end_ts) => {
        let cooldown = ctx.accounts.lock.cooldown;
        require_gte!(now_ts, end_ts + cooldown, StakingError::CooldownIsNotOver);

        // Here the cooldown is already over, so just update the receipt with the new
        // information.
        stake_receipt.end_ts = None;
        stake_receipt.start_ts = now_ts;
        stake_receipt.lock = ctx.accounts.lock.key();
        stake_receipt.reward_rate = reward_rate;
        stake_receipt.amount = amount;
      }
      None => {
        return err!(StakingError::GemStillStaked);
      }
    }
  }

  ctx.accounts.farmer.increase_reward_rate(reward_rate as f64)?;

  Ok(())
}

fn tokens_per_second(amount: u64, decimals: u32) -> Result<u64> {
  (10_u64)
    .checked_pow(decimals)
    .ok_or(StakingError::ArithmeticError)?
    .checked_mul(amount)
    .ok_or(StakingError::ArithmeticError)?
    .checked_div(86_400)
    .ok_or_else(|| error!(StakingError::ArithmeticError))
}

/// Converts a level to a reward_rate (tokens/sec).
fn level_emission(level: u8, decimals: u32) -> Result<u64> {
  let emissions = [0, 2, 3, 4, 6];
  let emission = emissions.get(level as usize).ok_or(StakingError::InvalidTripEffect)?;

  tokens_per_second(*emission, decimals)
}