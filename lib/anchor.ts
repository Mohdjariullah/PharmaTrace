import { AnchorProvider, Program, web3, Idl } from '@project-serum/anchor';
import { connection, PHARMACY_PROGRAM_ID } from './solana';

// This is a placeholder - in a real app, the IDL would be imported from a file
const IDL: Idl = {
  version: "0.1.0",
  name: "pharmatrace",
  instructions: [
    {
      name: "init_batch",
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
      name: "transfer_batch",
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
      name: "flag_batch",
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
      name: "update_batch_status",
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
          type: "u8"
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
            type: "u8"
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