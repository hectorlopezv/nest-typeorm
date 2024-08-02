import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  slug?: string;
  @IsOptional()
  @IsString()
  stock?: number;
  @IsString({ each: true })
  @IsArray()
  sizes: string[];
  @IsIn(['men', 'women', 'kid', 'unisex'])
  @IsString({ each: true })
  gender: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images: string[];
}
