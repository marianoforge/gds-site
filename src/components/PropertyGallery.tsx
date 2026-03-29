"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

export type PropertyGalleryPhoto = {
  display: string;
  full: string;
};

type PropertyGalleryProps = {
  photos: PropertyGalleryPhoto[];
  title: string;
};

const placeholderPhoto: PropertyGalleryPhoto = { display: "/placeholder.svg", full: "/placeholder.svg" };

function isLocalSrc(src: string): boolean {
  return src.startsWith("/");
}

export default function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const safePhotos = photos.length > 0 ? photos : [placeholderPhoto];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const closeModal = useCallback(() => setModalIndex(null), []);
  const prevModal = useCallback(
    () => setModalIndex((i) => (i != null ? (i - 1 + safePhotos.length) % safePhotos.length : null)),
    [safePhotos.length],
  );
  const nextModal = useCallback(
    () => setModalIndex((i) => (i != null ? (i + 1) % safePhotos.length : null)),
    [safePhotos.length],
  );

  useEffect(() => {
    if (modalIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevModal();
      if (e.key === "ArrowRight") nextModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, closeModal, prevModal, nextModal]);

  return (
    <>
      <div className="space-y-4">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            duration: 60,
            skipSnaps: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {safePhotos.map((photo, index) => (
              <CarouselItem key={`slide-${index}`}>
                <button
                  type="button"
                  className="group/img relative block w-full cursor-zoom-in"
                  onClick={() => setModalIndex(index)}
                  aria-label={`Ver foto ${index + 1} en grande`}
                >
                  <div className="relative h-[min(560px,70vh)] w-full overflow-hidden rounded-2xl bg-muted">
                    {isLocalSrc(photo.display) ? (
                      <Image
                        src={photo.display}
                        alt={`${title} ${index + 1}`}
                        width={1200}
                        height={700}
                        className="h-full w-full object-cover"
                        priority={index === 0}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
                      />
                    ) : (
                      <Image
                        src={photo.display}
                        alt={`${title} ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
                      />
                    )}
                  </div>
                  <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-4 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/img:opacity-100">
                    Click para ver imagen completa
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 top-1/2 h-10 w-10 -translate-y-1/2 border-none bg-card/90 text-foreground shadow-md hover:bg-card" />
          <CarouselNext className="right-4 top-1/2 h-10 w-10 -translate-y-1/2 border-none bg-card/90 text-foreground shadow-md hover:bg-card" />
        </Carousel>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
          {safePhotos.map((photo, index) => (
            <button
              key={`thumb-${index}`}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={`relative aspect-5/3 w-full overflow-hidden rounded-xl border transition-colors ${
                current === index ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
              }`}
              aria-label={`Ver foto ${index + 1}`}
            >
              {isLocalSrc(photo.display) ? (
                <Image
                  src={photo.display}
                  alt={`${title} miniatura ${index + 1}`}
                  width={160}
                  height={96}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  quality={100}
                  sizes="(max-width: 640px) 22vw, 10vw"
                />
              ) : (
                <Image
                  src={photo.display}
                  alt={`${title} miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  quality={100}
                  sizes="(max-width: 640px) 22vw, 10vw"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {modalIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          <span className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/60">
            {modalIndex + 1} / {safePhotos.length}
          </span>

          {safePhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevModal();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative h-[min(90vh,1080px)] w-[min(90vw,1920px)] max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {isLocalSrc(safePhotos[modalIndex].full) ? (
              <Image
                src={safePhotos[modalIndex].full}
                alt={`${title} ${modalIndex + 1}`}
                width={1920}
                height={1080}
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                quality={100}
                sizes="90vw"
              />
            ) : (
              <Image
                src={safePhotos[modalIndex].full}
                alt={`${title} ${modalIndex + 1}`}
                fill
                className="rounded-xl object-contain shadow-2xl"
                quality={100}
                sizes="min(90vw, 1920px)"
              />
            )}
          </div>

          {safePhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextModal();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
