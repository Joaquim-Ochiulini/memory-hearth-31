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
