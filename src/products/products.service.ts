import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Tag } from '../tags/tag.entity';
import { CreateProductDto, ProductImageDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { slugify } from '../common/slugify';

const RELATIONS = { category: true, brand: true, images: true, variants: true, tags: true };

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private imagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  /** Resolve an array of tag ids into persisted Tag entities. */
  private async resolveTags(tagIds?: number[]): Promise<Tag[]> {
    if (!tagIds || !tagIds.length) return [];
    return this.tagsRepository.findBy({ id: In(tagIds) });
  }

  /**
   * Turn the flat, ordered image list from the DTO into rows ready to save.
   * The first untagged (non-color) image becomes the product's primary/
   * default photo; each color group (and the untagged group) gets its own
   * independent sort order so per-color galleries display correctly.
   */
  private buildImageRows(images: ProductImageDto[]): Partial<ProductImage>[] {
    let firstGenericIndex = images.findIndex((img) => !img.color);
    if (firstGenericIndex === -1) firstGenericIndex = 0;

    const counters = new Map<string, number>();
    return images.map((img, i) => {
      const key = img.color || '';
      const sortOrder = counters.get(key) ?? 0;
      counters.set(key, sortOrder + 1);
      return {
        url: img.url,
        color: img.color || null,
        isPrimary: i === firstGenericIndex,
        sortOrder,
      };
    });
  }

  /**
   * Flatten the relational product into the shape the storefront expects
   * (category slug, originalPrice, imageUrl, colors[], sizes[], images[]).
   */
  private serialize(product: Product) {
    const images = [...(product.images || [])].sort(
      (a, b) =>
        Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
    );

    // Group color-tagged images for the storefront's variation gallery
    // switcher. Untagged images make up the default/shared gallery and are
    // still returned in full via `images` below.
    const variantImages: Record<string, string[]> = {};
    for (const img of images) {
      if (!img.color) continue;
      (variantImages[img.color] ||= []).push(img.url);
    }

    // Keep every variant (not just active ones) so the storefront can show
    // discontinued combinations as unavailable instead of hiding them.
    const variants = product.variants || [];
    const colors = Array.from(
      new Set(variants.map((v) => v.colorHex).filter(Boolean)),
    );
    const sizes = Array.from(new Set([
      ...(product.sizes || []),
      ...variants.map((v) => v.size).filter(Boolean),
    ]));

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      type: product.type || 'simple',
      externalUrl: product.externalUrl ?? null,
      buttonText: product.buttonText ?? null,
      groupedProductIds: product.groupedProductIds ?? [],
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      originalPrice: product.compareAtPrice ?? null,
      compareAtPrice: product.compareAtPrice ?? null,
      sku: product.sku,
      brand: product.brand?.name ?? null,
      brandId: product.brandId ?? null,
      brandSlug: product.brand?.slug ?? null,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      rating: product.rating,
      reviewCount: product.reviewCount,
      category: product.category?.slug ?? null,
      categoryName: product.category?.name ?? null,
      categoryId: product.categoryId ?? null,
      imageUrl: images[0]?.url ?? null,
      images: images.map((i) => i.url),
      // Color tag preserved per-image — the storefront doesn't need this
      // (it uses `images`/`variantImages` above), but the admin edit form
      // does, to rebuild which photo belongs to which color's gallery.
      imagesDetailed: images.map((i) => ({ url: i.url, color: i.color || null })),
      variantImages,
      colors,
      sizes,
      tags: (product.tags || []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      tagIds: (product.tags || []).map((t) => t.id),
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        sku: v.sku,
        stock: v.stock,
        isActive: v.isActive,
        // Raw overrides — null means "inherit the product's own pricing".
        // The storefront resolves the effective regular/sale price itself.
        priceOverride: v.priceOverride ?? null,
        salePrice: v.salePrice ?? null,
        // Raw schedule — also resolved by the storefront (a sale outside this
        // window is treated as if salePrice weren't set at all).
        saleStartDate: v.saleStartDate ?? null,
        saleEndDate: v.saleEndDate ?? null,
        imageUrl: v.imageUrl || null,
      })),
      reviews: (product.reviews || []).map((r) => ({
        id: r.id,
        authorName: r.authorName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(dto: CreateProductDto) {
    const { images, variants, tagIds, ...rest } = dto;
    const product = this.productsRepository.create({
      ...rest,
      slug: rest.slug || slugify(rest.name),
    });

    if (images?.length) {
      product.images = this.buildImageRows(images) as ProductImage[];
    }
    if (variants?.length) {
      product.variants = variants.map((v) => ({ ...v }) as ProductVariant);
    }
    product.tags = await this.resolveTags(tagIds);

    const saved = await this.productsRepository.save(product);
    return this.findOne(saved.id);
  }

  async findAll() {
    const products = await this.productsRepository.find({
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return products.map((p) => this.serialize(p));
  }

  async findFeatured() {
    const products = await this.productsRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: RELATIONS,
    });
    return products.map((p) => this.serialize(p));
  }

  async findByCategory(slug: string) {
    const products = await this.productsRepository.find({
      where: { category: { slug } },
      relations: RELATIONS,
    });
    return products.map((p) => this.serialize(p));
  }

  /** Simple substring search across name/SKU, optionally scoped to a category. */
  async search(query: string, categorySlug?: string) {
    const term = `%${query.trim()}%`;
    const categoryFilter = categorySlug ? { category: { slug: categorySlug } } : {};
    const products = await this.productsRepository.find({
      where: [
        { name: Like(term), ...categoryFilter },
        { sku: Like(term), ...categoryFilter },
      ],
      relations: RELATIONS,
      order: { createdAt: 'DESC' },
    });
    return products.map((p) => this.serialize(p));
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { ...RELATIONS, reviews: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.serialize(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const { images, variants, tagIds, ...rest } = dto;
    Object.assign(product, rest);
    // Reassign the tag relation only when tagIds was explicitly provided.
    if (tagIds !== undefined) {
      product.tags = await this.resolveTags(tagIds);
    }
    await this.productsRepository.save(product);

    // Images/variants are replaced wholesale rather than diffed via cascade —
    // simpler and avoids TypeORM orphan-removal nulling the (non-nullable) FK first.
    if (images) {
      await this.imagesRepository.delete({ productId: id });
      if (images.length) {
        const rows = this.buildImageRows(images).map((row) =>
          this.imagesRepository.create({ ...row, productId: id }),
        );
        await this.imagesRepository.save(rows);
      }
    }
    if (variants) {
      await this.variantsRepository.delete({ productId: id });
      if (variants.length) {
        const rows = variants.map((v) =>
          this.variantsRepository.create({ ...v, productId: id }),
        );
        await this.variantsRepository.save(rows);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productsRepository.remove(product);
  }
}
