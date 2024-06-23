import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}
  async create(createArticleDto: CreateArticleDto) {
    const article = await this.prisma.article.create({
      data: createArticleDto,
    });
    return article;
  }

  async findAll() {
    const articles = await this.prisma.article.findMany();
    return articles;
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    return article;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
