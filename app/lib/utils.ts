import {
  Metadata,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { web3, utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import { Lock } from "./gen/accounts";
import { fromTxError } from "./gen/errors";
import { PROGRAM_ID } from "./gen/programId";

type ProgramAccounts = {
  pubkey: web3.PublicKey;
  account: web3.AccountInfo<Buffer>;
};

type LockAccount = Lock & { address: web3.PublicKey };

export const findFarmLocks = async (
  connection: web3.Connection,
  farm: web3.PublicKey
): Promise<LockAccount[]> => {
  const dataSize = 8 + Lock.layout.span;
  const filters = [
    { dataSize },
    accountFilter(Lock.discriminator),
    memcmp(8, farm.toBase58()),
  ];

  const accounts = await fetchAccounts(connection, filters);

  return Promise.all(
    accounts.map(async ({ pubkey, account }) => {
      return Object.assign(Lock.decode(account.data), { address: pubkey });
    })
  );
};

export type FoundCreator = {
  metadataAddress: web3.PublicKey;
  creatorAddress: web3.PublicKey;
};

export const tryFindCreator = async (
  connection: web3.Connection,
  mint: web3.PublicKey
): Promise<FoundCreator | null> => {
  try {
    const metadataAddress = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      )
    )[0];

    // Try to find metadata account.
    const metadataAccount = await Metadata.fromAccountAddress(
      connection,
      metadataAddress
    );

    // If we do, then we're trying to stake an NFT.
    const creatorAddress = new web3.PublicKey(
      metadataAccount.data.creators.find((c) => c.verified).address
    );

    return { creatorAddress, metadataAddress };
  } catch (e) {
    return;
  }
};

// Helper function to handle the errors generated by the program.
export function withParsedError<T, U>(
  fn: (...args: T[]) => Promise<U>
): (...args: T[]) => Promise<U> {
  return async function (...args: T[]) {
    try {
      return await fn(...args);
    } catch (e) {
      const parsed = fromTxError(e);

      if (parsed != null) {
        throw parsed;
      }

      throw e;
    }
  };
}

const memcmp = (offset: number, bytes: string): web3.MemcmpFilter => {
  return {
    memcmp: {
      offset,
      bytes,
    },
  };
};

const accountFilter = (discriminator: Buffer) => {
  return memcmp(0, utils.bytes.bs58.encode(discriminator));
};

const fetchAccounts = (
  connection: web3.Connection,
  filters: web3.GetProgramAccountsFilter[]
): Promise<ProgramAccounts[]> => {
  return connection.getProgramAccounts(PROGRAM_ID, {
    encoding: "base64",
    filters,
  });
};
