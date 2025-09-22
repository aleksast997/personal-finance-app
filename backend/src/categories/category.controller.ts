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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from './dto/category.dto';
import { CategoryType } from '../entities/category.entity';
import { PublicUser } from '../auth/types/auth.types';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  async create(
    @CurrentUser() user: PublicUser,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryService.createCategory(user.id, dto);
    return CategoryResponseDto.fromEntity(category);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user categories' })
  @ApiResponse({
    status: 200,
    description: 'User categories',
    type: [CategoryResponseDto],
  })
  async getUserCategories(
    @CurrentUser() user: PublicUser,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryService.getUserCategories(user.id);
    return categories.map((cat) => CategoryResponseDto.fromEntity(cat));
  }

  @Get('by-type')
  @ApiOperation({ summary: 'Get categories by type' })
  @ApiQuery({
    name: 'type',
    enum: CategoryType,
    description: 'Category type (income or expense)',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories by type',
    type: [CategoryResponseDto],
  })
  async getCategoriesByType(
    @CurrentUser() user: PublicUser,
    @Query('type') type: CategoryType,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryService.getCategoriesByType(
      user.id,
      type,
    );
    return categories.map((cat) => CategoryResponseDto.fromEntity(cat));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  async getById(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryService.getCategory(id, user.id);
    return CategoryResponseDto.fromEntity(category);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  async update(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryService.updateCategory(
      id,
      user.id,
      dto,
    );
    return CategoryResponseDto.fromEntity(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted',
  })
  async delete(
    @CurrentUser() user: PublicUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.categoryService.deleteCategory(id, user.id);
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize default categories for user' })
  @ApiResponse({
    status: 201,
    description: 'Default categories created',
    type: [CategoryResponseDto],
  })
  async initialize(
    @CurrentUser() user: PublicUser,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryService.createDefaultCategories(
      user.id,
    );
    return categories.map((cat) => CategoryResponseDto.fromEntity(cat));
  }
}
