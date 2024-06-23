import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title is too short' })
  @ApiProperty()
  title: string;
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @ApiProperty()
  description: string;
}
