"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BOOK_LINKS } from "@/lib/book-links";

const navLinksBeforeBooks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Propiedades", href: "/#propiedades" },
  { label: "Servicios", href: "/#servicios" },
];

const navLinksAfterBooks = [
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Contacto", href: "/#contacto" },
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Gustavo+De+Simone+Soluciones+Inmobiliarias/@-34.5477,-58.4556,17z";

type NavbarProps = {
  forceSolid?: boolean;
  googleRating?: number;
  googleTotalReviews?: number;
};

const Navbar = ({ forceSolid = false, googleRating, googleTotalReviews }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isInternalPage = pathname !== "/";
  const isSolid = forceSolid || scrolled || isInternalPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-card/95 backdrop-blur-md shadow-card border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4 lg:px-8">
        {/* Logo */}
        <a
          href="/#inicio"
          className="flex w-[min(17.25rem,calc(100vw-7rem))] flex-col leading-none"
        >
          <span
            className={`block h-[22px] w-full overflow-hidden text-xl font-bold uppercase text-justify [text-justify:inter-character] after:inline-block after:w-full after:content-[''] transition-colors ${isSolid ? "text-primary" : "text-primary-foreground"}`}
          >
            GUSTAVO DE SIMONE
          </span>
          <span
            className={`mt-1 block h-[13px] w-full overflow-hidden text-[10px] font-medium uppercase text-justify [text-justify:inter-character] after:inline-block after:w-full after:content-[''] transition-colors ${isSolid ? "text-muted-foreground" : "text-primary-foreground/70"}`}
          >
            SOLUCIONES INMOBILIARIAS
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinksBeforeBooks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isSolid ? "text-foreground" : "text-primary-foreground/90"
              }`}
            >
              {link.label}
            </a>
          ))}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className={`inline-flex shrink-0 items-center gap-0.5 border-0 bg-transparent p-0 text-sm font-medium outline-none transition-colors hover:text-accent data-[state=open]:text-accent ${
                isSolid ? "text-foreground" : "text-primary-foreground/90"
              }`}
            >
              Libros
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="min-w-[20rem]">
              {BOOK_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinksAfterBooks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isSolid ? "text-foreground" : "text-primary-foreground/90"
              }`}
            >
              {link.label}
            </a>
          ))}

          {googleRating != null && googleTotalReviews != null && (
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-3.5 py-2.5 h-[42px] rounded-xl border transition-all hover:scale-105 ${
                isSolid
                  ? "border-border bg-secondary/80 hover:border-accent/40"
                  : "border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/15"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-bold ${isSolid ? "text-foreground" : "text-primary-foreground"}`}>
                    {googleRating.toFixed(1)}
                  </span>
                  <svg className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z"/>
                  </svg>
                </div>
                <span className={`text-[10px] ${isSolid ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                  {googleTotalReviews} reseñas
                </span>
              </div>
            </a>
          )}

          <a
            href="https://wa.me/5491165252190"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-accent text-accent-foreground px-5 h-[42px] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Phone className="w-4 h-4" />
            Contactar
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${isSolid ? "text-foreground" : "text-primary-foreground"}`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col gap-1">
              {navLinksBeforeBooks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground text-base font-medium py-2 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <p className="text-muted-foreground pt-2 text-xs font-semibold uppercase tracking-wide">Libros</p>
              {BOOK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground border-border text-base font-medium border-l-2 py-2 pl-3 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {navLinksAfterBooks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground text-base font-medium py-2 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://wa.me/5491165252190"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-lg text-sm font-semibold mt-2"
              >
                <Phone className="w-4 h-4" />
                Contactar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
