import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/decorators/user.decorator';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('addarticle')
  create(@User('id') currentUserId: number, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(currentUserId, createArticleDto);
    
  }

  @Get('allarticles')
  findAll(@User('id') currentUserId: number, @Query() query: any) {
    return this.articleService.findAll(currentUserId, query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('updatearticle/:slug')
  update(@User('id') currentUserId: number, @Param('slug') slug: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.updateArticle(slug, currentUserId, updateArticleDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deletearticle/:slug')
  remove(@Param('slug') slug: string, @User('id') currentUserId: number) {
    return this.articleService.deleteArticle(slug, currentUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':slug/favorite')
  async addArticleToFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ){
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId,
    );
    return article;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':slug/favorite')
  async deleteArticleFromFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ){
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      currentUserId,
    );
    return article;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('feed')
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: any,
  ) {
    return await this.articleService.getFeed(currentUserId, query);
  }

}
