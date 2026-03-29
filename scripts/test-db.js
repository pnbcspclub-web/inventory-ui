const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Raw env loading to be 100% sure
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

process.env.DATABASE_URL = dbUrl;

console.log('Testing with URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Attempting connect...');
    await prisma.$connect();
    console.log('Connected!');
    const count = await prisma.user.count();
    console.log('Total users:', count);
  } catch (e) {
    console.error('FAILED:', e.message);
    if (e.code) console.error('Code:', e.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
