// Dados iniciais do museu (antes ficavam fixos no front.html).

export interface JogoSeed {
    name: string
    year: number
    type: string
    description: string
}

export const ACERVO_TITULO = "A linha do tempo dos games"
export const ACERVO_DESCRICAO = "Um só percurso, de 1980 até hoje."

export const ACERVO: JogoSeed[] = [
    { name: "Pac-Man", year: 1980, type: "Arcade", description: "Fliperama que virou ritual: fugir dos fantasmas no labirinto entrou para a cultura popular mundial." },
    { name: "Donkey Kong", year: 1981, type: "Plataforma", description: "Primeira aparição do encanador que ainda não se chamava Mario — nascia o gênero de plataforma." },
    { name: "Tetris", year: 1984, type: "Puzzle", description: "Peças caindo, linhas somem: um dos quebra-cabeças mais portados da história dos games." },
    { name: "Super Mario Bros.", year: 1985, type: "Plataforma", description: "Definiu o salto, o ritmo e a estrutura de fases que o gênero plataforma usaria por décadas." },
    { name: "The Legend of Zelda", year: 1986, type: "Aventura", description: "Mundo aberto para explorar em qualquer ordem, com segredos escondidos em cada canto." },
    { name: "Sonic the Hedgehog", year: 1991, type: "Plataforma", description: "Velocidade como identidade visual: loopings e fases que respondiam à pressa do jogador." },
    { name: "Street Fighter II", year: 1991, type: "Luta", description: "Popularizou o combo e o duelo 1x1 competitivo nos fliperamas do mundo todo." },
    { name: "Doom", year: 1993, type: "Tiro em primeira pessoa", description: "Corredores labirínticos e velocidade brutal moldaram o gênero FPS por anos." },
    { name: "Super Mario 64", year: 1996, type: "Plataforma 3D", description: "Levou o gênero para o espaço tridimensional com uma câmera livre inédita na época." },
    { name: "Half-Life", year: 1998, type: "Tiro narrativo", description: "Contou sua história inteira sem cortar para cutscenes, dentro do próprio jogo." },
    { name: "The Sims", year: 2000, type: "Simulação", description: "Transformou rotina doméstica em jogo de estratégia social e virou fenômeno de massa." },
    { name: "Grand Theft Auto III", year: 2001, type: "Mundo aberto", description: "Cidade livre para percorrer sem missão fixa: referência do gênero mundo aberto moderno." },
    { name: "World of Warcraft", year: 2004, type: "MMORPG", description: "Milhões de jogadores dividindo o mesmo mundo persistente ao mesmo tempo." },
    { name: "Portal", year: 2007, type: "Puzzle", description: "Um portal de entrada e outro de saída bastaram para reinventar o quebra-cabeça em primeira pessoa." },
    { name: "Minecraft", year: 2011, type: "Sandbox", description: "Blocos simples viraram a maior superfície de criação coletiva dos games." },
    { name: "The Last of Us", year: 2013, type: "Ação narrativa", description: "Colocou roteiro e atuação no centro da experiência de sobrevivência pós-apocalíptica." },
    { name: "The Witcher 3", year: 2015, type: "RPG", description: "Missões secundárias com peso de história principal elevaram o padrão do RPG ocidental." },
    { name: "Fortnite", year: 2017, type: "Battle royale", description: "Cem jogadores, uma ilha, um vencedor: popularizou o formato battle royale em escala global." },
    { name: "Among Us", year: 2020, type: "Social dedução", description: "Jogo de 2018 que explodiu em 2020, unindo dedução social e transmissões ao vivo." },
    { name: "Elden Ring", year: 2022, type: "RPG de ação", description: "Mundo aberto desafiador que expandiu a fórmula dos jogos conhecidos por sua dificuldade." },
    { name: "Baldur's Gate 3", year: 2023, type: "RPG", description: "Escolhas de mesa de RPG traduzidas em consequências reais dentro do próprio jogo." },
]

// Linhas do tempo curadas pela equipe, para a busca não começar vazia.
export const CURADAS = [
    {
        title: "Mestres da plataforma",
        description: "Do macaco que jogava barris ao salto em três dimensões.",
        jogos: ["Donkey Kong", "Super Mario Bros.", "Sonic the Hedgehog", "Super Mario 64"],
    },
    {
        title: "RPGs e mundos para se perder",
        description: "Aventuras que pedem dezenas de horas e devolvem histórias inesquecíveis.",
        jogos: ["The Legend of Zelda", "World of Warcraft", "The Witcher 3", "Elden Ring", "Baldur's Gate 3"],
    },
]
