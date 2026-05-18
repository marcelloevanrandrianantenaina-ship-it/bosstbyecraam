export const WHATSAPP_NUMBER = "0347856539";
export const WHATSAPP_INTL = "+261347856539";
export const WHATSAPP_DIGITS = "261347856539";
export const MVOLA_NUMBER = "0347856539";
export const MVOLA_ACCOUNT_NAME = "Randrianbelo Sophia";
export const ADMIN_EMAIL = "marcelloevanrandrianantenaina@gmail.com";
export const BRAND = "ẞoost-by Ecr_aaM";
export const MIN_RECHARGE = 1000;

export function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " Ar";
}
