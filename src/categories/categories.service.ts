import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../common/slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const parent = await this.getParentOrNull(dto.parentId);
    if (dto.parentId && dto.isActive !== false) {
      this.assertParentIsActive(parent);
    }
    await this.assertNameIsUnique(dto.name, dto.parentId ?? null);

    const category = this.categoriesRepository.create({
      ...dto,
      slug: dto.slug ? slugify(dto.slug) : this.buildSlug(dto.name, parent),
    });
    return this.trySave(category);
  }

  private async getParentOrNull(parentId?: number | null): Promise<Category | null> {
    if (!parentId) return null;
    return this.categoriesRepository.findOne({ where: { id: parentId } });
  }

  /** Throws if a sub-category is being activated while its parent is hidden. */
  private assertParentIsActive(parent: Category | null) {
    if (parent && !parent.isActive) {
      throw new BadRequestException(
        'Activate the parent category before activating this sub-category.',
      );
    }
  }

  /**
   * Names only have to be unique within their own sibling group: two
   * top-level categories can't both be "Accessories", but "Sandals" can
   * exist under both Men's and Women's.
   */
  private async assertNameIsUnique(name: string, parentId: number | null, excludeId?: number) {
    const siblings = await this.categoriesRepository.find({
      where: { parentId: parentId ?? IsNull() },
    });
    const clash = siblings.find(
      (c) => c.id !== excludeId && c.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (clash) {
      throw new BadRequestException(
        parentId
          ? `A category named "${name}" already exists under this parent.`
          : `A top-level category named "${name}" already exists.`,
      );
    }
  }

  /**
   * Slugs are globally unique in the database (they're used as URL paths),
   * but names are only unique per sibling group — so two "Watch" categories
   * under different parents would otherwise both slugify to "watch" and
   * collide. Prefixing a child's slug with its parent's keeps auto-generated
   * slugs collision-free without needing a composite unique index.
   */
  private buildSlug(name: string, parent: Category | null): string {
    const base = slugify(name);
    // Re-slugify the parent's own slug defensively — it may predate this
    // sanitization and still contain raw characters.
    return parent ? `${slugify(parent.slug)}-${base}` : base;
  }

  /** Flat list of all categories, ordered for display. */
  findAll() {
    return this.categoriesRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /** Top-level categories with their children nested (for navigation menus). */
  findTree() {
    return this.categoriesRepository.find({
      where: { parentId: IsNull() },
      relations: { children: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
      relations: { children: true, parent: true },
    });
    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }
    return category;
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    const effectiveParentId = dto.parentId !== undefined ? dto.parentId : category.parentId;
    const parent = await this.getParentOrNull(effectiveParentId);

    if (dto.isActive === true && effectiveParentId) {
      this.assertParentIsActive(parent);
    }

    // Re-check uniqueness whenever the name changes, or the category moves
    // to a different parent (which puts it in a new sibling group).
    if (dto.name !== undefined || dto.parentId !== undefined) {
      const effectiveName = dto.name ?? category.name;
      await this.assertNameIsUnique(effectiveName, effectiveParentId ?? null, id);
    }

    Object.assign(category, dto);
    if (dto.slug) {
      category.slug = slugify(dto.slug);
    } else if (dto.name) {
      category.slug = this.buildSlug(dto.name, parent);
    }
    const saved = await this.trySave(category);

    // A hidden parent can't sensibly have visible children — take them
    // offline too. (No-op when this category has no children.)
    if (dto.isActive === false) {
      await this.categoriesRepository.update({ parentId: id }, { isActive: false });
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  /** Turns a raw duplicate-key crash (e.g. a manually-typed clashing slug) into a clean 400. */
  private async trySave(category: Category): Promise<Category> {
    try {
      return await this.categoriesRepository.save(category);
    } catch (err) {
      const code = (err as { driverError?: { code?: string } })?.driverError?.code;
      if (err instanceof QueryFailedError && code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'A category with this name or slug already exists. Try a different name or set a custom slug.',
        );
      }
      throw err;
    }
  }
}
