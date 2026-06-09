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
}

export interface Dilemma {
  id: number;
  title: string;
  context: string;
  options: Option[];
}

export interface PlayerStatus {
  saldo: number; // <-- Adicionamos o saldo aqui
  saudeFinanceira: number;
  qualidadeVida: number;
  reservaEmergencia: number;
  custosFixos?: number;
}

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
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Erro no sistema! Um imposto foi pago em duplicidade e o reembolso vai demorar.", impact: { saudeFinanceira: +10, qualidadeVida: -10, reservaEmergencia: -50, custo: c(1800) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O site travou algumas vezes, mas o pagamento foi efetuado pelo valor normal.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: -40, custo: c(1200) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Tudo pago! O alívio de não ter dívidas compensa a queda na reserva.", impact: { saudeFinanceira: +20, qualidadeVida: +5, reservaEmergencia: -40, custo: c(1200) } }
          ] 
        },
        { 
          text: `Parcelar em várias vezes com juros (Custo Base: R$ ${c(200)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Você esqueceu de pagar a primeira parcela e os juros foram para a lua!", impact: { saudeFinanceira: -35, qualidadeVida: -10, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Parcelamento feito. O limite do cartão ficou estrangulado, mas sob controle.", impact: { saudeFinanceira: -30, qualidadeVida: 0, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você organizou perfeitamente as contas e vai absorver as parcelas sem estresse.", impact: { saudeFinanceira: -20, qualidadeVida: +5, reservaEmergencia: 0, custo: c(200) } }
          ] 
        },
        { 
          text: `Fazer um empréstimo pessoal (Custo Base: R$ ${c(300)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Caiu no conto do empréstimo fácil! As taxas escondidas destruíram sua saúde financeira.", impact: { saudeFinanceira: -50, qualidadeVida: -20, reservaEmergencia: 0, custo: c(450) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O banco aprovou o empréstimo com juros normais. Nada demais, apenas mais uma dívida.", impact: { saudeFinanceira: -40, qualidadeVida: -5, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Pegou o empréstimo com um familiar a juros zero! Resolveu o problema rápido.", impact: { saudeFinanceira: -10, qualidadeVida: +10, reservaEmergencia: 0, custo: c(300) } }
          ] 
        }
      ]
    },
    {
      id: 2, // FEVEREIRO
      title: "Folia de Carnaval",
      context: "É Carnaval! Seus amigos alugaram uma casa na praia e te convidaram de última hora.",
      options: [
        { 
          text: `Aceitar e pagar a sua parte (Custo: R$ ${c(800)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A viagem foi um desastre! Choveu o tempo todo e você ainda gastou mais que o planejado.", impact: { saudeFinanceira: -40, qualidadeVida: -10, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Viagem legal, mas o trânsito infernal na volta e o cansaço empataram a diversão.", impact: { saudeFinanceira: -30, qualidadeVida: +10, reservaEmergencia: -10, custo: c(800) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "A viagem foi épica! Você se divertiu muito e recarregou as energias ao máximo.", impact: { saudeFinanceira: -30, qualidadeVida: +35, reservaEmergencia: -10, custo: c(800) } }
          ] 
        },
        { 
          text: `Ficar na cidade e ir em bloquinhos (Custo: R$ ${c(150)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Você perdeu a carteira no meio da multidão! Prejuízo gigante e muita dor de cabeça.", impact: { saudeFinanceira: -20, qualidadeVida: -15, reservaEmergencia: -10, custo: c(600) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Fila enorme para o banheiro e cerveja quente. Foi ok, mas voltou cedo pra casa.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você curtiu muito os bloquinhos perto de casa gastando quase nada!", impact: { saudeFinanceira: +10, qualidadeVida: +20, reservaEmergencia: 0, custo: c(150) } }
          ] 
        },
        { 
          text: `Maratona de séries em casa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A internet caiu e um cano estourou em casa. Feriado arruinado e custo surpresa!", impact: { saudeFinanceira: -10, qualidadeVida: -25, reservaEmergencia: -15, custo: c(400) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O tédio bateu forte ao ver as fotos dos amigos, mas ao menos economizou dinheiro.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Feriado relaxante! Você descansou perfeitamente e ficou imune às tentações.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 3, // MARÇO
      title: "O Imprevisto",
      context: "Março rolando e de repente... seu celular quebrou. Você depende muito dele no dia a dia.",
      options: [
        { 
          text: `Comprar o modelo top de linha (Custo: R$ ${c(4000)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Você foi assaltado na mesma semana. Pânico, celular perdido e o boleto ficou.", impact: { saudeFinanceira: -50, qualidadeVida: -30, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O aparelho é bom, mas o peso no bolso não te deixa curtir a compra 100%.", impact: { saudeFinanceira: -45, qualidadeVida: +5, reservaEmergencia: 0, custo: c(4000) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Aparelho maravilhoso! A câmera e a velocidade aumentaram muito sua produtividade.", impact: { saudeFinanceira: -40, qualidadeVida: +25, reservaEmergencia: 0, custo: c(4000) } }
          ] 
        },
        { 
          text: `Comprar um modelo intermediário (Custo: R$ ${c(1200)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "O celular veio com defeito e acionar a garantia deu uma dor de cabeça imensa.", impact: { saudeFinanceira: -10, qualidadeVida: -15, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Aparelho decente. A câmera não é grande coisa, mas resolve o problema do dia.", impact: { saudeFinanceira: -10, qualidadeVida: 0, reservaEmergencia: -20, custo: c(1200) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Ótimo custo-benefício. O sistema é limpo e faz tudo que você precisa super bem.", impact: { saudeFinanceira: -5, qualidadeVida: +15, reservaEmergencia: -20, custo: c(1200) } }
          ] 
        },
        { 
          text: `Mandar consertar a tela do antigo (Custo: R$ ${c(250)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A tela nova parou de funcionar 3 dias depois. O barato saiu caro e você perdeu o dinheiro.", impact: { saudeFinanceira: -5, qualidadeVida: -15, reservaEmergencia: -5, custo: c(250) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A tela ficou com umas cores estranhas e o touch meio duro, mas dá pra usar.", impact: { saudeFinanceira: +10, qualidadeVida: -5, reservaEmergencia: -5, custo: c(250) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Técnico milagroso! O celular ficou novinho em folha e você economizou muito.", impact: { saudeFinanceira: +20, qualidadeVida: +5, reservaEmergencia: -5, custo: c(250) } }
          ] 
        }
      ]
    },
    {
      id: 4, // ABRIL
      title: "A Doçura da Páscoa",
      context: "Páscoa chegando. Os supermercados estão cheios de ovos de marca caríssimos.",
      options: [
        { 
          text: `Comprar ovos de marca (Custo: R$ ${c(350)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Esqueceu os ovos no sol e eles derreteram completamente. Tristeza na família.", impact: { saudeFinanceira: -25, qualidadeVida: -15, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Ovos entregues, mas o gosto era de guarda-chuva. Pelo menos a intenção valeu.", impact: { saudeFinanceira: -20, qualidadeVida: +5, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "A família amou os presentes, brindes vieram certos e a data foi inesquecível.", impact: { saudeFinanceira: -20, qualidadeVida: +25, reservaEmergencia: 0, custo: c(350) } }
          ] 
        },
        { 
          text: `Comprar barras e fazer em casa (Custo: R$ ${c(70)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Queimou o chocolate e a cozinha virou um caos. Acabou comprando pronto de última hora.", impact: { saudeFinanceira: -10, qualidadeVida: -15, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Deram bastante trabalho e ficaram meio feios, mas o gosto agradou no fim das contas.", impact: { saudeFinanceira: +5, qualidadeVida: 0, reservaEmergencia: 0, custo: c(70) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você virou um chocolatier! Ficaram incríveis e todos amaram a dedicação.", impact: { saudeFinanceira: +15, qualidadeVida: +20, reservaEmergencia: 0, custo: c(70) } }
          ] 
        },
        { 
          text: `Ignorar a data (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A família ficou extremamente chateada com a falta de chocolate. Clima pesadíssimo.", impact: { saudeFinanceira: +20, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Ninguém reclamou alto, mas ficou um clima estranho no almoço de domingo.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Ninguém se importou com o marketing e o foco foi aproveitar a companhia um do outro.", impact: { saudeFinanceira: +25, qualidadeVida: +10, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 5, // MAIO
      title: "Dia das Mães",
      context: "Maio é o mês das mães. O comércio está agressivo nas propagandas de presentes caros.",
      options: [
        { 
          text: `Joia e um jantar chique (Custo: R$ ${c(600)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Comida péssima, restaurante lotado e estressante. Dinheiro muito mal gasto.", impact: { saudeFinanceira: -30, qualidadeVida: -10, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O jantar foi ok. Ela agradeceu a joia, mas brigou que você gasta demais.", impact: { saudeFinanceira: -25, qualidadeVida: +5, reservaEmergencia: 0, custo: c(600) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Ela chorou de emoção! Atendimento impecável, um dia inesquecível para a memória.", impact: { saudeFinanceira: -25, qualidadeVida: +35, reservaEmergencia: 0, custo: c(600) } }
          ] 
        },
        { 
          text: `Almoço feito em casa (Custo: R$ ${c(150)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "O fogão pifou e a comida queimou. Vocês comeram marmita fria por delivery.", impact: { saudeFinanceira: -10, qualidadeVida: -10, reservaEmergencia: 0, custo: c(250) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A comida ficou razoável, deu bastante louça para lavar, mas foi uma tarde legal.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Sua receita estava digna de MasterChef! O tempero caseiro trouxe memórias maravilhosas.", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: c(150) } }
          ] 
        },
        { 
          text: `Apenas um abraço (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Ela disse que não tem problema, mas você sentiu a decepção profunda nos olhos dela.", impact: { saudeFinanceira: +15, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Foi um dia bem comum. Sem presentes, sem surpresas, e a vida seguiu.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "A presença era o melhor presente. Vocês passaram o dia inteiro conversando felizes.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } }
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
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Curso horrível! Era só marketing vazio e o produtor sumiu sem dar reembolso.", impact: { saudeFinanceira: -5, qualidadeVida: -15, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O curso era longo e chato, você fez metade. O aprendizado foi medíocre.", impact: { saudeFinanceira: +5, qualidadeVida: 0, reservaEmergencia: -40, custo: c(800) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Certificado de peso! Você logo conseguiu aplicar e ser notado(a) no trabalho.", impact: { saudeFinanceira: +30, qualidadeVida: +25, reservaEmergencia: -40, custo: c(800) } }
          ] 
        },
        { 
          text: `Parcelar no cartão em 12x (Custo: R$ ${c(90)}/mês)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "As parcelas comprometeram seu cartão e você teve que entrar no rotativo. Ansiedade a mil.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: 0, custo: c(120) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A parcela pesa todo mês, o que te obriga a focar e terminar o curso na marra.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: 0, custo: c(90) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Decisão correta! O pequeno gasto mensal se pagou rápido com o networking que você fez.", impact: { saudeFinanceira: +10, qualidadeVida: +20, reservaEmergencia: 0, custo: c(90) } }
          ] 
        },
        { 
          text: `Não fazer o curso (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Um colega menos experiente fez o curso e pegou a promoção no seu lugar. Frustração total.", impact: { saudeFinanceira: +10, qualidadeVida: -20, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Você ignorou e a vida seguiu normalmente. Nem promoção, nem demissão.", impact: { saudeFinanceira: +15, qualidadeVida: 0, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você garimpou e achou os exatos mesmos conteúdos perdidos pelo YouTube de graça!", impact: { saudeFinanceira: +25, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } }
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
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "O hotel era sujo, choveu granizo e você pegou uma gripe de cama. Férias perdidas.", impact: { saudeFinanceira: -40, qualidadeVida: -15, reservaEmergencia: -10, custo: c(1600) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A serra estava absurdamente lotada, mas a comida compensou a dor de cabeça.", impact: { saudeFinanceira: -35, qualidadeVida: +10, reservaEmergencia: -10, custo: c(1500) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Vinhos, lareira e paisagens de cinema. Você voltou como uma nova pessoa!", impact: { saudeFinanceira: -30, qualidadeVida: +45, reservaEmergencia: -10, custo: c(1500) } }
          ] 
        },
        { 
          text: `Passeios bate-volta (Custo: R$ ${c(250)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "O pneu estourou na estrada num buraco. Gastos pesados com guincho e mecânica.", impact: { saudeFinanceira: -15, qualidadeVida: -10, reservaEmergencia: -10, custo: c(500) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "O lugar do passeio estava chato e frio, mas as fotos no mirante ficaram bonitas.", impact: { saudeFinanceira: +5, qualidadeVida: +5, reservaEmergencia: 0, custo: c(250) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Achou um chalé de fazenda desconhecido pelas massas, super barato e aconchegante!", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: c(200) } }
          ] 
        },
        { 
          text: `Ficar em casa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Ficar rolando o feed e vendo os ex-colegas em Gramado te afundou numa fossa mental.", impact: { saudeFinanceira: +20, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "As férias consistiram em arrumar a bagunça da casa e lavar as roupas. Sem descanso real.", impact: { saudeFinanceira: +25, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você zerou os jogos que estavam parados e dormiu 10h por noite. Que delícia!", impact: { saudeFinanceira: +25, qualidadeVida: +20, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 8, // AGOSTO
      title: "Armadilha do Consumo",
      context: "Agosto parece não ter fim. Você está exausto(a) e vê uma Smart TV 65'' numa 'Super Promoção'.",
      options: [
        { 
          text: `Comprar na hora! Eu mereço! (Custo: R$ ${c(2500)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A tela chegou totalmente trincada. A transportadora culpou a loja, que sumiu. Pesadelo.", impact: { saudeFinanceira: -45, qualidadeVida: -20, reservaEmergencia: -25, custo: c(2500) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A TV é ótima, mas o limite estourou. A fatura do próximo mês tá te tirando o sono.", impact: { saudeFinanceira: -40, qualidadeVida: +10, reservaEmergencia: -20, custo: c(2500) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Verdadeiro cinema em casa! A imagem e som surreais compensaram toda a tristeza de Agosto.", impact: { saudeFinanceira: -35, qualidadeVida: +35, reservaEmergencia: -20, custo: c(2500) } }
          ] 
        },
        { 
          text: `TV menor e mais barata (Custo: R$ ${c(1300)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "O sistema da TV (Smart) trava até pra mudar o volume. Você passa raiva diariamente.", impact: { saudeFinanceira: -20, qualidadeVida: -10, reservaEmergencia: -10, custo: c(1300) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Ela atende ao propósito, mas seus amigos zoaram o tamanho comparada à TV antiga.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: -10, custo: c(1300) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Escolha inteligentíssima! O modelo é rápido, nítido e seu orçamento ficou intacto.", impact: { saudeFinanceira: -10, qualidadeVida: +20, reservaEmergencia: -10, custo: c(1300) } }
          ] 
        },
        { 
          text: `Não comprar nada (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Sua TV velha soltou fumaça e queimou de vez! Agora sem promoções ativas, teve prejuízo maior.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: -15, custo: c(1600) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Agosto foi longo e chato, mas ao menos o dinheiro ficou na conta rendendo trocados.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: +5, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Resistência de ferro! A velha TV ainda serve muito bem e seu caixa está forte.", impact: { saudeFinanceira: +30, qualidadeVida: +5, reservaEmergencia: +15, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 9, // SETEMBRO
      title: "Pressão Social",
      context: "Setembro. Seus amigos de trabalho combinam de ir num restaurante muito chique na sexta-feira.",
      options: [
        { 
          text: `Ir e rachar tudo (Custo: R$ ${c(200)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Alguém bebeu muito vinho caro, a conta multiplicou e você precisou cobrir a falta.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: -10, custo: c(350) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "A comida e a conversa foram razoáveis. Voltou para casa com cheiro de fritura no cabelo.", impact: { saudeFinanceira: -15, qualidadeVida: +5, reservaEmergencia: 0, custo: c(200) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Noite de gala! O bife derretia na boca e de quebra rolou um ótimo networking com o chefe.", impact: { saudeFinanceira: -10, qualidadeVida: +30, reservaEmergencia: 0, custo: c(200) } }
          ] 
        },
        { 
          text: `Ir, mas pedir só uma bebida (Custo: R$ ${c(40)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "No fim, impuseram a divisão igualitária da conta e você passou o vexame de brigar pelo valor.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: 0, custo: c(150) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Bebida rala com muito gelo. A fome bateu forte vendo o prato dos outros, mas aguentou.", impact: { saudeFinanceira: +5, qualidadeVida: -5, reservaEmergencia: 0, custo: c(40) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Você deu sorte! Outra pessoa quis pagar a conta inteira para todos, e você jantou de graça!", impact: { saudeFinanceira: +10, qualidadeVida: +25, reservaEmergencia: 0, custo: 0 } }
          ] 
        },
        { 
          text: `Dar uma desculpa (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Uma foto sua na padaria vazou. Fofocas correm no escritório de que você é antissocial.", impact: { saudeFinanceira: +15, qualidadeVida: -25, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Ninguém sentiu muito sua falta. Foi uma noite banal lavando a louça de casa.", impact: { saudeFinanceira: +15, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Eles mandaram mensagem dizendo que o restaurante era uma furada! Você riu de alívio no sofá.", impact: { saudeFinanceira: +20, qualidadeVida: +15, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 10, // OUTUBRO
      title: "Dia das Crianças",
      context: "Outubro chegou. Crianças da família esperando presentes e o shopping está uma loucura.",
      options: [
        { 
          text: `Comprar os brinquedos da moda (Custo: R$ ${c(400)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Brinquedo de plástico frágil. A criança quebrou antes de ir dormir e começou a chorar.", impact: { saudeFinanceira: -25, qualidadeVida: -10, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Elas brincaram por uns 15 minutos e logo voltaram para as telas de celular e iPad.", impact: { saudeFinanceira: -20, qualidadeVida: 0, reservaEmergencia: 0, custo: c(400) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Sorrisos imensos e abraços apertados! Elas largaram os tablets e brincaram a semana toda.", impact: { saudeFinanceira: -15, qualidadeVida: +30, reservaEmergencia: 0, custo: c(400) } }
          ] 
        },
        { 
          text: `Lembrancinhas e parque (Custo: R$ ${c(80)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Choveu forte, o escorregador encharcou e o algodão doce derreteu. Desastre com os sobrinhos.", impact: { saudeFinanceira: 0, qualidadeVida: -20, reservaEmergencia: 0, custo: c(80) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Gritaria correndo pelo parque. Foi exaustivo, mas as crianças cansaram logo e dormiram.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(80) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Brincar ao ar livre gerou memórias nostálgicas e uma tarde deliciosa e econômica.", impact: { saudeFinanceira: +15, qualidadeVida: +25, reservaEmergencia: 0, custo: c(80) } }
          ] 
        },
        { 
          text: `Sem presente (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "As crianças te chamaram de pão-duro em público! Que vergonha gigantesca na família.", impact: { saudeFinanceira: +15, qualidadeVida: -30, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Choraram no início, mas esqueceram rapidamente. O clima só ficou chato por uns minutos.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: 0, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Eles ganharam TANTOS brinquedos dos avós que sequer notaram a falta do seu pacote.", impact: { saudeFinanceira: +25, qualidadeVida: +10, reservaEmergencia: 0, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 11, // NOVEMBRO
      title: "A febre da Black Friday",
      context: "Novembro, a internet toda grita: COMPRE! COMPRE! COMPRE!",
      options: [
        { 
          text: `Comprar por impulso (Custo: R$ ${c(1000)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Metade comprou pela metade do dobro. E o outro site clonou seu cartão de crédito.", impact: { saudeFinanceira: -40, qualidadeVida: -30, reservaEmergencia: -10, custo: c(1400) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Os cacarecos chegaram e já acumulam pó na estante, mas foi divertido rasgar as caixas.", impact: { saudeFinanceira: -35, qualidadeVida: +5, reservaEmergencia: -10, custo: c(1000) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "A promoção era um bug real de uma grande loja! Tudo pela metade do preço! Você se deu super bem.", impact: { saudeFinanceira: -20, qualidadeVida: +35, reservaEmergencia: 0, custo: c(600) } }
          ] 
        },
        { 
          text: `Comprar apenas o essencial (Custo: R$ ${c(350)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Chegou com a voltagem errada e a loja recusou a troca fácil. Dor de cabeça infinita.", impact: { saudeFinanceira: +5, qualidadeVida: -15, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Encontrou uma leve promoção, mas o frete comeu o lucro. Saiu elas por elas.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(350) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Mestre do garimpo de descontos! Produto necessário, barato, e entregue no dia seguinte.", impact: { saudeFinanceira: +20, qualidadeVida: +20, reservaEmergencia: 0, custo: c(250) } }
          ] 
        },
        { 
          text: `Ignorar a data (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Segunda-feira sua geladeira pifou! Acabou a Black Friday e os preços voltaram pro teto.", impact: { saudeFinanceira: -15, qualidadeVida: -20, reservaEmergencia: -30, custo: c(1800) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Você viu seus amigos trocando tudo em casa e deu um leve aperto, mas seguiu firme.", impact: { saudeFinanceira: +20, qualidadeVida: -5, reservaEmergencia: +5, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Nirvana financeiro. Não precisa de nada e seu patrimônio sorri no fim do mês.", impact: { saudeFinanceira: +30, qualidadeVida: +15, reservaEmergencia: +15, custo: 0 } }
          ] 
        }
      ]
    },
    {
      id: 12, // DEZEMBRO
      title: "A Magia do Natal (e do 13º)",
      context: "Dezembro! O 13º caiu na conta, mas a pressão por presentes, ceia e viagens é gigante.",
      options: [
        { 
          text: `Festão, sem limites! (Custo: R$ ${c(1800)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "A bebida secou cedo, choveu no churrasco e rolou briga política pesada no peru. Decepção.", impact: { saudeFinanceira: -45, qualidadeVida: -30, reservaEmergencia: -20, custo: c(1800) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Festa padrão. Encheram a pança, sobraram restos por 3 dias, mas sem magia e muita conta pra Janeiro.", impact: { saudeFinanceira: -35, qualidadeVida: +15, reservaEmergencia: -20, custo: c(1800) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Um filme de Hollywood. A família reunida rindo e trocando memórias. Valeu cada centavo da ceia!", impact: { saudeFinanceira: -20, qualidadeVida: +50, reservaEmergencia: -10, custo: c(1800) } }
          ] 
        },
        { 
          text: `Amigo oculto e ceia rachada (Custo: R$ ${c(300)})`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Você comprou presentes de lista e recebeu meias esburacadas de uma prima distante.", impact: { saudeFinanceira: +5, qualidadeVida: -20, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Meia dúzia de risadas nervosas quando as uvas-passas invadiram os pratos. Tudo equilibrado.", impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: 0, custo: c(300) } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Divertido, simples e cheio de amor. O amigo oculto de presentes engraçados roubou a cena.", impact: { saudeFinanceira: +20, qualidadeVida: +30, reservaEmergencia: +5, custo: c(300) } }
          ] 
        },
        { 
          text: `Ignorar o Natal e investir (Custo: R$ 0)`, 
          outcomes: [
            { minRoll: 1, maxRoll: 7, type: 'bad', message: "Fama de Scrooge sovina! Foi excluído do Zap da família e passou o sino da meia-noite infeliz.", impact: { saudeFinanceira: +40, qualidadeVida: -40, reservaEmergencia: +30, custo: 0 } },
            { minRoll: 8, maxRoll: 11, type: 'neutral', message: "Se empanturrou de miojo sozinho, viu um filme, foi dormir e o dinheiro continuou rendendo SELIC.", impact: { saudeFinanceira: +45, qualidadeVida: -10, reservaEmergencia: +35, custo: 0 } },
            { minRoll: 12, maxRoll: 20, type: 'good', message: "Paz e silêncio. Um retiro espiritual pessoal e com seu suado 13º rendendo muito na carteira.", impact: { saudeFinanceira: +50, qualidadeVida: +15, reservaEmergencia: +45, custo: 0 } }
          ] 
        }
      ]
    }
  ];
};