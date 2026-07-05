/**
 * Mock domain data. Later replaced by services/ adapters (Supabase, etc.).
 * Photos use picsum.photos with stable seeds so nothing is generic-AI-looking.
 */

export interface Memory {
  id: string;
  title: string;
  phrase: string;
  placeId: string;
  personIds: string[];
  takenAt: string; // ISO
  cover: string;
  ratio: "portrait" | "landscape" | "square" | "pano";
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
}

export interface Place {
  id: string;
  name: string;
  region: string;
  cover: string;
  /** Position in the stylised map, 0..1 in both axes. */
  x: number;
  y: number;
}

const img = (seed: string, w = 1200, h = 1500) =>
  `https://picsum.photos/seed/livro-${seed}/${w}/${h}`;

export const people: Person[] = [
  { id: "ana", name: "Ana Ribeiro", avatar: img("ana", 400, 400) },
  { id: "leo", name: "Léo", avatar: img("leo", 400, 400) },
  { id: "cecilia", name: "Vovó Cecília", avatar: img("cecilia", 400, 400) },
  { id: "marina", name: "Marina", avatar: img("marina", 400, 400) },
  { id: "pedro", name: "Pedro", avatar: img("pedro", 400, 400) },
  { id: "julia", name: "Júlia", avatar: img("julia", 400, 400) },
];

export const places: Place[] = [
  { id: "rio", name: "Rio de Janeiro", region: "Brasil", cover: img("rio", 1200, 800), x: 0.42, y: 0.62 },
  { id: "trancoso", name: "Trancoso", region: "Bahia", cover: img("trancoso", 1200, 800), x: 0.58, y: 0.44 },
  { id: "lisboa", name: "Lisboa", region: "Portugal", cover: img("lisboa", 1200, 800), x: 0.72, y: 0.28 },
  { id: "mantiqueira", name: "Serra da Mantiqueira", region: "Minas Gerais", cover: img("serra", 1200, 800), x: 0.34, y: 0.54 },
  { id: "casa", name: "Casa da vovó", region: "Petrópolis", cover: img("casa", 1200, 800), x: 0.5, y: 0.7 },
];

export const memories: Memory[] = [
  {
    id: "trancoso-verao",
    title: "Verão em Trancoso",
    phrase: "O mar estava quieto e a gente também.",
    placeId: "trancoso",
    personIds: ["ana", "leo"],
    takenAt: "2022-01-14",
    cover: img("m1", 1400, 1750),
    ratio: "portrait",
  },
  {
    id: "cafe",
    title: "Manhãs de café",
    phrase: "Um ritual pequeno, quase secreto.",
    placeId: "casa",
    personIds: ["ana"],
    takenAt: "2024-03-02",
    cover: img("m2", 1200, 1200),
    ratio: "square",
  },
  {
    id: "cais-belem",
    title: "Cais de Belém",
    phrase: "O rio Tejo parecia um espelho antigo.",
    placeId: "lisboa",
    personIds: ["ana", "marina"],
    takenAt: "2023-06-21",
    cover: img("m3", 1400, 1750),
    ratio: "portrait",
  },
  {
    id: "cozinha-noite",
    title: "Cozinha à noite",
    phrase: "A luz do forno como única companhia.",
    placeId: "casa",
    personIds: ["cecilia"],
    takenAt: "2024-05-18",
    cover: img("m4", 1600, 1000),
    ratio: "landscape",
  },
  {
    id: "praia-deserta",
    title: "Praia deserta",
    phrase: "Como se o dia fosse só nosso.",
    placeId: "trancoso",
    personIds: ["ana", "pedro"],
    takenAt: "2023-08-04",
    cover: img("m5", 1400, 1750),
    ratio: "portrait",
  },
  {
    id: "aniversario",
    title: "Aniversário de Léo",
    phrase: "Cinco anos e um bolo torto.",
    placeId: "casa",
    personIds: ["leo", "ana", "cecilia"],
    takenAt: "2024-09-12",
    cover: img("m6", 1200, 1200),
    ratio: "square",
  },
  {
    id: "mantiqueira",
    title: "Serra da Mantiqueira",
    phrase: "Neblina baixa, silêncio alto.",
    placeId: "mantiqueira",
    personIds: ["ana", "pedro"],
    takenAt: "2024-06-30",
    cover: img("m7", 2000, 900),
    ratio: "pano",
  },
  {
    id: "corcovado",
    title: "Corcovado ao amanhecer",
    phrase: "Ninguém falou por vinte minutos.",
    placeId: "rio",
    personIds: ["ana", "julia"],
    takenAt: "2021-11-10",
    cover: img("m8", 1400, 1750),
    ratio: "portrait",
  },
];

export function getMemory(id: string) {
  return memories.find((m) => m.id === id);
}
export function getPerson(id: string) {
  return people.find((p) => p.id === id);
}
export function getPlace(id: string) {
  return places.find((p) => p.id === id);
}
export function memoriesByPerson(id: string) {
  return memories.filter((m) => m.personIds.includes(id));
}
export function memoriesByPlace(id: string) {
  return memories.filter((m) => m.placeId === id);
}

/**
 * Picks the "featured" memory for the home hero.
 * Prefers memories with round anniversaries (n years ago today ± few days),
 * falls back to the oldest.
 */
export function featuredMemory(now = new Date()): {
  memory: Memory;
  eyebrow: string;
} {
  const scored = memories.map((m) => {
    const d = new Date(m.takenAt);
    const years = now.getFullYear() - d.getFullYear();
    const sameDay =
      d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    const closeDay =
      Math.abs(d.getMonth() - now.getMonth()) <= 0 &&
      Math.abs(d.getDate() - now.getDate()) <= 7;
    let score = 0;
    if (sameDay) score += 100;
    else if (closeDay) score += 40;
    score += Math.min(years, 10) * 3;
    return { m, years, sameDay, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const pick = scored[0];
  let eyebrow: string;
  if (pick.sameDay && pick.years > 0)
    eyebrow = `Há exatamente ${pick.years} ${pick.years === 1 ? "ano" : "anos"}`;
  else if (pick.years >= 5) eyebrow = `Há ${pick.years} anos`;
  else if (pick.years >= 1)
    eyebrow = `Há ${pick.years} ${pick.years === 1 ? "ano" : "anos"}`;
  else eyebrow = "Uma lembrança recente";
  return { memory: pick.m, eyebrow };
}

/* ------------------------------------------------------------------ */
/*  Memory detail — the "chapter" content shown on /memory/$id.        */
/*  Kept optional so a bare Memory (from a list) still works.          */
/* ------------------------------------------------------------------ */

export interface GalleryPhoto {
  id: string;
  src: string;
  ratio: "portrait" | "landscape" | "square" | "pano";
  /** Optional short caption shown in the lightbox. */
  caption?: string;
  /** "HH:MM" of the day. */
  time?: string;
  /** People visible in this specific photo. */
  personIds?: string[];
  /** Small complementary story for this single photo. */
  story?: string;
}

export interface TimelineEntry {
  time: string; // "HH:MM"
  text: string;
}

export interface MemoryDetail {
  story: string[]; // paragraphs
  gallery: GalleryPhoto[];
  timeline?: TimelineEntry[];
}

const detailImg = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/livro-${seed}/${w}/${h}`;

const memoryDetails: Record<string, MemoryDetail> = {
  "trancoso-verao": {
    story: [
      "Chegamos em Trancoso no fim da tarde, com o carro cheio de areia de outra praia e a vontade de não fazer absolutamente nada por alguns dias.",
      "O mar estava quieto de um jeito raro — sem vento, sem barulho, como se estivesse guardando fôlego para outra coisa. A gente sentou e ficou olhando. Foi só isso.",
      "No fim do dia, entendi por que voltamos sempre a este lugar: não é a paisagem, é o silêncio que a gente consegue habitar aqui.",
    ],
    timeline: [
      { time: "09:30", text: "Chegamos na praia." },
      { time: "11:00", text: "Almoçamos peixe grelhado no quiosque." },
      { time: "15:20", text: "Tiramos esta foto." },
      { time: "19:00", text: "Voltamos para a pousada devagar." },
    ],
    gallery: [
      { id: "g1", src: detailImg("tr-1", 1600, 2000), ratio: "portrait", time: "09:41", caption: "As primeiras pegadas do dia.", story: "Ninguém tinha chegado ainda. Só a gente e o vento." },
      { id: "g2", src: detailImg("tr-2", 2000, 900), ratio: "pano", time: "10:12", caption: "A faixa inteira de praia, deserta." },
      { id: "g3", src: detailImg("tr-3", 1200, 1200), ratio: "square", time: "11:05", caption: "Peixe fresco, limão e cerveja." },
      { id: "g4", src: detailImg("tr-4", 1600, 2000), ratio: "portrait", time: "15:22" },
      { id: "g5", src: detailImg("tr-5", 1800, 1200), ratio: "landscape", time: "17:44", caption: "O céu começou a mudar de cor cedo." },
      { id: "g6", src: detailImg("tr-6", 1200, 1600), ratio: "portrait", time: "18:30", story: "Foi aqui que a Ana disse aquela frase que eu nunca mais esqueci." },
      { id: "g7", src: detailImg("tr-7", 2000, 900), ratio: "pano", time: "18:52", caption: "O último recorte de luz sobre a água." },
    ],
  },
};

/**
 * Fallback generator: builds a plausible, elegant chapter for any memory
 * that doesn't have hand-written detail yet. Deterministic per id.
 */
function fallbackDetail(m: Memory): MemoryDetail {
  const seeds = ["a", "b", "c", "d", "e", "f"];
  const shapes: GalleryPhoto["ratio"][] = [
    "portrait", "landscape", "square", "pano", "portrait", "landscape",
  ];
  return {
    story: [
      m.phrase,
      "Alguns dias ficam guardados de um jeito estranho: não pelo que aconteceu, mas pela sensação exata do ar naquele momento. Este foi um deles.",
      "Escrevo isto para não esquecer o pequeno detalhe que só a gente viu.",
    ],
    gallery: seeds.map((s, i) => ({
      id: `${m.id}-${s}`,
      src: detailImg(`${m.id}-${s}`, 1600, i % 3 === 1 ? 900 : 2000),
      ratio: shapes[i],
      time: `${String(9 + i).padStart(2, "0")}:${i % 2 === 0 ? "12" : "48"}`,
    })),
  };
}

export function getMemoryDetail(id: string): MemoryDetail | null {
  const m = getMemory(id);
  if (!m) return null;
  return memoryDetails[id] ?? fallbackDetail(m);
}
