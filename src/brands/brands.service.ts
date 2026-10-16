import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { slugify } from '../common/slugify';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto) {
    const brand = this.brandsRepository.create({
      ...dto,
      slug: dto.slug || slugify(dto.name),
    });
    return this.brandsRepository.save(brand);
  }

  /** Flat list of all brands, ordered for display. */
  findAll() {
    return this.brandsRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    Object.assign(brand, dto);
    if (dto.name && !dto.slug) {
      brand.slug = slugify(dto.name);
    }
    return this.brandsRepository.save(brand);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandsRepository.remove(brand);
  }
}
