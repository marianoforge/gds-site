export const BOOK_LINKS = [
  { label: "100% Emprendedor", href: "/100-emprendedor" },
  { label: "Descifrando la Mente Inmobiliaria", href: "/descifrando-la-mente-inmobiliaria" },
] as const;

export function whatsappBookUrl(bookTitle: string): string {
  const text = encodeURIComponent(`Hola, quiero conseguir el libro "${bookTitle}".`);
  return `https://wa.me/5491130601512?text=${text}`;
}
