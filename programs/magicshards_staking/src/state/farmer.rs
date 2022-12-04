use anchor_lang::prelude::*;

use crate::{ utils::now_ts };

#[account]
pub struct Farmer {
  pub farm: Pubkey,
  pub owner: Pubkey,
  accrued_rewards: f64,
  total_reward_rate: f64,
  last_update: u64,
  pub bump: [u8; 1],
}

impl Farmer {
  pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 1;
  pub const PREFIX: &'static [u8] = b"farmer";

  pub fn seeds(&self) -> [&[u8]; 4] {
    [Self::PREFIX, self.farm.as_ref(), self.owner.as_ref(), self.bump.as_ref()]
  }

  pub fn new(farm: Pubkey, owner: Pubkey, bump: u8) -> Result<Self> {
    Ok(Self {
      farm,
      owner,
      accrued_rewards: 0.0,
      total_reward_rate: 0.0,
      last_update: now_ts()?,
      bump: [bump],
    })
  }

  pub fn claim_accrued(&mut self) -> Result<f64> {
    self.update_accrued_rewards()?;

    let reward = self.accrued_rewards;

    // farm.reward.try_release(reward)?;

    self.accrued_rewards = 0.0;

    Ok(reward)
  }

  pub fn update_accrued_rewards(&mut self) -> Result<()> {
    let now = now_ts()?;
    let elapsed = now.saturating_sub(self.last_update);
    let increment = self.total_reward_rate * (elapsed as f64);

    if increment > 0.0 {
      // Before updating, we try to reserve the reward.

      self.accrued_rewards = self.accrued_rewards + increment;
    }

    self.last_update = now;

    Ok(())
  }

  pub fn increase_reward_rate(&mut self, increment: f64) -> Result<()> {
    self.total_reward_rate = self.total_reward_rate + increment;

    Ok(())
  }

  pub fn decrease_reward_rate(&mut self, decrement: f64) -> Result<()> {
    self.total_reward_rate = self.total_reward_rate - decrement;

    Ok(())
  }
}