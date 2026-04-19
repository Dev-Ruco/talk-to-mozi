interface ArticleBodyProps {
  paragraphs: string[];
  from?: number;
  to?: number;
}

export function ArticleBody({ paragraphs, from = 0, to }: ArticleBodyProps) {
  const slice = paragraphs.slice(from, to);
  if (slice.length === 0) return null;

  return (
    <div className="space-y-6">
      {slice.map((paragraph, i) => (
        <p
          key={`${from}-${i}`}
          className="text-[1.0625rem] leading-8 text-foreground md:text-lg md:leading-8"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
