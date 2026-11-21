// 13 signature African-print shirts handcrafted by Urban Men.
import type { Size, StockBySize } from "@/lib/types";

export type Sleeve = "Short sleeve" | "Long sleeve";
export type Colour = "Pink" | "White" | "Green" | "Cream" | "Black" | "Navy" | "Charcoal" | "Blue";
export type Badge = "New" | "Signature" | "Popular" | "Limited edition";

export type ProductImage = {
  src: string;
  alt: string;
  kind?: "photo" | "flat" | "detail" | "video";
};

export type Product = {
  slug: string;
  /** Medusa product ID, populated when the backend is connected */
  id?: string;
  /** Medusa variant IDs keyed by size, populated when the backend is connected */
  variantIds?: Partial<Record<import("@/lib/types").Size, string>>;
  name: string;
  /** e.g. Twi word for royalty, wisdom, the sun */
  localName?: string;
  /** What the local name means in English, e.g. "royalty" */
  localMeaning?: string;
  note: string;
  description: string;
  sleeve: Sleeve;
  /** Matching trousers come with the shirt unless this is false (the product page then says "shirt only"). */
  includesTrousers?: boolean;
  colour: Colour;
  badge?: Badge;
  /** previous price, shown crossed out next to the current one */
  compareAtPrice?: number;
  features: string[];
  /** GH₵ */
  price?: number;
  /** units in stock per size */
  stock: StockBySize;
  /** false hides the product from shoppers (admin can toggle) */
  published?: boolean;
  /**
   * Open for pre-order: made after the customer orders, so stock counts do not limit it.
   * "readyBy" is free text shown to the customer, e.g. "Mid-February".
   */
  preorder?: { open: boolean; readyBy?: string };
  images: ProductImage[];
};

/** Default initial inventory across available sizes. */
const defaultStock: StockBySize = { L: 10, XL: 10, "2XL": 8, "3XL": 6 };

const dir = "https://res.cloudinary.com/dpg0vyigg/image/upload/urban-men/products";
const photo = (file: string, alt: string): ProductImage => ({ src: `${dir}/${file}`, alt, kind: "photo" });
const flat = (file: string, alt: string): ProductImage => ({ src: `${dir}/${file}`, alt, kind: "flat" });

const shirts: Product[] = [
  {
    slug: "deep-pink-kente-shirt",
    localName: "Adom",
    localMeaning: "grace",
    name: "The Deep Pink Kente Shirt",
    note: "Vibrant deep magenta tailored luxury shirt with authentic woven Kente accents",
    description:
      "Handcrafted from rich, breathable magenta cotton, this statement tunic shirt features hand-woven Ghanaian Kente detailing along the neckline and cuffs. Tailored with a modern structured silhouette and a clean mandarin collar, it commands presence at weddings, galas, and cultural celebrations.",
    sleeve: "Long sleeve",
    colour: "Pink",
    badge: "New",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Rich deep magenta breathable premium cotton",
      "Authentic hand-woven Ghanaian Kente accents",
      "Structured mandarin collar and tailored cuffs",
      "Hand-finished placket and reinforced seams",
    ],
    images: [
      photo("deep-pink-kente-shirt.jpg", "Man wearing the deep pink tailored shirt with Kente accents"),
    ],
  },
  {
    slug: "white-adinkra-shirt",
    localName: "Aseda",
    localMeaning: "gratitude",
    name: "The Royal White Adinkra Shirt",
    note: "Pristine white executive shirt with subtle gold and black heritage print trim",
    description:
      "The epitome of regal African minimalism. Tailored from crisp, high-thread-count white cotton, this executive long-sleeve shirt is accented with artisanal heritage geometric motifs along the placket and cuffs. Impeccably structured for formal ceremonies, traditional weddings, and executive engagements.",
    sleeve: "Long sleeve",
    colour: "White",
    badge: "New",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Crisp, premium high-density white cotton",
      "Subtle heritage geometric print accent along placket and cuffs",
      "Concealed front placket for a clean, sleek profile",
      "Reinforced spread collar and executive cuff finishing",
    ],
    images: [
      photo("white-adinkra-shirt.jpg", "Man in pristine white executive formal shirt with African print accents"),
    ],
  },
  {
    slug: "emerald-green-accent-shirt",
    localName: "Aboafre",
    localMeaning: "prosperity",
    name: "The Forest Green Accent Shirt",
    note: "Deep forest green tailored tunic with artisanal contrast print panel",
    description:
      "A bold, commanding statement in rich forest green. This luxury tailored shirt features an artisanal contrast African print block across the chest, harmonizing deep earth tones with modern menswear geometry. Cut with a contemporary relaxed drape that flatters all builds.",
    sleeve: "Long sleeve",
    colour: "Green",
    badge: "New",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Lush forest green premium polished cotton",
      "Artisanal contrast African print chest panel",
      "Neat band collar and tailored sleeve hems",
      "Clean straight-cut hem designed to be worn untucked",
    ],
    images: [
      photo("emerald-green-accent-shirt.jpg", "Man wearing forest green tailored shirt with African print contrast"),
    ],
  },
  {
    slug: "cream-luxe-shirt",
    localName: "Sika",
    localMeaning: "wealth",
    name: "The Cream Luxe Signature Shirt",
    note: "Warm cream luxury cotton shirt with refined ochre and gold geometric framing",
    description:
      "Subtle luxury defined. Crafted from smooth, warm cream cotton, this shirt incorporates warm earth-toned geometric African motifs that frame the chest with architectural precision. An effortless choice for daylight receptions, traditional engagements, and sophisticated dinners.",
    sleeve: "Long sleeve",
    colour: "Cream",
    badge: "New",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Silky-smooth warm cream cotton weave",
      "Architectural geometric print panel in ochre, gold, and chocolate",
      "Subtle contrast piping along collar and cuffs",
      "Tailored regular fit ensuring effortless movement",
    ],
    images: [
      photo("cream-luxe-shirt.jpg", "Man in warm cream luxury shirt with gold and brown geometric print"),
    ],
  },
  {
    slug: "emerald-kente-shirt",
    localName: "Odehye",
    localMeaning: "royalty",
    name: "The Emerald Kente Shirt",
    note: "Crisp white tailored shirt with asymmetric emerald and gold Kente panel",
    description:
      "A modern classic celebrating asymmetric Ghanaian elegance. Pristine white cotton is balanced by an asymmetric vertical panel of rich emerald green and gold Kente, extending down the sleeve with precision green piping.",
    sleeve: "Long sleeve",
    colour: "White",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Crisp white lightweight cotton base",
      "Asymmetric emerald green and gold Kente panel",
      "Precision green piping along chest and placket",
      "Contrast black buttons and tailored cuffs",
    ],
    images: [
      photo("green-kente-shirt.jpg", "Man in white shirt with green and gold Kente panel"),
      flat("green-kente-shirt-flat.jpg", "The white shirt with green and gold Kente panel laid out"),
    ],
  },
  {
    slug: "midnight-panel-shirt",
    localName: "Anadwo",
    localMeaning: "night",
    name: "The Midnight Panel Shirt",
    note: "Sleek jet-black short-sleeve shirt with vibrant sunset Ankara side panels",
    description:
      "Understated at first glance, striking in motion. Cut from rich jet-black fabric, this short-sleeve shirt incorporates vibrant red, orange, and golden Ankara side inserts that catch the eye with every step. Perfect for warm-weather celebrations and upscale evenings.",
    sleeve: "Short sleeve",
    colour: "Black",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Jet-black breathable luxury fabric",
      "Flanked sunset-hued Ankara print side panels",
      "Tailored short sleeves with comfortable arm openings",
      "Crisp point collar and contrasting white pearl buttons",
    ],
    images: [
      photo("black-side-panel-shirt.jpg", "Man wearing black shirt with red and gold Ankara side panels"),
      flat("black-side-panel-shirt-flat.jpg", "The black shirt with Ankara side panels laid out"),
    ],
  },
  {
    slug: "navy-yoke-shirt",
    localName: "Nyansa",
    localMeaning: "wisdom",
    name: "The Navy Yoke Shirt",
    note: "Deep navy blue long-sleeve shirt with woven kente-style shoulder yoke",
    description:
      "A stately navy blue shirt accented with a woven Kente-style yoke across the shoulders on both the front and back. The rich cobalt, black, and silver geometric motifs create a masculine, broad-shouldered silhouette suited for milestone events.",
    sleeve: "Long sleeve",
    colour: "Navy",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Deep royal navy breathable cotton-blend",
      "Woven Kente geometric yoke wrapping across both shoulders",
      "Matching print detail inside the collar",
      "Two-button tailored cuffs and navy dyed-to-match buttons",
    ],
    images: [
      photo("navy-kente-yoke-shirt.jpg", "Man in navy shirt with blue Kente yoke, front view"),
      photo("navy-kente-yoke-shirt-back.jpg", "Navy shirt with blue Kente yoke across the shoulders, back view"),
      flat("navy-kente-yoke-shirt-flat.jpg", "The navy shirt with Kente yoke laid out, front"),
      flat("navy-kente-yoke-shirt-back-flat.jpg", "The navy shirt with Kente yoke laid out, back"),
    ],
  },
  {
    slug: "sunburst-shirt",
    localName: "Owia",
    localMeaning: "the sun",
    name: "The Sunburst Shirt",
    note: "Warm cream shirt with vibrant red and golden-yellow sunburst Ankara panel",
    description:
      "Exuding warmth and vitality, this cream long-sleeve shirt features an energetic vertical sunburst Ankara motif down the chest and button placket. The harmonious contrast between the neutral cream base and solar motifs delivers effortless festive style.",
    sleeve: "Long sleeve",
    colour: "Cream",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Breathable cream cotton foundation",
      "Vertical red and golden sunburst Ankara panel",
      "Neat welt chest pocket integrated seamlessly into the print",
      "Dyed-to-match cream buttons and reinforced seams",
    ],
    images: [
      photo("cream-sunburst-shirt.jpg", "Man wearing cream shirt with red and gold sunburst Ankara panel"),
      flat("cream-sunburst-shirt-flat.jpg", "The cream shirt with sunburst panel laid out"),
    ],
  },
  {
    slug: "wave-band-shirt",
    localName: "Nsuo",
    localMeaning: "water",
    name: "The Wave Band Shirt",
    note: "Contemporary white short-sleeve shirt with diagonal teal and violet wave band",
    description:
      "Dynamic contemporary design meets traditional symbolism. A crisp white tailored base is bisected by a bold diagonal sash of teal, violet, and deep navy concentric wave motifs, finished with a matching print accent along the placket.",
    sleeve: "Short sleeve",
    colour: "White",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Lightweight, breathable pure white cotton",
      "Diagonal sash of teal and violet wave print",
      "Matching vertical print trim along the button placket",
      "Comfortable tailored short sleeves for all-day ease",
    ],
    images: [
      photo("white-diagonal-print-shirt.jpg", "Man in white shirt with diagonal teal and purple print band"),
      flat("white-diagonal-print-shirt-flat.jpg", "The white shirt with diagonal wave-print band laid out"),
    ],
  },
  {
    slug: "ember-placket-shirt",
    localName: "Ogya",
    localMeaning: "fire",
    name: "The Ember Placket Shirt",
    note: "Dramatic black long-sleeve shirt with flame-orange and violet Ankara placket",
    description:
      "Dramatic contrast and bold character. Cut from premium black cotton, this design features an electrifying flame-orange and violet Ankara centerpiece running straight down the placket, mirrored by subtle matching side panels.",
    sleeve: "Long sleeve",
    colour: "Black",
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Deep black wrinkle-resistant cotton base",
      "Full-length flame-orange and violet Ankara placket",
      "Side seam Ankara print accents and inner collar lining",
      "Lustrous white pearl buttons",
    ],
    images: [
      photo("black-ankara-placket-shirt.jpg", "Man seated in black shirt with orange and purple Ankara placket"),
      flat("black-ankara-placket-shirt-flat.jpg", "The black shirt with orange and purple Ankara placket laid out"),
    ],
  },
  {
    slug: "kente-sash-shirt",
    localName: "Ahenfie",
    localMeaning: "the palace",
    name: "The Kente Sash Shirt",
    note: "Charcoal grey short-sleeve shirt with diagonal heritage Kente sash",
    description:
      "Modern executive charcoal enhanced by historic royalty. A diagonal sash of authentic Ghanaian Kente—featuring woven gold, crimson, forest green, and black—crosses the chest from shoulder to hip, creating an imposing, distinguished profile.",
    sleeve: "Short sleeve",
    colour: "Charcoal",
    preorder: { open: true, readyBy: "Date announced soon" },
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Premium matte charcoal grey fabric",
      "Diagonal sash of authentic heritage Kente",
      "Tailored short sleeves and structured collar",
      "Smoke-grey buttons for a seamless finish",
    ],
    images: [
      photo("charcoal-kente-sash-shirt.jpg", "Man in charcoal shirt with diagonal Kente sash"),
      flat("charcoal-kente-sash-shirt-flat.jpg", "The charcoal shirt with Kente sash laid out"),
    ],
  },
  {
    slug: "sky-ankara-shirt",
    localName: "Wim",
    localMeaning: "the sky",
    name: "The Sky Ankara Shirt",
    note: "Light blue chambray short-sleeve shirt with horizontal ochre and teal Ankara panel",
    description:
      "Relaxed sophistication for weekend soirees and garden weddings. Soft, textured light blue chambray serves as the canvas for a wide horizontal Ankara panel displaying earthy ochre, teal, and cream tribal motifs.",
    sleeve: "Short sleeve",
    colour: "Blue",
    preorder: { open: true, readyBy: "Date announced soon" },
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Textured, breathable light blue chambray",
      "Wide horizontal Ankara chest panel in ochre, teal, and navy",
      "Chambray patch pocket anchored on the chest",
      "Carved dark brown buttons",
    ],
    images: [
      photo("blue-chambray-ankara-shirt.jpg", "Man in light blue chambray shirt with Ankara chest panel"),
      flat("blue-chambray-ankara-shirt-flat.jpg", "The blue chambray shirt with Ankara panel laid out"),
    ],
  },
  {
    slug: "adinkra-linen-shirt",
    localName: "Sankofa",
    localMeaning: "go back and fetch it",
    name: "The Adinkra Linen Shirt",
    note: "Airy sky-blue linen short-sleeve shirt with bespoke Adinkra symbol trims",
    description:
      "Crafted for effortless warm-weather refinement. Spun from breathable sky-blue linen, this shirt features discreet indigo Adinkra symbols hidden inside the collar, along the inner placket, and lining the chest pocket trim for an intimate expression of heritage.",
    sleeve: "Short sleeve",
    colour: "Blue",
    preorder: { open: true, readyBy: "Date announced soon" },
    price: 300,
    includesTrousers: false,
    stock: defaultStock,
    features: [
      "Airy, breathable pure sky-blue linen",
      "Indigo Adinkra symbol motifs tucked into collar, placket, and pocket",
      "Clean patch chest pocket",
      "Iridescent light-blue pearl buttons",
    ],
    images: [
      photo("sky-blue-adinkra-shirt.jpg", "Man in sky-blue linen shirt with subtle Adinkra symbols"),
      flat("sky-blue-adinkra-shirt-flat.jpg", "The sky-blue linen shirt laid out"),
    ],
  },
];

export const products: Product[] = shirts;
