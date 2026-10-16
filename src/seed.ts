import { AppDataSource } from './data-source';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { Review } from './products/review.entity';
import { Brand } from './brands/brand.entity';
import { Tag } from './tags/tag.entity';
import { slugify } from './common/slugify';

/* -------------------------------------------------------------------------- */
/*  Seed data                                                                 */
/* -------------------------------------------------------------------------- */

const BRANDS = [
  {
    name: 'Amrooz',
    slug: 'amrooz',
    description: 'The Amrooz Collection house label — considered, elevated essentials.',
    sortOrder: 1,
  },
  {
    name: 'Amrooz Atelier',
    slug: 'amrooz-atelier',
    description: 'The premium line — limited-run, hand-finished pieces.',
    sortOrder: 2,
  },
];

const TAGS = [
  { name: 'New Arrival', slug: 'new-arrival' },
  { name: 'Featured', slug: 'featured' },
  { name: 'Sale', slug: 'sale' },
  { name: 'Bestseller', slug: 'bestseller' },
];

const CATEGORIES = [
  {
    name: "Women's",
    slug: 'women',
    description: 'Elevated essentials and statement pieces for her.',
    sortOrder: 1,
  },
  {
    name: "Men's",
    slug: 'men',
    description: 'Modern tailoring and refined staples for him.',
    sortOrder: 2,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'The finishing touches that complete the look.',
    sortOrder: 3,
  },
];

// Real, curated clothing photography (verified-loading Unsplash sources).
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// Three real product photos per item, keyed by product name.
// First entry becomes the primary (card) image.
const PRODUCT_IMAGES: Record<string, string[]> = {
  'Silk-Blend Evening Dress': [
    'photo-1595777457583-95e059d581b8',
    'photo-1566174053879-31528523f8ae',
    'photo-1572804013309-59a88b7e92f1',
  ],
  'Cashmere Ribbed Sweater': [
    'photo-1576566588028-4147f3842f27',
    'photo-1620799140408-edc6dcb6d633',
    'photo-1516826957135-700dedea698c',
  ],
  'Pleated Midi Skirt': [
    'photo-1583496661160-fb5886a0aaaa',
    'photo-1548036328-c9fa89d128fa',
    'photo-1539008835657-9e8e9680c956',
  ],
  'Tailored Wool Overcoat': [
    'photo-1544923246-77307dd654cb',
    'photo-1520975954732-35dd22299614',
    'photo-1601924994987-69e26d50dc26',
  ],
  'Heritage Oxford Shirt': [
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1603252109303-2751441dd157',
    'photo-1584030373081-f37b7bb4fa8e',
  ],
  'Linen Resort Shirt': [
    'photo-1626497764746-6dc36546b388',
    'photo-1556905055-8f358a7a47b2',
    'photo-1614251055880-ee96e4803393',
  ],
  'Structured Leather Tote': [
    'photo-1584917865442-de89df76afd3',
    'photo-1566150905458-1bf1fc113f0d',
    'photo-1553062407-98eeb64c6a62',
  ],
  'Minimalist Gold Hoops': [
    'photo-1630019852942-f89202989a59',
    'photo-1535632066927-ab7c9ab60908',
    'photo-1608042314453-ae338d80c427',
  ],
  'Silk Twill Scarf': [
    'photo-1520903920243-00d872a2d1c9',
    'photo-1611652022419-a9419f74343d',
    'photo-1434389677669-e08b4cac3105',
  ],
};

type SeedProduct = {
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  colors: { color: string; hex: string }[];
  sizes: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Silk-Blend Evening Dress',
    category: 'women',
    description:
      'A fluid silk-blend evening dress with a hand-finished hem, concealed zip and a flattering bias cut that moves beautifully.',
    shortDescription: 'Fluid drape with a hand-finished hem.',
    price: 189,
    compareAtPrice: 240,
    stock: 24,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 128,
    colors: [
      { color: 'Onyx', hex: '#1c1a17' },
      { color: 'Merlot', hex: '#8c2f39' },
      { color: 'Gold', hex: '#c8a24a' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Cashmere Ribbed Sweater',
    category: 'women',
    description:
      'Featherweight pure cashmere knit with a relaxed everyday fit and a soft ribbed texture for warmth without weight.',
    shortDescription: 'Featherweight cashmere, relaxed fit.',
    price: 145,
    compareAtPrice: 180,
    stock: 40,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 212,
    colors: [
      { color: 'Camel', hex: '#c08457' },
      { color: 'Cream', hex: '#e7d5a6' },
      { color: 'Onyx', hex: '#1c1a17' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Pleated Midi Skirt',
    category: 'women',
    description:
      'Sunray pleats in a soft, movement-friendly crepe that falls to an elegant midi length. Fully lined with an elastic waist.',
    shortDescription: 'Sunray pleats in soft crepe.',
    price: 119,
    stock: 18,
    isNew: true,
    rating: 4.5,
    reviewCount: 63,
    colors: [
      { color: 'Onyx', hex: '#1c1a17' },
      { color: 'Sage', hex: '#6b7d5b' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Tailored Wool Overcoat',
    category: 'men',
    description:
      'A double-faced Italian wool overcoat with a clean notch lapel, welt pockets and a considered, structured silhouette.',
    shortDescription: 'Double-faced Italian wool.',
    price: 329,
    stock: 15,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 74,
    colors: [
      { color: 'Charcoal', hex: '#2b2b2b' },
      { color: 'Taupe', hex: '#5b4a35' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Heritage Oxford Shirt',
    category: 'men',
    description:
      'Crisp long-staple cotton oxford with mother-of-pearl buttons and a versatile button-down collar. A true wardrobe staple.',
    shortDescription: 'Crisp long-staple cotton.',
    price: 89,
    stock: 52,
    isNew: true,
    rating: 4.6,
    reviewCount: 156,
    colors: [
      { color: 'White', hex: '#f5f5f0' },
      { color: 'Sky', hex: '#a7c7e7' },
      { color: 'Onyx', hex: '#1c1a17' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Linen Resort Shirt',
    category: 'men',
    description:
      'Breathable European linen with a relaxed camp collar and a soft, lived-in handfeel — made for warm evenings.',
    shortDescription: 'Breathable European linen.',
    price: 78,
    compareAtPrice: 98,
    stock: 33,
    isFeatured: true,
    rating: 4.4,
    reviewCount: 41,
    colors: [
      { color: 'Sand', hex: '#f2ede3' },
      { color: 'Sky', hex: '#a7c7e7' },
      { color: 'Sage', hex: '#6b7d5b' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Structured Leather Tote',
    category: 'accessories',
    description:
      'A full-grain leather tote with a suede-lined interior, magnetic closure and enough room for the everyday essentials.',
    shortDescription: 'Full-grain leather, suede-lined.',
    price: 259,
    stock: 20,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 98,
    colors: [
      { color: 'Cognac', hex: '#5b4a35' },
      { color: 'Onyx', hex: '#1c1a17' },
    ],
    sizes: ['One Size'],
  },
  {
    name: 'Minimalist Gold Hoops',
    category: 'accessories',
    description:
      '14k gold-plated hoops with a secure hinged clasp — lightweight, tarnish-resistant and effortless to wear daily.',
    shortDescription: '14k gold-plated, hinged clasp.',
    price: 64,
    stock: 60,
    isNew: true,
    rating: 4.8,
    reviewCount: 187,
    colors: [{ color: 'Gold', hex: '#c8a24a' }],
    sizes: ['One Size'],
  },
  {
    name: 'Silk Twill Scarf',
    category: 'accessories',
    description:
      'A hand-rolled silk twill scarf in a painterly seasonal print. A versatile finishing touch, worn any number of ways.',
    shortDescription: 'Hand-rolled silk twill.',
    price: 72,
    compareAtPrice: 90,
    stock: 28,
    rating: 4.6,
    reviewCount: 52,
    colors: [
      { color: 'Merlot', hex: '#8c2f39' },
      { color: 'Gold', hex: '#c8a24a' },
    ],
    sizes: ['One Size'],
  },
];

const REVIEWS = [
  {
    productName: 'Silk-Blend Evening Dress',
    authorName: 'Sarah M.',
    rating: 5,
    title: 'Absolutely stunning',
    comment: 'The drape is gorgeous and the fit is true to size. I get compliments every time.',
    isVerifiedPurchase: true,
  },
  {
    productName: 'Silk-Blend Evening Dress',
    authorName: 'Ayesha K.',
    rating: 5,
    title: 'Worth every penny',
    comment: 'Elegant, comfortable and beautifully made. My new go-to for events.',
    isVerifiedPurchase: true,
  },
  {
    productName: 'Tailored Wool Overcoat',
    authorName: 'Daniyal R.',
    rating: 5,
    title: 'Impeccable tailoring',
    comment: 'Feels like something from a house twice the price. The wool is superb.',
    isVerifiedPurchase: true,
  },
  {
    productName: 'Structured Leather Tote',
    authorName: 'Hina S.',
    rating: 5,
    title: 'Beautiful everyday bag',
    comment: 'The leather is buttery and it holds so much. Excellent quality.',
    isVerifiedPurchase: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Runner                                                                    */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  console.log('Connected. Schema synchronized.');

  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);
  const reviewRepo = AppDataSource.getRepository(Review);
  const brandRepo = AppDataSource.getRepository(Brand);
  const tagRepo = AppDataSource.getRepository(Tag);

  // Reset catalogue tables (FK-safe) so the seed is repeatable
  console.log('Clearing existing catalogue data...');
  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of [
    'reviews',
    'product_variants',
    'product_images',
    'product_tags',
    'products',
    'categories',
    'brands',
    'tags',
  ]) {
    await AppDataSource.query(`TRUNCATE TABLE \`${table}\``);
  }
  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  // Brands
  console.log('Seeding brands...');
  const brandBySlug: Record<string, Brand> = {};
  for (const b of BRANDS) {
    brandBySlug[b.slug] = await brandRepo.save(
      brandRepo.create({ ...b, isActive: true }),
    );
  }

  // Tags
  console.log('Seeding tags...');
  const tagBySlug: Record<string, Tag> = {};
  for (const t of TAGS) {
    tagBySlug[t.slug] = await tagRepo.save(tagRepo.create({ ...t }));
  }

  // Categories
  console.log('Seeding categories...');
  const categoryBySlug: Record<string, Category> = {};
  for (const c of CATEGORIES) {
    const category = await categoryRepo.save(
      categoryRepo.create({ ...c, isActive: true }),
    );
    categoryBySlug[c.slug] = category;
  }

  // Products (+ images + variants via cascade)
  console.log('Seeding products, images and variants...');
  const productByName: Record<string, Product> = {};
  for (const p of PRODUCTS) {
    const seedName = slugify(p.name);
    // Derive tags from the product's flags (mirrors the storefront badges).
    const productTags: Tag[] = [];
    if (p.isNew) productTags.push(tagBySlug['new-arrival']);
    if (p.isFeatured) productTags.push(tagBySlug['featured']);
    if (p.compareAtPrice) productTags.push(tagBySlug['sale']);
    if (p.reviewCount >= 100) productTags.push(tagBySlug['bestseller']);

    const product = productRepo.create({
      name: p.name,
      slug: seedName,
      description: p.description,
      shortDescription: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      sku: `AMZ-${seedName.slice(0, 10).toUpperCase()}`,
      brandId: brandBySlug['amrooz'].id,
      stock: p.stock,
      isActive: true,
      isFeatured: !!p.isFeatured,
      isNew: !!p.isNew,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categoryId: categoryBySlug[p.category].id,
      tags: productTags,
      images: (PRODUCT_IMAGES[p.name] || []).map(
        (id, idx) =>
          ({
            url: img(id),
            altText: `${p.name} — view ${idx + 1}`,
            isPrimary: idx === 0,
            sortOrder: idx + 1,
          }) as any,
      ),
      variants: p.colors.flatMap((c) =>
        p.sizes.map(
          (size) =>
            ({
              size,
              color: c.color,
              colorHex: c.hex,
              sku: `AMZ-${seedName.slice(0, 6).toUpperCase()}-${c.color.slice(0, 3).toUpperCase()}-${size}`,
              stock: Math.max(2, Math.round(p.stock / (p.colors.length * p.sizes.length))),
              isActive: true,
            }) as any,
        ),
      ),
    });
    productByName[p.name] = await productRepo.save(product);
  }

  // Reviews
  console.log('Seeding reviews...');
  for (const r of REVIEWS) {
    const product = productByName[r.productName];
    if (!product) continue;
    await reviewRepo.save(
      reviewRepo.create({
        authorName: r.authorName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isApproved: true,
        isVerifiedPurchase: r.isVerifiedPurchase,
        productId: product.id,
      }),
    );
  }

  const [catCount, prodCount, revCount, brandCount, tagCount] = await Promise.all([
    categoryRepo.count(),
    productRepo.count(),
    reviewRepo.count(),
    brandRepo.count(),
    tagRepo.count(),
  ]);

  console.log('------------------------------------------');
  console.log(`  Brands:     ${brandCount}`);
  console.log(`  Tags:       ${tagCount}`);
  console.log(`  Categories: ${catCount}`);
  console.log(`  Products:   ${prodCount}`);
  console.log(`  Reviews:    ${revCount}`);
  console.log('  Seed completed successfully.');
  console.log('------------------------------------------');

  await AppDataSource.destroy();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
