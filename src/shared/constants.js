export const logoCandidates = [
  "/logo.png",
  "/logo.jpg",
  "/logo.jpeg",
  "/logo.webp",
  "/logo.svg",
  "/dudas-logo.png",
  "/dudas-lingerie-logo.png"
];

export const categoryGradients = {
  Conjuntos: "linear-gradient(135deg, #8d6247 0%, #2f1f19 100%)",
  Sutias: "linear-gradient(135deg, #9b725a 0%, #3b2921 100%)",
  Calcinhas: "linear-gradient(135deg, #705549 0%, #2b2120 100%)",
  Modeladores: "linear-gradient(135deg, #5e4a46 0%, #1f1d22 100%)",
  Noite: "linear-gradient(135deg, #665a7f 0%, #1d1f29 100%)",
  Acessorios: "linear-gradient(135deg, #7a6048 0%, #241f1b 100%)",
  Esportivos: "linear-gradient(135deg, #4f5f7d 0%, #1f2634 100%)",
  "Plus Size": "linear-gradient(135deg, #81556f 0%, #2b1f2a 100%)",
  Maternidade: "linear-gradient(135deg, #8a6d59 0%, #2f261f 100%)",
  Loungewear: "linear-gradient(135deg, #6d5f73 0%, #26212a 100%)"
};

export const mockProductPhotos = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618677603286-0ec56cb6e1b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80"
];

export function getMockProductPhoto(index = 0) {
  const normalizedIndex = Math.abs(Number(index) || 0) % mockProductPhotos.length;
  return mockProductPhotos[normalizedIndex];
}

export const fallbackProducts = [
  {
    id: "lg-1",
    title: "Conjunto Aurora Lace",
    category: "Conjuntos",
    price: 189.9,
    oldPrice: 229.9,
    rating: 4.9,
    badge: "Mais vendido",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-2",
    title: "Sutia Velvet Support",
    category: "Sutias",
    price: 129.9,
    oldPrice: 149.9,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-3",
    title: "Calcinha Soft Touch",
    category: "Calcinhas",
    price: 69.9,
    oldPrice: 89.9,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-4",
    title: "Body Moonlight",
    category: "Modeladores",
    price: 219,
    oldPrice: 249,
    rating: 4.9,
    badge: "Elegante",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-5",
    title: "Pijama Satin Cloud",
    category: "Noite",
    price: 169,
    oldPrice: 209,
    rating: 4.8,
    badge: "Edição limitada",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-6",
    title: "Robe Pearl Light",
    category: "Noite",
    price: 209,
    oldPrice: 239,
    rating: 4.9,
    badge: "Premium",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-7",
    title: "Top Sculpt Air",
    category: "Esportivos",
    price: 159,
    oldPrice: 179,
    rating: 4.7,
    badge: "Performance",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-8",
    title: "Kit Luxo Romance",
    category: "Conjuntos",
    price: 279,
    oldPrice: 329,
    rating: 5,
    badge: "Presenteável",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-9",
    title: "Faixa Silhouette",
    category: "Acessorios",
    price: 79,
    oldPrice: 99,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-10",
    title: "Conjunto Midnight Rose",
    category: "Conjuntos",
    price: 239,
    oldPrice: 279,
    rating: 4.9,
    badge: "Exclusivo",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-11",
    title: "Sutia Active Lift",
    category: "Esportivos",
    price: 149.9,
    oldPrice: 189.9,
    rating: 4.7,
    badge: "Alta sustentação",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-12",
    title: "Short Esportivo Flow",
    category: "Esportivos",
    price: 119.9,
    oldPrice: 149.9,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-13",
    title: "Body Sculpt Plus",
    category: "Plus Size",
    price: 249,
    oldPrice: 299,
    rating: 4.9,
    badge: "Mais vendido",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-14",
    title: "Calcinha Comfort Plus",
    category: "Plus Size",
    price: 89.9,
    oldPrice: 109.9,
    rating: 4.8,
    badge: "Conforto",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-15",
    title: "Sutia Materna Flex",
    category: "Maternidade",
    price: 139.9,
    oldPrice: 169.9,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-16",
    title: "Camisola Materna Soft",
    category: "Maternidade",
    price: 159.9,
    oldPrice: 189.9,
    rating: 4.7,
    badge: "Leve",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-17",
    title: "Conjunto Lounge Cozy",
    category: "Loungewear",
    price: 189.9,
    oldPrice: 229.9,
    rating: 4.7,
    badge: "Queridinho",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-18",
    title: "Short Doll Cozy Touch",
    category: "Loungewear",
    price: 129.9,
    oldPrice: 159.9,
    rating: 4.6,
    badge: "Conforto",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-19",
    title: "Cinta Modeladora Core",
    category: "Modeladores",
    price: 199,
    oldPrice: 249,
    rating: 4.8,
    badge: "Alta compressão",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-20",
    title: "Bermuda Modeladora Slim",
    category: "Modeladores",
    price: 179,
    oldPrice: 219,
    rating: 4.7,
    badge: "Efeito imediato",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-21",
    title: "Kit Acessórios Glam",
    category: "Acessorios",
    price: 99,
    oldPrice: 129,
    rating: 4.5,
    badge: "Presenteável",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-22",
    title: "Robe Classic Nude",
    category: "Noite",
    price: 189,
    oldPrice: 229,
    rating: 4.8,
    badge: "Clássico",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-23",
    title: "Sutia Basic Daily",
    category: "Sutias",
    price: 99,
    oldPrice: 129,
    rating: 4.6,
    badge: "Mais vendido",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-24",
    title: "Conjunto Serena Mesh",
    category: "Conjuntos",
    price: 219,
    oldPrice: 259,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-25",
    title: "Sutia Lace Comfort",
    category: "Sutias",
    price: 119.9,
    oldPrice: 149.9,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-26",
    title: "Conjunto Brisa Nude",
    category: "Conjuntos",
    price: 209.9,
    oldPrice: 249.9,
    rating: 4.8,
    badge: "Mais vendido",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-27",
    title: "Calcinha Daily Seamless",
    category: "Calcinhas",
    price: 59.9,
    oldPrice: 79.9,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-28",
    title: "Body Sculpt Satin",
    category: "Modeladores",
    price: 239,
    oldPrice: 289,
    rating: 4.9,
    badge: "Premium",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-29",
    title: "Robe Soft Elegance",
    category: "Noite",
    price: 219,
    oldPrice: 259,
    rating: 4.8,
    badge: "Elegante",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-30",
    title: "Top Motion Active",
    category: "Esportivos",
    price: 139.9,
    oldPrice: 169.9,
    rating: 4.7,
    badge: "Performance",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-31",
    title: "Short Active Balance",
    category: "Esportivos",
    price: 109.9,
    oldPrice: 139.9,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-32",
    title: "Sutia Plus Fit Pro",
    category: "Plus Size",
    price: 149,
    oldPrice: 189,
    rating: 4.8,
    badge: "Alta sustentacao",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-33",
    title: "Calcinha Plus Comfort",
    category: "Plus Size",
    price: 79.9,
    oldPrice: 99.9,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-34",
    title: "Camisola Soft Night",
    category: "Noite",
    price: 149,
    oldPrice: 189,
    rating: 4.7,
    badge: "Leve",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-35",
    title: "Conjunto Maternidade Care",
    category: "Maternidade",
    price: 199,
    oldPrice: 239,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-36",
    title: "Sutia Maternidade Soft",
    category: "Maternidade",
    price: 129,
    oldPrice: 159,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-37",
    title: "Conjunto Lounge Minimal",
    category: "Loungewear",
    price: 179,
    oldPrice: 219,
    rating: 4.7,
    badge: "Queridinho",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-38",
    title: "Short Doll Satin Glow",
    category: "Loungewear",
    price: 139,
    oldPrice: 169,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-39",
    title: "Kit Acessorios Shine",
    category: "Acessorios",
    price: 89,
    oldPrice: 119,
    rating: 4.5,
    badge: "Promocao",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-40",
    title: "Faixa Elegance Fit",
    category: "Acessorios",
    price: 69,
    oldPrice: 89,
    rating: 4.5,
    badge: "Novo",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-41",
    title: "Conjunto Iris Bloom",
    category: "Conjuntos",
    price: 229,
    oldPrice: 279,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-42",
    title: "Sutia Lift Comfort",
    category: "Sutias",
    price: 109.9,
    oldPrice: 139.9,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-43",
    title: "Calcinha Invisible Fit",
    category: "Calcinhas",
    price: 64.9,
    oldPrice: 84.9,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-44",
    title: "Body Sculpt Breeze",
    category: "Modeladores",
    price: 229,
    oldPrice: 279,
    rating: 4.8,
    badge: "Alta compressao",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-45",
    title: "Pijama Calm Night",
    category: "Noite",
    price: 159,
    oldPrice: 199,
    rating: 4.7,
    badge: "Conforto",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-46",
    title: "Robe Velvet Touch",
    category: "Noite",
    price: 219,
    oldPrice: 269,
    rating: 4.8,
    badge: "Premium",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-47",
    title: "Top Impact Move",
    category: "Esportivos",
    price: 149.9,
    oldPrice: 189.9,
    rating: 4.7,
    badge: "Performance",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-48",
    title: "Legging Seamless Pulse",
    category: "Esportivos",
    price: 179.9,
    oldPrice: 219.9,
    rating: 4.8,
    badge: "Mais vendido",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-49",
    title: "Conjunto Plus Essence",
    category: "Plus Size",
    price: 239,
    oldPrice: 289,
    rating: 4.9,
    badge: "Mais vendido",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-50",
    title: "Body Plus Curve",
    category: "Plus Size",
    price: 219,
    oldPrice: 259,
    rating: 4.8,
    badge: "Novo",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-51",
    title: "Sutia Materna Daily",
    category: "Maternidade",
    price: 134.9,
    oldPrice: 164.9,
    rating: 4.8,
    badge: "Conforto",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-52",
    title: "Calca Jogger Cozy",
    category: "Loungewear",
    price: 169,
    oldPrice: 209,
    rating: 4.7,
    badge: "Queridinho",
    image: getMockProductPhoto(3)
  },
  {
    id: "lg-53",
    title: "Blusa Lounge Warm",
    category: "Loungewear",
    price: 149,
    oldPrice: 189,
    rating: 4.6,
    badge: "Novo",
    image: getMockProductPhoto(4)
  },
  {
    id: "lg-54",
    title: "Kit Extensor Flex",
    category: "Acessorios",
    price: 59,
    oldPrice: 79,
    rating: 4.5,
    badge: "Utilitario",
    image: getMockProductPhoto(5)
  },
  {
    id: "lg-55",
    title: "Alca Silicone Comfort",
    category: "Acessorios",
    price: 49,
    oldPrice: 69,
    rating: 4.4,
    badge: "Novo",
    image: getMockProductPhoto(6)
  },
  {
    id: "lg-56",
    title: "Conjunto Lumiere Soft",
    category: "Conjuntos",
    price: 249,
    oldPrice: 299,
    rating: 4.9,
    badge: "Exclusivo",
    image: getMockProductPhoto(7)
  },
  {
    id: "lg-57",
    title: "Sutia Prime Lace",
    category: "Sutias",
    price: 139.9,
    oldPrice: 179.9,
    rating: 4.8,
    badge: "Premium",
    image: getMockProductPhoto(0)
  },
  {
    id: "lg-58",
    title: "Calcinha Cotton Breeze",
    category: "Calcinhas",
    price: 54.9,
    oldPrice: 74.9,
    rating: 4.6,
    badge: "Conforto",
    image: getMockProductPhoto(1)
  },
  {
    id: "lg-59",
    title: "Cinta Sculpt Pro",
    category: "Modeladores",
    price: 209,
    oldPrice: 259,
    rating: 4.8,
    badge: "Alta compressao",
    image: getMockProductPhoto(2)
  },
  {
    id: "lg-60",
    title: "Camisola Moon Glow",
    category: "Noite",
    price: 169,
    oldPrice: 209,
    rating: 4.7,
    badge: "Elegante",
    image: getMockProductPhoto(3)
  }
];
