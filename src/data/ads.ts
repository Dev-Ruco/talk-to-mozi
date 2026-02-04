import { SponsoredAd } from '@/types/news';

export const sponsoredAds: SponsoredAd[] = [
  {
    id: 'ad-1',
    title: 'Abra a sua conta no Millennium bim e ganhe benefícios exclusivos',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    sponsor: 'Millennium bim',
    link: '#',
    description: 'A melhor solução bancária para si e para o seu negócio.'
  },
  {
    id: 'ad-2',
    title: 'Vodacom M-Pesa: Envie dinheiro de forma rápida e segura',
    imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop',
    sponsor: 'Vodacom',
    link: '#',
    description: 'A forma mais fácil de transferir dinheiro em Moçambique.'
  },
  {
    id: 'ad-3',
    title: 'Toyota Hilux 2024: Potência e robustez para qualquer terreno',
    imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=400&fit=crop',
    sponsor: 'Toyota Moçambique',
    link: '#',
    description: 'A pick-up mais vendida agora com novas funcionalidades.'
  },
  {
    id: 'ad-4',
    title: 'Seguro de saúde Fidelidade: Proteja a sua família',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
    sponsor: 'Fidelidade Seguros',
    link: '#',
    description: 'Coberturas completas com a melhor rede hospitalar.'
  }
];

export const getRandomAd = (): SponsoredAd => {
  return sponsoredAds[Math.floor(Math.random() * sponsoredAds.length)];
};

export const getAdsForCarousel = (): SponsoredAd[] => {
  return sponsoredAds.slice(0, 2);
};
