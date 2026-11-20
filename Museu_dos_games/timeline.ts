import { el } from "./common"
import type { JogoDTO } from "./shared"

function marcador(g: JogoDTO, dx: number, borda: string): HTMLElement {
    const m = el("div", { class: "marker" + (borda ? ` ${borda}` : ""), attrs: { tabindex: "0" } },
        el("div", { class: "placard" },
            el("div", { class: "p-top" },
                el("span", { class: "p-name", text: g.name }),
                el("span", { class: "p-year mono", text: String(g.year) })),
            el("span", { class: "p-type", text: g.type }),
            ...(g.description ? [el("div", { class: "p-desc", text: g.description })] : [])),
        el("div", { class: "stem" }),
        el("div", { class: "dot" }),
        el("div", { class: "label", text: g.name }))
    if (dx) m.style.setProperty("--dx", `${dx}px`)
    return m
}

function rotuloAno(ano: number): HTMLElement {
    const yr = el("div", { class: "yr mono" })
    const txt = String(ano)
    if (ano % 5 === 0) yr.textContent = txt
    else yr.append(el("span", { class: "c", text: txt.slice(0, 2) }), txt.slice(2))
    return yr
}

/** Monta as décadas, os anos e os marcadores a partir dos jogos vindos da API. */
export function renderTimeline(track: HTMLElement, inicio: number, fim: number, jogos: JogoDTO[]): void {
    const porAno = new Map<number, JogoDTO[]>()
    for (const g of jogos) porAno.set(g.year, [...(porAno.get(g.year) ?? []), g])

    const total = fim - inicio + 1
    const anoAtual = new Date().getFullYear()
    const blocos: HTMLElement[] = []

    for (let dec = Math.floor(inicio / 10) * 10; dec <= fim; dec += 10) {
        const ini = Math.max(dec, inicio)
        const ultimo = Math.min(dec + 9, fim)

        const linha = el("div", { class: "decade-row" })
        for (let ano = ini; ano <= ultimo; ano++) {
            const doAno = porAno.get(ano) ?? []
            const idx = ano - inicio
            const borda = idx < 6 ? "edge-l" : idx >= total - 5 ? "edge-r" : ""

            const col = el("div", {
                class: "year-col" + (doAno.length ? " has-game" : "") + (ano % 5 === 0 ? " yr-major" : "")
            })
            doAno.forEach((g, i) => col.append(marcador(g, (i - (doAno.length - 1) / 2) * 16, borda)))
            col.append(el("div", { class: "baseline" }), rotuloAno(ano))
            linha.append(col)
        }

        const bloco = el("div", { class: "decade-block" },
            el("div", { class: "decade-label" },
                el("div", { class: "name display", text: `${dec}s` }),
                el("div", { class: "range mono", text: `${ini}–${ultimo >= anoAtual ? "atual" : ultimo}` })),
            linha)
        bloco.style.setProperty("--n", String(ultimo - ini + 1))
        blocos.push(bloco)
    }

    track.replaceChildren(...blocos)
}
