import { cardResumo, exigirLogin } from "./common"
import type { LinhaDoTempoResumo } from "./shared"

const q = document.querySelector<HTMLInputElement>("#q")!
const ordem = document.querySelector<HTMLSelectElement>("#ordem")!
const minav = document.querySelector<HTMLSelectElement>("#minav")!
const box = document.querySelector<HTMLElement>("#resultados")!
const vazio = document.querySelector<HTMLElement>("#vazio")!

let ultimaBusca = 0
let timer: ReturnType<typeof setTimeout> | undefined

async function buscar(): Promise<void> {
    const minha = ++ultimaBusca
    const params = new URLSearchParams({ q: q.value.trim(), ordem: ordem.value, min: minav.value })
    const response = await fetch(`/api/timelines?${params}`)
    if (response.status == 401) {
        window.location.href = "/"
        return
    }
    const lista: LinhaDoTempoResumo[] = await response.json()
    if (minha !== ultimaBusca) return   // chegou uma resposta mais nova enquanto esta voltava

    box.replaceChildren(...lista.map(r => cardResumo(r)))
    vazio.style.display = lista.length ? "none" : "block"
}

q.addEventListener("input", () => {
    clearTimeout(timer)
    timer = setTimeout(buscar, 250)
})
ordem.addEventListener("change", buscar)
minav.addEventListener("change", buscar)

exigirLogin().then(user => { if (user) buscar() })

export {}
