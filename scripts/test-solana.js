const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const dotenv = require('dotenv');
dotenv.config();

async function checkSolana() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
    console.log('✅ Connecting to Solana RPC:', rpcUrl);
    const connection = new web3.Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('✅ Successfully connected to Solana nodes. Version:', version['solana-core']);
    
    if (process.env.NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY) {
      let keyArr = bs58.decode(process.env.NEXT_PUBLIC_PHARMATRACE_PRIVATE_KEY);
      let keypair = web3.Keypair.fromSecretKey(keyArr);
      console.log('✅ Loaded wallet public key:', keypair.publicKey.toString());
      let balance = await connection.getBalance(keypair.publicKey);
      console.log(`✅ Balance for this account on devnet: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
      if (balance === 0) {
        console.log('⚠️  Warning: Wallet has 0 SOL. You may need to airdrop some SOL to process transactions.');
      }
    } else {
      console.log('⚠️  No private key configured in .env');
    }
  } catch (err) {
    console.error('❌ Error connecting to Solana:', err);
    process.exit(1);
  }
}
checkSolana();
