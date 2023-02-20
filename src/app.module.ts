import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
  TypeOrmModule.forRoot(dataSourceOptions),
   TagModule, UserModule, ArticleModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
