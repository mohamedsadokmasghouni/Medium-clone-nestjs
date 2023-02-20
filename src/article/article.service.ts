// import { ForbiddenException, Injectable } from '@nestjs/common';
// import { CreateArticleDto } from './dto/create-article.dto';
// import { UpdateArticleDto } from './dto/update-article.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
// import slugify from 'slugify';

// @Injectable()
// export class ArticleService {
//   constructor(private prismaService: PrismaService){}

//   private getSlug(title: string){
//     const slug = slugify(title, {lower: true}) + '-' + (Math.random()*Math.pow(36, 6) | 0).toString();
//     return slug;
//   }

//   async create(id: number, createArticleDto: CreateArticleDto) {
//     const article = await this.prismaService.article.create({data:{
//       authorId: id,
//       slug: this.getSlug(createArticleDto.title),
//       ...createArticleDto
//     }});
//     return article;
//   }

//   async findAll() {
//     const articles = await this.prismaService.article.findMany({ 
//       include: {
//         author: true
//       }
//     });
//     const articlesCount = await this.prismaService.article.count()

//     return {articles, articlesCount};
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} article`;
//   }

//   async findBySlug(slug: string) {
//     const article = await this.prismaService.article.findUnique({ where:{
//       slug
//     }});
//     return article;
//   }

//   async addArticleToFavorites(
//     slug: string,
//     userId: number,
//   ) {
//     const article = await this.findBySlug(slug);
//     const user = await this.prismaService.user.findUnique({where: { 
//       id: userId
//     },
//     include: {
//       favorites: true,
//     }
//   });

//     const isNotFavorited =
//       user.favorites.findIndex(
//         (articleInFavorites) => articleInFavorites.articleId === article.id,
//       ) === -1;

//     if (isNotFavorited) {
//       const articleLikedByUser = {
//         articleId: article.id,
//         article,
//         userId: user.id,
//         user
//       }
//       user.favorites.push(articleLikedByUser);
//       article.favoritesCount++;

//       // const updateduser = await this.prismaService.user.update({
//       //   where: { 
//       //     id: userId
//       //   },
//       //   include: {
//       //     favorites: true
//       //   },
//       //   data: {
          
//       //   }
//       // });
//       const updatedarticle = await this.prismaService.article.update({
//         where: {
//           slug
//         },
//         data: article
//       });
//     }

//     return article;
//   }

//   async deleteArticleFromFavorites(
//     slug: string,
//     userId: number,
//   ){
//     const article = await this.findBySlug(slug);
//     const user = await this.prismaService.user.findUnique({where: {
//       id: userId
//     },
//     include: {
//       favorites: true,
//     }
//   });

//     const articleIndex = user.favorites.findIndex(
//       (articleInFavorites) => articleInFavorites.articleId === article.id,
//     );

//     if (articleIndex >= 0) {
//       user.favorites.splice(articleIndex, 1);
//       article.favoritesCount--;
//       // const updateduser = await this.prismaService.user.update({
//       //   where: { 
//       //     id: userId
//       //   },
//       //   data: user
//       // });
//       const updatedarticle = await this.prismaService.article.update({
//         where: {
//           slug
//         },
//         data: article
//       });
//     }

//     return article;
//   }

//   async update(slug: string, currentUserId: number, updateArticleDto: UpdateArticleDto) {
//     const article = await this.prismaService.article.findUnique({ where: {
//       slug: slug,
//     }})
//     if(!article){
//       throw new ForbiddenException("No article with such slug!!!");
//     }
//     if(article.authorId !== currentUserId){
//       console.log(currentUserId);
//       throw new ForbiddenException("You are not the owner of the article!!!");
//     }

//     const updatedArticle = await this.prismaService.article.update({
//       where: {slug},
//       data: {
//         ...updateArticleDto,
//         slug: slugify(updateArticleDto.title, {lower: true}) + '-' + (Math.random()*Math.pow(36, 6) | 0).toString()
//       }
//     })

//     return updatedArticle;
//   }

//   async remove(slug: string, currentUserId: number) {
//     const article = await this.prismaService.article.findUnique({ where: {
//       slug: slug,
//     }})
//     if(!article){
//       throw new ForbiddenException("No article with such slug!!!");
//     }
//     if(article.authorId !== currentUserId){
//       console.log(currentUserId);
//       throw new ForbiddenException("You are not the owner of the article!!!");
//     }

//     return await this.prismaService.article.delete({where: { slug: slug}});
//   }
// }

import { UserEntity } from 'src/user/entities/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { ArticleEntity } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import slugify from 'slugify';
import { FollowEntity } from 'src/profile/entities/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ){
    const queryBuilder = await this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {username: query.author,}
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          where: {username: query.favorited},
          relations: ['favorites'] 
        }
      );
      const ids = author.favorites.map((el) => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId},
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async createArticle(
    currentUserId: number,
    createArticleDto: CreateArticleDto,
  ){

    const user = await this.userRepository.findOne({where: {
      id: currentUserId
    }})
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = user;

    return await this.articleRepository.save(article);
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ){
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string, currentUserId: number, updateArticleDto: UpdateArticleDto,){
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }
    
    article.slug = this.getSlug(updateArticleDto.title);
    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string){
    return await this.articleRepository.findOne({
      where: { slug: slug },
    });
  }

  async addArticleToFavorites(
    slug: string,
    userId: number,
  ){
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId},
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    userId: number,
  ){
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId},
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  async getFeed(
    currentUserId: number,
    query: any,
  ) {
    const follows = await this.followRepository.find({
      where: {followerId: currentUserId,}
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = await this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }
}