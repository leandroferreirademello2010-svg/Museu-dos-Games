import { cardResumo, el, exigirLogin, formatarNota, iniciais, sair } from "./common"
import type { PerfilDTO } from "./shared"

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!

document.querySelector("#sair")!.addEventListener("click", (ev) => {
    ev.preventDefault()
    sair()
})

async function carregar(): Promise<void> {
    const response = await fetch("/api/perfil")
    const { user, stats, timelines }: PerfilDTO = await response.json()

    $("#avatar").textContent = iniciais(user.username)
    $("#perfil-nome").textContent = user.username
    $("#perfil-email").textContent = user.email
    $("#stat-timelines").textContent = String(stats.timelines)
    $("#stat-avaliacoes").textContent = String(stats.ratingsReceived)
    $("#stat-media").textContent = stats.media === null ? "—" : formatarNota(stats.media)

    const lista = $("#minhas")
    lista.replaceChildren(...timelines.map(t => {
        const excluir = el("button", { class: "btn-del", text: "Excluir", attrs: { type: "button" } })
        excluir.addEventListener("click", async () => {
            if (!confirm(`Excluir "${t.title}"? Esta ação não pode ser desfeita.`)) return
            const r = await fetch(`/api/timelines/${t.id}`, { method: "DELETE" })
            if (!r.ok) return alert((await r.json()).msg)
            carregar()
        })
        return cardResumo(t, excluir)
    }))
    $("#vazio").style.display = timelines.length ? "none" : "block"
}

exigirLogin().then(user => { if (user) carregar() })

export {}
