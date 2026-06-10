export interface Impact {
  saudeFinanceira: number;
  qualidadeVida: number;
  reservaEmergencia: number;
  custo: number; //
}

export interface Outcome {
  minRoll: number;
  maxRoll: number;
  type: 'good' | 'neutral' | 'bad';
  message: string;
  impact: Impact;
}

export interface Option {
  text: string;
  outcomes: Outcome[];
  requiredPerk?: string;
}

export interface Dilemma {
  id: number;
  title: string;
  context: string;
  options: Option[];
  isSocial?: boolean;
  isFamily?: boolean;
  isShopping?: boolean;
}

export interface PlayerStatus {
  saldo: number; // <-- Adicionamos o saldo aqui
  saudeFinanceira: number;
  qualidadeVida: number;
  reservaEmergencia: number;
  custosFixos?: number;
  perks?: string[];
}

export const PERKS = {
  positive: [
    { id: 'sortudo', label: '🍀 Sortudo', desc: '+2 nas rolagens de D20', cost: 3 },
    { id: 'minimalista', label: '🧘 Minimalista', desc: '-10% de custos no geral', cost: 3 },
    { id: 'lobo_solitario', label: '🐺 Lobo Solitário', desc: 'Não se estressa ao ficar em casa', cost: 2 },
    { id: 'extrovertido', label: '🎉 Extrovertido', desc: '+50% Qualidade de Vida em rolês', cost: 2 },
    { id: 'desapegado', label: '🛡️ Desapegado', desc: 'Imune à pressão do consumo (Q.V.)', cost: 2 },
    { id: 'calculista', label: '🧊 Calculista', desc: '+4 no D20 em eventos familiares', cost: 1 },
  ],
  negative: [
    { id: 'azarado', label: '🐈‍⬛ Azarado', desc: '-2 nas rolagens de D20', cost: 3 },
    { id: 'gastao', label: '💸 Gastão', desc: '+20% de custos no geral', cost: 3 },
    { id: 'fomo', label: '💃 Socialite (FOMO)', desc: 'Sofre o dobro ao ficar de fora das saidinhas', cost: 2 },
    { id: 'antissocial', label: '🚷 Antissocial', desc: '-4 no dado em eventos sociais', cost: 2 },
    { id: 'consumista', label: '🛍️ Consumista', desc: 'Dobro de dano na Q.V. ao não comprar', cost: 2 },
    { id: 'emocionado', label: '😭 Emocionado', desc: '-4 no D20 em eventos familiares', cost: 1 },
  ]
};

export const getDilemmas = (salary: number): Dilemma[] => {
  // Multiplicador baseado em um salário base de R$ 3000
  // Um salário de R$ 15.000 terá custos 5x maiores (IPVA de 1200 vai pra 6000)
  // O multiplicador tem piso de 0.4 para salários muito baixos não terem as coisas quase de graça
  const m = Math.max(0.4, salary / 3000);
  const c = (baseCost: number) => Math.round(baseCost * m);

  return [
    {
      id: 1, // JANEIRO
      title: "Mês dos Impostos",
      context: "Janeiro chegou! É a época do IPVA, IPTU e matrícula/material escolar. A conta ficou pesada.",
      options: [
        { 
          text: `Pagar tudo à vista usando a reserva de emergência (Custo Base: R$ ${c(1200)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Golpe do boleto falso! Você pagou para um fraudador e a dívida continua lá. Desespero total.", impact: { saudeFinanceira: -10, qualidadeVida: -20, reservaEmergencia: -50, custo: c(2400) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Erro no sistema! Um imposto foi pago em duplicidade e o reembolso vai demorar.", impact: { saudeFinanceira: +10, qualidadeVida: -10, reservaEmergencia: -50, custo: c(1800) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "O site travou algumas vezes, mas o pagamento foi efetuado pelo valor normal.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: -40, custo: c(1200) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Tudo pago! O alívio de não ter dívidas compensa a queda na reserva.", impact: { saudeFinanceira: +20, qualidadeVida: +5, reservaEmergencia: -40, custo: c(1200) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Como você tinha bom histórico, ganhou o desconto máximo de bom pagador no IPVA!", impact: { saudeFinanceira: +25, qualidadeVida: +10, reservaEmergencia: -30, custo: c(900) } }
          ] 
        },
        { 
          text: `Parcelar em várias vezes com juros (Custo Base: R$ ${c(200)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O cartão foi clonado durante o pagamento e o limite estourou. Fila no banco e dor de cabeça.", impact: { saudeFinanceira: -40, qualidadeVida: -25, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Você esqueceu de pagar a primeira parcela e os juros foram para a lua!", impact: { saudeFinanceira: -35, qualidadeVida: -10, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Parcelamento feito. O limite do cartão ficou estrangulado, mas sob controle.", impact: { saudeFinanceira: -30, qualidadeVida: 0, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Você organizou perfeitamente as contas e vai absorver as parcelas sem estresse.", impact: { saudeFinanceira: -20, qualidadeVida: +5, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "A prefeitura lançou um programa de isenção de multas e o parcelamento ficou sem juros.", impact: { saudeFinanceira: -10, qualidadeVida: +15, reservaEmergencia: 0, custo: c(100) } }
          ] 
        },
        { 
          text: `Fazer um empréstimo pessoal (Custo Base: R$ ${c(300)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Seu nome foi negativado porque a financeira cobrou taxas ocultas absurdas impossíveis de pagar.", impact: { saudeFinanceira: -60, qualidadeVida: -30, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Caiu no conto do empréstimo fácil! As taxas escondidas destruíram sua saúde financeira.", impact: { saudeFinanceira: -50, qualidadeVida: -20, reservaEmergencia: 0, custo: c(450) } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "O banco aprovou o empréstimo com juros normais. Nada demais, apenas mais uma dívida.", impact: { saudeFinanceira: -40, qualidadeVida: -5, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Pegou o empréstimo com um familiar a juros zero! Resolveu o problema rápido.", impact: { saudeFinanceira: -10, qualidadeVida: +10, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Seu familiar emprestou o dinheiro e disse que você só precisa devolver quando puder. Alívio!", impact: { saudeFinanceira: 0, qualidadeVida: +25, reservaEmergencia: 0, custo: c(100) } }
          ] 
        },
        { 
          text: `✨ [Minimalista] Vender coisas que não usa para pagar os impostos (Custo: R$ 0)`, 
          requiredPerk: 'minimalista',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "Vendeu o suficiente para cobrir os impostos com facilidade. A casa ficou mais limpa!", impact: { saudeFinanceira: +15, qualidadeVida: +10, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Vendeu super rápido para um colecionador! Pagou os impostos e ainda sobrou um trocado.", impact: { saudeFinanceira: +25, qualidadeVida: +15, reservaEmergencia: +10, custo: -c(200) } }
          ] 
        }
      ]
    },
    {
      id: 2, // FEVEREIRO
      title: "Folia de Carnaval",
      context: "É Carnaval! Seus amigos alugaram uma casa na praia e te convidaram de última hora.",
      isSocial: true,
      options: [
        { 
          text: `Aceitar e pagar a sua parte (Custo: R$ ${c(800)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Tempestade na praia e a casa destelhou. Tiveram que pagar o conserto e voltar mais cedo.", impact: { saudeFinanceira: -50, qualidadeVida: -30, reservaEmergencia: -30, custo: c(1500) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "A viagem foi um desastre! Choveu o tempo todo e você ainda gastou mais que o planejado.", impact: { saudeFinanceira: -40, qualidadeVida: -10, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "Viagem legal, mas o trânsito infernal na volta e o cansaço empataram a diversão.", impact: { saudeFinanceira: -30, qualidadeVida: +10, reservaEmergencia: -10, custo: c(800) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "A viagem foi épica! Você se divertiu muito e recarregou as energias ao máximo.", impact: { saudeFinanceira: -30, qualidadeVida: +35, reservaEmergencia: -10, custo: c(800) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Viagem dos sonhos! O dono da casa deu um desconto e vocês fizeram churrasco todo dia.", impact: { saudeFinanceira: -20, qualidadeVida: +50, reservaEmergencia: -10, custo: c(500) } }
          ] 
        },
        { 
          text: `Ficar na cidade e ir em bloquinhos (Custo: R$ ${c(150)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "Arrumou briga no bloquinho e furtaram seu celular. Carnaval inesquecível pelos piores motivos.", impact: { saudeFinanceira: -35, qualidadeVida: -30, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Você perdeu a carteira no meio da multidão! Prejuízo gigante e muita dor de cabeça.", impact: { saudeFinanceira: -20, qualidadeVida: -15, reservaEmergencia: -10, custo: c(600) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Fila enorme para o banheiro e cerveja quente. Foi ok, mas voltou cedo pra casa.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Você curtiu muito os bloquinhos perto de casa gastando quase nada!", impact: { saudeFinanceira: +10, qualidadeVida: +20, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Conheceu uma pessoa incrível no bloquinho e viveram um romance de Carnaval de cinema!", impact: { saudeFinanceira: +10, qualidadeVida: +40, reservaEmergencia: 0, custo: c(150) } }
          ] 
        },
        { 
          text: `Maratona de séries em casa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "A chuva alagou sua rua, a luz caiu e a geladeira queimou. Feriado no escuro e prejuízo.", impact: { saudeFinanceira: -20, qualidadeVida: -35, reservaEmergencia: -30, custo: c(800) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "A internet caiu e um cano estourou em casa. Feriado arruinado e custo surpresa!", impact: { saudeFinanceira: -10, qualidadeVida: -25, reservaEmergencia: -15, custo: c(400) } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "O tédio bateu forte ao ver as fotos dos amigos, mas ao menos economizou dinheiro.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Feriado relaxante! Você descansou perfeitamente e ficou imune às tentações.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Você descobriu sua nova série favorita da vida e maratonou comendo pipoca. Felicidade indescritível!", impact: { saudeFinanceira: +25, qualidadeVida: +30, reservaEmergencia: 0, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Extrovertido] Ser promoter VIP: Promover a festa, beber de graça e receber por isso! (Ganho: R$ ${c(300)})`, 
          requiredPerk: 'extrovertido',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "Você promoveu bem a festa, curtiu muito com os amigos e ganhou uma grana extra!", impact: { saudeFinanceira: +10, qualidadeVida: +30, reservaEmergencia: 0, custo: -c(150) } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Rei/Rainha do camarote! Muitas fotos, VIP, diversão total e saiu no lucro máximo!", impact: { saudeFinanceira: +20, qualidadeVida: +45, reservaEmergencia: 0, custo: -c(300) } }
          ] 
        }
      ]
    },
    {
      id: 3, // MARÇO
      title: "O Imprevisto",
      context: "Março rolando e de repente... seu celular quebrou. Você depende muito dele no dia a dia.",
      isShopping: true,
      options: [
        { 
          text: `Comprar o modelo top de linha (Custo: R$ ${c(4000)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Derrubou o celular de 4 mil no asfalto no primeiro dia e não tinha seguro. Tristeza infinita.", impact: { saudeFinanceira: -60, qualidadeVida: -40, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Você foi assaltado na mesma semana. Pânico, celular perdido e o boleto ficou.", impact: { saudeFinanceira: -50, qualidadeVida: -30, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "O aparelho é bom, mas o peso no bolso não te deixa curtir a compra 100%.", impact: { saudeFinanceira: -45, qualidadeVida: +5, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Aparelho maravilhoso! A câmera e a velocidade aumentaram muito sua produtividade.", impact: { saudeFinanceira: -40, qualidadeVida: +25, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Você comprou na pré-venda e ganhou um fone sem fio de brinde que vale uma fortuna!", impact: { saudeFinanceira: -30, qualidadeVida: +40, reservaEmergencia: 0, custo: c(4000) } }
          ] 
        },
        { 
          text: `Comprar um modelo intermediário (Custo: R$ ${c(1200)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O aparelho era falsificado. A loja sumiu e você ficou no prejuízo absoluto.", impact: { saudeFinanceira: -20, qualidadeVida: -25, reservaEmergencia: -30, custo: c(1200) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "O celular veio com defeito e acionar a garantia deu uma dor de cabeça imensa.", impact: { saudeFinanceira: -10, qualidadeVida: -15, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Aparelho decente. A câmera não é grande coisa, mas resolve o problema do dia.", impact: { saudeFinanceira: -10, qualidadeVida: 0, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Ótimo custo-benefício. O sistema é limpo e faz tudo que você precisa super bem.", impact: { saudeFinanceira: -5, qualidadeVida: +15, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Aparelho surpreendente! Roda tudo perfeitamente e a bateria dura dois dias inteiros.", impact: { saudeFinanceira: 0, qualidadeVida: +25, reservaEmergencia: -20, custo: c(1200) } }
          ] 
        },
        { 
          text: `Mandar consertar a tela do antigo (Custo: R$ ${c(250)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "O técnico danificou a placa-mãe. Você pagou, perdeu o celular e seus dados.", impact: { saudeFinanceira: -15, qualidadeVida: -30, reservaEmergencia: -10, custo: c(400) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "A tela nova parou de funcionar 3 dias depois. O barato saiu caro e você perdeu o dinheiro.", impact: { saudeFinanceira: -5, qualidadeVida: -15, reservaEmergencia: -5, custo: c(250) } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "A tela ficou com umas cores estranhas e o touch meio duro, mas dá pra usar.", impact: { saudeFinanceira: +10, qualidadeVida: -5, reservaEmergencia: -5, custo: c(250) } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Técnico milagroso! O celular ficou novinho em folha e você economizou muito.", impact: { saudeFinanceira: +20, qualidadeVida: +10, reservaEmergencia: -5, custo: c(250) } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Além de consertar, o técnico encontrou um problema antigo na bateria e arrumou de brinde!", impact: { saudeFinanceira: +25, qualidadeVida: +25, reservaEmergencia: -5, custo: c(250) } }
          ] 
        }
      ]
    },
    {
      id: 4, // ABRIL
      title: "A Doçura da Páscoa",
      context: "Páscoa chegando. Os supermercados estão cheios de ovos de marca caríssimos.",
      isFamily: true,
      options: [
        { 
          text: `Comprar ovos de marca (Custo: R$ ${c(350)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Os ovos vieram com chocolate mofado. A loja se recusou a trocar. Um absurdo.", impact: { saudeFinanceira: -35, qualidadeVida: -25, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Esqueceu os ovos no sol e eles derreteram completamente. Tristeza na família.", impact: { saudeFinanceira: -25, qualidadeVida: -15, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "Ovos entregues, mas o gosto era de guarda-chuva. Pelo menos a intenção valeu.", impact: { saudeFinanceira: -20, qualidadeVida: +5, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "A família amou os presentes, brindes vieram certos e a data foi inesquecível.", impact: { saudeFinanceira: -20, qualidadeVida: +25, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Ovos trufados deliciosos e os brindes viraram atração. Dinheiro muito bem gasto!", impact: { saudeFinanceira: -10, qualidadeVida: +40, reservaEmergencia: 0, custo: c(350) } }
          ] 
        },
        { 
          text: `Comprar barras e fazer em casa (Custo: R$ ${c(70)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O chocolate que você comprou para derreter estava estragado e todos passaram mal.", impact: { saudeFinanceira: -20, qualidadeVida: -30, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Queimou o chocolate e a cozinha virou um caos. Acabou comprando pronto de última hora.", impact: { saudeFinanceira: -10, qualidadeVida: -15, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Deram bastante trabalho e ficaram meio feios, mas o gosto agradou no fim das contas.", impact: { saudeFinanceira: +5, qualidadeVida: 0, reservaEmergencia: 0, custo: c(70) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Você virou um chocolatier! Ficaram incríveis e todos amaram a dedicação.", impact: { saudeFinanceira: +15, qualidadeVida: +20, reservaEmergencia: 0, custo: c(70) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Ficaram tão perfeitos que você recebeu encomendas dos vizinhos e fez uma renda extra!", impact: { saudeFinanceira: +30, qualidadeVida: +25, reservaEmergencia: 0, custo: -c(150) } }
          ] 
        },
        { 
          text: `Ignorar a data (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Rebelião das crianças! Elas choraram, os adultos brigaram com você e o domingo acabou cedo.", impact: { saudeFinanceira: +10, qualidadeVida: -35, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "A família ficou extremamente chateada com a falta de chocolate. Clima pesadíssimo.", impact: { saudeFinanceira: +20, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Ninguém reclamou alto, mas ficou um clima estranho no almoço de domingo.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Ninguém se importou com o marketing e o foco foi aproveitar a companhia um do outro.", impact: { saudeFinanceira: +25, qualidadeVida: +10, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Uma tia distante trouxe caixas de bombom para todos, salvando seu dia e seu bolso!", impact: { saudeFinanceira: +30, qualidadeVida: +25, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 5, // MAIO
      title: "Dia das Mães",
      context: "Maio é o mês das mães. O comércio está agressivo nas propagandas de presentes caros.",
      isFamily: true,
      options: [
        { 
          text: `Joia e um jantar chique (Custo: R$ ${c(600)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "A joia deu alergia terrível nela. O restaurante errou o prato e a noite foi um fiasco.", impact: { saudeFinanceira: -40, qualidadeVida: -25, reservaEmergencia: 0, custo: c(700) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Comida péssima, restaurante lotado e estressante. Dinheiro muito mal gasto.", impact: { saudeFinanceira: -30, qualidadeVida: -10, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "O jantar foi ok. Ela agradeceu a joia, mas brigou que você gasta demais.", impact: { saudeFinanceira: -25, qualidadeVida: +5, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Ela chorou de emoção! Atendimento impecável, um dia inesquecível para a memória.", impact: { saudeFinanceira: -25, qualidadeVida: +35, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Tratamento VIP no restaurante e a joia brilhou! Ela nunca te viu tão próspero(a)!", impact: { saudeFinanceira: -20, qualidadeVida: +50, reservaEmergencia: 0, custo: c(600) } }
          ] 
        },
        { 
          text: `Almoço feito em casa (Custo: R$ ${c(150)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "Você botou fogo num pano de prato. O almoço quase virou um incêndio e a fome bateu.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "O fogão pifou e a comida queimou. Vocês comeram marmita fria por delivery.", impact: { saudeFinanceira: -10, qualidadeVida: -10, reservaEmergencia: 0, custo: c(250) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "A comida ficou razoável, deu bastante louça para lavar, mas foi uma tarde legal.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Sua receita estava digna de MasterChef! O tempero caseiro trouxe memórias maravilhosas.", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Almoço dos deuses e vocês conversaram até a noite relembrando histórias hilárias!", impact: { saudeFinanceira: +15, qualidadeVida: +40, reservaEmergencia: 0, custo: c(150) } }
          ] 
        },
        { 
          text: `Apenas um abraço (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Ela fingiu que não se importou, mas desabafou com as vizinhas que você é ingrato(a).", impact: { saudeFinanceira: +10, qualidadeVida: -35, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Ela disse que não tem problema, mas você sentiu a decepção profunda nos olhos dela.", impact: { saudeFinanceira: +15, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Foi um dia bem comum. Sem presentes, sem surpresas, e a vida seguiu.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "A presença era o melhor presente. Vocês passaram o dia inteiro conversando felizes.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Vocês foram caminhar e ela disse que sentia falta da sua atenção exclusiva. Revigorante!", impact: { saudeFinanceira: +25, qualidadeVida: +30, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 6, // JUNHO
      title: "Oportunidade Profissional",
      context: "Junho. Surgiu um curso online maravilhoso que pode alavancar sua carreira, mas o preço é salgado.",
      options: [
        { 
          text: `Pagar à vista com a reserva (Custo: R$ ${c(800)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "A plataforma faliu na mesma semana e o site saiu do ar. Seu dinheiro virou fumaça.", impact: { saudeFinanceira: -10, qualidadeVida: -25, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Curso horrível! Era só marketing vazio e o produtor sumiu sem dar reembolso.", impact: { saudeFinanceira: -5, qualidadeVida: -15, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "O curso era longo e chato, você fez metade. O aprendizado foi medíocre.", impact: { saudeFinanceira: +5, qualidadeVida: 0, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Certificado de peso! Você logo conseguiu aplicar e ser notado(a) no trabalho.", impact: { saudeFinanceira: +30, qualidadeVida: +25, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "O professor do curso adorou seu projeto final e te recomendou para uma ótima vaga!", impact: { saudeFinanceira: +40, qualidadeVida: +40, reservaEmergencia: -40, custo: c(800) } }
          ] 
        },
        { 
          text: `Parcelar no cartão em 12x (Custo: R$ ${c(90)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O rotativo explodiu e seu nome foi parar no SPC. Curso abandonado pelo estresse.", impact: { saudeFinanceira: -35, qualidadeVida: -25, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "As parcelas comprometeram seu cartão e você teve que entrar no rotativo. Ansiedade a mil.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: 0, custo: c(120) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "A parcela pesa todo mês, o que te obriga a focar e terminar o curso na marra.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: 0, custo: c(90) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Decisão correta! O pequeno gasto mensal se pagou rápido com o networking que você fez.", impact: { saudeFinanceira: +10, qualidadeVida: +20, reservaEmergencia: 0, custo: c(90) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Você conseguiu fechar um freela usando o que aprendeu na 1ª semana, pagando o curso inteiro!", impact: { saudeFinanceira: +25, qualidadeVida: +30, reservaEmergencia: 0, custo: 0 } }
          ] 
        },
        { 
          text: `Não fazer o curso (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Seu chefe notou que você está estagnado(a) no mercado e te tirou de um projeto importante.", impact: { saudeFinanceira: 0, qualidadeVida: -30, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Um colega menos experiente fez o curso e pegou a promoção no seu lugar. Frustração total.", impact: { saudeFinanceira: +10, qualidadeVida: -20, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Você ignorou e a vida seguiu normalmente. Nem promoção, nem demissão.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Você garimpou e achou os exatos mesmos conteúdos perdidos pelo YouTube de graça!", impact: { saudeFinanceira: +25, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "A empresa decidiu pagar um treinamento corporativo idêntico para você 1 mês depois!", impact: { saudeFinanceira: +35, qualidadeVida: +25, reservaEmergencia: 0, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Sorte] Enviar um e-mail para o produtor do curso pedindo uma bolsa de estudos (Custo: R$ 0)`, 
          requiredPerk: 'sortudo',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "O produtor foi super simpático e te deu 50% de desconto! O curso ficou muito mais acessível.", impact: { saudeFinanceira: +15, qualidadeVida: +15, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Você ganhou uma bolsa 100% integral! O aprendizado alavancou incrivelmente sua carreira.", impact: { saudeFinanceira: +35, qualidadeVida: +30, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 7, // JULHO
      title: "Férias de Inverno",
      context: "Mês de julho, clima frio. Todo mundo postando fotos viajando para a serra.",
      options: [
        { 
          text: `Viajar para a serra (Custo: R$ ${c(1500)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "O chalé alugado era um golpe. Vocês dormiram no carro no frio e perderam a grana.", impact: { saudeFinanceira: -50, qualidadeVida: -35, reservaEmergencia: -10, custo: c(1500) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "O hotel era sujo, choveu granizo e você pegou uma gripe de cama. Férias perdidas.", impact: { saudeFinanceira: -40, qualidadeVida: -15, reservaEmergencia: -10, custo: c(1600) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "A serra estava absurdamente lotada, mas a comida compensou a dor de cabeça.", impact: { saudeFinanceira: -35, qualidadeVida: +10, reservaEmergencia: -10, custo: c(1500) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Vinhos, lareira e paisagens de cinema. Você voltou como uma nova pessoa!", impact: { saudeFinanceira: -30, qualidadeVida: +45, reservaEmergencia: -10, custo: c(1500) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Pegaram neve na serra! Fotos dignas de Europa, fondue maravilhoso e descanso profundo.", impact: { saudeFinanceira: -25, qualidadeVida: +60, reservaEmergencia: -10, custo: c(1500) } }
          ] 
        },
        { 
          text: `Passeios bate-volta (Custo: R$ ${c(250)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "Você se perdeu numa trilha mal sinalizada e a bateria do carro arriou. Resgate caríssimo.", impact: { saudeFinanceira: -25, qualidadeVida: -20, reservaEmergencia: -15, custo: c(700) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "O pneu estourou na estrada num buraco. Gastos pesados com guincho e mecânica.", impact: { saudeFinanceira: -15, qualidadeVida: -10, reservaEmergencia: -10, custo: c(500) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "O lugar do passeio estava chato e frio, mas as fotos no mirante ficaram bonitas.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(250) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Achou um chalé de fazenda desconhecido pelas massas, super barato e aconchegante!", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "O roteiro foi surpreendente! Comeram super bem e o carro não gastou quase nada.", impact: { saudeFinanceira: +15, qualidadeVida: +40, reservaEmergencia: 0, custo: c(150) } }
          ] 
        },
        { 
          text: `Ficar em casa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "O vizinho começou uma obra no sábado e furou parede todos os dias. Descanso zero.", impact: { saudeFinanceira: +10, qualidadeVida: -35, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Ficar rolando o feed e vendo os amigos em Gramado te afundou numa fossa mental.", impact: { saudeFinanceira: +20, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "As férias consistiram em arrumar a bagunça da casa e lavar as roupas. Sem descanso real.", impact: { saudeFinanceira: +25, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Você zerou os jogos que estavam parados e dormiu 10h por noite. Que delícia!", impact: { saudeFinanceira: +25, qualidadeVida: +20, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Descanso supremo! Acordou tarde todo dia, e sua saúde mental restaurou 100%.", impact: { saudeFinanceira: +30, qualidadeVida: +35, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 8, // AGOSTO
      title: "Armadilha do Consumo",
      context: "Agosto parece não ter fim. Você está exausto(a) e vê uma Smart TV 65'' numa 'Super Promoção'.",
      isShopping: true,
      options: [
        { 
          text: `Comprar na hora! Eu mereço! (Custo: R$ ${c(2500)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Sua casa foi roubada na mesma semana e levaram a TV nova na caixa. Devastador.", impact: { saudeFinanceira: -50, qualidadeVida: -40, reservaEmergencia: -25, custo: c(2500) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "A tela chegou totalmente trincada. A transportadora culpou a loja, que sumiu. Pesadelo.", impact: { saudeFinanceira: -45, qualidadeVida: -20, reservaEmergencia: -25, custo: c(2500) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "A TV é ótima, mas o limite estourou. A fatura do próximo mês tá te tirando o sono.", impact: { saudeFinanceira: -40, qualidadeVida: +10, reservaEmergencia: -20, custo: c(2500) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Verdadeiro cinema em casa! A imagem e som surreais compensaram toda a tristeza de Agosto.", impact: { saudeFinanceira: -35, qualidadeVida: +35, reservaEmergencia: -20, custo: c(2500) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "A imagem é absurda e veio um home theater de brinde surpresa na caixa! Felicidade extrema.", impact: { saudeFinanceira: -30, qualidadeVida: +50, reservaEmergencia: -20, custo: c(2500) } }
          ] 
        },
        { 
          text: `TV menor e mais barata (Custo: R$ ${c(1300)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "A TV pegou fogo na tomada assim que ligou. A loja não deu suporte e você perdeu tudo.", impact: { saudeFinanceira: -30, qualidadeVida: -25, reservaEmergencia: -15, custo: c(1300) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "O sistema da TV (Smart) trava até pra mudar o volume. Você passa raiva diariamente.", impact: { saudeFinanceira: -20, qualidadeVida: -10, reservaEmergencia: -10, custo: c(1300) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Ela atende ao propósito, mas seus amigos zoaram o tamanho comparada à TV antiga.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: -10, custo: c(1300) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Escolha inteligentíssima! O modelo é rápido, nítido e seu orçamento ficou intacto.", impact: { saudeFinanceira: -10, qualidadeVida: +20, reservaEmergencia: -10, custo: c(1300) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Mesmo sendo o modelo mais barato, a qualidade é incrível e sobrou grana pra pipoca!", impact: { saudeFinanceira: 0, qualidadeVida: +35, reservaEmergencia: -10, custo: c(1300) } }
          ] 
        },
        { 
          text: `Não comprar nada (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Sua TV velha deu curto-circuito e queimou o roteador junto. Você perdeu internet e TV.", impact: { saudeFinanceira: -20, qualidadeVida: -30, reservaEmergencia: -15, custo: c(2000) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Sua TV velha soltou fumaça e queimou de vez! Agora sem promoções ativas, teve prejuízo.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: -15, custo: c(1600) } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Agosto foi longo e chato, mas ao menos o dinheiro ficou na conta rendendo trocados.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: +5, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Resistência de ferro! A velha TV ainda serve muito bem e seu caixa está forte.", impact: { saudeFinanceira: +30, qualidadeVida: +5, reservaEmergencia: +15, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Um amigo foi morar fora e te doou a TV 4k dele de graça! Paciência recompensada.", impact: { saudeFinanceira: +35, qualidadeVida: +35, reservaEmergencia: +15, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Desapegado] Rir da promoção, fechar o site e ir ler um livro que você já tem (Custo: R$ 0)`, 
          requiredPerk: 'desapegado',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "Você leu metade de um livro incrível e percebeu que não precisa de telas gigantes para ser feliz.", impact: { saudeFinanceira: +35, qualidadeVida: +40, reservaEmergencia: +15, custo: 0 } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Você até doou sua TV velha e agora sua sala tem um espaço Zen. Paz financeira e mental absurda!", impact: { saudeFinanceira: +40, qualidadeVida: +60, reservaEmergencia: +20, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 9, // SETEMBRO
      title: "Pressão Social",
      context: "Setembro. Seus amigos de trabalho combinam de ir num restaurante muito chique na sexta-feira.",
      isSocial: true,
      options: [
        { 
          text: `Ir e rachar tudo (Custo: R$ ${c(200)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Intoxicação alimentar grave com os frutos do mar. Parou no hospital pagando exames caros.", impact: { saudeFinanceira: -35, qualidadeVida: -40, reservaEmergencia: -10, custo: c(500) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Alguém bebeu muito vinho caro, a conta multiplicou e você precisou cobrir a falta.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: -10, custo: c(350) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "A comida e a conversa foram razoáveis. Voltou para casa com cheiro de fritura no cabelo.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Noite de gala! O bife derretia na boca e de quebra rolou um ótimo networking com o chefe.", impact: { saudeFinanceira: -10, qualidadeVida: +30, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Além da melhor comida, o networking rendeu um convite irrecusável para uma promoção!", impact: { saudeFinanceira: 0, qualidadeVida: +50, reservaEmergencia: 0, custo: c(200) } }
          ] 
        },
        { 
          text: `Ir, mas pedir só uma bebida (Custo: R$ ${c(40)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O garçom derrubou vinho na sua roupa. Conta dividida por igual e você foi taxado de chato.", impact: { saudeFinanceira: -20, qualidadeVida: -30, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "No fim, impuseram a divisão igualitária da conta e você passou o vexame de brigar pelo valor.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Bebida rala com muito gelo. A fome bateu forte vendo o prato dos outros, mas aguentou.", impact: { saudeFinanceira: +5, qualidadeVida: -5, reservaEmergencia: 0, custo: c(40) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Você deu sorte! Outra pessoa quis pagar a conta inteira para todos, e você jantou de graça!", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Acharam um bar incrível depois dali e a noite foi épica pagando trocados na cerveja!", impact: { saudeFinanceira: +15, qualidadeVida: +40, reservaEmergencia: 0, custo: c(50) } }
          ] 
        },
        { 
          text: `Dar uma desculpa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "A equipe falou mal de você, dizendo que não veste a camisa da empresa. Clima terrível no RH.", impact: { saudeFinanceira: +5, qualidadeVida: -35, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Uma foto sua na padaria vazou. Fofocas correm no escritório de que você é antissocial.", impact: { saudeFinanceira: +15, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Ninguém sentiu muito sua falta. Foi uma noite banal lavando a louça de casa.", impact: { saudeFinanceira: +15, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Eles mandaram mensagem dizendo que o restaurante era uma furada! Você riu de alívio no sofá.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Todos pegaram virose da comida cara! Você escapou e foi o único saudável na segunda.", impact: { saudeFinanceira: +25, qualidadeVida: +30, reservaEmergencia: 0, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Lobo Solitário] Ignorar as mensagens, desligar o celular e curtir sua própria companhia (Custo: R$ 0)`, 
          requiredPerk: 'lobo_solitario',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "Você preparou uma janta maravilhosa só para você e dormiu cedo. Uma noite perfeita de paz!", impact: { saudeFinanceira: +25, qualidadeVida: +35, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Paz absoluta! Nenhuma notificação. Você zerou aquele jogo que queria e recarregou a bateria social 100%.", impact: { saudeFinanceira: +30, qualidadeVida: +55, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 10, // OUTUBRO
      title: "Dia das Crianças",
      context: "Outubro chegou. Crianças da família esperando presentes e o shopping está uma loucura.",
      isFamily: true,
      options: [
        { 
          text: `Comprar os brinquedos da moda (Custo: R$ ${c(400)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Eles brigaram pelo brinquedo e ele quebrou em 5 minutos. Dinheiro rasgado e choro.", impact: { saudeFinanceira: -30, qualidadeVida: -20, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Brinquedo de plástico frágil. A criança quebrou antes de ir dormir e começou a chorar.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "Elas brincaram por uns 15 minutos e logo voltaram para as telas de celular e iPad.", impact: { saudeFinanceira: -20, qualidadeVida: 0, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Sorrisos imensos e abraços apertados! Elas largaram os tablets e brincaram a semana toda.", impact: { saudeFinanceira: -15, qualidadeVida: +30, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "O brinquedo não só era ótimo como ensinava lógica! Você se sentiu o(a) melhor tio/tia.", impact: { saudeFinanceira: -10, qualidadeVida: +45, reservaEmergencia: 0, custo: c(400) } }
          ] 
        },
        { 
          text: `Lembrancinhas e parque (Custo: R$ ${c(80)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O parque fechou para manutenção surpresa. Tiveram que pagar um cinema caríssimo de emergência.", impact: { saudeFinanceira: -15, qualidadeVida: -15, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Choveu forte, o escorregador encharcou e o algodão doce derreteu. Desastre com as crianças.", impact: { saudeFinanceira: 0, qualidadeVida: -20, reservaEmergencia: 0, custo: c(80) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Gritaria correndo pelo parque. Foi exaustivo, mas as crianças cansaram logo e dormiram.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(80) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Brincar ao ar livre gerou memórias nostálgicas e uma tarde deliciosa e econômica.", impact: { saudeFinanceira: +15, qualidadeVida: +25, reservaEmergencia: 0, custo: c(80) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Acharam um evento gratuito no parque com teatro de fantoches. Melhor que brinquedo caro!", impact: { saudeFinanceira: +20, qualidadeVida: +40, reservaEmergencia: 0, custo: c(40) } }
          ] 
        },
        { 
          text: `Sem presente (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Você foi o assunto do almoço. Todos te julgaram de mesquinho e a relação familiar azedou.", impact: { saudeFinanceira: +10, qualidadeVida: -40, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "As crianças te chamaram de pão-duro em público! Que vergonha gigantesca na família.", impact: { saudeFinanceira: +15, qualidadeVida: -30, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Choraram no início, mas esqueceram rapidamente. O clima só ficou chato por uns minutos.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Eles ganharam TANTOS brinquedos dos avós que sequer notaram a falta do seu pacote.", impact: { saudeFinanceira: +25, qualidadeVida: +10, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Você contou histórias e ensinou a fazer pipa. Ganhou o prêmio de melhor pessoa no fim do dia!", impact: { saudeFinanceira: +30, qualidadeVida: +35, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 11, // NOVEMBRO
      title: "A febre da Black Friday",
      context: "Novembro, a internet toda grita: COMPRE! COMPRE! COMPRE!",
      isShopping: true,
      options: [
        { 
          text: `Comprar por impulso (Custo: R$ ${c(1000)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Seu cartão foi clonado! Boletos atrasaram e geraram multas enormes na semana seguinte.", impact: { saudeFinanceira: -50, qualidadeVida: -40, reservaEmergencia: -15, custo: c(1600) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "Metade comprou pela metade do dobro. E o outro site era golpe e sumiu com seu dinheiro.", impact: { saudeFinanceira: -40, qualidadeVida: -30, reservaEmergencia: -10, custo: c(1400) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "Os cacarecos chegaram e já acumulam pó na estante, mas foi divertido rasgar as caixas.", impact: { saudeFinanceira: -35, qualidadeVida: +5, reservaEmergencia: -10, custo: c(1000) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "A promoção era um bug real de uma loja! Tudo pela metade do preço! Você se deu super bem.", impact: { saudeFinanceira: -20, qualidadeVida: +35, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "Você pegou descontos de 80% e ainda parcelou sem juros! Renovou a casa parecendo de revista.", impact: { saudeFinanceira: -10, qualidadeVida: +50, reservaEmergencia: 0, custo: c(500) } }
          ] 
        },
        { 
          text: `Comprar apenas o essencial (Custo: R$ ${c(350)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "O site atrasou a entrega em 2 meses, a loja declarou falência e o produto nunca chegou.", impact: { saudeFinanceira: 0, qualidadeVida: -25, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Chegou com a voltagem errada e a loja recusou a troca fácil. Dor de cabeça infinita.", impact: { saudeFinanceira: +5, qualidadeVida: -15, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Encontrou uma leve promoção, mas o frete comeu o lucro. Saiu elas por elas.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Mestre do garimpo de descontos! Produto necessário, barato, e entregue no dia seguinte.", impact: { saudeFinanceira: +20, qualidadeVida: +20, reservaEmergencia: 0, custo: c(250) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Além do desconto absurdo, o produto essencial veio com garantia estendida e brinde. Perfeito!", impact: { saudeFinanceira: +25, qualidadeVida: +35, reservaEmergencia: 0, custo: c(200) } }
          ] 
        },
        { 
          text: `Ignorar a data (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "Sua geladeira e máquina de lavar pifaram no dia seguinte. Faltou sorte e faltou promoção.", impact: { saudeFinanceira: -25, qualidadeVida: -30, reservaEmergencia: -40, custo: c(2800) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Segunda-feira sua geladeira pifou! Acabou a Black Friday e os preços voltaram pro teto.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: -30, custo: c(1800) } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Você viu seus amigos trocando tudo em casa e deu um leve aperto, mas seguiu firme.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: +5, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Nirvana financeiro. Não precisa de nada e seu patrimônio sorri no fim do mês.", impact: { saudeFinanceira: +30, qualidadeVida: +15, reservaEmergencia: +15, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "Sua paz interior atingiu o ápice. Nada do que tentaram empurrar com anúncios funcionou.", impact: { saudeFinanceira: +35, qualidadeVida: +25, reservaEmergencia: +20, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Gastão] Comprar absolutamente tudo em 24x no limite do rotativo (Custo: R$ ${c(4500)})`, 
          requiredPerk: 'gastao',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "A fatura vai ser gigante, mas a alegria de abrir 15 caixas curou sua alma momentaneamente!", impact: { saudeFinanceira: -40, qualidadeVida: +40, reservaEmergencia: -20, custo: c(4500) } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Extravagância máxima! A loja mandou produtos em dobro por engano. Felicidade total!", impact: { saudeFinanceira: -20, qualidadeVida: +60, reservaEmergencia: -10, custo: c(4500) } }
          ] 
        }
      ]
    },
    {
      id: 12, // DEZEMBRO
      title: "A Magia do Natal (e do 13º)",
      context: "Dezembro! O 13º caiu na conta, mas a pressão por presentes, ceia e viagens é gigante.",
      isSocial: true,
      isFamily: true,
      options: [
        { 
          text: `Festão, sem limites! (Custo: R$ ${c(1800)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 2, type: 'bad', message: "Intoxicação alimentar em massa com a maionese cara. Todos no hospital. Natal arruinado.", impact: { saudeFinanceira: -50, qualidadeVida: -45, reservaEmergencia: -30, custo: c(2200) } },
            { minRoll: 3, maxRoll: 4, type: 'bad', message: "A bebida secou cedo, choveu no churrasco e rolou briga política pesada no peru. Decepção.", impact: { saudeFinanceira: -45, qualidadeVida: -30, reservaEmergencia: -20, custo: c(1800) } },
            { minRoll: 5, maxRoll: 9, type: 'neutral', message: "Festa padrão. Encheram a pança, sobraram restos por 3 dias, mas sem magia e muita conta.", impact: { saudeFinanceira: -35, qualidadeVida: +15, reservaEmergencia: -20, custo: c(1800) } },
            { minRoll: 10, maxRoll: 16, type: 'good', message: "Um filme de Hollywood. A família reunida rindo e trocando memórias. Valeu cada centavo!", impact: { saudeFinanceira: -20, qualidadeVida: +50, reservaEmergencia: -10, custo: c(1800) } },
            { minRoll: 17, maxRoll: 20, type: 'good', message: "A confraternização uniu partes da família que não se falavam há anos. Ceia histórica e mágica!", impact: { saudeFinanceira: -15, qualidadeVida: +65, reservaEmergencia: -10, custo: c(1800) } }
          ] 
        },
        { 
          text: `Amigo oculto e ceia rachada (Custo: R$ ${c(300)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 3, type: 'bad', message: "No amigo oculto roubaram seu presente, e a ceia rachada deu briga por causa de bebida.", impact: { saudeFinanceira: 0, qualidadeVida: -30, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 4, maxRoll: 7, type: 'bad', message: "Você comprou presentes da lista e recebeu meias esburacadas de uma prima distante.", impact: { saudeFinanceira: +5, qualidadeVida: -20, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 8, maxRoll: 12, type: 'neutral', message: "Meia dúzia de risadas nervosas quando as uvas-passas invadiram os pratos. Tudo equilibrado.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 13, maxRoll: 17, type: 'good', message: "Divertido, simples e cheio de amor. O amigo oculto de presentes engraçados roubou a cena.", impact: { saudeFinanceira: +20, qualidadeVida: +30, reservaEmergencia: +5, custo: c(300) } },
            { minRoll: 18, maxRoll: 20, type: 'good', message: "Ceia colaborativa impecável! Cada um trouxe sua especialidade e deram muita risada juntos.", impact: { saudeFinanceira: +25, qualidadeVida: +45, reservaEmergencia: +5, custo: c(200) } }
          ] 
        },
        { 
          text: `Ignorar o Natal e investir (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 5, type: 'bad', message: "A solidão foi tão grande que você gastou todo o dinheiro em futilidades online deprimido(a).", impact: { saudeFinanceira: +10, qualidadeVida: -50, reservaEmergencia: 0, custo: c(1000) } },
            { minRoll: 6, maxRoll: 10, type: 'bad', message: "Fama de Scrooge sovina! Foi excluído do Zap da família e passou o sino da meia-noite infeliz.", impact: { saudeFinanceira: +40, qualidadeVida: -40, reservaEmergencia: +30, custo: 0 } },
            { minRoll: 11, maxRoll: 15, type: 'neutral', message: "Se empanturrou de miojo sozinho, viu um filme, foi dormir e o dinheiro continuou rendendo.", impact: { saudeFinanceira: +45, qualidadeVida: -10, reservaEmergencia: +35, custo: 0 } },
            { minRoll: 16, maxRoll: 18, type: 'good', message: "Paz e silêncio. Um retiro espiritual pessoal e com seu suado 13º rendendo muito na carteira.", impact: { saudeFinanceira: +50, qualidadeVida: +15, reservaEmergencia: +45, custo: 0 } },
            { minRoll: 19, maxRoll: 20, type: 'good', message: "A família viajou e você pôde curtir a paz absoluta com a carteira transbordando dividendos!", impact: { saudeFinanceira: +55, qualidadeVida: +35, reservaEmergencia: +50, custo: 0 } }
          ] 
        },
        { 
          text: `✨ [Calculista] Organizar uma ceia colaborativa em planilha, cobrando todos antes da festa (Custo: R$ ${c(50)})`, 
          requiredPerk: 'calculista',
          outcomes: [
            { minRoll: 1, maxRoll: 10, type: 'good', message: "Seu plano funcionou perfeitamente. A família te achou super organizado(a) e ninguém faliu!", impact: { saudeFinanceira: +30, qualidadeVida: +25, reservaEmergencia: +10, custo: c(50) } },
            { minRoll: 11, maxRoll: 20, type: 'good', message: "Eficiência cirúrgica! Você cobrou os parentes folgados adiantado e até sobrou dinheiro no caixa da ceia.", impact: { saudeFinanceira: +45, qualidadeVida: +40, reservaEmergencia: +20, custo: -c(100) } }
          ] 
        }
      ]
    }
  ];
};