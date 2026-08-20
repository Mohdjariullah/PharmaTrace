import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { connection, PHARMACY_PROGRAM_ID } from './solana';

// IDL matching the deployed pharmatrace-program (pharmatrace-program/src/lib.rs,
// program id 7QUnqWD9rAAy5PNCpvXqZxYXfPW7G9SrWKJ3osTWy2EL).
const IDL: Idl = {
  version: "0.1.0",
  name: "pharmatrace",
  instructions: [
    {
      name: "initBatch",
      accounts: [
        {
          name: "batchAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "manufacturer",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "batchId",
          type: "string"
        },
        {
          name: "productName",
          type: "string"
        },
        {
          name: "mfgDate",
          type: "string"
        },
        {
          name: "expDate",
          type: "string"
        },
        {
          name: "ipfsHash",
          type: "string"
        }
      ]
    },
    {
      name: "transferBatch",
      accounts: [
        {
          name: "batchAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "currentOwner",
          isMut: false,
          isSigner: true
        },
        {
          name: "newOwner",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "flagBatch",
      accounts: [
        {
          name: "batchAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "regulator",
          isMut: false,
          isSigner: true
        }
      ],
      args: [
        {
          name: "reason",
          type: "string"
        }
      ]
    },
    {
      name: "updateBatchStatus",
      accounts: [
        {
          name: "batchAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true
        }
      ],
      args: [
        {
          name: "newStatus",
          type: {
            defined: "BatchStatus"
          }
        }
      ]
    }
  ],
  accounts: [
    {
      name: "Batch",
      type: {
        kind: "struct",
        fields: [
          {
            name: "batchId",
            type: "string"
          },
          {
            name: "productName",
            type: "string"
          },
          {
            name: "manufacturer",
            type: "publicKey"
          },
          {
            name: "currentOwner",
            type: "publicKey"
          },
          {
            name: "mfgDate",
            type: "string"
          },
          {
            name: "expDate",
            type: "string"
          },
          {
            name: "status",
            type: {
              defined: "BatchStatus"
            }
          },
          {
            name: "ipfsHash",
            type: "string"
          },
          {
            name: "createdAt",
            type: "i64"
          },
          {
            name: "updatedAt",
            type: "i64"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "BatchStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Valid" },
          { name: "Flagged" },
          { name: "Expired" }
        ]
      }
    }
  ],
  events: [
    {
      name: "BatchInitialized",
      fields: [
        { name: "batchId", type: "string", index: false },
        { name: "manufacturer", type: "publicKey", index: false },
        { name: "productName", type: "string", index: false }
      ]
    },
    {
      name: "BatchTransferred",
      fields: [
        { name: "batchId", type: "string", index: false },
        { name: "from", type: "publicKey", index: false },
        { name: "to", type: "publicKey", index: false }
      ]
    },
    {
      name: "BatchFlagged",
      fields: [
        { name: "batchId", type: "string", index: false },
        { name: "flaggedBy", type: "publicKey", index: false },
        { name: "reason", type: "string", index: false }
      ]
    },
    {
      name: "BatchStatusUpdated",
      fields: [
        { name: "batchId", type: "string", index: false },
        { name: "newStatus", type: { defined: "BatchStatus" }, index: false },
        { name: "updatedBy", type: "publicKey", index: false }
      ]
    }
  ],
  errors: [
    { code: 6000, name: "BatchIdTooLong", msg: "Batch ID is too long (max 64 characters)" },
    { code: 6001, name: "ProductNameTooLong", msg: "Product name is too long (max 128 characters)" },
    { code: 6002, name: "DateTooLong", msg: "Date string is too long (max 32 characters)" },
    { code: 6003, name: "IpfsHashTooLong", msg: "IPFS hash is too long (max 128 characters)" },
    { code: 6004, name: "ReasonTooLong", msg: "Reason is too long (max 256 characters)" },
    { code: 6005, name: "ReasonEmpty", msg: "Reason cannot be empty" },
    { code: 6006, name: "NotCurrentOwner", msg: "You are not the current owner of this batch" },
    { code: 6007, name: "BatchFlagged", msg: "This batch has been flagged and cannot be transferred" },
    { code: 6008, name: "AlreadyFlagged", msg: "This batch is already flagged" },
    { code: 6009, name: "NotAuthorized", msg: "You are not authorized to perform this action" }
  ]
};

export function getAnchorProvider(wallet: any) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return provider;
}

export function getPharmaProgram(wallet: any): Program<Idl> {
  const provider = getAnchorProvider(wallet);
  return new Program(IDL, PHARMACY_PROGRAM_ID, provider);
}
