#!/bin/bash

# PharmaTrace Solana Program Deployment Script
# Make sure you have Solana CLI and Anchor installed

echo "🚀 Deploying PharmaTrace Program to Solana..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first:"
    echo "sh -c \"\$(curl -sSfL https://release.solana.com/v1.16.0/install)\""
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor not found. Please install it first:"
    echo "cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    echo "avm install latest"
    echo "avm use latest"
    exit 1
fi

# Set Solana config to devnet
echo "📡 Setting Solana cluster to devnet..."
solana config set --url https://api.devnet.solana.com

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance --lamports)
if [ "$BALANCE" -lt 1000000000 ]; then
    echo "⚠️  Low SOL balance. Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Build the program
echo "🔨 Building the program..."
anchor build

# Deploy the program
echo "🚀 Deploying to devnet..."
anchor deploy --program-name pharmatrace --program-keypair target/deploy/pharmatrace-keypair.json

# Verify deployment
echo "✅ Verifying deployment..."
PROGRAM_ID=$(solana address -k target/deploy/pharmatrace-keypair.json)
echo "Program deployed with ID: $PROGRAM_ID"

# Update Anchor.toml with the deployed program ID
echo "📝 Updating Anchor.toml..."
sed -i.bak "s/pharmatrace = \".*\"/pharmatrace = \"$PROGRAM_ID\"/" Anchor.toml

echo "🎉 Deployment complete!"
echo "Program ID: $PROGRAM_ID"
echo "Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "Next steps:"
echo "1. Update your .env file with: NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID"
echo "2. Run your frontend application"