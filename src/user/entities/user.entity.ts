import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { ArticleEntity } from "src/article/entities/article.entity";
@Entity()
export class UserEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({ unique: true})
    username: string;

    @Column()
    hash: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({default: ''})
    bio: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type: 'timestamp', default:() => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
    updatedAt: Date;

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];
  
    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[];
}
