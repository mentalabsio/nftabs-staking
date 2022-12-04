use anchor_lang::prelude::*;

#[derive(Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct Reward {
  pub mint: Pubkey,
  pub reserved: f64,
  pub available: f64,
}

impl Reward {
  pub const LEN: usize = 32 + 8 + 8;

  pub fn new(mint: Pubkey) -> Self {
    Self {
      mint,
      reserved: 0.0,
      available: 0.0,
    }
  }
}

#[account]
pub struct Farm {
  pub authority: Pubkey,
  pub reward: Reward,
  pub bump: [u8; 1],
}

impl Farm {
  pub const LEN: usize = 32 + Reward::LEN + 1;
  pub const PREFIX: &'static [u8] = b"farm";

  pub fn seeds(&self) -> [&[u8]; 4] {
    [Self::PREFIX, self.authority.as_ref(), self.reward.mint.as_ref(), &self.bump]
  }
}