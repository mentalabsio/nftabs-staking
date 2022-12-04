use anchor_lang::{ prelude::*, system_program };
use anchor_spl::token;
use solutils::wrappers::metadata::MetadataAccount;

pub fn initialize_pda<'info>(
  seeds: &[&[u8]],
  space: usize,
  owner: &Pubkey,
  account: AccountInfo<'info>,
  payer: AccountInfo<'info>,
  system_program: AccountInfo<'info>
) -> Result<()> {
  let rent = Rent::get()?.minimum_balance(space);

  let cpi_accounts = system_program::CreateAccount {
    from: payer,
    to: account,
  };

  let cpi_ctx = CpiContext::new(system_program, cpi_accounts);

  system_program::create_account(cpi_ctx.with_signer(&[seeds]), rent, space as u64, owner)
}

pub fn transfer_spl_ctx<'a, 'b, 'c, 'info>(
  from: AccountInfo<'info>,
  to: AccountInfo<'info>,
  authority: AccountInfo<'info>,
  token_program: AccountInfo<'info>
) -> CpiContext<'a, 'b, 'c, 'info, token::Transfer<'info>> {
  CpiContext::new(token_program, token::Transfer {
    from,
    to,
    authority,
  })
}

pub fn calculate_reward_rate(base: f64, factor: f64) -> Result<f64> {
  if factor == 0.0 {
    return Ok(base);
  }

  // (factor + 100) * base / 100;
  let rate = factor + (100.0 * base) / 100.0;

  Ok(rate)
}

pub fn metadata_creator(metadata: &MetadataAccount) -> Result<Pubkey> {
  Ok(
    metadata.data.creators
      .as_ref()
      .ok_or(ProgramError::InvalidAccountData)?
      .get(0)
      .and_then(|creator| creator.verified.then(|| creator.address))
      .ok_or(ProgramError::InvalidAccountData)?
  )
}

pub fn now_ts() -> Result<u64> {
  Clock::get()
    .map(|c| c.unix_timestamp as u64)
    .map_err(Into::into)
}