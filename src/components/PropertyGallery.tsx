"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

type PropertyGalleryProps = {
  photos: string[];
  title: string;
};

export default function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const safePhotos = photos.length > 0 ? photos : ["/placeholder.svg"];
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="space-y-4">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {safePhotos.map((photo, index) => (
            <CarouselItem key={`${photo}-${index}`}>
              <img
                src={photo}
                alt={`${title} ${index + 1}`}
                className="h-[560px] w-full rounded-2xl object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 top-1/2 h-10 w-10 -translate-y-1/2 border-none bg-card/90 text-foreground shadow-md hover:bg-card" />
        <CarouselNext className="right-4 top-1/2 h-10 w-10 -translate-y-1/2 border-none bg-card/90 text-foreground shadow-md hover:bg-card" />
      </Carousel>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {safePhotos.slice(0, 10).map((photo, index) => (
          <button
            key={`${photo}-thumb-${index}`}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`overflow-hidden rounded-xl border transition ${
              current === index ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
            }`}
            aria-label={`Ver foto ${index + 1}`}
          >
            <img src={photo} alt={`${title} miniatura ${index + 1}`} className="h-20 w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
