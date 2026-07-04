# Lumina

> Toda lembrança merece uma história.

Lumina é um **livro digital de memórias** — não uma galeria de fotos. Cada tela é uma página. Cada gesto é o folhear de um álbum. O objetivo do produto não é organizar imagens: é **preservar histórias**.

---

## 1. Visão de produto

- Preservar histórias, não arquivar arquivos.
- A fotografia é sempre protagonista; o texto apenas complementa.
- Sensação-alvo ao abrir o app pela primeira vez:
  1. "Que aplicativo bonito."
  2. "Eu quero colocar minhas memórias aqui."

## 2. Princípios de design

- **Calma** — nada pisca, nada urge, nada compete pela atenção.
- **Nostalgia** — papel, tinta, brasa. Serifas editoriais.
- **Elegância** — restringir mais do que adicionar.
- **Simplicidade** — poucos elementos por tela, muito branco.
- **Emoção** — cada composição transmite algo antes de ser lida.
- **Organização** — silenciosa, invisível quando não precisa aparecer.

## 3. Regras de UX

- Antes de qualquer tela, perguntar: *"Isso parece painel administrativo ou álbum de memórias?"* — se painel, refazer.
- Uso confortável **com uma só mão**.
- Toques respondem em < 100 ms; transições entre 240 e 360 ms.
- Animações discretas — nunca performáticas. Preferir *fade + subtle rise* e `layoutId` para continuidade entre telas.
- Nada de estados de erro genéricos; a linguagem é editorial ("Essa página não existe no álbum.").
- Datas em português, formatação longa ("14 de janeiro de 2022") no detalhe; ano seco na miniatura.

## 4. Identidade visual

### Paleta (tokens em `src/styles.css`)

| Token           | Hex        | Uso                          |
| --------------- | ---------- | ---------------------------- |
| `background`    | `#F7F5F2`  | Fundo — papel quente         |
| `surface`       | `#FFFCF8`  | Cards, superfícies elevadas  |
| `ink`           | `#2B2623`  | Texto principal, primário    |
| `ink-soft`      | `#7A746E`  | Texto secundário             |
| `ink-mute`      | `#9A938B`  | Eyebrows, meta               |
| `accent`        | `#B08B57`  | Destaque discreto (brasa)    |
| `line`          | `#E9E3DB`  | Divisores, hairlines         |

Cores são **sempre** consumidas via tokens semânticos (`bg-background`, `text-ink`, `border-line`) — nunca hex hardcoded em componentes.

### Tipografia

- **Cormorant Garamond** — títulos e display (`.text-display`, `h1/h2/h3`, `font-serif`).
- **Inter** — corpo, meta, botões (`font-sans`).
- Sem uppercase agressivo. Eyebrows em `text-[10px] uppercase tracking-[0.28em]` para respirar.

### Regras visuais

- Nada de gradientes chamativos.
- Nada de sombras pesadas — apenas `--shadow-paper` / `--shadow-lift`.
- Nada de bordas fortes — hairlines em `--line`.
- Cantos: raio base `14–20px`. Retratos redondos apenas para pessoas.
- Fotografia grande, sempre `object-cover`, `loading="lazy"`.

## 5. Arquitetura de código

```
src/
  components/app/   componentes visuais reutilizáveis do Lumina
  components/ui/    primitivos shadcn (não redecorar sem necessidade)
  features/         domínio (memórias, pessoas, lugares)
  services/         adaptadores externos (futuro Cloud)
  hooks/            hooks compartilhados
  utils/            puros, sem React
  types/            interfaces de domínio
  routes/           rotas (TanStack Router — file-based)
```

Regras:
- Nenhum componente duplica UI que já exista em `components/app/`.
- Rotas contêm composição, não estilo profundo.
- Dados mock em `features/memories/data.ts` — substituíveis por serviço sem tocar em UI.

## 6. Decisões importantes (log)

- **2026-07-04** — Rebranding "Livro" → **Lumina**. Paleta migrada para papel/brasa (`#F7F5F2 / #B08B57`). Tipografia display trocada para Cormorant Garamond. Datas passam a ser formatadas em UTC para eliminar mismatch de hidratação SSR/cliente.

## 7. O que ainda **não** existe (por design)

Upload, banco de dados, login, mapa real, pessoas editáveis, linha do tempo, pesquisa, favoritos. Serão adicionados por etapas, sob solicitação.
