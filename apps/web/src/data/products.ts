// PLACEHOLDER catalogue: names, notes, descriptions, PRICES (all set to GH₵ 300.00 for now) and STOCK COUNTS
// are working values to be replaced (the admin screen can edit prices/stock).
// Fabric/print/colour details come from the real shirt photos.
// Later this whole file is replaced by products from the backend.
import type { StockBySize } from "@/lib/types";

export type ProductImage = {
  src: string;
  alt: string;
  /** "photo" fills the frame; "flat" is a studio shot shown whole on a light backdrop */
  kind: "photo" | "flat";
};

export type Sleeve = "Long sleeve" | "Short sleeve";
export type Badge = "New" | "Best seller" | "Limited";
export type Colour = "White" | "Cream" | "Black" | "Navy" | "Blue" | "Charcoal";

export type Product = {
  slug: string;
  name: string;
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
  images: ProductImage[];
};

/** Placeholder stock, not real inventory. */
const defaultStock: StockBySize = { S: 10, M: 10, L: 10, XL: 10, XXL: 10 };

const dir = "/images/products";
const photo = (file: string, alt: string): ProductImage => ({ src: `${dir}/${file}`, alt, kind: "photo" });
const flat = (file: string, alt: string): ProductImage => ({ src: `${dir}/${file}`, alt, kind: "flat" });

const shirts: Product[] = [
  {
    slug: "emerald-kente-shirt",
    name: "The Emerald Kente Shirt",
    note: "White shirt with green and gold kente panel and piping",
    description:
      "A crisp white shirt colour-blocked with a green and gold paisley-diamond print. The print runs across one side of the chest and down the sleeve, balanced by clean green piping on the plain side.",
    sleeve: "Long sleeve",
    colour: "White",
    price: 300,
    stock: defaultStock,
    features: [
      "Green and gold print panel across the chest and one sleeve",
      "Print flap pocket with green piping lines",
      "Print cuff and collar lining",
      "Black buttons",
      "Comes with matching white trousers",
    ],
    images: [
      photo("green-kente-shirt.jpg", "Man in a white shirt with a green and gold kente panel and matching white trousers"),
      flat("green-kente-shirt-flat.jpg", "The white shirt with green and gold kente panel laid out on its own"),
    ],
  },
  {
    slug: "midnight-panel-shirt",
    name: "The Midnight Panel Shirt",
    note: "Black shirt with red and gold Ankara side panels",
    description:
      "A sharp black shirt with Ankara print panels in red, orange and gold running down both sides. The front stays plain and formal, and the print appears as you move.",
    sleeve: "Short sleeve",
    colour: "Black",
    price: 300,
    stock: defaultStock,
    features: [
      "Red, orange and gold Ankara panels down both sides",
      "Plain black front and collar",
      "White buttons",
      "No chest pocket",
      "Comes with matching black trousers",
    ],
    images: [
      photo("black-side-panel-shirt.jpg", "Man walking in a black shirt with red and gold Ankara side panels and black trousers"),
      flat("black-side-panel-shirt-flat.jpg", "The black shirt with Ankara side panels laid out on its own"),
    ],
  },
  {
    slug: "navy-yoke-shirt",
    name: "The Navy Yoke Shirt",
    note: "Navy shirt with a woven kente yoke across the shoulders",
    description:
      "A deep navy shirt with a woven kente-style yoke in blue, black and silver across the shoulders. The same print lines the collar, and it shows front and back.",
    sleeve: "Long sleeve",
    colour: "Navy",
    price: 300,
    stock: defaultStock,
    features: [
      "Blue, black and silver kente-style yoke, front and back",
      "Matching print on the collar lining",
      "Navy buttons and two-button cuffs",
      "Comes with matching navy trousers",
    ],
    images: [
      photo("navy-kente-yoke-shirt.jpg", "Man in a navy shirt with a blue kente yoke and navy trousers, front view"),
      photo("navy-kente-yoke-shirt-back.jpg", "The same man from behind, showing the kente yoke across the shoulders"),
      flat("navy-kente-yoke-shirt-flat.jpg", "The navy shirt with kente yoke laid out, front"),
      flat("navy-kente-yoke-shirt-back-flat.jpg", "The navy shirt with kente yoke laid out, back"),
    ],
  },
  {
    slug: "sunburst-shirt",
    name: "The Sunburst Shirt",
    note: "Cream shirt with a gold and red sunburst Ankara panel",
    description:
      "A warm cream shirt with a bold red and gold sunburst Ankara panel down one side of the chest, running through the button placket for a clean, statement look.",
    sleeve: "Long sleeve",
    colour: "Cream",
    price: 300,
    stock: defaultStock,
    features: [
      "Red and yellow sunburst Ankara panel from shoulder to hem",
      "Plain cream welt pocket on the print",
      "Cream buttons",
      "Comes with matching cream trousers",
    ],
    images: [
      photo("cream-sunburst-shirt.jpg", "Smiling man in a cream shirt with a red and gold sunburst Ankara panel and cream trousers"),
      flat("cream-sunburst-shirt-flat.jpg", "The cream shirt with sunburst panel laid out on its own"),
    ],
  },
  {
    slug: "wave-band-shirt",
    name: "The Wave Band Shirt",
    note: "White shirt with a diagonal teal and purple wave-print band",
    description:
      "A clean white shirt crossed by a diagonal band of teal, lilac and navy wave print. A matching print strip follows the button placket.",
    sleeve: "Short sleeve",
    colour: "White",
    price: 300,
    stock: defaultStock,
    features: [
      "Diagonal band of teal, lilac and navy concentric-wave print",
      "Matching print strip along the placket",
      "White buttons",
      "Comes with matching white trousers",
    ],
    images: [
      photo("white-diagonal-print-shirt.jpg", "Man in a white shirt with a diagonal teal and purple print band and white trousers"),
      flat("white-diagonal-print-shirt-flat.jpg", "The white shirt with diagonal wave-print band laid out on its own"),
    ],
  },
  {
    slug: "ember-placket-shirt",
    name: "The Ember Placket Shirt",
    note: "Black shirt with an orange and purple Ankara placket",
    description:
      "A black shirt lit up by a wide orange and purple Ankara band down the front placket, with matching panels on both sides and inside the collar.",
    sleeve: "Long sleeve",
    colour: "Black",
    price: 300,
    stock: defaultStock,
    features: [
      "Orange and purple Ankara band down the full front placket",
      "Matching print panels on both sides and inside the collar",
      "White pearl buttons",
      "Comes with matching black trousers",
    ],
    images: [
      photo("black-ankara-placket-shirt.jpg", "Man seated in a black shirt with an orange and purple Ankara placket and black trousers"),
      flat("black-ankara-placket-shirt-flat.jpg", "The black shirt with orange and purple Ankara placket laid out on its own"),
    ],
  },
  {
    slug: "kente-sash-shirt",
    name: "The Kente Sash Shirt",
    note: "Charcoal shirt with a diagonal kente sash",
    description:
      "A charcoal shirt carrying a diagonal sash of authentic kente print in gold, red, green and black, running from the shoulder across the chest.",
    sleeve: "Short sleeve",
    colour: "Charcoal",
    price: 300,
    stock: defaultStock,
    features: [
      "Diagonal kente sash in gold, red, green and black",
      "Charcoal base with grey buttons",
      "Comes with matching charcoal trousers",
    ],
    images: [
      photo("charcoal-kente-sash-shirt.jpg", "Bearded man in a charcoal shirt with a diagonal kente sash"),
      flat("charcoal-kente-sash-shirt-flat.jpg", "The charcoal shirt with kente sash laid out on its own"),
    ],
  },
  {
    slug: "sky-ankara-shirt",
    name: "The Sky Ankara Shirt",
    note: "Blue chambray shirt with a navy and ochre Ankara chest panel",
    description:
      "A light blue chambray shirt with a wide Ankara panel across the chest in navy, teal, ochre and cream. A plain blue patch pocket keeps the look balanced.",
    sleeve: "Short sleeve",
    colour: "Blue",
    price: 300,
    stock: defaultStock,
    features: [
      "Navy, teal and ochre Ankara panel across the chest",
      "Plain blue chambray patch pocket",
      "Dark brown buttons",
      "Comes with matching blue chambray trousers",
    ],
    images: [
      photo("blue-chambray-ankara-shirt.jpg", "Man in a light blue chambray shirt with a navy and ochre Ankara chest panel"),
      flat("blue-chambray-ankara-shirt-flat.jpg", "The blue chambray shirt with Ankara panel laid out on its own"),
    ],
  },
  {
    slug: "adinkra-linen-shirt",
    name: "The Adinkra Linen Shirt",
    note: "Sky-blue linen shirt with adinkra-print trim inside the collar",
    description:
      "A relaxed sky-blue linen shirt that looks plain on the outside, with blue and white adinkra symbols tucked inside the collar, along the placket and on the pocket trim.",
    sleeve: "Short sleeve",
    colour: "Blue",
    price: 300,
    stock: defaultStock,
    features: [
      "Adinkra print inside the collar and placket, and on the pocket trim",
      "Plain patch pocket",
      "Light blue pearl buttons",
      "Comes with matching sky-blue linen trousers",
    ],
    images: [
      photo("sky-blue-adinkra-shirt.jpg", "Smiling man in a sky-blue linen shirt with blue adinkra print inside the collar"),
      flat("sky-blue-adinkra-shirt-flat.jpg", "The sky-blue linen shirt laid out on its own"),
    ],
  },
];

export const products: Product[] = shirts;
