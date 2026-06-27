export const BOOKS = [
  {
    label: "100% Emprendedor",
    href: "/100-emprendedor",
    cover: "/books/100-emprendedor.jpg",
    excerpt:
      "Fundamentos y bases para el éxito empresarial: planificación estratégica, plan de negocios y la mentalidad emprendedora aplicada al rubro inmobiliario.",
  },
  {
    label: "Descifrando la Mente Inmobiliaria",
    href: "/descifrando-la-mente-inmobiliaria",
    cover: "/books/descifrando-la-mente.jpg",
    excerpt:
      "La tríada del psicoemprendimiento: mentalidad, competencias y acción para construir un negocio inmobiliario sólido y rentable.",
  },
] as const;

export const BOOK_LINKS = BOOKS.map(({ label, href }) => ({ label, href }));

export const BOOKS_HERO_IMAGE = "/books/ambos.jpg";

export const SITE_WHATSAPP_HREF = "https://wa.me/5491165252190";
export const SITE_PHONE_DISPLAY = "+54 9 11 6525-2190";

export function whatsappBookUrl(bookTitle: string): string {
  const text = encodeURIComponent(`Hola, quiero conseguir el libro "${bookTitle}".`);
  return `${SITE_WHATSAPP_HREF}?text=${text}`;
}
