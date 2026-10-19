export const VIDEOAULA_CATEGORIAS = [
  { value: "todas", label: "Todas" },
  { value: "redacao", label: "Redação" },
  { value: "linguagens", label: "Linguagens" },
  { value: "gramatica", label: "Gramática" },
] as const

export type VideoaulaCategoria =
  (typeof VIDEOAULA_CATEGORIAS)[number]["value"]

export type CategoriaVideoaula = Exclude<VideoaulaCategoria, "todas">

export const TERMOS_CATEGORIAS_VIDEOAULA: Record<
  CategoriaVideoaula,
  string[]
> = {
  redacao: [
    "redação",
    "redacao",
    "tese",
    "argumentação",
    "argumentacao",
    "repertório",
    "repertorio",
    "dissertativo",
    "intervenção",
    "intervencao",
    "estrutura",
    "introdução",
    "introducao",
    "desenvolvimento",
    "conclusão",
    "conclusao",
    "parágrafo",
    "paragrafo",
    "competência",
    "competencia",
    "enem",
    "tema",
  ],
  linguagens: [
    "linguagens",
    "linguagem",
    "interpretação",
    "interpretacao",
    "literatura",
    "leitura",
    "semântica",
    "semantica",
  ],
  gramatica: [
    "gramática",
    "gramatica",
    "pontuação",
    "pontuacao",
    "ortografia",
    "acentuação",
    "acentuacao",
    "sintaxe",
    "concordância",
    "concordancia",
    "crase",
  ],
}
