/* Universo Sorriso Baiano — conteúdo do site.
   Na versão oficial, cardápio, horários e eventos passam a vir de uma planilha Google
   (ver CONFIG.planilhaCsv em app.js). Tudo aqui é o conteúdo-base da prévia. */
window.SB = {
  marca: {
    nome: "Sorriso Baiano",
    universo: "Universo Sorriso Baiano",
    desde: 2013,
    lugar: "Praia de Guaratiba · Prado, Bahia",
    essencia: "Cozinha baiana com sotaque mediterrâneo",
  },

  casas: {
    "cafe-bistro": {
      ordem: 1,
      nome: "Café & Bistrô",
      nomeCompleto: "Sorriso Baiano Café & Bistrô",
      momento: "manhã",
      rotulo: "Café, afeto & Bahia",
      tagline: "O dia começa sem pressa. À noite, a Itália chega à mesa.",
      onde: "Shopping Guaratiba",
      mapa: "https://www.google.com/maps/search/?api=1&query=Shopping+Guaratiba+Prado+BA",
      instagram: "sorrisobaianocafebistro",
      reserva: { tipo: "instagram", alvo: "sorrisobaianocafebistro" },
      horario: [
        ["Café da manhã e brunch", "até 19h"],
        ["Massas, petiscos e sanduíches", "a partir das 19h"],
      ],
      sobre: [
        "A casa mais íntima do universo. De dia, café passado na hora, tapiocas, croissants e waffles. Depois das 19h, as luzes baixam e entram as massas, os petiscos e os sushis.",
        "É aqui que o sotaque italiano do Sorriso Baiano fala mais alto: o Fettuccine Alfredo é finalizado dentro de uma peça inteira de Grana Padano, e o tiramisù leva a clássica spolverata di cacao.",
      ],
      italiano: "Dolce far niente",
      cardapio: [
        { secao: "Tapioca", turno: "dia", itens: [
          ["Frango Cremoso", "Frango desfiado com requeijão", 20],
          ["Sertão Brasileiro", "Carne seca com requeijão", 22],
          ["Clássico do Café", "Queijo e ovo", 18],
          ["Queridinha da Casa", "Queijo e tomate", 16],
        ]},
        { secao: "Croissant", turno: "dia", itens: [
          ["Franguinho", "Frango desfiado com alface", 22],
          ["Clássico do Café", "Queijo quente e ovo", 22],
          ["Caprese", "Queijo e tomate", 20],
          ["Dolce Amore", "Nutella com morango", 26],
        ]},
        { secao: "Sanduíche no pão baguete", turno: "dia", itens: [
          ["Frangostoso", "Frango desfiado com creme de queijo, tomate confit e folhas", 29],
          ["Clássico do Café com Bacon", "Pão com ovos e bacon", 29],
          ["Tradicional", "Pão na manteiga, queijo quente, maionese da casa, tomate-cereja e folhas frescas", 26],
        ]},
        { secao: "Waffle", turno: "dia", itens: [
          ["Morango com Nutella", "", 26],
          ["Banana com Doce de Leite", "", 24],
          ["Queijo com Tomate", "", 22],
          ["Frango com Queijo", "", 24],
        ]},
        { secao: "Salgados e folhados", turno: "dia", itens: [
          ["Coxinha de Charque", "", 16],
          ["Empada de Bacalhau com Palmito", "", 16],
          ["Coxinha de Frango com Requeijão", "", 14],
          ["Folhado Quatro Queijos", "", 16],
          ["Folhado de Maçã e Canela", "", 14],
        ]},
        { secao: "Massas", turno: "noite", itens: [
          ["Fettuccine Alfredo", "Molho cremoso de manteiga, finalizado em uma peça inteira de Grana Padano", 89.9],
          ["Fettuccine com Mignon ao Quatro Queijos", "Fettuccine amanteigado com tiras de mignon e cremoso molho de quatro queijos", 89.9],
          ["Spaghetti al Sugo di Gamberi", "Molho de tomate artesanal, camarões salteados no alho, ervas frescas e azeite extravirgem", 74.9],
          ["Penne all'Amatriciana", "Molho de tomate italiano, guanciale e pecorino, levemente apimentado", 74.9],
          ["Penne alla Bolognese", "Ragù de carne preparado lentamente e finalizado com parmesão", 54.9],
        ]},
        { secao: "Petiscos da noite", turno: "noite", itens: [
          ["Filé a Palito à 4 Queijos com Torradas", "Tiras de filé mignon ao molho de quatro queijos", 159],
          ["Filé a Palito com Fritas", "Tiras de filé mignon com fritas e molho da casa", 149],
          ["Isca de Peixe", "Peixe em tiras crocantes, acompanhado do molho da casa", 125],
          ["Aipim Frito", "", 45],
          ["Batata Frita", "", 45],
        ]},
        { secao: "Paninis", turno: "noite", itens: [
          ["Panini do Vovô", "Baguete, costela desfiada, creme de queijo, rúcula e cebola caramelizada", 40],
          ["Panini Caprese", "Baguete, creme de queijo, pesto, tomate confit e folhas", 38],
        ]},
      ],
      pratos: ["mamma-mia", "che-figata", "fettuccine"],
      instagramPosts: ["DcBZZYpx5rb", "DbTxw_0MO5n", "DeYJx7kxELr"],
    },

    restaurante: {
      ordem: 2,
      nome: "Restaurante",
      nomeCompleto: "Restaurante Sorriso Baiano",
      momento: "tarde",
      rotulo: "O primeiro do universo · desde 2013",
      tagline: "Cozinha contemporânea com alma baiana e sotaque mediterrâneo.",
      onde: "Praia de Guaratiba",
      mapa: "https://www.google.com/maps/search/?api=1&query=Restaurante+Sorriso+Baiano+Guaratiba+Prado+BA",
      instagram: "restaurantesorrisobaiano",
      reserva: { tipo: "instagram", alvo: "restaurantesorrisobaiano" },
      horario: [
        ["Segunda a domingo", "9h às 17h"],
        ["Quarta-feira", "fechado"],
      ],
      sobre: [
        "Foi aqui que tudo começou, em 2013. Uma varanda entre coqueiros, mesas no jardim e um caminho à beira-mar que leva até o Beach Club, tão bonito que vira parte do passeio.",
        "Cada prato conta uma história: lendas, memórias de família, ingredientes da feira de Prado. Dendê, coco e peixe fresco encontram azeite, limão-siciliano e técnica italiana.",
      ],
      italiano: "La vita è bella",
      cardapio: [
        { secao: "Histórias no prato", turno: "dia", itens: [
          ["Naiá", "Risoto de casquinha de siri inspirado na lenda da Vitória-Régia · 20º Festival Gastronômico", null],
          ["Drink Naiá", "Jabuticaba e limão-siciliano", null],
          ["Amaná", "Costela, inhame, cuscuz e tucupi: a abundância que a chuva traz · 19º Festival", null],
          ["Uru'Ku", "Drink em homenagem à ancestralidade indígena e à agricultura familiar · 19º Festival", null],
        ]},
      ],
      cardapioNota: "O cardápio completo do Restaurante entra na versão oficial do site, atualizado direto pela equipe.",
      pratos: ["naia", "amana", "mani"],
      instagramPosts: ["DbIxz_ETZF2", "DezFy2jTeIc", "DeX8yvKJiP6"],
    },

    "beach-club": {
      ordem: 3,
      nome: "Beach Club",
      nomeCompleto: "Sorriso Baiano Beach Club",
      momento: "noite",
      rotulo: "Exclusividade à beira-mar",
      tagline: "Pés na areia de dia. Lua cheia, música e brinde à noite.",
      onde: "Na areia da Praia de Guaratiba",
      mapa: "https://www.google.com/maps/search/?api=1&query=Sorriso+Baiano+Beach+Club+Guaratiba+Prado+BA",
      instagram: "sorrisobaianobeachclub",
      reserva: { tipo: "whatsapp", alvo: "5573999314391", alvo2: "5573998248376" },
      horario: [
        ["Dias de praia", "consulte a agenda"],
        ["Eventos e luaus", "veja a programação"],
      ],
      sobre: [
        "A Costa Amalfitana encontra a Bahia. Um deck de madeira sobre a areia, ombrelones de palha, cabanas com cortinas brancas e uma passarela que leva direto ao mar verde-água de Guaratiba.",
        "De dia, gastronomia, drinks autorais e o tempo sem relógio. À noite, o palco acende para o Luau Bahia Mia, para as confraternizações e para o Réveillon mais exclusivo da região.",
      ],
      italiano: "Sole, mare & luna",
      cardapio: [
        { secao: "Da cozinha", turno: "dia", itens: [
          ["Morena do Mar", "Croquetas de polvo e bacon, aioli de cajá e vinagrete de uvas verdes com coentro", null],
          ["Frutos do mar", "Peixes e frutos do mar frescos da costa", null],
          ["Pizzas e sushis", "Para dividir à mesa, de frente para o mar", null],
        ]},
        { secao: "Do bar", turno: "dia", itens: [
          ["Drinks autorais", "Criações da casa para cada estação", null],
          ["Aperol Spritz", "O clássico que virou assinatura da casa", null],
        ]},
      ],
      cardapioNota: "O cardápio completo e a carta de drinks entram na versão oficial do site, atualizados direto pela equipe.",
      pratos: ["morena-do-mar"],
      instagramPosts: ["DfUsanHxhOu", "Dd1r07FxeXS", "DeAGYu0uW7w"],
    },
  },

  pratos: {
    "naia": { casa: "restaurante", nome: "Naiá", tipo: "Prato do 20º Festival · 2026", historia: "A lenda da indígena que se apaixonou pela lua e virou Vitória-Régia, contada num risoto de casquinha de siri. Para acompanhar, jabuticaba e limão-siciliano." },
    "morena-do-mar": { casa: "beach-club", nome: "Morena do Mar", tipo: "Petisco do 20º Festival · 2026", historia: "Uma homenagem à figura que é parte da identidade do nosso litoral. Croquetas de polvo e bacon, aioli de cajá e vinagrete de uvas verdes. Crocante por fora, cremoso por dentro." },
    "mamma-mia": { casa: "cafe-bistro", nome: "Mamma Mia!", tipo: "Lanche do 20º Festival · 2026", historia: "Croissant trufado de filé-mignon, com o cupuaçu ligando cada etapa da experiência. A estreia do Café no Festival." },
    "che-figata": { casa: "cafe-bistro", nome: "Che Figata!", tipo: "Drink do 20º Festival · 2026", historia: "Maracujá, Aperol, água tônica, café expresso e um toque de limão. Cítrico, aromático e com o café que dá nome à casa." },
    "fettuccine": { casa: "cafe-bistro", nome: "Fettuccine Alfredo", tipo: "Clássico da casa", historia: "Uma história de amor que nasceu em Roma: a massa quente é finalizada dentro de uma peça inteira de Grana Padano, envolvendo cada fio." },
    "amana": { casa: "restaurante", nome: "Amaná", tipo: "Prato do 19º Festival · 2025", historia: "Costela, inhame, cuscuz e tucupi. Um prato que simboliza a abundância trazida pela chuva." },
    "mani": { casa: "restaurante", nome: "Maní", tipo: "Prato de Festival", historia: "A lenda da menina de onde nasceu a mandioca, contada em prato. Uma das histórias que o Sorriso Baiano já levou ao Festival, ao lado de Manauara, Afrodite e Casa de Vó." },
  },

  eventos: [
    {
      id: "reveillon", casa: "beach-club", destaque: true,
      nome: "Réveillon Camarote do Sorriso", ano: "2027",
      data: "2026-12-31T21:00:00-03:00", quando: "31 de dezembro · das 21h às 2h",
      resumo: "Área fechada à beira-mar com acesso por pulseira, open food, open bar e lounges exclusivos. Na praia, Kenny Paladino (Pocket) e DJ Andressa Vegas, e os fogos refletindo no mar.",
      itens: ["Open food + open bar", "Lounges e mesas exclusivas", "Acesso por pulseira", "Banda ao vivo + DJ"],
      preco: "R$ 650 por pessoa",
      precoNota: "Até 6 anos não paga · de 7 a 12 anos, 50% · valores especiais para grupos a partir de 8 pessoas",
      cta: "Reservar meu lugar",
    },
    {
      id: "luau", casa: "beach-club",
      nome: "Luau Bahia Mia", ano: "3ª edição em breve",
      quando: "Edições em 26/09 e 21/11 de 2026",
      resumo: "A Bahia encontra o Mediterrâneo sob a lua cheia. Música ao vivo, DJ, drinks autorais, petiscos, pizzas e sushis. Dress code off-white.",
      cta: "Quero saber da próxima",
    },
    {
      id: "dolce-vita", casa: "cafe-bistro",
      nome: "La Dolce Vita Baiana", ano: "2ª edição em 2027",
      quando: "1ª edição: 14 e 15 de agosto de 2026 · Shopping Guaratiba",
      resumo: "O festival ítalo-baiano de Guaratiba: gastronomia, música, cultura e bons encontros, com as três casas juntas.",
      cta: "Avise-me",
    },
    {
      id: "festival", casa: "restaurante",
      nome: "Festival Gastronômico de Prado", ano: "Outubro",
      quando: "Participação desde 2021",
      resumo: "Todo ano, cada casa leva um prato com uma história. Título de Melhor Atendimento desde a primeira participação.",
      cta: "Ver os pratos",
    },
  ],

  historia: [
    ["1999", "11 de setembro. Carol chega a Guaratiba para uma entrevista de trabalho e encontra, sem saber, a cozinha italiana que mudaria o rumo da sua vida."],
    ["2013", "Nasce o Restaurante Sorriso Baiano, na Praia de Guaratiba. O primeiro do universo."],
    ["2021", "Primeira participação no Festival Gastronômico de Prado, e o primeiro título de Melhor Atendimento."],
    ["2024", "1º e 2º lugar em atendimento no Festival."],
    ["2025", "Nasce o Sorriso Baiano Beach Club, na areia, em parceria com o Grupo Guaratiba."],
    ["2026", "La Dolce Vita Baiana, o primeiro Luau Bahia Mia e as três casas juntas no 20º Festival, com a estreia do Café & Bistrô."],
  ],
};
