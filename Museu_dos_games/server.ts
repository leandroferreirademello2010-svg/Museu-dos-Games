import login from "./index.html"
import cadastro from "./cadastro.html"
import home from "./home.html"
import criar from "./criar.html"
import pesquisar from "./pesquisar.html"
import perfil from "./perfil.html"
import { db, ACERVO_ID } from "./db"
import { ANO_MAX, ANO_MIN, DESC_JOGO_MAX, TIPOS } from "./shared"
import type { AvaliacaoDTO, JogoDTO, LinhaDoTempoResumo, NovaLinhaDoTempo } from "./shared"

interface UsuarioRow {
    id: number
    username: string
    email: string
    password_hash?: string
}

interface UsuarioSessao {
    id: number
    username: string
    email: string
}

interface ResumoRow {
    id: number
    user_id: number | null
    title: string
    description: string
    start_year: number
    end_year: number
    is_public: number
    author: string
    games_count: number
    media: number | null
    total: number
}

const loggedUsers: Record<string, UsuarioSessao> = {}

// ---------- helpers ----------
function usuarioLogado(req: { cookies: Bun.CookieMap }): UsuarioSessao | null {
    const ses = req.cookies.get("ses")
    return (ses && loggedUsers[ses]) || null
}

const naoLogado = () => Response.json({ msg: "usuário não está logado" }, { status: 401 })
const erro = (msg: string, status = 400) => Response.json({ msg }, { status })
const arredondar = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10)
const anoValido = (n: number) => Number.isInteger(n) && n >= ANO_MIN && n <= ANO_MAX

const SELECT_RESUMO = `
    SELECT t.id, t.user_id, t.title, t.description, t.start_year, t.end_year, t.is_public,
           COALESCE(u.username, 'Museu') AS author,
           (SELECT COUNT(*)     FROM games   g WHERE g.timeline_id = t.id) AS games_count,
           (SELECT AVG(r.score) FROM ratings r WHERE r.timeline_id = t.id) AS media,
           (SELECT COUNT(*)     FROM ratings r WHERE r.timeline_id = t.id) AS total
    FROM timelines t LEFT JOIN users u ON u.id = t.user_id
`

function resumo(r: ResumoRow, uid: number): LinhaDoTempoResumo {
    return {
        id: r.id, title: r.title, description: r.description,
        startYear: r.start_year, endYear: r.end_year,
        isPublic: r.is_public === 1, author: r.author, isOwner: r.user_id === uid,
        gamesCount: r.games_count, media: arredondar(r.media), total: r.total
    }
}

/** Linha do tempo que o usuário pode ver (pública ou dele), ou null. */
function buscarVisivel(id: number, uid: number): ResumoRow | null {
    const row = db.query(`${SELECT_RESUMO} WHERE t.id = :id`).get({ ":id": id }) as ResumoRow | null
    if (!row || (row.is_public !== 1 && row.user_id !== uid)) return null
    return row
}

function avaliacao(id: number, uid: number): AvaliacaoDTO {
    const agg = db.query(`SELECT AVG(score) AS media, COUNT(*) AS total FROM ratings WHERE timeline_id = :id`)
        .get({ ":id": id }) as { media: number | null; total: number }
    const mine = db.query(`SELECT score FROM ratings WHERE timeline_id = :id AND user_id = :uid`)
        .get({ ":id": id, ":uid": uid }) as { score: number } | null
    return { media: arredondar(agg.media), total: agg.total, minha: mine?.score ?? null }
}

function validarNova(b: any): NovaLinhaDoTempo | string {
    if (!b || typeof b !== "object") return "dados inválidos"
    const title = String(b.title ?? "").trim()
    const description = String(b.description ?? "").trim()
    const startYear = Number(b.startYear)
    const endYear = Number(b.endYear)

    if (!title || title.length > 120) return "informe um título (até 120 caracteres)"
    if (description.length > 1000) return "a descrição passa de 1000 caracteres"
    if (!anoValido(startYear) || !anoValido(endYear)) return `os anos devem estar entre ${ANO_MIN} e ${ANO_MAX}`
    if (startYear > endYear) return "o ano inicial não pode ser maior que o final"
    if (!Array.isArray(b.games) || b.games.length < 1 || b.games.length > 100) return "adicione de 1 a 100 jogos"

    const games: NovaLinhaDoTempo["games"] = []
    for (const g of b.games) {
        const name = String(g?.name ?? "").trim()
        const year = Number(g?.year)
        const type = String(g?.type ?? "")
        const gameDesc = String(g?.description ?? "").trim()
        if (!name || name.length > 60) return "cada jogo precisa de um nome (até 60 caracteres)"
        if (!anoValido(year) || year < startYear || year > endYear)
            return `"${name}": o ano precisa estar entre ${startYear} e ${endYear}`
        if (!(TIPOS as readonly string[]).includes(type)) return `"${name}": tipo inválido`
        if (gameDesc.length > DESC_JOGO_MAX) return `"${name}": a descrição passa de ${DESC_JOGO_MAX} caracteres`
        games.push({ name, year, type, description: gameDesc })
    }
    return { title, description, startYear, endYear, isPublic: b.isPublic !== false, games }
}

const inserirLinhaDoTempo = db.transaction((uid: number, nova: NovaLinhaDoTempo) => {
    const r = db.query(`
        INSERT INTO timelines(user_id, title, description, start_year, end_year, is_public)
        VALUES(:uid, :title, :description, :start, :end, :pub)
    `).run({
        ":uid": uid, ":title": nova.title, ":description": nova.description,
        ":start": nova.startYear, ":end": nova.endYear, ":pub": nova.isPublic ? 1 : 0
    })
    const id = Number(r.lastInsertRowid)
    const ins = db.query(`INSERT INTO games(timeline_id, name, year, type, description) VALUES(:tl, :name, :year, :type, :desc)`)
    for (const g of nova.games)
        ins.run({ ":tl": id, ":name": g.name, ":year": g.year, ":type": g.type, ":desc": g.description })
    return id
})

const ORDENS: Record<string, string> = {
    melhor: "COALESCE(media, 0) DESC, total DESC",
    pior: "COALESCE(media, 6) ASC, total DESC",   // sem avaliação vai para o fim
    mais: "total DESC, COALESCE(media, 0) DESC"
}

// ---------- servidor ----------
const srv = Bun.serve({
    port: 3000,
    routes: {
        // páginas
        "/": login,
        "/cadastro": cadastro,
        "/home": home,
        "/criar": criar,
        "/pesquisar": pesquisar,
        "/perfil": perfil,

        // cadastro
        "/user": {
            POST: async (req) => {
                const body = await req.json().catch(() => null)
                const username = String(body?.username ?? "").trim()
                const email = String(body?.email ?? "").trim()
                const password = String(body?.password ?? "")
                if (!username || !email.includes("@") || password.length < 6)
                    return erro("preencha usuário, e-mail válido e senha de pelo menos 6 caracteres")

                const query = db.query(`INSERT INTO users(username, email, password_hash) VALUES(:username, :email, :password_hash)`)
                const hash = await Bun.password.hash(password)
                try {
                    const data = query.run({ ":username": username, ":email": email, ":password_hash": hash })
                    return Response.json(data)
                } catch {
                    return erro("usuário ou e-mail já cadastrado", 409)
                }
            }
        },

        // sessão
        "/login": {
            POST: async (req) => {
                const body = await req.json().catch(() => null)
                const query = db.query(`SELECT * FROM users WHERE username=:username LIMIT 1`)
                const data = query.get({ ":username": String(body?.username ?? "") }) as UsuarioRow | null
                if (!data)
                    return erro("usuário não encontrado", 404)
                const isMatch = await Bun.password.verify(String(body?.password ?? ""), data.password_hash ?? "")
                if (!isMatch)
                    return erro("senha incorreta", 401)
                const uuid = crypto.randomUUID()
                loggedUsers[uuid] = { id: data.id, username: data.username, email: data.email }
                req.cookies.set("ses", uuid, {
                    httpOnly: true, sameSite: "lax", path: "/",
                    ...(body?.remember ? { maxAge: 60 * 60 * 24 * 30 } : {})   // "manter-me conectado"
                })
                return Response.json(isMatch)
            }
        },

        "/login/user": (req) => {
            const data = usuarioLogado(req)
            if (!data)
                return naoLogado()
            return Response.json(data)
        },

        "/logout": {
            POST: (req) => {
                const ses = req.cookies.get("ses")
                if (ses) delete loggedUsers[ses]
                req.cookies.delete("ses")
                return Response.json(true)
            }
        },

        // linhas do tempo
        "/api/timelines": {
            GET: (req) => {
                const user = usuarioLogado(req)
                if (!user) return naoLogado()

                const url = new URL(req.url)
                const q = (url.searchParams.get("q") ?? "").trim()
                const min = Math.max(0, parseInt(url.searchParams.get("min") ?? "0", 10) || 0)
                const orderBy = ORDENS[url.searchParams.get("ordem") ?? ""] ?? ORDENS.melhor
                const like = "%" + q.replace(/[\\%_]/g, "\\$&") + "%"

                const rows = db.query(`
                    SELECT * FROM (${SELECT_RESUMO}
                        WHERE (t.is_public = 1 OR t.user_id = :uid) AND t.title LIKE :like ESCAPE '\\'
                    )
                    WHERE total >= :min
                    ORDER BY ${orderBy}, id DESC
                `).all({ ":uid": user.id, ":like": like, ":min": min }) as ResumoRow[]

                return Response.json(rows.map(r => resumo(r, user.id)))
            },

            POST: async (req) => {
                const user = usuarioLogado(req)
                if (!user) return naoLogado()

                const nova = validarNova(await req.json().catch(() => null))
                if (typeof nova === "string") return erro(nova)

                const id = inserirLinhaDoTempo(user.id, nova)
                return Response.json({ id }, { status: 201 })
            }
        },

        // :id pode ser um número ou "acervo" (a linha do tempo principal)
        "/api/timelines/:id": {
            GET: (req) => {
                const user = usuarioLogado(req)
                if (!user) return naoLogado()

                const id = req.params.id === "acervo" ? ACERVO_ID : Number(req.params.id)
                const row = buscarVisivel(id, user.id)
                if (!row) return erro("linha do tempo não encontrada", 404)

                const games = db.query(`
                    SELECT id, name, year, type, description FROM games
                    WHERE timeline_id = :id ORDER BY year, id
                `).all({ ":id": id }) as JogoDTO[]

                return Response.json({
                    ...resumo(row, user.id),
                    isAcervo: id === ACERVO_ID,
                    games,
                    rating: avaliacao(id, user.id)
                })
            },

            DELETE: (req) => {
                const user = usuarioLogado(req)
                if (!user) return naoLogado()

                const row = buscarVisivel(Number(req.params.id), user.id)
                if (!row) return erro("linha do tempo não encontrada", 404)
                if (row.user_id !== user.id) return erro("só o autor pode excluir", 403)

                db.query(`DELETE FROM timelines WHERE id = :id`).run({ ":id": row.id })
                return Response.json(true)
            }
        },

        "/api/timelines/:id/rating": {
            POST: async (req) => {
                const user = usuarioLogado(req)
                if (!user) return naoLogado()

                const row = buscarVisivel(Number(req.params.id), user.id)
                if (!row) return erro("linha do tempo não encontrada", 404)
                if (row.user_id === user.id) return erro("você não pode avaliar a sua própria linha do tempo", 403)

                const body = await req.json().catch(() => null)
                const score = Number(body?.score)
                if (!Number.isInteger(score) || score < 1 || score > 5) return erro("a nota vai de 1 a 5")

                db.query(`
                    INSERT INTO ratings(timeline_id, user_id, score) VALUES(:tl, :uid, :score)
                    ON CONFLICT(timeline_id, user_id) DO UPDATE SET score = excluded.score
                `).run({ ":tl": row.id, ":uid": user.id, ":score": score })

                return Response.json(avaliacao(row.id, user.id))
            }
        },

        "/api/perfil": (req) => {
            const user = usuarioLogado(req)
            if (!user) return naoLogado()

            const rows = db.query(`${SELECT_RESUMO} WHERE t.user_id = :uid ORDER BY t.id DESC`)
                .all({ ":uid": user.id }) as ResumoRow[]
            const stats = db.query(`
                SELECT COUNT(*) AS total, AVG(r.score) AS media
                FROM ratings r JOIN timelines t ON t.id = r.timeline_id
                WHERE t.user_id = :uid
            `).get({ ":uid": user.id }) as { total: number; media: number | null }

            return Response.json({
                user,
                stats: { timelines: rows.length, ratingsReceived: stats.total, media: arredondar(stats.media) },
                timelines: rows.map(r => resumo(r, user.id))
            })
        }
    },

    fetch() {
        return new Response("Não encontrado", { status: 404 })
    }
})

console.log(`Server running on ${srv.url}`)
