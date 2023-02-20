import { IsNotEmpty } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  title: string;

  slug?: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  body: string;

  tagList?: string[];
}
