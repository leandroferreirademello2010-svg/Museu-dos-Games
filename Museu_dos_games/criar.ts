import { exigirLogin } from "./common"

const form = document.querySelector<HTMLFormElement>("#criar-form")!
const lista = document.querySelector<HTMLElement>("#jogos-lista")!
const valor = (id: string) => document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(id)!.value

exigirLogin()

document.querySelector("#add-jogo")!.addEventListener("click", () => {
    const nova = lista.firstElementChild!.cloneNode(true) as HTMLElement
    nova.querySelectorAll("input").forEach(i => { i.value = "" })
    nova.querySelector(".desc-count")!.textContent = "0/50"
    nova.querySelector("select")!.selectedIndex = 0
    lista.append(nova)
})

lista.addEventListener("input", (e) => {
    const alvo = e.target as HTMLInputElement
    if (alvo.classList.contains("jogo-desc"))
        alvo.parentElement!.querySelector(".desc-count")!.textContent = `${alvo.value.length}/50`
})

lista.addEventListener("click", (e) => {
    const alvo = e.target as HTMLElement
    if (alvo.classList.contains("rm") && lista.children.length > 1)
        alvo.parentElement!.remove()
})

form.addEventListener("submit", async (ev: SubmitEvent) => {
    ev.preventDefault()

    const games = [...lista.querySelectorAll<HTMLElement>(".jogo-row")].map(row => {
        const [nome, ano, desc] = row.querySelectorAll<HTMLInputElement>("input")
        return { name: nome.value, year: Number(ano.value), type: row.querySelector("select")!.value, description: desc.value }
    })

    const response = await fetch("/api/timelines", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            title: valor("#tl-titulo"),
            description: valor("#tl-desc"),
            startYear: Number(valor("#tl-inicio")),
            endYear: Number(valor("#tl-fim")),
            isPublic: valor("#tl-vis") === "1",
            games
        })
    })

    if (response.status == 401) {
        window.location.href = "/"
        return
    }

    if (response.status == 400)
        return alert(`Não foi possível publicar: ${(await response.json()).msg}`)

    if (response.ok) {
        const { id } = await response.json()
        window.location.href = `/home?tl=${id}`
        return
    }

    alert("Não foi possível publicar")
})

export {}
