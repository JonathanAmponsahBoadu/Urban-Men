export const site = {
  name: "Urban Men Apparel",
  tagline: "Professional. Timeless. Authentic.",
  phoneDisplay: "055 009 5440",
  phoneHref: "tel:+233550095440",
  whatsappNumber: "233550095440",
  instagramHandle: "urban_men_apparel",
  instagramUrl: "https://www.instagram.com/urban_men_apparel",
  /** DRAFT: share of a pre-order paid at checkout (the admin setting will drive this once the backend exists) */
  preorderDepositPercent: 50,
};

export const whatsappUrl = (message: string) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
