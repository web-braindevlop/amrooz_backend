import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { slugify } from '../common/slugify';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto) {
    const tag = this.tagsRepository.create({
      ...dto,
      slug: dto.slug || slugify(dto.name),
    });
    return this.tagsRepository.save(tag);
  }

  /** Flat list of all tags, alphabetical for display. */
  findAll() {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    if (dto.name && !dto.slug) {
      tag.slug = slugify(dto.name);
    }
    return this.tagsRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }
}
