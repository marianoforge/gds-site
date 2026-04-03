export const BOOK_LINKS = [
  { label: "100% Emprendedor", href: "/100-emprendedor" },
  { label: "Descifrando la Mente Inmobiliaria", href: "/descifrando-la-mente-inmobiliaria" },
] as const;

export const SITE_WHATSAPP_HREF = "https://wa.me/5491165252190";
export const SITE_PHONE_DISPLAY = "+54 9 11 6525-2190";

export function whatsappBookUrl(bookTitle: string): string {
  const text = encodeURIComponent(`Hola, quiero conseguir el libro "${bookTitle}".`);
  return `${SITE_WHATSAPP_HREF}?text=${text}`;
}
