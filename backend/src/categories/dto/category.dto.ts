import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, CategoryType } from '../../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Coffee & Drinks' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.EXPENSE,
    description: 'Category type',
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({
    example: '☕',
    description: 'Emoji or icon identifier',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({
    example: '#8B4513',
    description: 'Hex color code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Updated Category Name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '🍕' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiPropertyOptional({ example: '#FF6347' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty({ nullable: true })
  color: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.type = category.type;
    dto.icon = category.icon;
    dto.color = category.color;
    dto.isActive = category.isActive;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    return dto;
  }
}
