#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup script to automatically configure environment variables
 * and ensure all program IDs are consistent across the application
 */

const CONFIG = {
  PROGRAM_ID: '7QUnqWD9rAAy5PNCpvXqZxYXfPW7G9SrWKJ3osTWy2EL',
  NETWORK: 'devnet',
  RPC_ENDPOINT: 'https://api.devnet.solana.com',
  WS_ENDPOINT: 'wss://api.devnet.solana.com',
};

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Read .env.example as template
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    // Create default .env content
    envContent = `# Solana Configuration
NEXT_PUBLIC_PROGRAM_ID=${CONFIG.PROGRAM_ID}
NEXT_PUBLIC_SOLANA_NETWORK=${CONFIG.NETWORK}
NEXT_PUBLIC_SOLANA_RPC=${CONFIG.RPC_ENDPOINT}
NEXT_PUBLIC_SOLANA_WS_ENDPOINT=${CONFIG.WS_ENDPOINT}

# Supabase Configuration (replace with your values)

NEXT_PUBLIC_SUPABASE_URL=https://tbplqnkbrntjonwsayur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicGxxbmticm50am9ud3NheXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjkyMjAsImV4cCI6MjA2NDU0NTIyMH0.BtDfGP7xefM4T0uTglYz_qwzq88ZxtS3KzFeJCnT2a8            
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicGxxbmticm50am9ud3NheXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2OTIyMCwiZXhwIjoyMDY0NTQ1MjIwfQ.Rm5MWD_C5Mb-5oD7eYOPSjZ91PyG3-CkQbf3-MXBp0c
`;
  }
  
  // Update program ID in content
  envContent = envContent.replace(
    /NEXT_PUBLIC_PROGRAM_ID=.*/,
    `NEXT_PUBLIC_PROGRAM_ID=${CONFIG.PROGRAM_ID}`
  );
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created/updated .env file with program ID:', CONFIG.PROGRAM_ID);
}

function updateAnchorConfig() {
  const anchorConfigPath = path.join(process.cwd(), 'pharmatrace-program', 'Anchor.toml');
  
  if (fs.existsSync(anchorConfigPath)) {
    let content = fs.readFileSync(anchorConfigPath, 'utf8');
    
    // Update program ID in Anchor.toml
    content = content.replace(
      /pharmatrace = ".*"/g,
      `pharmatrace = "${CONFIG.PROGRAM_ID}"`
    );
    
    fs.writeFileSync(anchorConfigPath, content);
    console.log('✅ Updated Anchor.toml with program ID:', CONFIG.PROGRAM_ID);
  }
}

function updateRustLib() {
  const rustLibPath = path.join(process.cwd(), 'pharmatrace-program', 'src', 'lib.rs');
  
  if (fs.existsSync(rustLibPath)) {
    let content = fs.readFileSync(rustLibPath, 'utf8');
    
    // Update declare_id! in Rust code
    content = content.replace(
      /declare_id!\(".*"\);/,
      `declare_id!("${CONFIG.PROGRAM_ID}");`
    );
    
    fs.writeFileSync(rustLibPath, content);
    console.log('✅ Updated Rust lib.rs with program ID:', CONFIG.PROGRAM_ID);
  }
}

function validateConfiguration() {
  console.log('\n🔍 Validating configuration...');
  
  // Check if program ID is valid format
  try {
    const { PublicKey } = require('@solana/web3.js');
    new PublicKey(CONFIG.PROGRAM_ID);
    console.log('✅ Program ID format is valid');
  } catch (error) {
    console.error('❌ Invalid program ID format:', CONFIG.PROGRAM_ID);
    process.exit(1);
  }
  
  // Check if .env file exists and has correct values
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes(CONFIG.PROGRAM_ID)) {
      console.log('✅ .env file contains correct program ID');
    } else {
      console.log('⚠️  .env file does not contain the expected program ID');
    }
  }
  
  console.log('\n📋 Current Configuration:');
  console.log('  Program ID:', CONFIG.PROGRAM_ID);
  console.log('  Network:', CONFIG.NETWORK);
  console.log('  RPC Endpoint:', CONFIG.RPC_ENDPOINT);
  console.log('  WS Endpoint:', CONFIG.WS_ENDPOINT);
}

function main() {
  console.log('🚀 Setting up PharmaTrace environment...\n');
  
  try {
    createEnvFile();
    updateAnchorConfig();
    updateRustLib();
    validateConfiguration();
    
    console.log('\n🎉 Environment setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update your Supabase credentials in .env');
    console.log('2. Deploy your Solana program: cd pharmatrace-program && ./deploy.sh');
    console.log('3. Start the development server: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();