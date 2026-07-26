-- Repeatable Maqbool catalog seed. Existing Cloudinary media and admin-created
-- records are preserved; rows below are reconciled by stable category/product
-- slugs, variant SKUs, image URLs, specification labels and FAQ questions.

insert into public.categories (name, slug, description, is_active, display_order)
values
  ('Quran & Tafsir', 'quran-tafsir', 'Quran editions and trusted tafsir resources.', true, 0),
  ('Prayer Mats', 'prayer-mats', 'Prayer mats for home, travel and gifting.', true, 1),
  ('Ittars & Perfumes', 'ittars-perfumes', 'Alcohol-free ittars and concentrated perfume oils.', true, 2),
  ('Tasbih & Misbaha', 'tasbih-misbaha', 'Prayer beads for daily dhikr.', true, 3),
  ('Islamic Gifts', 'islamic-gifts', 'Meaningful gifts for blessed occasions.', true, 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

with seed(name, slug, category_slug, description, price, compare_at_price, rating, review_count, is_featured, badge, created_at, display_order) as (
  values
    ('The Holy Quran — Arabic Text', 'holy-quran-arabic-text', 'quran-tafsir', 'A beautifully bound Arabic Quran with clear, reader-friendly script, gilt page edges and a durable cover made for daily recitation.', 699::numeric, 899::numeric, 4.9::numeric, 1256, true, 'Bestseller', '2026-06-10'::timestamptz, 0),
    ('Gold Quran with Carved Stand Set', 'gold-quran-carved-stand-set', 'islamic-gifts', 'An elegant Quran and hand-finished rehal set, presented as a meaningful gift for weddings, housewarmings and Ramadan.', 1499, 1899, 4.8, 340, true, 'New', '2026-07-01', 1),
    ('Premium Velvet Prayer Mat', 'premium-velvet-prayer-mat', 'prayer-mats', 'A plush, softly cushioned sajjadah with an elegant mihrab motif and anti-slip backing for unhurried daily salah.', 549, 799, 4.8, 982, true, 'Popular', '2026-05-18', 2),
    ('Royal Trio Concentrated Perfume Oil', 'royal-trio-perfume-oil', 'ittars-perfumes', 'Three alcohol-free perfume oils built around oud, rose and musk, in travel-friendly roll-on bottles.', 1199, 1599, 4.7, 512, true, '25% off', '2026-04-12', 3),
    ('Crystal Bottle Sandalwood Attar', 'crystal-sandalwood-attar', 'ittars-perfumes', 'A warm sandalwood attar with a creamy, woody dry-down, decanted into a keepsake crystal bottle.', 699, 999, 4.6, 682, false, null, '2026-03-20', 4),
    ('Oud Al Haramain Premium Attar', 'oud-al-haramain-attar', 'ittars-perfumes', 'A deep, long-wearing oud fragrance balanced with amber and a gentle floral heart.', 899, 1299, 4.9, 743, true, 'New', '2026-07-14', 5),
    ('Emerald Jade Tasbih — 99 Beads', 'emerald-jade-tasbih', 'tasbih-misbaha', 'Smooth emerald-toned prayer beads with hand-knotted spacing and a finely detailed tassel.', 399, 499, 4.8, 890, true, null, '2026-02-17', 6),
    ('Misbaha Classic Olive Tasbih', 'classic-olive-tasbih', 'tasbih-misbaha', 'A lightweight olive-green misbaha designed for a comfortable grip during daily dhikr.', 319, 399, 4.4, 461, false, '20% off', '2026-01-28', 7),
    ('Foldable Travel Prayer Mat', 'foldable-travel-prayer-mat', 'prayer-mats', 'A water-resistant, pocket-sized prayer mat for travel, office and outdoor use.', 349, 449, 4.3, 218, false, null, '2026-06-29', 8),
    ('Ramadan Lantern Gift Box', 'ramadan-lantern-gift-box', 'islamic-gifts', 'A warm Ramadan gift box pairing a decorative lantern with tasbih and a handwritten greeting card.', 1299, 1599, 4.5, 176, false, 'Limited', '2026-07-19', 9),
    ('Pocket Quran — Travel Edition', 'pocket-quran-travel-edition', 'quran-tafsir', 'A compact Arabic Quran with zip cover, designed to accompany commutes and journeys.', 449, 549, 4.6, 305, false, null, '2026-05-06', 10),
    ('Nikah Keepsake Quran Set', 'nikah-keepsake-quran-set', 'islamic-gifts', 'A graceful wedding keepsake featuring a Quran, pearl tasbih and personalised greeting card.', 1799, 2199, 4.9, 94, true, 'New', '2026-07-22', 11)
)
insert into public.products (
  name, slug, category_id, description, price, compare_at_price, rating,
  review_count, is_featured, badge, is_active, created_at, display_order
)
select seed.name, seed.slug, categories.id, seed.description, seed.price,
  seed.compare_at_price, seed.rating, seed.review_count, seed.is_featured,
  seed.badge, true, seed.created_at, seed.display_order
from seed
join public.categories on categories.slug = seed.category_slug
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  rating = excluded.rating,
  review_count = excluded.review_count,
  is_featured = excluded.is_featured,
  badge = excluded.badge,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

with seed(product_slug, sku, name, value, price, compare_at_price, stock, color, display_order) as (
  values
    ('holy-quran-arabic-text','QUR-STD','Edition','Standard',699::numeric,899::numeric,18,null,0),
    ('holy-quran-arabic-text','QUR-LRG','Edition','Large Print',899,1099,7,null,1),
    ('holy-quran-arabic-text','QUR-GFT','Edition','Gift Box',1099,1399,4,null,2),
    ('gold-quran-carved-stand-set','QRS-WAL','Stand finish','Walnut',1499,1899,8,'#654321',0),
    ('gold-quran-carved-stand-set','QRS-NAT','Stand finish','Natural',1399,1799,5,'#d2a679',1),
    ('premium-velvet-prayer-mat','MAT-GRN','Colour','Emerald',549,799,24,'#174d3a',0),
    ('premium-velvet-prayer-mat','MAT-MAR','Colour','Maroon',549,799,10,'#6d1f2b',1),
    ('premium-velvet-prayer-mat','MAT-NAV','Colour','Navy',599,849,0,'#223655',2),
    ('royal-trio-perfume-oil','TRIO-06','Pack','3 × 6 ml',1199,1599,16,null,0),
    ('royal-trio-perfume-oil','TRIO-12','Pack','3 × 12 ml',1899,2399,6,null,1),
    ('crystal-sandalwood-attar','SAN-06','Volume','6 ml',699,999,12,null,0),
    ('crystal-sandalwood-attar','SAN-12','Volume','12 ml',1099,1399,9,null,1),
    ('oud-al-haramain-attar','OUD-06','Volume','6 ml',899,1299,15,null,0),
    ('oud-al-haramain-attar','OUD-12','Volume','12 ml',1499,1899,3,null,1),
    ('emerald-jade-tasbih','JAD-33','Beads','33 beads',299,399,18,'#316b51',0),
    ('emerald-jade-tasbih','JAD-99','Beads','99 beads',399,499,22,'#174d3a',1),
    ('classic-olive-tasbih','OLI-99','Beads','99 beads',319,399,30,'#718355',0),
    ('foldable-travel-prayer-mat','TRV-GRN','Colour','Forest',349,449,14,'#174d3a',0),
    ('foldable-travel-prayer-mat','TRV-SND','Colour','Sand',349,449,9,'#c2a878',1),
    ('ramadan-lantern-gift-box','RAM-STD','Box','Standard',1299,1599,5,null,0),
    ('pocket-quran-travel-edition','PQT-GRN','Cover','Green',449,549,20,'#174d3a',0),
    ('pocket-quran-travel-edition','PQT-BLK','Cover','Black',449,549,11,'#252525',1),
    ('nikah-keepsake-quran-set','NIK-IVR','Theme','Ivory & Gold',1799,2199,6,'#eee6d1',0)
)
insert into public.product_variants (
  product_id, sku, name, value, price, compare_at_price, stock, color, is_active, display_order
)
select products.id, seed.sku, seed.name, seed.value, seed.price,
  seed.compare_at_price, seed.stock, seed.color, true, seed.display_order
from seed join public.products on products.slug = seed.product_slug
on conflict (product_id, sku) do update set
  name = excluded.name, value = excluded.value, price = excluded.price,
  compare_at_price = excluded.compare_at_price, stock = excluded.stock,
  color = excluded.color, is_active = excluded.is_active,
  display_order = excluded.display_order;

with seed(product_slug, secure_url, alt_text, is_featured, display_order) as (
  values
    ('holy-quran-arabic-text','/quran.webp','Green and gold Holy Quran cover',true,0),
    ('holy-quran-arabic-text','/quran.hero.webp','Holy Quran displayed on a carved wooden stand',false,1),
    ('gold-quran-carved-stand-set','/quran.hero.webp','Gold Quran resting on a carved wooden stand',true,0),
    ('gold-quran-carved-stand-set','/quran.webp','Detailed Quran cover included in the gift set',false,1),
    ('premium-velvet-prayer-mat','/mat.webp','Emerald green velvet prayer mat with ornate border',true,0),
    ('premium-velvet-prayer-mat','/ramadan.webp','Prayer setting illuminated by a decorative lantern',false,1),
    ('royal-trio-perfume-oil','/ittar.webp','Three luxury glass attar perfume bottles',true,0),
    ('royal-trio-perfume-oil','/perfumes.webp','Premium oud attar bottle in warm light',false,1),
    ('crystal-sandalwood-attar','/ittar2.webp','Crystal bottle containing sandalwood attar',true,0),
    ('oud-al-haramain-attar','/perfumes.webp','Oud Al Haramain premium attar bottle',true,0),
    ('oud-al-haramain-attar','/ittar2.webp','Decorative crystal attar bottle',false,1),
    ('emerald-jade-tasbih','/tasbih.webp','Emerald jade 99-bead tasbih',true,0),
    ('emerald-jade-tasbih','/tasbih2.webp','Olive prayer beads arranged in a circle',false,1),
    ('classic-olive-tasbih','/tasbih2.webp','Classic olive green tasbih beads',true,0),
    ('foldable-travel-prayer-mat','/mat.webp','Green foldable travel prayer mat',true,0),
    ('ramadan-lantern-gift-box','/ramadan.webp','Glowing golden Ramadan lantern gift arrangement',true,0),
    ('ramadan-lantern-gift-box','/tasbih.webp','Tasbih included in Ramadan gift box',false,1),
    ('pocket-quran-travel-edition','/quran.webp','Compact green pocket Quran',true,0),
    ('nikah-keepsake-quran-set','/quran.hero.webp','Quran arranged as a refined nikah keepsake',true,0),
    ('nikah-keepsake-quran-set','/tasbih.webp','Prayer beads included with the nikah gift',false,1)
)
insert into public.product_images (
  product_id, secure_url, public_id, resource_type, alt_text, is_featured, is_active, display_order
)
select products.id, seed.secure_url, null, 'image', seed.alt_text,
  false, true, seed.display_order
from seed join public.products on products.slug = seed.product_slug
on conflict (product_id, secure_url) do update set
  alt_text = excluded.alt_text,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

update public.product_images candidate
set is_featured = true
where candidate.id = (
  select first_image.id
  from public.product_images first_image
  where first_image.product_id = candidate.product_id and first_image.is_active
  order by first_image.display_order, first_image.created_at
  limit 1
)
and not exists (
  select 1 from public.product_images featured
  where featured.product_id = candidate.product_id and featured.is_featured
);

with seed(product_slug, label, value, display_order) as (
  values
    ('holy-quran-arabic-text','Language','Arabic',0),('holy-quran-arabic-text','Binding','Hardcover',1),('holy-quran-arabic-text','Pages','604',2),('holy-quran-arabic-text','Size','14 × 20 cm',3),
    ('gold-quran-carved-stand-set','Includes','Quran, carved rehal, gift box',0),('gold-quran-carved-stand-set','Material','Wood & paper',1),('gold-quran-carved-stand-set','Packaging','Premium gift box',2),
    ('premium-velvet-prayer-mat','Material','Premium velvet',0),('premium-velvet-prayer-mat','Size','70 × 110 cm',1),('premium-velvet-prayer-mat','Backing','Anti-slip',2),('premium-velvet-prayer-mat','Care','Gentle hand wash',3),
    ('royal-trio-perfume-oil','Type','Concentrated perfume oil',0),('royal-trio-perfume-oil','Alcohol','Free',1),('royal-trio-perfume-oil','Notes','Oud, rose, musk',2),('royal-trio-perfume-oil','Applicator','Roll-on',3),
    ('crystal-sandalwood-attar','Fragrance','Woody & creamy',0),('crystal-sandalwood-attar','Alcohol','Free',1),('crystal-sandalwood-attar','Origin','India',2),('crystal-sandalwood-attar','Applicator','Glass wand',3),
    ('oud-al-haramain-attar','Fragrance','Oud, amber & floral',0),('oud-al-haramain-attar','Alcohol','Free',1),('oud-al-haramain-attar','Longevity','8–10 hours',2),('oud-al-haramain-attar','Applicator','Roll-on',3),
    ('emerald-jade-tasbih','Beads','Polished stone composite',0),('emerald-jade-tasbih','Thread','Hand-knotted',1),('emerald-jade-tasbih','BeadSize','8 mm',2),('emerald-jade-tasbih','Includes','Cotton pouch',3),
    ('classic-olive-tasbih','Beads','Resin',0),('classic-olive-tasbih','Count','99',1),('classic-olive-tasbih','BeadSize','7 mm',2),('classic-olive-tasbih','Includes','Drawstring pouch',3),
    ('foldable-travel-prayer-mat','Material','Water-resistant polyester',0),('foldable-travel-prayer-mat','Size','60 × 100 cm',1),('foldable-travel-prayer-mat','Folded','15 × 10 cm',2),('foldable-travel-prayer-mat','Weight','180 g',3),
    ('ramadan-lantern-gift-box','Includes','Lantern, tasbih, card',0),('ramadan-lantern-gift-box','Packaging','Rigid gift box',1),('ramadan-lantern-gift-box','Lantern','Battery powered',2),
    ('pocket-quran-travel-edition','Language','Arabic',0),('pocket-quran-travel-edition','Binding','Zip cover',1),('pocket-quran-travel-edition','Size','9 × 13 cm',2),('pocket-quran-travel-edition','Pages','604',3),
    ('nikah-keepsake-quran-set','Includes','Quran, tasbih, greeting card',0),('nikah-keepsake-quran-set','Packaging','Keepsake box',1),('nikah-keepsake-quran-set','Personalisation','Card message',2)
)
insert into public.product_information (product_id, label, value, display_order)
select products.id, seed.label, seed.value, seed.display_order
from seed join public.products on products.slug = seed.product_slug
on conflict (product_id, label) do update set
  value = excluded.value, display_order = excluded.display_order;

with faq(question, answer, display_order) as (
  values
    ('Is this product quality checked?', 'Yes. Every item is inspected by our team before it is carefully packed for dispatch.', 0),
    ('Can I return this item?', 'Unused items in their original packaging can be returned within seven days of delivery.', 1)
)
insert into public.product_faqs (product_id, question, answer, is_active, display_order)
select products.id, faq.question, faq.answer, true, faq.display_order
from public.products cross join faq
where products.slug in (
  'holy-quran-arabic-text','gold-quran-carved-stand-set','premium-velvet-prayer-mat',
  'royal-trio-perfume-oil','crystal-sandalwood-attar','oud-al-haramain-attar',
  'emerald-jade-tasbih','classic-olive-tasbih','foldable-travel-prayer-mat',
  'ramadan-lantern-gift-box','pocket-quran-travel-edition','nikah-keepsake-quran-set'
)
on conflict (product_id, question) do update set
  answer = excluded.answer, is_active = excluded.is_active,
  display_order = excluded.display_order;

insert into public.global_faqs (question, answer, is_active, display_order)
values
  ('Are all your products 100% authentic and halal?', 'Yes. Our items are sourced from trusted and verified manufacturers, and fragrance products are clearly identified as alcohol-free.', true, 0),
  ('How long does delivery usually take?', 'Orders are generally processed within 24 hours and delivered in 3 to 5 business days, depending on the destination.', true, 1),
  ('Is Cash on Delivery available for my area?', 'Cash on Delivery is available across most serviceable pincodes in India. Online payment options remain available at checkout.', true, 2),
  ('What is your return and exchange policy?', 'Unused items in their original packaging may be returned within seven days. Contact support for damaged or incorrect deliveries.', true, 3)
on conflict (question) do update set
  answer = excluded.answer, is_active = excluded.is_active,
  display_order = excluded.display_order;

alter table public.products alter column category_id set not null;
