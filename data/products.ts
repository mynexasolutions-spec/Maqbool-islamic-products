export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  oldPrice?: string;
  image: string;
  alt: string;
  reviews: string;
  badge?: string;
  badgeTone?: "gold" | "green" | "red";
};

export const products: Product[] = [
  {
    slug: "holy-quran-arabic-text",
    name: "The Holy Quran (Arabic Text)",
    category: "Quran & Tafsir",
    price: "₹699",
    oldPrice: "₹899",
    image: "/quran.webp",
    alt: "The Holy Quran Close up",
    reviews: "1,256",
    badge: "Bestseller",
    badgeTone: "gold",
  },
  {
    slug: "gold-quran-carved-stand-set",
    name: "Gold Quran with Carved Stand Set",
    category: "Islamic Gifts",
    price: "₹1,499",
    oldPrice: "₹1,899",
    image: "/quran.hero.webp",
    alt: "Holy Quran with Wooden Stand",
    reviews: "340",
    badge: "New",
    badgeTone: "green",
  },
  {
    slug: "premium-velvet-prayer-mat",
    name: "Premium Velvet Prayer Mat",
    category: "Prayer Mats",
    price: "₹549",
    oldPrice: "₹799",
    image: "/mat.webp",
    alt: "Premium Velvet Green Sajjadah",
    reviews: "982",
  },
  {
    slug: "royal-trio-perfume-oil",
    name: "Royal Trio Concentrated Perfume Oil",
    category: "Ittars & Perfumes",
    price: "₹1,199",
    oldPrice: "₹1,599",
    image: "/ittar.webp",
    alt: "Luxury Glass Attar Perfumes",
    reviews: "512",
    badge: "-25%",
    badgeTone: "red",
  },
  {
    slug: "crystal-sandalwood-attar",
    name: "Crystal Bottle Sandalwood Attar",
    category: "Ittars & Perfumes",
    price: "₹699",
    oldPrice: "₹999",
    image: "/ittar2.webp",
    alt: "Luxury Sandalwood Concentrated Oil",
    reviews: "682",
  },
  {
    slug: "oud-al-haramain-attar",
    name: "Oud Al Haramain Premium Attar",
    category: "Ittars & Perfumes",
    price: "₹899",
    oldPrice: "₹1,299",
    image: "/perfumes.webp",
    alt: "Premium Oud Attar Perfume Bottle",
    reviews: "743",
    badge: "New",
    badgeTone: "green",
  },
  {
    slug: "emerald-jade-tasbih",
    name: "Emerald Jade Tasbih (99 Beads)",
    category: "Tasbih & Misbaha",
    price: "₹399",
    oldPrice: "₹499",
    image: "/tasbih.webp",
    alt: "Emerald Jade Prayer Beads",
    reviews: "890",
  },
  {
    slug: "classic-olive-tasbih",
    name: "Misbaha Classic Olive Tasbih",
    category: "Tasbih & Misbaha",
    price: "₹319",
    oldPrice: "₹399",
    image: "/tasbih2.webp",
    alt: "Olive Jade Prayer Beads 99",
    reviews: "461",
    badge: "-20%",
    badgeTone: "red",
  },
];
