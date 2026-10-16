import { cooperative } from "./data";

/** Link that opens a WhatsApp chat with the cooperative, with the message already typed. */
export function whatsappLink(message: string) {
  return `https://wa.me/${cooperative.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function phoneLink() {
  return `tel:+${cooperative.whatsapp}`;
}
