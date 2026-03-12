

# Fix: Remove Fixed Card Height, Restore Natural Sizing

The `h-[360px]` fixed height combined with `overflow-hidden` is clipping card content when titles or summaries are longer. The image, metadata, title, summary, and button all compete for 180px of remaining space, which isn't enough.

## Change

**`src/components/news/NewsCard.tsx`** (line 114):
- Remove `h-[360px]` from the card container — let it size naturally
- Keep `overflow-hidden` for rounded corners only
- Keep image at `h-[180px]` fixed
- Keep `line-clamp-2` on title and summary
- Keep `mt-auto` on actions

This restores the card to its natural height while maintaining uniform image sizing and text clamping.

**`src/components/news/SponsoredCard.tsx`**: Same change — remove fixed height from feed variant.

Result: Cards will have consistent image height (180px) and clamped text, but won't clip content. Cards with shorter titles will be slightly shorter, but nothing will be cut off.

