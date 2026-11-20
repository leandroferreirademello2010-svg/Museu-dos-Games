import { exigirLogin, formatarNota, textoAvaliacoes, el } from "./common"
import { renderTimeline } from "./timeline"
import type { AvaliacaoDTO, LinhaDoTempoDetalhe } from "./shared"

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!

// Esc fecha a barra lateral
const menu = $<HTMLInputElement>("#menu-toggle")
document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.checked = false })

function montarAvaliacao(tl: LinhaDoTempoDetalhe): void {
    const stars = $("#stars")
    const mostrar = (r: AvaliacaoDTO) => {
        $("#rating-media").textContent = r.media === null ? "" : formatarNota(r.media)
        $("#rating-total").textContent = r.total === 0 ? "Ainda sem avaliações" : textoAvaliacoes(r.total)
        stars.querySelectorAll<HTMLElement>(".star").forEach(b =>
            b.classList.toggle("on", r.minha !== null && Number(b.dataset.v) <= r.minha))
    }

    if (tl.isOwner) {
        $("#rating-label").textContent = "Esta é a sua linha do tempo — a comunidade avalia por aqui."
        stars.hidden = true
        mostrar(tl.rating)
        return
    }

    // ordem 5→1 + flex row-reverse: o :hover ~ acende as estrelas anteriores só com CSS
    for (let v = 5; v >= 1; v--) {
        const b = el("button", { class: "star", text: "★", attrs: { type: "button", "data-v": String(v), "aria-label": `Dar nota ${v} de 5` } })
        b.addEventListener("click", async () => {
            const response = await fetch(`/api/timelines/${tl.id}/rating`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ score: v })
            })
            if (!response.ok) return alert((await response.json()).msg)
            mostrar(await response.json())
        })
        stars.append(b)
    }
    mostrar(tl.rating)
}

async function init(): Promise<void> {
    if (!await exigirLogin()) return

    const id = new URLSearchParams(window.location.search).get("tl") ?? "acervo"
    const response = await fetch(`/api/timelines/${encodeURIComponent(id)}`)
    if (!response.ok) {
        alert("Linha do tempo não encontrada")
        window.location.href = "/home"
        return
    }

    const tl: LinhaDoTempoDetalhe = await response.json()
    document.title = `${tl.title} · Museu Interativo dos Games`
    $("#tl-kicker").textContent = tl.isAcervo ? "Acervo principal" : `Linha do tempo de ${tl.author}`
    $("#tl-title").textContent = tl.title
    $("#tl-desc").textContent = tl.description
    renderTimeline($("#timeline-track"), tl.startYear, tl.endYear, tl.games)
    montarAvaliacao(tl)
}

init()

export {}
