
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@swifttransfer.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@swifttransfer.com',
        fullName: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Default admin user created');
    console.log('   Email: admin@swifttransfer.com');
    console.log('   Password: admin123');

    // Create sample senders
    const senders = await Promise.all([
      prisma.sender.create({
        data: {
          userId: admin.id,
          fullName: 'Takeshi Tanaka',
          email: 'takeshi.tanaka@email.com',
          phone: '+81-90-1234-5678',
          address: 'Shinjuku, Tokyo',
          city: 'Tokyo',
          country: 'Japan',
          identityType: 'passport',
          identityNumber: 'JP123456789',
          status: 'active',
          createdBy: admin.id,
        },
      }),
      prisma.sender.create({
        data: {
          userId: admin.id,
          fullName: 'Yuki Sato',
          email: 'yuki.sato@email.com',
          phone: '+81-90-2345-6789',
          address: 'Shibuya, Tokyo',
          city: 'Tokyo',
          country: 'Japan',
          identityType: 'drivers_license',
          identityNumber: 'DL987654321',
          status: 'active',
          createdBy: admin.id,
        },
      }),
      prisma.sender.create({
        data: {
          userId: admin.id,
          fullName: 'Hiroshi Nakamura',
          email: 'hiroshi.nakamura@email.com',
          phone: '+81-90-3456-7890',
          address: 'Ginza, Tokyo',
          city: 'Tokyo',
          country: 'Japan',
          identityType: 'residence_card',
          identityNumber: 'RC456789123',
          status: 'active',
          createdBy: admin.id,
        },
      }),
    ]);

    console.log('Created 3 sample senders');

    // Create sample receivers
    const receivers = await Promise.all([
      prisma.receiver.create({
        data: {
          senderId: senders[0].id,
          fullName: 'Ram Prasad Sharma',
          email: 'ram.sharma@email.com',
          phone: '+977-98-12345678',
          bankName: 'Global IME Bank',
          bankBranch: 'Thamel Branch',
          accountNumber: '123456789012',
          address: 'Thamel, Kathmandu',
          city: 'Kathmandu',
          country: 'Nepal',
          relationship: 'Family Member',
          status: 'active',
          createdBy: admin.id,
        },
      }),
      prisma.receiver.create({
        data: {
          senderId: senders[1].id,
          fullName: 'Sita Devi Thapa',
          email: 'sita.thapa@email.com',
          phone: '+977-98-23456789',
          bankName: 'Nabil Bank',
          bankBranch: 'New Road Branch',
          accountNumber: '987654321098',
          address: 'New Road, Pokhara',
          city: 'Pokhara',
          country: 'Nepal',
          relationship: 'Mother',
          status: 'active',
          createdBy: admin.id,
        },
      }),
      prisma.receiver.create({
        data: {
          senderId: senders[2].id,
          fullName: 'Krishna Bahadur Gurung',
          email: 'krishna.gurung@email.com',
          phone: '+977-98-34567890',
          bankName: 'Machhapuchchhre Bank',
          bankBranch: 'Lakeside Branch',
          accountNumber: '456789123456',
          address: 'Lakeside, Pokhara',
          city: 'Pokhara',
          country: 'Nepal',
          relationship: 'Father',
          status: 'active',
          createdBy: admin.id,
        },
      }),
      prisma.receiver.create({
        data: {
          senderId: senders[0].id,
          fullName: 'Maya Kumari Rai',
          email: 'maya.rai@email.com',
          phone: '+977-98-45678901',
          bankName: 'Prabhu Bank',
          bankBranch: 'Biratnagar Branch',
          accountNumber: '789123456789',
          address: 'Biratnagar',
          city: 'Biratnagar',
          country: 'Nepal',
          relationship: 'Sister',
          status: 'active',
          createdBy: admin.id,
        },
      }),
    ]);

    console.log('Created 4 sample receivers');

    // Create sample transactions with different statuses
    const transactions = await Promise.all([
      // Completed transaction
      prisma.transaction.create({
        data: {
          id: 'TXN-COMPLETED-001',
          transactionId: 'TXN-20261118-COM001',
          userId: admin.id,
          senderId: senders[0].id,
          receiverId: receivers[0].id,
          amountJPY: 50000,
          amountNPR: 46000,
          serviceFee: 500,
          exchangeRate: 0.92,
          totalAmountJPY: 50543.48,
          status: 'completed',
          purpose: 'Monthly family support',
          processedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 3600000), // 1 hour ago
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      }),
      // Processing transaction
      prisma.transaction.create({
        data: {
          id: 'TXN-PROCESSING-001',
          transactionId: 'TXN-20261118-PRC001',
          userId: admin.id,
          senderId: senders[1].id,
          receiverId: receivers[1].id,
          amountJPY: 75000,
          amountNPR: 69000,
          serviceFee: 1000,
          exchangeRate: 0.92,
          totalAmountJPY: 76086.96,
          status: 'processing',
          purpose: 'Medical expenses',
          processedAt: new Date(Date.now() - 1800000), // 30 minutes ago
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      }),
      // Pending transaction
      prisma.transaction.create({
        data: {
          id: 'TXN-PENDING-001',
          transactionId: 'TXN-20261118-PND001',
          userId: admin.id,
          senderId: senders[2].id,
          receiverId: receivers[2].id,
          amountJPY: 25000,
          amountNPR: 23000,
          serviceFee: 500,
          exchangeRate: 0.92,
          totalAmountJPY: 25543.48,
          status: 'pending',
          purpose: 'Education fees',
          createdBy: admin.id,
        },
      }),
      // Failed transaction
      prisma.transaction.create({
        data: {
          id: 'TXN-FAILED-001',
          transactionId: 'TXN-20261118-FAIL001',
          userId: admin.id,
          senderId: senders[0].id,
          receiverId: receivers[3].id,
          amountJPY: 100000,
          amountNPR: 92000,
          serviceFee: 3000,
          exchangeRate: 0.92,
          totalAmountJPY: 103260.87,
          status: 'failed',
          purpose: 'Business investment',
          notes: 'Payment gateway timeout',
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      }),
      // Cancelled transaction
      prisma.transaction.create({
        data: {
          id: 'TXN-CANCELLED-001',
          transactionId: 'TXN-20261118-CAN001',
          userId: admin.id,
          senderId: senders[1].id,
          receiverId: receivers[0].id,
          amountJPY: 30000,
          amountNPR: 27600,
          serviceFee: 500,
          exchangeRate: 0.92,
          totalAmountJPY: 30543.48,
          status: 'cancelled',
          purpose: 'Gift money',
          cancelledReason: 'Customer requested cancellation',
          cancelledAt: new Date(Date.now() - 7200000), // 2 hours ago
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      }),
    ]);

    console.log('Created 5 sample transactions with different statuses');

  } else {
    console.log('Default admin user already exists');
  }

  console.log('Database seeded successfully!');
  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Admin Email: admin@swifttransfer.com');
  console.log('Admin Password: admin123');
  console.log('\n=== SAMPLE DATA CREATED ===');
  console.log('✓ 1 Admin User');
  console.log('✓ 3 Sample Senders (Japan)');
  console.log('✓ 4 Sample Receivers (Nepal)');
  console.log('✓ 5 Sample Transactions (various statuses)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    throw new Error('Error seeding database');
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
