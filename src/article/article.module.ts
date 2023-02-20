import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ArticleEntity } from './entities/article.entity';
import { FollowEntity } from 'src/profile/entities/follow.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserEntity, ArticleEntity, FollowEntity])],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
