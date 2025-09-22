import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  // const categories = [
  //   { name: 'Food & Dining', colorHex: '#FF6B6B', iconName: 'utensils' },
  //   { name: 'Transportation', colorHex: '#4ECDC4', iconName: 'car' },
  //   { name: 'Shopping', colorHex: '#45B7D1', iconName: 'shopping-bag' },
  //   { name: 'Entertainment', colorHex: '#96CEB4', iconName: 'film' },
  //   { name: 'Bills & Utilities', colorHex: '#FECA57', iconName: 'file-text' },
  //   { name: 'Healthcare', colorHex: '#FF9FF3', iconName: 'heart' },
  //   { name: 'Income', colorHex: '#54A0FF', iconName: 'trending-up' },
  //   { name: 'Transfer', colorHex: '#5F27CD', iconName: 'exchange' },
  //   { name: 'Other', colorHex: '#636E72', iconName: 'more-horizontal' },
  // ];

  console.log('Creating categories...');
  // for (const category of categories) {
  //   await prisma.category.upsert({
  //     where: { name: category.name },
  //     update: {},
  //     create: { ...category, isSystem: true },
  //   });
  // }

  // Create a demo user
  // const hashedPassword = await bcrypt.hash('demo123', 10);
  // const demoUser = await prisma.user.upsert({
  //   where: { email: 'demo@example.com' },
  //   update: {},
  //   create: {
  //     email: 'demo@example.com',
  //     passwordHash: hashedPassword,
  //     firstName: 'Demo',
  //     lastName: 'User',
  //   },
  // });

  // Create demo accounts
  // const checkingAccount = await prisma.account.upsert({
  //   where: { id: '00000000-0000-0000-0000-000000000001' },
  //   update: {},
  //   create: {
  //     id: '00000000-0000-0000-0000-000000000001',
  //     userId: demoUser.id,
  //     name: 'Checking Account',
  //     accountType: 'checking',
  //     balance: 5000.0,
  //     currency: 'RSD',
  //   },
  // });
  //
  // const cashAccount = await prisma.account.upsert({
  //   where: { id: '00000000-0000-0000-0000-000000000002' },
  //   update: {},
  //   create: {
  //     id: '00000000-0000-0000-0000-000000000002',
  //     userId: demoUser.id,
  //     name: 'Cash Wallet',
  //     accountType: 'cash',
  //     balance: 500.0,
  //     currency: 'RSD',
  //   },
  // });

  // Get some categories for demo transactions
  // const foodCategory = await prisma.category.findFirst({
  //   where: { name: 'Food & Dining' },
  // });
  // const incomeCategory = await prisma.category.findFirst({
  //   where: { name: 'Income' },
  // });

  // Create some demo transactions
  // const transactions = [
  //   {
  //     userId: demoUser.id,
  //     accountId: checkingAccount.id,
  //     categoryId: incomeCategory!.id,
  //     type: 'income',
  //     amount: 80000,
  //     description: 'Salary',
  //     transactionDate: new Date('2024-09-01'),
  //     source: 'manual',
  //   },
  //   {
  //     userId: demoUser.id,
  //     accountId: checkingAccount.id,
  //     categoryId: foodCategory!.id,
  //     type: 'expense',
  //     amount: 1500,
  //     description: 'Grocery shopping',
  //     merchantName: 'Maxi',
  //     transactionDate: new Date('2024-09-10'),
  //     source: 'manual',
  //   },
  //   {
  //     userId: demoUser.id,
  //     accountId: cashAccount.id,
  //     categoryId: foodCategory!.id,
  //     type: 'expense',
  //     amount: 350,
  //     description: 'Coffee',
  //     merchantName: 'Local Cafe',
  //     transactionDate: new Date('2024-09-12'),
  //     source: 'manual',
  //   },
  // ];

  console.log('Creating demo transactions...');
  // for (const transaction of transactions) {
  //   await prisma.transaction.create({ data: transaction });
  // }

  console.log('✅ Database seeded successfully!');
  console.log('Demo user: demo@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
