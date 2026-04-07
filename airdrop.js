const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function checkBalance() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const pubkey = new PublicKey('EWbWYMvXWgRYhcK4JVFmiC6LifoqrfniWve5GyuNbuhi');
  
  try {
    const balance = await connection.getBalance(pubkey);
    console.log(`Current balance for ${pubkey.toString()}: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.error('Error checking balance:', error.message);
  }
}

checkBalance();
