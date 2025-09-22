import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PublicUser } from '../auth/types/auth.types';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFiltersDto,
} from './dto/transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  async create(
    @CurrentUser() user: PublicUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user transactions with filters' })
  async getUserTransactions(
    @CurrentUser() user: PublicUser,
    @Query() filters: TransactionFiltersDto,
  ) {
    return this.transactionService.getUserTransactions(user.id, {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    });
  }

  @Get('stats/monthly')
  @ApiOperation({ summary: 'Get monthly statistics' })
  async getMonthlyStats(
    @CurrentUser() user: PublicUser,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.transactionService.getMonthlyStats(
      user.id,
      year || new Date().getFullYear(),
      month || new Date().getMonth() + 1,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async getById(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    return this.transactionService.getTransaction(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  async update(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.updateTransaction(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete transaction' })
  async delete(@CurrentUser() user: PublicUser, @Param('id') id: string) {
    await this.transactionService.deleteTransaction(id, user.id);
  }
}
