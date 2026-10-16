import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from './attribute.entity';
import { AttributeTerm } from './attribute-term.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeTermDto } from './dto/create-attribute-term.dto';
import { UpdateAttributeTermDto } from './dto/update-attribute-term.dto';
import { slugify } from '../common/slugify';

function sortTerms(terms: AttributeTerm[] = []): AttributeTerm[] {
  return [...terms].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributesRepository: Repository<Attribute>,
    @InjectRepository(AttributeTerm)
    private termsRepository: Repository<AttributeTerm>,
  ) {}

  /* ---------- Attributes ---------- */

  async create(dto: CreateAttributeDto) {
    const attribute = this.attributesRepository.create({
      ...dto,
      slug: dto.slug || slugify(dto.name),
    });
    return this.attributesRepository.save(attribute);
  }

  async findAll() {
    const attributes = await this.attributesRepository.find({
      relations: { terms: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    for (const attribute of attributes) {
      attribute.terms = sortTerms(attribute.terms);
    }
    return attributes;
  }

  async findOne(id: number) {
    const attribute = await this.attributesRepository.findOne({
      where: { id },
      relations: { terms: true },
    });
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    attribute.terms = sortTerms(attribute.terms);
    return attribute;
  }

  async update(id: number, dto: UpdateAttributeDto) {
    const attribute = await this.findOne(id);
    Object.assign(attribute, dto);
    if (dto.name && !dto.slug) {
      attribute.slug = slugify(dto.name);
    }
    return this.attributesRepository.save(attribute);
  }

  async remove(id: number): Promise<void> {
    const attribute = await this.findOne(id);
    await this.attributesRepository.remove(attribute);
  }

  /* ---------- Terms ---------- */

  async findTerms(attributeId: number) {
    await this.findOne(attributeId); // 404 if the attribute doesn't exist
    return this.termsRepository.find({
      where: { attributeId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createTerm(attributeId: number, dto: CreateAttributeTermDto) {
    await this.findOne(attributeId);
    const term = this.termsRepository.create({
      ...dto,
      attributeId,
      slug: dto.slug || slugify(dto.name),
    });
    return this.termsRepository.save(term);
  }

  async findTerm(termId: number) {
    const term = await this.termsRepository.findOne({ where: { id: termId } });
    if (!term) {
      throw new NotFoundException(`Attribute term with ID ${termId} not found`);
    }
    return term;
  }

  async updateTerm(termId: number, dto: UpdateAttributeTermDto) {
    const term = await this.findTerm(termId);
    Object.assign(term, dto);
    if (dto.name && !dto.slug) {
      term.slug = slugify(dto.name);
    }
    return this.termsRepository.save(term);
  }

  async removeTerm(termId: number): Promise<void> {
    const term = await this.findTerm(termId);
    await this.termsRepository.remove(term);
  }
}
