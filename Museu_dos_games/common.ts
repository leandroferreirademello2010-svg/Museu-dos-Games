import type { LinhaDoTempoResumo, UsuarioLogado } from "./shared"

type Filho = Node | string

/** Cria elementos sem usar innerHTML (os textos vêm de usuários). */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    opts: { class?: string; text?: string; attrs?: Record<string, string> } = {},
    ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag)
    if (opts.class) e.className = opts.class
    if (opts.text !== undefined) e.textContent = opts.text
    for (const [k, v] of Object.entries(opts.attrs ?? {})) e.setAttribute(k, v)
    e.append(...filhos)
    return e
}

export const formatarNota = (n: number) => n.toFixed(1).replace(".", ",")
export const textoAvaliacoes = (n: number) =>
    n === 0 ? "sem avaliações" : n === 1 ? "1 avaliação" : `${n} avaliações`
export const iniciais = (nome: string) => (nome.trim()[0] ?? "?").toUpperCase()

export async function usuarioAtual(): Promise<UsuarioLogado | null> {
    const response = await fetch("/login/user")
    return response.ok ? await response.json() : null
}

/** Garante que há alguém logado (senão volta ao login) e preenche o chip de perfil. */
export async function exigirLogin(): Promise<UsuarioLogado | null> {
    const user = await usuarioAtual()
    if (!user) {
        alert("Usuário não logado")
        window.location.href = "/"
        return null
    }
    document.querySelectorAll<HTMLElement>(".profile .username").forEach(e => e.textContent = user.username)
    document.querySelectorAll<HTMLElement>(".profile .thumb").forEach(e => e.textContent = iniciais(user.username))
    return user
}

export async function sair(): Promise<void> {
    await fetch("/logout", { method: "POST" })
    window.location.href = "/"
}

/** Card de linha do tempo usado na pesquisa e no perfil. */
export function cardResumo(r: LinhaDoTempoResumo, acao?: Node): HTMLElement {
    const meta = [`por ${r.author}`, `${r.gamesCount} ${r.gamesCount === 1 ? "jogo" : "jogos"}`, `${r.startYear}–${r.endYear}`]
    if (!r.isPublic) meta.push("privada")

    return el("div", { class: "tl-card" },
        el("div", {},
            el("h3", {}, el("a", { text: r.title, attrs: { href: `/home?tl=${r.id}` } })),
            el("div", { class: "meta", text: meta.join(" · ") })),
        el("div", { class: "card-side" },
            el("div", { class: "nota" },
                el("b", { text: r.media === null ? "—" : formatarNota(r.media) }),
                el("span", { text: textoAvaliacoes(r.total) })),
            ...(acao ? [acao] : [])))
}
