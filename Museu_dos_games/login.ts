import { usuarioAtual } from "./common"

const frmLogin = document.querySelector<HTMLFormElement>("#frm-login")

// quem já está logado não precisa ver o login de novo
usuarioAtual().then(user => { if (user) window.location.href = "/home" })

frmLogin?.addEventListener("submit", async (ev: SubmitEvent) => {
    ev.preventDefault()

    const username = frmLogin.querySelector<HTMLInputElement>('input[name="username"]')
    const password = frmLogin.querySelector<HTMLInputElement>('input[name="password"]')
    const remember = frmLogin.querySelector<HTMLInputElement>('input[name="remember"]')
    if (!username || !password) return

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
            remember: remember?.checked ?? false
        })
    })

    if (response.status == 404)
        return alert("Usuário não encontrado")

    if (response.status == 401)
        return alert("Senha incorreta")

    if (response.ok) {
        document.querySelector(".auth-screen")?.classList.add("saindo")
        setTimeout(() => { window.location.href = "/home" }, 250)
        return
    }

    alert("Não foi possível entrar")
})

export {}
