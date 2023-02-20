import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { FollowEntity } from './entities/follow.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity]), UserModule],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
