import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponse {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty({ required: false })
  description: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
