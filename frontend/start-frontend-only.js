#!/usr/bin/env node

// Script to start frontend with mock environment variables
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mock environment variables for frontend-only development
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://mock-supabase-url.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-supabase-anon-key-for-development-only',
  NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8000',
  NEXT_PUBLIC_URL: 'http://localhost:3000',
  NEXT_PUBLIC_ENV_MODE: 'MOCK',
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'mock-google-client-id',
  NEXT_PUBLIC_SENTRY_DSN: 'https://mock-sentry-dsn@sentry.io/mock',
  NEXT_PUBLIC_TOLT_REFERRAL_ID: 'mock-tolt-id',
  NEXT_PUBLIC_MOCK_MODE: 'true'
};

console.log('🚀 Starting Suna Frontend in Mock Mode...');
console.log('📝 This will run the frontend with mock data - no backend required!');
console.log('🌐 Access the app at: http://localhost:3000');
console.log('');

// Create .env.local file with mock values
const envContent = Object.entries(mockEnv)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with mock environment variables');
} catch (error) {
  console.log('⚠️  Could not create .env.local file, but continuing...');
}

// Start the development server
console.log('🔧 Starting Next.js development server...\n');

const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ...mockEnv
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n👋 Development server stopped with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  child.kill('SIGTERM');
}); 