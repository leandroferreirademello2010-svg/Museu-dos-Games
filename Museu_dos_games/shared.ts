// Tipos e constantes usados tanto pelo servidor quanto pelas páginas.

export const TIPOS = ["Arcade", "Console", "PC", "Mobile"] as const
export const ANO_MIN = 1980
export const DESC_JOGO_MAX = 50
export const ANO_MAX = Math.max(2026, new Date().getFullYear())

export interface UsuarioLogado {
    id: number
    username: string
    email: string
}

export interface JogoDTO {
    id: number
    name: string
    year: number
    type: string
    description: string
}

export interface AvaliacaoDTO {
    media: number | null
    total: number
    minha: number | null
}

export interface LinhaDoTempoResumo {
    id: number
    title: string
    description: string
    startYear: number
    endYear: number
    isPublic: boolean
    author: string
    isOwner: boolean
    gamesCount: number
    media: number | null
    total: number
}

export interface LinhaDoTempoDetalhe {
    id: number
    title: string
    description: string
    startYear: number
    endYear: number
    isPublic: boolean
    author: string
    isOwner: boolean
    isAcervo: boolean
    games: JogoDTO[]
    rating: AvaliacaoDTO
}

export interface NovaLinhaDoTempo {
    title: string
    description: string
    startYear: number
    endYear: number
    isPublic: boolean
    games: { name: string; year: number; type: string; description: string }[]
}

export interface PerfilDTO {
    user: UsuarioLogado
    stats: { timelines: number; ratingsReceived: number; media: number | null }
    timelines: LinhaDoTempoResumo[]
}
