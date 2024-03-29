import * as anchor from "@project-serum/anchor";

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { assert, expect } from "chai";

import { StakingProgram } from "../app/lib";
import {
  WhitelistProof,
  Farm,
  Farmer,
  StakeReceipt,
} from "../app/lib/gen/accounts";
import { GemStillStaked } from "../app/lib/gen/errors/custom";
import { WhitelistType } from "../app/lib/gen/types";
import { LockConfigFields } from "../app/lib/gen/types/LockConfig";
import {
  findFarmAddress,
  findFarmerAddress,
  findStakeReceiptAddress,
  findWhitelistProofAddress,
} from "../app/lib/pda";
import { TripEffect } from "../app/lib/types";
import { findFarmLocks, withParsedError } from "../app/lib/utils";

const send = (
  connection: Connection,
  ixs: TransactionInstruction[],
  signers: Signer[]
) => {
  const tx = new Transaction().add(...ixs);

  return withParsedError(sendAndConfirmTransaction)(connection, tx, signers);
};

describe("staking-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const stakingClient = StakingProgram(connection);

  // Farm creator.
  const farmAuthority = anchor.web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(
      "V4D4Baxt5sinEbnAwg27H7R83o3m5DVEoCR9N3GeVDSD7vX3gS5fZRdPf3BijMJ3tuP71wDoKjAcfzE75bT9Gi3"
    )
  );
  // NFTs that will be staked.
  const nft = new PublicKey("SaCd2fYycnD2wcUJWZNfF2xGAVvcUaVeTnEz7MUibm5");

  const otherNft = new PublicKey(
    "F8DBPPFwjddGdqs4EXdJTj3xqC8NE8FzUEzYQfMXt8Rs"
  );

  // Whitelisted creator address. - Particles NFTs
  const creatorAddress = new PublicKey(
    "BXrvZdCNzvXFEW35mpLWPHgweTGVcMfuUJfLwxggQem"
  );

  // NFT that will be used as a buff.
  const buffCreator = new PublicKey(
    "J1E9xvBsE8gwfV8qXVxbQ6H2wfEEKjRaxS2ENiZm4h2D"
  );

  // Sunshine tabs NFTs to be used as buffer
  const buffMint = new PublicKey(
    "9nqYaDVzYgmednWYGgkGVjNt19hjUN3ZfoA34peHK7rY"
  );

  const userWallet = anchor.web3.Keypair.fromSecretKey(
    anchor.utils.bytes.bs58.decode(
      "2YFHVfWEbNAFJtJ2z2ENTfZXcpD982ggcKvZtmKhUz3o7Tm1fS5JSDf4se2xxjjvj2ykqF4t6QnjRwGxznaN82Ru"
    )
  );

  // $OOO token mint
  const rewardMint = new PublicKey(
    "BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu"
  );

  console.log("farmAuthority", farmAuthority.publicKey.toString());

  // 10 tokens per day = 10e2 / 86400 = 0.011574074074074073
  const whitelistRewardRatePerSecond = 0.011574074074074073;

  it.skip("should be able to create a new farm.", async () => {
    const { ix } = await stakingClient.createCreateFarmInstruction({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    await send(connection, ix, [farmAuthority]);

    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { authority, reward } = await Farm.fetch(connection, farm);

    expect(reward.reserved).to.equal(0);
    expect(reward.available).to.equal(0);
    expect(reward.mint.toString()).to.eql(rewardMint.toString());
    expect(authority.toString()).to.eql(farmAuthority.publicKey.toString());
  });

  it.skip("should be able to create new locks for a farm", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const lockConfigs: LockConfigFields[] = [
      { duration: new BN(0), bonusFactor: 0, cooldown: new BN(0) },
    ];

    const { ix } = await stakingClient.createCreateLocksInstruction({
      farm,
      authority: farmAuthority.publicKey,
      lockConfigs,
    });

    await send(connection, [ix], [farmAuthority]);

    const locks = (await findFarmLocks(connection, farm)).map((acc) =>
      acc.toJSON()
    );

    // console.log(locks);

    expect(locks.length).to.be.equal(lockConfigs.length);
    expect(locks.every((lock) => lock.farm === farm.toBase58())).to.be.true;
  });

  it.skip("should be able to fund a farm's rewards", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint: rewardMint,
    });

    const { ix } = await stakingClient.createFundRewardInstruction({
      farm,
      authority: farmAuthority.publicKey,
      amount: 100e2,
    });

    const farmVault = await anchor.utils.token.associatedAddress({
      mint: rewardMint,
      owner: farm,
    });

    const txid = await send(connection, [ix], [farmAuthority]);
    const farmAccount = await Farm.fetch(connection, farm);
  });

  it("should be able to whitelist a creator address", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    // const whitelistBuff = await stakingClient.createAddToWhitelistInstruction({
    //   farm,
    //   authority: farmAuthority.publicKey,
    //   // Since this is a buff, the rewardRate will act as a multiplier.
    //   // Here it will buff the pair reward in 2x.
    //   rewardRate: { tokenAmount: 2, intervalInSeconds: 1 },
    //   creatorOrMint: buffCreator,
    //   whitelistType: new WhitelistType.Buff(),
    // });

    const whitelistCreator =
      await stakingClient.createAddToWhitelistInstruction({
        creatorOrMint: creatorAddress,
        authority: farmAuthority.publicKey,
        farm,
        rewardRate: {
          tokenAmount: whitelistRewardRatePerSecond,
          intervalInSeconds: 1,
        },
        whitelistType: new WhitelistType.Creator(),
      });

    const whitelistNFTabs = await stakingClient.createAddToWhitelistInstruction(
      {
        creatorOrMint: new anchor.web3.PublicKey(
          "AFW3EJSbVep5uG643Qk7JLyRR2W5PVK39ECZrKBzkBP3"
        ),
        authority: farmAuthority.publicKey,
        farm,
        rewardRate: {
          tokenAmount: 0,
          intervalInSeconds: 1,
        },
        whitelistType: new WhitelistType.Creator(),
      }
    );

    await send(
      connection,
      [/** whitelistBuff.ix */ whitelistCreator.ix, whitelistNFTabs.ix],
      [farmAuthority]
    );

    const whitelistProof = findWhitelistProofAddress({
      farm,
      creatorOrMint: creatorAddress,
    });

    const whitelistProofAccount = await WhitelistProof.fetch(
      connection,
      whitelistProof
    );

    expect(whitelistProofAccount.farm.toString()).to.eql(farm.toString());
    expect(whitelistProofAccount.whitelistedAddress.toString()).to.eql(
      creatorAddress.toString()
    );
    expect(whitelistProofAccount.ty.kind).to.equal("Creator");
    expect(whitelistProofAccount.rewardRate).to.equal(
      whitelistRewardRatePerSecond
    );
  });

  it.skip("should be able to whitelist a mint address", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = await stakingClient.createAddToWhitelistInstruction({
      creatorOrMint: rewardMint,
      authority: farmAuthority.publicKey,
      farm,
      rewardRate: { tokenAmount: 1, intervalInSeconds: 1 },
      whitelistType: new WhitelistType.Mint(),
    });

    await send(connection, [ix], [farmAuthority]);

    const whitelistProof = findWhitelistProofAddress({
      farm,
      creatorOrMint: rewardMint,
    });

    const whitelistProofAccount = await WhitelistProof.fetch(
      connection,
      whitelistProof
    );

    expect(whitelistProofAccount.farm.toString()).to.eql(farm.toString());
    expect(whitelistProofAccount.whitelistedAddress.toString()).to.eql(
      rewardMint.toString()
    );
    expect(whitelistProofAccount.rewardRate).to.equal(1);
  });

  it.skip("should be able to initialize a farmer", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = await stakingClient.createInitializeFarmerInstruction({
      farm,
      owner: userWallet.publicKey,
    });

    await send(connection, [ix], [userWallet]);

    const farmer = findFarmerAddress({
      farm,
      owner: userWallet.publicKey,
    });

    const { totalRewardRate, accruedRewards, owner } = await Farmer.fetch(
      connection,
      farmer
    );

    expect(totalRewardRate).to.equal(0);
    expect(accruedRewards).to.equal(0);
    expect(owner.toString()).to.eql(userWallet.publicKey.toString());
  });

  it.skip("should be able to stake an NFT", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const locks = await findFarmLocks(connection, farm);
    const lock = locks.find((lock) => lock.bonusFactor === 0);

    const tripEffect: TripEffect = "None";

    const { ix } = await stakingClient.createStakeInstruction({
      farm,
      mint: nft,
      lock: lock.address,
      owner: userWallet.publicKey,
      args: { amount: new BN(1), tripEffect },
    });

    const txid = await send(connection, [ix], [userWallet]);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });

    const farmerAccount = await Farmer.fetch(connection, farmer);
    const { reward } = await Farm.fetch(connection, farm);

    const expectedRewardRate =
      whitelistRewardRatePerSecond * (1 + lock.bonusFactor / 100);
    const expectedReservedReward =
      expectedRewardRate * lock.duration.toNumber();

    expect(farmerAccount.totalRewardRate).to.equal(expectedRewardRate);
  });

  it.skip("should be able to buff a pair", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const locks = await findFarmLocks(connection, farm);
    const lock = locks.find((lock) => lock.bonusFactor === 0);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });
    const farmerAccount = await Farmer.fetch(connection, farmer);

    const stakeNft = await stakingClient.createStakeInstruction({
      farm,
      owner: userWallet.publicKey,
      mint: otherNft,
      lock: lock.address,
      args: { amount: new BN(1), tripEffect: "None" },
    });

    const { ix } = await stakingClient.createBuffPairInstruction({
      farm,
      buffMint,
      pair: [nft, otherNft],
      authority: userWallet.publicKey,
    });

    await send(connection, [stakeNft.ix], [farmAuthority, userWallet]);

    await send(connection, [ix], [farmAuthority, userWallet]);

    const farmerAccount2 = await Farmer.fetch(connection, farmer);

    expect(farmerAccount2.totalRewardRate).to.equal(
      whitelistRewardRatePerSecond * 4
    );
  });

  it.skip("should be able to debuff a pair", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = await stakingClient.createDebuffPairInstruction({
      farm,
      buffMint,
      pair: [nft, otherNft],
      authority: userWallet.publicKey,
    });

    const unstakeOtherNft = await stakingClient.createUnstakeInstruction({
      farm,
      owner: userWallet.publicKey,
      mint: otherNft,
    });

    await send(connection, [ix, unstakeOtherNft.ix], [userWallet]);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });
    const farmerAccount = await Farmer.fetch(connection, farmer);

    expect(farmerAccount.totalRewardRate).to.equal(
      whitelistRewardRatePerSecond
    );
  });

  it.skip("should be able to unstake an NFT", async () => {
    // Sleep for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });

    const { ix } = await stakingClient.createUnstakeInstruction({
      farm,
      mint: nft,
      owner: userWallet.publicKey,
    });

    await send(connection, [ix], [userWallet]);

    const stakeReceipt = findStakeReceiptAddress({ farmer, mint: nft });

    const { totalRewardRate } = await Farmer.fetch(connection, farmer);
    const { endTs } = await StakeReceipt.fetch(connection, stakeReceipt);

    expect(totalRewardRate).to.equal(0);
    expect(endTs.toNumber()).to.be.closeTo(Math.floor(Date.now() / 1000), 1);
  });

  it.skip("should be able to stake a fungible token", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const locks = await findFarmLocks(connection, farm);
    const lock = locks.find((lock) => lock.bonusFactor === 0);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });

    // Stake 0.5 tokens
    const { ix } = await stakingClient.createStakeInstruction({
      farm,
      mint: rewardMint,
      lock: lock.address,
      owner: userWallet.publicKey,
      args: { amount: new BN(5e2), tripEffect: "None" },
    });

    await send(connection, [ix], [userWallet]);

    const { totalRewardRate } = await Farmer.fetch(connection, farmer);
    const expectedRewardRate = 5e2 * Math.floor(1 + lock.bonusFactor / 100);

    expect(totalRewardRate).to.eql(expectedRewardRate);
  });

  it.skip("should not be able to stake more while still staking", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const locks = await findFarmLocks(connection, farm);
    const lock = locks.find((lock) => lock.bonusFactor === 0);

    try {
      const { ix } = await stakingClient.createStakeInstruction({
        farm,
        mint: rewardMint,
        lock: lock.address,
        owner: userWallet.publicKey,
        args: { amount: new BN(5e2), tripEffect: "None" },
      });

      await send(connection, [ix], [userWallet]);
      assert(false);
    } catch (e) {
      expect(e).to.be.instanceOf(GemStillStaked);
    }
  });

  it.skip("should be able to remove and address from the whitelist", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = stakingClient.createRemoveFromWhitelistInstruction({
      farm,
      authority: farmAuthority.publicKey,
      addressToRemove: rewardMint,
    });

    await send(connection, [ix], [farmAuthority]);

    const whitelistProof = findWhitelistProofAddress({
      farm,
      creatorOrMint: rewardMint,
    });
    const whitelistProofAccount = await WhitelistProof.fetch(
      connection,
      whitelistProof
    );

    expect(whitelistProofAccount).to.be.null;
  });

  it.skip("should be able to unstake a fungible token", async () => {
    // Sleep for 2 seconds so the rewards get updated.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = await stakingClient.createUnstakeInstruction({
      farm,
      mint: rewardMint,
      owner: userWallet.publicKey,
    });

    await send(connection, [ix], [userWallet]);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });
    const stakeReceipt = findStakeReceiptAddress({ farmer, mint: rewardMint });

    const farmerAccount = await Farmer.fetch(connection, farmer);
    const { endTs } = await StakeReceipt.fetch(connection, stakeReceipt);

    expect(farmerAccount.totalRewardRate).to.equal(0);
    expect(endTs.toNumber()).to.be.closeTo(Math.floor(Date.now() / 1000), 1);
  });

  it.skip("should be able to claim rewards", async () => {
    const farm = findFarmAddress({
      authority: farmAuthority.publicKey,
      rewardMint,
    });

    const { ix } = await stakingClient.createClaimRewardsInstruction({
      farm,
      authority: userWallet.publicKey,
    });

    const txid = await send(connection, [ix], [userWallet]);

    const farmer = findFarmerAddress({ farm, owner: userWallet.publicKey });
    const farmerAccount = await Farmer.fetch(connection, farmer);

    expect(farmerAccount.accruedRewards).to.equal(0);
  });
});
