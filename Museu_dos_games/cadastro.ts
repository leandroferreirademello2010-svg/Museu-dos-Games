const frmCadastro = document.querySelector<HTMLFormElement>("#frm-cadastro")

frmCadastro?.addEventListener("submit", async (ev: SubmitEvent) => {
    ev.preventDefault()

    const username = frmCadastro.querySelector<HTMLInputElement>('input[name="username"]')
    const email = frmCadastro.querySelector<HTMLInputElement>('input[name="email"]')
    const password = frmCadastro.querySelector<HTMLInputElement>('input[name="password"]')
    if (!username || !email || !password) return

    const response = await fetch("/user", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
        })
    })

    if (response.status == 409)
        return alert("Usuário ou e-mail já cadastrado")

    if (response.status == 400)
        return alert((await response.json()).msg)

    if (response.ok) {
        alert("Cadastro realizado! Faça login para entrar.")
        window.location.href = "/"
        return
    }

    alert("Não foi possível cadastrar")
})

export {}
