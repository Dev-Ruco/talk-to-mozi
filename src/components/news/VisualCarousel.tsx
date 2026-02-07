import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VisualCarouselProps {
  images: string[];
  format: 'vertical' | 'horizontal';
  className?: string;
}

export function VisualCarousel({ images, format, className }: VisualCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (images.length === 0) return null;

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <div className={cn('overflow-hidden rounded-xl aspect-video relative', className)}>
        <img
          src={images[0]}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl aspect-video', className)}>
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((url, index) => (
            <div key={index} className="flex-shrink-0 w-full h-full">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows - inside panel */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors z-10"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots - inside panel at bottom */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              emblaApi?.scrollTo(index);
            }}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === selectedIndex
                ? 'w-5 bg-background'
                : 'w-1.5 bg-background/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}
