export const WHATSAPP_NUMBER = "+261347856539";
export const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
export const ADMIN_EMAIL = "marcelloevanrandrianantenaina@gmail.com";
export const BRAND = "ẞoost-by Ecr_aaM";

export function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " Ar";
}
