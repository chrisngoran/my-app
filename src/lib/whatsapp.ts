import { cooperative } from "./data";

/** Link that opens a WhatsApp chat with the cooperative, with the message already typed. */
export function whatsappLink(message: string) {
  return `https://wa.me/${cooperative.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function phoneLink() {
  return `tel:+${cooperative.whatsapp}`;
}

/** "When is the next roast?" for empty and not-on-sale states. A separate chat; the order message is untouched. */
export function askNextRoastLink() {
  return whatsappLink(`Hello ${cooperative.shortName}, when is the next roast?`);
}
