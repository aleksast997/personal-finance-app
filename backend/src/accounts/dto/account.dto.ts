import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, Currency, Account } from '../../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Tekući račun' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.CHECKING,
    description: 'Type of account',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({
    enum: Currency,
    example: Currency.RSD,
    description: 'Account currency',
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Initial balance (default: 0)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance?: number;

  @ApiPropertyOptional({ example: 'Banka Intesa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: '160-5000001234567-43' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Tekući račun - Updated' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Banka Intesa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: '160-5000001234567-43' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;
}

export class UpdateBalanceDto {
  @ApiProperty({
    example: 75000.5,
    description: 'New account balance',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  balance: number;
}

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  formattedBalance: string;

  @ApiProperty({ nullable: true })
  bankName: string | null;

  @ApiProperty()
  hasAccountNumber: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(account: Account): AccountResponseDto {
    const dto = new AccountResponseDto();
    const publicData = account.toPublic();
    Object.assign(dto, publicData);
    return dto;
  }
}

export class DetailedAccountResponseDto extends AccountResponseDto {
  @ApiProperty({ nullable: true })
  accountNumber: string | null;

  static fromEntity(account: Account): DetailedAccountResponseDto {
    const dto = new DetailedAccountResponseDto();
    const detailedData = account.toDetailed();
    Object.assign(dto, detailedData);
    return dto;
  }
}
