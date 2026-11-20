# Museu Interativo dos Games

Refeito sobre a arquitetura do **Prog1-Tri3**: servidor Bun (`Bun.serve` + `routes`), SQLite,
login/cadastro com sessão por cookie e uma página HTML por rota, cada uma com seu script TypeScript.

## Rodando

```bash
bun install
bun run dev      # http://localhost:3000  (use "bun start" sem hot reload)
```

O `database.sqlite` é criado na primeira execução e já vem com o acervo do museu
(21 jogos) e duas linhas do tempo curadas. Para recomeçar do zero, apague o arquivo.

## Estrutura

| Arquivo | Papel |
|---|---|
| `server.ts` | Servidor: rotas das páginas, auth (`/user`, `/login`, `/login/user`, `/logout`) e API (`/api/...`) |
| `db.ts` | Conexão SQLite, tabelas e seed |
| `acervo.ts` | Dados iniciais (antes fixos no `front.html`) |
| `shared.ts` | Tipos e constantes usados por servidor e páginas |
| `index.html` + `login.ts` | `/` — login |
| `cadastro.html` + `cadastro.ts` | `/cadastro` |
| `home.html` + `home.ts` + `timeline.ts` | `/home` — linha do tempo (`?tl=ID` abre outra) e avaliação |
| `criar.html` + `criar.ts` | `/criar` |
| `pesquisar.html` + `pesquisar.ts` | `/pesquisar` |
| `perfil.html` + `perfil.ts` | `/perfil` |
| `common.ts` | Helpers: checagem de login, logout, criação de elementos, cards |
| `front.css` | Estilo do projeto original |

## Tabelas

`users` (igual ao Prog1) · `timelines` (`user_id` nulo = do museu) · `games` · `ratings` (uma nota por usuário por linha do tempo)

## Regras

- Todas as páginas, exceto login e cadastro, exigem sessão (o servidor também valida a API).
- Linhas do tempo privadas só aparecem para o autor.
- Não é possível avaliar a própria linha do tempo; reavaliar troca a nota anterior.
- Sessões ficam em memória (como no Prog1): reiniciar o servidor desloga todo mundo.
