import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty()
  @IsNumber()
  orderId: number;
  @ApiProperty()
  @IsString()
  code: string;
}
