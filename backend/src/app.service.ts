import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDatabaseStatus() {
    const userCount = await this.prisma.user.count();
    const accountCount = await this.prisma.account.count();

    return {
      status: 'connected',
      users: userCount,
      accounts: accountCount,
      // TODO: Add categories and transactions when their models are implemented
      categories: 0,
      transactions: 0,
    };
  }
}
