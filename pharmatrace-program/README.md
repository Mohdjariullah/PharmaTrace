# PharmaTrace Solana Program

A Solana smart contract for pharmaceutical supply chain tracking and verification.

## Features

- **Batch Registration**: Register pharmaceutical batches with immutable metadata
- **Ownership Transfer**: Securely transfer batch ownership through the supply chain
- **Regulatory Flagging**: Allow regulators to flag suspicious batches
- **Status Management**: Track batch status (Valid, Flagged, Expired)
- **Event Logging**: Emit events for all major operations

## Program Structure

### Instructions

1. **init_batch**: Initialize a new pharmaceutical batch
2. **transfer_batch**: Transfer ownership of a batch
3. **flag_batch**: Flag a batch as suspicious (regulator only)
4. **update_batch_status**: Update batch status

### Account Structure

```rust
pub struct Batch {
    pub batch_id: String,        // Unique batch identifier
    pub product_name: String,    // Product name
    pub manufacturer: Pubkey,    // Original manufacturer
    pub current_owner: Pubkey,   // Current owner
    pub mfg_date: String,        // Manufacturing date
    pub exp_date: String,        // Expiry date
    pub status: BatchStatus,     // Current status
    pub ipfs_hash: String,       // IPFS hash for additional metadata
    pub created_at: i64,         // Creation timestamp
    pub updated_at: i64,         // Last update timestamp
}
```

### Batch Status

- `Valid`: Normal, transferable batch
- `Flagged`: Suspicious batch, cannot be transferred
- `Expired`: Past expiry date

## Deployment

### Prerequisites

1. Install Solana CLI:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
```

2. Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

3. Create a Solana wallet:
```bash
solana-keygen new
```

### Deploy to Devnet

1. Make the deployment script executable:
```bash
chmod +x deploy.sh
```

2. Run the deployment:
```bash
./deploy.sh
```

3. The script will:
   - Set Solana cluster to devnet
   - Check wallet balance and airdrop SOL if needed
   - Build the program
   - Deploy to devnet
   - Display the program ID

### Manual Deployment

If you prefer manual deployment:

```bash
# Set cluster
solana config set --url https://api.devnet.solana.com

# Build
anchor build

# Deploy
anchor deploy

# Get program ID
solana address -k target/deploy/pharmatrace-keypair.json
```

## Testing

Run the test suite:

```bash
anchor test
```

## Integration

After deployment, update your frontend application's `.env` file:

```env
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Security Considerations

- All batch operations require proper signature verification
- Flagged batches cannot be transferred
- Only current owners can transfer batches
- Program uses PDAs (Program Derived Addresses) for deterministic batch accounts

## Events

The program emits the following events:

- `BatchInitialized`: When a new batch is created
- `BatchTransferred`: When ownership is transferred
- `BatchFlagged`: When a batch is flagged by a regulator
- `BatchStatusUpdated`: When batch status changes

## Error Handling

The program includes comprehensive error handling for:

- Invalid input lengths
- Unauthorized operations
- Batch status violations
- Ownership verification failures