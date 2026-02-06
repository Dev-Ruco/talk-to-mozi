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
    align: 'center',
    containScroll: false,
    slidesToScroll: 1,
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (images.length === 0) return null;

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <div className={cn('overflow-hidden rounded-xl', className)}>
        <img
          src={images[0]}
          alt=""
          className={cn(
            'w-full object-cover',
            format === 'vertical' ? 'aspect-[4/5]' : 'aspect-video'
          )}
        />
      </div>
    );
  }

  if (format === 'vertical') {
    return (
      <div className={cn('relative', className)}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-3">
            {images.map((url, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={index}
                  className={cn(
                    'relative flex-shrink-0 transition-all duration-500 ease-out overflow-hidden rounded-xl',
                    isActive
                      ? 'w-[75%] scale-100 opacity-100'
                      : 'w-[20%] scale-90 opacity-60'
                  )}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* Navigation arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Horizontal classic
  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {images.map((url, index) => (
            <div key={index} className="flex-shrink-0 w-full">
              <img
                src={url}
                alt=""
                className="w-full aspect-video object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-background transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === selectedIndex
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
}
