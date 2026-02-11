

# Carrossel Hero com Efeito de Escala Central

## O que muda

O carrossel de "Últimas Notícias" no Hero ganha um efeito visual onde o card central se amplia (escala maior) em relacao aos cards laterais, criando profundidade. Cada card passa a mostrar o tempo relativo de publicacao (ex: "Há 2h", "Há 3 dias") junto com a data.

## Efeito visual (referencia da imagem)

```text
        ÚLTIMAS NOTÍCIAS DE HOJE

+--------+    +==============+    +--------+
|        |    ||            ||    |        |
|  card  |    ||   CARD     ||    |  card  |
| menor  |    ||  CENTRAL   ||    | menor  |
|        |    ||  (ampliado)||    |        |
+--------+    +==============+    +--------+
                 ● ● ● ●
```

- O card no centro tem `scale(1.05)` e `z-index` mais alto
- Os cards laterais ficam com `scale(0.9)` e `opacity(0.7)`
- A transicao entre estados e animada com CSS transitions (300ms)

## Implementacao tecnica

### Ficheiro: `src/components/news/HeroChat.tsx`

**1. Tracking do slide activo com Embla API**

Substituir o uso do componente `<Carousel>` do shadcn por Embla directo (como ja e feito no `VisualCarousel.tsx`) para ter acesso ao `selectedScrollSnap()` e aplicar estilos dinamicos a cada slide.

```typescript
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: true,
  align: 'center', // Centrar o slide activo
  containScroll: false, // Permitir que slides laterais fiquem visiveis
}, [Autoplay({ delay: 5000, stopOnInteraction: true })]);

const [selectedIndex, setSelectedIndex] = useState(0);

useEffect(() => {
  if (!emblaApi) return;
  const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
  emblaApi.on('select', onSelect);
  onSelect();
  return () => { emblaApi.off('select', onSelect); };
}, [emblaApi]);
```

**2. Estilo dinamico por slide**

Cada slide recebe classes condicionais baseadas na sua posicao relativa ao slide activo:

```typescript
const getSlideStyle = (index: number) => {
  const isActive = index === selectedIndex;
  return cn(
    'transition-all duration-300 ease-out',
    isActive 
      ? 'scale-105 z-10 opacity-100' 
      : 'scale-90 opacity-70 z-0'
  );
};
```

**3. Tempo relativo em cada card**

Adicionar informacao temporal a cada card de noticia:

```typescript
// Funcao getTimeAgo (reutilizar do NewsCard.tsx ou criar inline)
<p className="text-xs text-muted-foreground">
  {getTimeAgo(article.publishedAt)} · {formatDate(article.publishedAt)}
</p>
```

Formato: "Há 2h · 11 Fev 2026"

**4. Dots indicadores activos**

Os dots passam a reflectir o slide activo:

```typescript
<div className="mt-4 flex justify-center gap-2">
  {carouselItems.map((_, index) => (
    <button
      key={index}
      onClick={() => emblaApi?.scrollTo(index)}
      className={cn(
        'h-2 rounded-full transition-all duration-300',
        index === selectedIndex 
          ? 'w-6 bg-primary' 
          : 'w-2 bg-primary/30'
      )}
    />
  ))}
</div>
```

## Titulo da seccao

Adicionar o titulo "Últimas notícias de hoje" acima do carrossel, dentro do HeroChat, com estilo `font-display font-bold text-lg uppercase tracking-wide`.

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/news/HeroChat.tsx` | Migrar para Embla directo, efeito de escala central, tempo relativo nos cards, dots activos, titulo da seccao |

Nenhum outro ficheiro e alterado.

## Seccao Tecnica - Estrutura do card actualizado

```tsx
<div className={cn('overflow-hidden rounded-xl border bg-card', getSlideStyle(index))}>
  <img src={imageUrl} className="aspect-[16/10] w-full object-cover" />
  <div className="p-3 space-y-1">
    <h3 className="font-display text-sm font-semibold leading-tight line-clamp-2">
      {title}
    </h3>
    <p className="text-xs text-muted-foreground">
      {getTimeAgo(publishedAt)} · {new Date(publishedAt).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', year: 'numeric' })}
    </p>
  </div>
</div>
```

