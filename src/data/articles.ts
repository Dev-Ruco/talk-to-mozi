import { Article } from '@/types/news';

export const articles: Article[] = [
  {
    id: '1',
    title: 'Banco de Moçambique reduz taxa de juro para estimular economia',
    summary: 'A decisão visa incentivar o crédito às famílias e empresas, num contexto de inflação controlada.',
    content: `O Banco de Moçambique anunciou hoje uma redução da taxa de juro de referência de 15,5% para 14,5%, uma medida que visa estimular a actividade económica no país.

A decisão surge após três meses consecutivos de inflação abaixo da meta estabelecida, o que dá margem de manobra para políticas monetárias mais expansionistas.

"Esta redução permitirá que os bancos comerciais ofereçam crédito a taxas mais acessíveis, beneficiando tanto as famílias como as pequenas e médias empresas", explicou o governador do banco central.

Os analistas económicos prevêem que a medida poderá ter um impacto positivo no crescimento do PIB nos próximos trimestres, estimando um aumento de 0,3 a 0,5 pontos percentuais.

O sector imobiliário e o crédito ao consumo deverão ser os principais beneficiários desta política, com os bancos comerciais já a preparar novos produtos financeiros.`,
    category: 'economia',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
    publishedAt: '2024-01-15T10:30:00Z',
    readingTime: 4,
    author: 'Maria Santos',
    quickFacts: [
      'Taxa de juro reduzida de 15,5% para 14,5%',
      'Inflação abaixo da meta há 3 meses',
      'Impacto esperado de 0,3-0,5% no PIB',
      'Sector imobiliário será o mais beneficiado'
    ],
    relatedArticleIds: ['3', '7']
  },
  {
    id: '2',
    title: 'Assembleia da República aprova nova Lei de Descentralização',
    summary: 'A legislação transfere mais poderes para as autarquias e prevê eleições directas para governadores provinciais.',
    content: `A Assembleia da República aprovou hoje, com maioria qualificada, a nova Lei de Descentralização que promete transformar a governação local em Moçambique.

A lei prevê a transferência gradual de competências do governo central para as autarquias, incluindo áreas como educação primária, saúde básica e gestão de recursos naturais locais.

Uma das mudanças mais significativas é a introdução de eleições directas para governadores provinciais, uma reivindicação antiga de vários partidos da oposição.

"Este é um momento histórico para a democracia moçambicana", declarou o presidente da Assembleia. "Estamos a dar mais poder às comunidades locais para decidirem o seu próprio futuro."

A implementação será faseada ao longo de cinco anos, com as primeiras eleições para governadores previstas para 2026.`,
    category: 'politica',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
    publishedAt: '2024-01-15T09:00:00Z',
    readingTime: 5,
    author: 'João Tembe',
    quickFacts: [
      'Lei aprovada com maioria qualificada',
      'Eleições directas para governadores em 2026',
      'Implementação faseada em 5 anos',
      'Transferência de competências em educação e saúde'
    ],
    relatedArticleIds: ['5', '10']
  },
  {
    id: '3',
    title: 'Investimento estrangeiro em Moçambique cresce 23% no primeiro semestre',
    summary: 'O sector de energia lidera os investimentos, seguido pela agricultura e turismo.',
    content: `Os dados divulgados pelo Banco de Moçambique revelam um crescimento de 23% no investimento directo estrangeiro no primeiro semestre de 2024, totalizando 1,8 mil milhões de dólares.

O sector de energia, particularmente os projectos de gás natural em Cabo Delgado, continua a liderar a captação de investimentos, representando cerca de 60% do total.

A agricultura surge em segundo lugar, com investidores a apostarem na produção de culturas de exportação como castanha de caju, algodão e tabaco.

O turismo registou um crescimento surpreendente de 45% nos investimentos, impulsionado por novos projectos hoteleiros em Pemba, Vilankulo e na Ilha de Moçambique.

"Moçambique está a consolidar-se como um destino privilegiado para investidores internacionais", afirmou a ministra da Economia.`,
    category: 'economia',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    publishedAt: '2024-01-14T16:45:00Z',
    readingTime: 4,
    author: 'Ana Machava',
    quickFacts: [
      'Crescimento de 23% no investimento estrangeiro',
      'Total de 1,8 mil milhões USD no primeiro semestre',
      'Sector de energia lidera com 60%',
      'Turismo cresceu 45%'
    ],
    relatedArticleIds: ['1', '8']
  },
  {
    id: '4',
    title: 'Chuvas intensas afectam mais de 50 mil pessoas no norte do país',
    summary: 'As províncias de Nampula e Zambézia são as mais afectadas, com várias famílias deslocadas.',
    content: `As chuvas intensas que têm assolado o norte de Moçambique nas últimas duas semanas já afectaram mais de 50 mil pessoas, segundo dados do Instituto Nacional de Gestão de Calamidades (INGC).

As províncias de Nampula e Zambézia são as mais afectadas, com mais de 8 mil famílias deslocadas e a necessitar de assistência humanitária urgente.

Várias pontes e estradas foram destruídas, dificultando o acesso das equipas de socorro às zonas mais afectadas. O governo mobilizou recursos do Fundo de Calamidades e já pediu apoio à comunidade internacional.

"Estamos a trabalhar 24 horas por dia para assistir as populações afectadas", garantiu o director do INGC. "A prioridade é garantir abrigo, alimentação e água potável."

A previsão meteorológica indica que as chuvas deverão continuar nas próximas duas semanas, aumentando o risco de mais cheias.`,
    category: 'sociedade',
    imageUrl: 'https://images.unsplash.com/photo-1446824505046-e43605ffb17f?w=800&h=400&fit=crop',
    publishedAt: '2024-01-14T14:20:00Z',
    readingTime: 3,
    author: 'Carlos Nhaca',
    quickFacts: [
      'Mais de 50 mil pessoas afectadas',
      'Nampula e Zambézia são as províncias mais atingidas',
      '8 mil famílias deslocadas',
      'Chuvas devem continuar por mais 2 semanas'
    ],
    relatedArticleIds: ['11', '14']
  },
  {
    id: '5',
    title: 'Presidente inaugura nova ponte sobre o Rio Save',
    summary: 'A infraestrutura vai reduzir o tempo de viagem entre Maputo e Beira em duas horas.',
    content: `O Presidente da República inaugurou hoje a nova ponte sobre o Rio Save, uma infraestrutura que promete revolucionar a ligação rodoviária entre o sul e o centro do país.

Com 1,2 quilómetros de extensão, a ponte foi construída com um investimento de 180 milhões de dólares, financiado pelo Banco Mundial e pelo governo moçambicano.

A nova estrutura substitui a antiga ponte que, com mais de 50 anos, apresentava sérios problemas de conservação e limitações de carga.

"Esta ponte não é apenas uma infraestrutura, é um símbolo do progresso e da unidade nacional", declarou o Presidente durante a cerimónia de inauguração.

Os transportadores estimam que a nova via permitirá reduzir o tempo de viagem entre Maputo e Beira em aproximadamente duas horas.`,
    category: 'politica',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=400&fit=crop',
    publishedAt: '2024-01-14T11:00:00Z',
    readingTime: 3,
    author: 'Fátima Cossa',
    quickFacts: [
      'Ponte com 1,2 km de extensão',
      'Investimento de 180 milhões USD',
      'Financiamento do Banco Mundial',
      'Reduz viagem Maputo-Beira em 2 horas'
    ],
    relatedArticleIds: ['2', '8']
  },
  {
    id: '6',
    title: 'Festival de Música de Maputo regressa com artistas internacionais',
    summary: 'O evento contará com a participação de músicos de 15 países durante três dias.',
    content: `O Festival Internacional de Música de Maputo regressa em Março com uma edição especial que promete reunir artistas de 15 países diferentes.

Entre os nomes confirmados estão várias estrelas da música africana, incluindo artistas do Mali, Senegal, Angola e África do Sul, além de convidados da Europa e das Américas.

O festival decorrerá ao longo de três dias no Parque dos Continuadores, com capacidade para receber até 30 mil espectadores por dia.

"Queremos fazer de Maputo a capital da música africana", afirmou a directora artística do festival. "Esta edição vai ser a maior de sempre."

Os bilhetes já estão à venda, com preços especiais para estudantes e residentes nas províncias.`,
    category: 'entretenimento',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
    publishedAt: '2024-01-13T18:30:00Z',
    readingTime: 3,
    author: 'Luísa Mondlane',
    quickFacts: [
      'Artistas de 15 países confirmados',
      'Festival em Março, 3 dias',
      '30 mil espectadores por dia',
      'Bilhetes com desconto para estudantes'
    ],
    relatedArticleIds: ['12', '15']
  },
  {
    id: '7',
    title: 'Metical valoriza face ao dólar pela primeira vez em seis meses',
    summary: 'A moeda nacional ganhou 2,3% nas últimas duas semanas, beneficiando importadores.',
    content: `O metical registou nas últimas duas semanas uma valorização de 2,3% face ao dólar americano, a primeira subida significativa nos últimos seis meses.

A moeda moçambicana passou de 63,8 para 62,3 meticais por dólar, beneficiando empresas importadoras e consumidores de produtos importados.

Os analistas apontam três factores principais para esta valorização: o aumento das exportações de gás, a entrada de investimento estrangeiro e a política monetária do Banco de Moçambique.

"Esta valorização é sustentável se mantivermos os actuais níveis de exportação", comentou um economista do Banco Standard.

Contudo, os exportadores alertam que a valorização do metical pode prejudicar a competitividade dos produtos moçambicanos no mercado internacional.`,
    category: 'economia',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&h=400&fit=crop',
    publishedAt: '2024-01-13T15:00:00Z',
    readingTime: 4,
    author: 'Paulo Macuácua',
    quickFacts: [
      'Metical valorizou 2,3% em duas semanas',
      'Passou de 63,8 para 62,3 MZN/USD',
      'Primeira valorização em 6 meses',
      'Exportações de gás impulsionam moeda'
    ],
    relatedArticleIds: ['1', '3']
  },
  {
    id: '8',
    title: 'Moçambique assina acordo de cooperação tecnológica com Índia',
    summary: 'O acordo inclui formação de programadores e desenvolvimento de software local.',
    content: `Moçambique e a Índia assinaram hoje um acordo de cooperação tecnológica que prevê a formação de mil programadores moçambicanos nos próximos três anos.

O acordo, assinado durante a visita oficial do ministro da Ciência e Tecnologia à Índia, inclui também a criação de um centro de desenvolvimento de software em Maputo.

"A tecnologia é o futuro da economia moçambicana", afirmou o ministro. "Com este acordo, estamos a preparar os nossos jovens para os empregos do século XXI."

O governo indiano vai disponibilizar bolsas de estudo para 200 estudantes moçambicanos frequentarem cursos de engenharia informática em universidades indianas.

As empresas tecnológicas indianas também manifestaram interesse em investir em Moçambique, particularmente nas áreas de fintech e e-commerce.`,
    category: 'tecnologia',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    publishedAt: '2024-01-13T12:15:00Z',
    readingTime: 3,
    author: 'Amélia Nguenha',
    quickFacts: [
      'Formação de 1000 programadores em 3 anos',
      'Centro de software em Maputo',
      '200 bolsas para estudar na Índia',
      'Foco em fintech e e-commerce'
    ],
    relatedArticleIds: ['3', '16']
  },
  {
    id: '9',
    title: 'Selecção nacional vence Tanzânia e lidera grupo nas eliminatórias',
    summary: 'Os Mambas venceram por 2-1 e estão em primeiro lugar com 10 pontos.',
    content: `A Selecção Nacional de Futebol de Moçambique venceu ontem a Tanzânia por 2-1, no Estádio Nacional do Zimpeto, em jogo a contar para as eliminatórias do Campeonato Africano das Nações.

Os golos moçambicanos foram marcados por Geny Catamo (25') e Reinildo Mandava (67'), enquanto a Tanzânia reduziu de penálti aos 82 minutos.

Com esta vitória, os Mambas lideram o grupo com 10 pontos em quatro jogos, distanciando-se dos adversários directos na luta pela qualificação.

"Estamos no bom caminho para chegar à fase final", declarou o seleccionador nacional. "Mas temos de manter a concentração nos próximos jogos."

O próximo desafio será contra a Etiópia, em jogo fora, no dia 25 de Janeiro.`,
    category: 'desporto',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    publishedAt: '2024-01-13T09:30:00Z',
    readingTime: 3,
    author: 'Roberto Chissano',
    quickFacts: [
      'Moçambique 2-1 Tanzânia',
      'Golos de Geny Catamo e Reinildo',
      'Mambas lideram grupo com 10 pontos',
      'Próximo jogo: Etiópia (fora)'
    ],
    relatedArticleIds: ['13', '17']
  },
  {
    id: '10',
    title: 'União Europeia anuncia apoio de 500 milhões para desenvolvimento rural',
    summary: 'O financiamento vai beneficiar projectos agrícolas e de acesso a água nas zonas rurais.',
    content: `A União Europeia anunciou um pacote de apoio de 500 milhões de euros para projectos de desenvolvimento rural em Moçambique, a ser desembolsado ao longo dos próximos cinco anos.

O financiamento vai ser direccionado para três áreas prioritárias: agricultura sustentável, acesso a água potável e desenvolvimento de energias renováveis.

"Este investimento reflecte o compromisso da União Europeia com o desenvolvimento sustentável de Moçambique", declarou o embaixador da UE em Maputo.

Os projectos agrícolas receberão 250 milhões de euros, focando-se na mecanização, irrigação e acesso a mercados para pequenos agricultores.

O restante será dividido entre infraestruturas de água (150 milhões) e projectos de energia solar em comunidades rurais (100 milhões).`,
    category: 'internacional',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=400&fit=crop',
    publishedAt: '2024-01-12T16:00:00Z',
    readingTime: 4,
    author: 'Helena Matavele',
    quickFacts: [
      '500 milhões EUR em 5 anos',
      '250 milhões para agricultura',
      '150 milhões para água potável',
      '100 milhões para energia solar'
    ],
    relatedArticleIds: ['2', '3']
  },
  {
    id: '11',
    title: 'Novo hospital central em Nampula abre portas em Junho',
    summary: 'A unidade terá 500 camas e equipamentos de última geração.',
    content: `O novo Hospital Central de Nampula, com capacidade para 500 camas, deverá abrir portas em Junho deste ano, anunciou o Ministério da Saúde.

A infraestrutura, construída com um investimento de 120 milhões de dólares do governo chinês, será a maior unidade de saúde do norte do país.

O hospital contará com equipamentos de diagnóstico de última geração, incluindo ressonância magnética e tomografia computadorizada, evitando que os pacientes tenham de viajar para Maputo.

"Este hospital vai revolucionar a prestação de cuidados de saúde no norte de Moçambique", afirmou a ministra da Saúde durante uma visita às obras.

Cerca de 600 profissionais de saúde, incluindo médicos especialistas e enfermeiros, estão a ser recrutados e formados para trabalhar na nova unidade.`,
    category: 'sociedade',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=400&fit=crop',
    publishedAt: '2024-01-12T14:30:00Z',
    readingTime: 3,
    author: 'Graça Mabote',
    quickFacts: [
      'Abertura prevista para Junho',
      '500 camas disponíveis',
      'Investimento de 120 milhões USD',
      '600 profissionais a serem contratados'
    ],
    relatedArticleIds: ['4', '14']
  },
  {
    id: '12',
    title: 'Artista moçambicano Azagaia recebe prémio póstumo em Lisboa',
    summary: 'O rapper foi homenageado com o Prémio Carreira na gala dos Prémios da Música Lusófona.',
    content: `O rapper moçambicano Azagaia, falecido em 2023, foi homenageado ontem com o Prémio Carreira na gala dos Prémios da Música Lusófona, realizada em Lisboa.

O prémio foi recebido pela família do artista, que agradeceu o reconhecimento internacional ao legado musical e social de Azagaia.

"O Azagaia foi mais do que um músico, foi a voz de uma geração", disse o apresentador da gala. "As suas letras continuam a inspirar milhões de jovens africanos."

Vários artistas lusófonos prestaram tributo ao rapper, interpretando versões das suas músicas mais emblemáticas durante a cerimónia.

A gala contou ainda com a participação de outros artistas moçambicanos, incluindo Lizha James e Stewart Sukuma.`,
    category: 'entretenimento',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    publishedAt: '2024-01-12T11:45:00Z',
    readingTime: 3,
    author: 'Sérgio Vilanculo',
    quickFacts: [
      'Prémio Carreira póstumo',
      'Gala realizada em Lisboa',
      'Família recebeu o prémio',
      'Tributos de artistas lusófonos'
    ],
    relatedArticleIds: ['6', '15']
  },
  {
    id: '13',
    title: 'Maratona de Maputo bate recorde de participantes',
    summary: 'Mais de 15 mil corredores de 40 países participaram na edição deste ano.',
    content: `A Maratona Internacional de Maputo bateu ontem o recorde de participantes, com mais de 15 mil corredores de 40 países diferentes a percorrerem as ruas da capital moçambicana.

O atleta queniano Elijah Kipchoge venceu a prova masculina com um tempo de 2h08m23s, enquanto a etíope Tigist Assefa conquistou a vitória feminina em 2h21m45s.

Entre os moçambicanos, o destaque foi para Hélder Fumo, que terminou em quinto lugar e bateu o recorde nacional.

"Esta maratona colocou Maputo no mapa das grandes provas de atletismo mundiais", declarou o presidente da Federação de Atletismo.

A prova contou com uma meia-maratona e uma corrida de 10 km para atletas amadores, que atraíram milhares de participantes locais.`,
    category: 'desporto',
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=400&fit=crop',
    publishedAt: '2024-01-11T18:00:00Z',
    readingTime: 3,
    author: 'Nelson Bila',
    quickFacts: [
      'Recorde de 15 mil participantes',
      '40 países representados',
      'Vencedores: Kipchoge (Quénia) e Assefa (Etiópia)',
      'Hélder Fumo bateu recorde nacional'
    ],
    relatedArticleIds: ['9', '17']
  },
  {
    id: '14',
    title: 'Campanha de vacinação atinge 90% das crianças moçambicanas',
    summary: 'O programa nacional de imunização alcançou cobertura recorde em todas as províncias.',
    content: `O Ministério da Saúde anunciou que a campanha nacional de vacinação infantil atingiu uma cobertura de 90% em 2023, a mais alta de sempre em Moçambique.

A campanha, apoiada pela UNICEF e pela OMS, focou-se na vacinação contra sarampo, pólio, tuberculose e outras doenças preveníveis.

"Este é um marco histórico para a saúde pública moçambicana", afirmou o director nacional de Saúde Pública. "Protegemos milhões de crianças de doenças evitáveis."

O sucesso deveu-se a uma estratégia que combinou centros de vacinação fixos com brigadas móveis que chegaram às comunidades mais remotas.

O desafio agora é manter e aumentar esta cobertura, com a meta de atingir 95% até 2025.`,
    category: 'sociedade',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
    publishedAt: '2024-01-11T15:30:00Z',
    readingTime: 3,
    author: 'Rosa Massango',
    quickFacts: [
      'Cobertura de 90% - recorde nacional',
      'Apoio da UNICEF e OMS',
      'Brigadas móveis em zonas remotas',
      'Meta de 95% até 2025'
    ],
    relatedArticleIds: ['4', '11']
  },
  {
    id: '15',
    title: 'Cinema moçambicano em destaque no Festival de Berlim',
    summary: 'O filme "Mãe Terra" é o primeiro longa-metragem moçambicano em competição oficial.',
    content: `O filme "Mãe Terra", do realizador Sol de Carvalho, fará história ao ser o primeiro longa-metragem moçambicano a competir na secção oficial do Festival de Cinema de Berlim.

A película conta a história de uma família de agricultores que luta para sobreviver às alterações climáticas no sul de Moçambique.

"Este filme fala de uma realidade que afecta milhões de africanos", disse o realizador. "É uma história de resiliência e esperança."

O elenco é inteiramente moçambicano, com destaque para a actriz veterana Lucia Manjate no papel principal.

A equipa do filme viajará para Berlim em Fevereiro para a estreia mundial, que coincide com o 50º aniversário da independência de Moçambique.`,
    category: 'entretenimento',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop',
    publishedAt: '2024-01-11T12:00:00Z',
    readingTime: 3,
    author: 'Anabela Langa',
    quickFacts: [
      'Primeiro filme moçambicano em competição oficial',
      'Realizador: Sol de Carvalho',
      'Estreia em Fevereiro em Berlim',
      'Tema: alterações climáticas'
    ],
    relatedArticleIds: ['6', '12']
  },
  {
    id: '16',
    title: 'Startup moçambicana de pagamentos móveis levanta 5 milhões USD',
    summary: 'A M-Pesa local atraiu investimento de fundos internacionais para expandir operações.',
    content: `A fintech moçambicana PayFácil anunciou ter levantado 5 milhões de dólares numa ronda de investimento liderada por fundos de capital de risco africanos e europeus.

A empresa, fundada em 2020, desenvolveu uma plataforma de pagamentos móveis que permite transferências instantâneas e pagamentos em estabelecimentos comerciais.

"Este investimento vai permitir-nos expandir para todo o país e lançar novos produtos", afirmou o CEO da PayFácil.

A startup já conta com mais de 500 mil utilizadores activos, principalmente nas áreas urbanas de Maputo, Beira e Nampula.

Os investidores destacam o potencial de crescimento do mercado de pagamentos digitais em Moçambique, onde apenas 20% da população tem acesso a serviços bancários tradicionais.`,
    category: 'tecnologia',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    publishedAt: '2024-01-10T16:45:00Z',
    readingTime: 4,
    author: 'Armando Guebuza Jr.',
    quickFacts: [
      '5 milhões USD levantados',
      '500 mil utilizadores activos',
      'Fundada em 2020',
      'Apenas 20% da população tem conta bancária'
    ],
    relatedArticleIds: ['8', '3']
  },
  {
    id: '17',
    title: 'Costa do Sol recebe etapa do circuito mundial de surf',
    summary: 'Pela primeira vez, Moçambique acolhe uma competição da World Surf League.',
    content: `A praia da Costa do Sol, em Maputo, vai acolher pela primeira vez uma etapa do circuito mundial de surf da World Surf League (WSL), anunciou a federação internacional.

A competição, agendada para Abril, contará com a participação de 50 surfistas de elite, incluindo os actuais campeões mundiais masculino e feminino.

"A Costa do Sol tem ondas de classe mundial", afirmou o director da WSL para África. "Esta é uma oportunidade única para mostrar Moçambique ao mundo do surf."

O evento deverá atrair milhares de turistas e gerar um impacto económico estimado em 10 milhões de dólares na cidade de Maputo.

Surfistas moçambicanos terão wildcards para participar na competição, oferecendo-lhes a oportunidade de competir ao mais alto nível.`,
    category: 'desporto',
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=400&fit=crop',
    publishedAt: '2024-01-10T14:00:00Z',
    readingTime: 3,
    author: 'Pedro Macamo',
    quickFacts: [
      'Primeira etapa da WSL em Moçambique',
      'Competição em Abril',
      '50 surfistas de elite',
      'Impacto económico de 10 milhões USD'
    ],
    relatedArticleIds: ['9', '13']
  },
  {
    id: '18',
    title: 'Conflito em Cabo Delgado: forças governamentais retomam distrito estratégico',
    summary: 'As forças de defesa anunciaram a recuperação de Mocímboa da Praia após operação conjunta.',
    content: `As Forças de Defesa e Segurança de Moçambique anunciaram hoje a retomada total do distrito de Mocímboa da Praia, considerado um bastião dos grupos insurgentes desde 2020.

A operação, conduzida em conjunto com as forças da SADC e do Ruanda, decorreu ao longo de duas semanas e resultou na neutralização de dezenas de insurgentes.

"Esta é uma vitória significativa para a paz e estabilidade em Cabo Delgado", declarou o porta-voz das forças armadas.

As autoridades iniciaram já o processo de retorno das populações deslocadas, com mais de 50 mil pessoas previstas regressarem nos próximos meses.

A comunidade internacional saudou os progressos, mas alertou para a necessidade de manter a presença militar para consolidar os ganhos.`,
    category: 'internacional',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
    publishedAt: '2024-01-10T10:30:00Z',
    readingTime: 4,
    author: 'Joaquim Chissano III',
    quickFacts: [
      'Mocímboa da Praia recuperada',
      'Operação conjunta com SADC e Ruanda',
      '50 mil deslocados a regressar',
      'Insurgentes presentes desde 2020'
    ],
    relatedArticleIds: ['10', '2']
  }
];

export const getArticleById = (id: string): Article | undefined => {
  return articles.find(article => article.id === id);
};

export const getArticlesByCategory = (categoryId: string): Article[] => {
  return articles.filter(article => article.category === categoryId);
};

export const getRelatedArticles = (article: Article): Article[] => {
  return article.relatedArticleIds
    .map(id => getArticleById(id))
    .filter((a): a is Article => a !== undefined);
};

export const getLatestArticles = (count: number = 10): Article[] => {
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
};

export const getTrendingArticles = (): Article[] => {
  // Mock trending - in reality would use view counts/engagement
  return articles.slice(0, 5);
};

export const searchArticles = (query: string): Article[] => {
  const lowerQuery = query.toLowerCase();
  return articles.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.summary.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery)
  );
};
