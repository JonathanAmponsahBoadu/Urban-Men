// Contact details from the Urban Men flyer and packaging.
const PHONE_DISPLAY = "055 009 5440";
// Ghana country code + number without the leading zero.
const WHATSAPP_NUMBER = "233550095440";

export const site = {
  name: "Urban Men Apparel",
  tagline: "Professional. Timeless. Authentic.",
  phoneDisplay: PHONE_DISPLAY,
  phoneHref: "tel:+233550095440",
  instagramHandle: "urban_men_apparel",
  instagramUrl: "https://www.instagram.com/urban_men_apparel",
  facebookName: "Urban Men Apparel",
  /** Set this to the APK download link when the Android app is published. Empty = "coming soon". */
  apkUrl: "" as string,
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
