import { ArticleEntity } from "src/article/entities/article.entity";
import { FollowEntity } from "src/profile/entities/follow.entity";
import { TagEntity } from "src/tag/entities/tag.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { DataSourceOptions, DataSource } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5434,
    username: 'sadok',
    password: 'azerty',
    database: 'nest',
    entities: [UserEntity, TagEntity, ArticleEntity, FollowEntity],
    synchronize: true,
  };

  const dataSource = new DataSource(dataSourceOptions);

  export default dataSource;