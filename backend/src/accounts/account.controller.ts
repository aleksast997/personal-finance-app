import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PublicUser } from '../auth/types/auth.types';
import { Account } from '../entities/account.entity';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateBalanceDto,
  AccountResponseDto,
  DetailedAccountResponseDto,
} from './dto/account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account successfully created',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createAccount(
    @CurrentUser() user: PublicUser,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.createAccount(
      user.id,
      createAccountDto,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Get()
  @ApiOperation({ summary: 'Get user accounts' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active accounts only',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'User accounts retrieved',
    type: [AccountResponseDto],
  })
  async getUserAccounts(
    @CurrentUser() user: PublicUser,
    @Query('active') activeOnly?: boolean,
  ): Promise<AccountResponseDto[]> {
    let accounts: Account[];

    if (activeOnly === true) {
      accounts = await this.accountService.getActiveUserAccounts(user.id);
    } else {
      accounts = await this.accountService.getUserAccounts(user.id);
    }

    return accounts.map((account) => AccountResponseDto.fromEntity(account));
  }

  @Get('count')
  @ApiOperation({ summary: 'Get user accounts count' })
  @ApiResponse({
    status: 200,
    description: 'Account count retrieved',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getUserAccountsCount(
    @CurrentUser() user: PublicUser,
  ): Promise<{ count: number }> {
    const count = await this.accountService.getUserAccountsCount(user.id);
    return { count };
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiParam({ name: 'type', description: 'Account type' })
  @ApiResponse({
    status: 200,
    description: 'Accounts by type retrieved',
    type: [AccountResponseDto],
  })
  async getAccountsByType(
    @CurrentUser() user: PublicUser,
    @Param('type') accountType: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountService.getAccountsByType(
      user.id,
      accountType,
    );
    return accounts.map((account) => AccountResponseDto.fromEntity(account));
  }

  @Get('by-currency/:currency')
  @ApiOperation({ summary: 'Get accounts by currency' })
  @ApiParam({ name: 'currency', description: 'Currency code' })
  @ApiResponse({
    status: 200,
    description: 'Accounts by currency retrieved',
    type: [AccountResponseDto],
  })
  async getAccountsByCurrency(
    @CurrentUser() user: PublicUser,
    @Param('currency') currency: string,
  ): Promise<AccountResponseDto[]> {
    const accounts = await this.accountService.getAccountsByCurrency(
      user.id,
      currency,
    );
    return accounts.map((account) => AccountResponseDto.fromEntity(account));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account retrieved',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getAccountById(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.getAccountById(
      accountId,
      user.id,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account updated',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateAccount(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.updateAccount(
      accountId,
      user.id,
      updateAccountDto,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Patch(':id/balance')
  @ApiOperation({ summary: 'Update account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account balance updated',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updateAccountBalance(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.updateAccountBalance(
      accountId,
      user.id,
      updateBalanceDto,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.deactivateAccount(
      accountId,
      user.id,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account activated',
    type: DetailedAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
  ): Promise<DetailedAccountResponseDto> {
    const account = await this.accountService.activateAccount(
      accountId,
      user.id,
    );
    return DetailedAccountResponseDto.fromEntity(account);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 204,
    description: 'Account deleted',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: PublicUser,
    @Param('id') accountId: string,
  ): Promise<void> {
    await this.accountService.deleteAccount(accountId, user.id);
  }
}
