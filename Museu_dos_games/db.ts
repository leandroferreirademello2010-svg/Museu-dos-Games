import { Database } from "bun:sqlite";
import { ACERVO, ACERVO_DESCRICAO, ACERVO_TITULO, CURADAS } from "./acervo";

const db = new Database("database.sqlite");

db.exec(`PRAGMA foreign_keys = ON`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT NOT NULL UNIQUE,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL
    );

    -- user_id NULL = linha do tempo do próprio museu (acervo e curadorias)
    CREATE TABLE IF NOT EXISTS timelines (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        description     TEXT NOT NULL DEFAULT '',
        start_year      INTEGER NOT NULL,
        end_year        INTEGER NOT NULL,
        is_public       INTEGER NOT NULL DEFAULT 1,
        created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS games (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timeline_id     INTEGER NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        year            INTEGER NOT NULL,
        type            TEXT NOT NULL,
        description     TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS ratings (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timeline_id     INTEGER NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score           INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
        UNIQUE (timeline_id, user_id)
    );
`);

// ---------- seed: só roda no banco vazio ----------
const { n } = db.query(`SELECT COUNT(*) AS n FROM timelines`).get() as { n: number }

if (n === 0) {
    const insTimeline = db.query(`
        INSERT INTO timelines(user_id, title, description, start_year, end_year, is_public)
        VALUES(NULL, :title, :description, :start, :end, 1)
    `)
    const insGame = db.query(`
        INSERT INTO games(timeline_id, name, year, type, description)
        VALUES(:tl, :name, :year, :type, :description)
    `)

    db.transaction(() => {
        const anoFinal = Math.max(2026, new Date().getFullYear())
        const acervoId = Number(insTimeline.run({
            ":title": ACERVO_TITULO, ":description": ACERVO_DESCRICAO, ":start": 1980, ":end": anoFinal
        }).lastInsertRowid)
        for (const g of ACERVO)
            insGame.run({ ":tl": acervoId, ":name": g.name, ":year": g.year, ":type": g.type, ":description": g.description })

        for (const c of CURADAS) {
            const jogos = c.jogos.map(nome => ACERVO.find(g => g.name === nome)!)
            const anos = jogos.map(j => j.year)
            const id = Number(insTimeline.run({
                ":title": c.title, ":description": c.description,
                ":start": Math.min(...anos), ":end": Math.max(...anos)
            }).lastInsertRowid)
            for (const g of jogos)
                insGame.run({ ":tl": id, ":name": g.name, ":year": g.year, ":type": g.type, ":description": g.description })
        }
    })()
}

const ACERVO_ID = (db.query(`SELECT id FROM timelines WHERE user_id IS NULL AND title = :t`)
    .get({ ":t": ACERVO_TITULO }) as { id: number }).id

export { db, ACERVO_ID }
