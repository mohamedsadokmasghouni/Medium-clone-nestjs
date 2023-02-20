import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class TagService {

  constructor(
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>){}

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagRepository.save(createTagDto);
    return tag;
  }

  async findAll() {
    const tags = this.tagRepository.find();
    return tags;
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
