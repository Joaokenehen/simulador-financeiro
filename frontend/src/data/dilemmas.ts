export interface PlayerStatus {
  saudeFinanceira: number;
  qualidadeVida: number;
  reservaEmergencia: number;
}

export const dilemmas = [
  {
    id: 1,
    title: "O Imprevisto",
    context: "Seu celular quebrou inesperadamente e você depende dele para trabalhar e falar com a família. O que você faz?",
    options: [
      {
        text: "Comprar o modelo do ano parcelado em 24x com juros.",
        impact: { saudeFinanceira: -20, qualidadeVida: +10, reservaEmergencia: 0 }
      },
      {
        text: "Comprar um intermediário à vista usando a reserva de emergência.",
        impact: { saudeFinanceira: +5, qualidadeVida: 0, reservaEmergencia: -30 }
      },
      {
        text: "Mandar consertar a tela do antigo, mesmo não ficando 100%.",
        impact: { saudeFinanceira: +10, qualidadeVida: -10, reservaEmergencia: 0 }
      }
    ]
  },
  {
    id: 2,
    title: "Pressão Social",
    context: "Sexta-feira à noite, seus amigos te chamam para um restaurante caro. Você já gastou seu orçamento de lazer do mês.",
    options: [
      {
        text: "Ir e pagar no cartão de crédito, o mês que vem eu resolvo.",
        impact: { saudeFinanceira: -15, qualidadeVida: +15, reservaEmergencia: 0 }
      },
      {
        text: "Recusar o convite e ficar em casa assistindo série sozinho.",
        impact: { saudeFinanceira: +10, qualidadeVida: -15, reservaEmergencia: 0 }
      },
      {
        text: "Propor uma noite de pizzas na sua casa, dividindo o valor.",
        impact: { saudeFinanceira: +5, qualidadeVida: +10, reservaEmergencia: 0 }
      }
    ]
  },
  {
    id: 3,
    title: "Oportunidade",
    context: "Surgiu uma promoção de 50% em um curso excelente na sua área de atuação, mas você teria que usar metade da sua reserva.",
    options: [
      {
        text: "Usar a reserva. É um investimento no meu futuro.",
        impact: { saudeFinanceira: +15, qualidadeVida: +5, reservaEmergencia: -50 }
      },
      {
        text: "Ignorar a promoção. Não posso mexer na reserva para isso.",
        impact: { saudeFinanceira: -5, qualidadeVida: 0, reservaEmergencia: +10 }
      },
      {
        text: "Tentar negociar um parcelamento sem juros direto com a escola.",
        impact: { saudeFinanceira: +10, qualidadeVida: +5, reservaEmergencia: -10 }
      }
    ]
  }
];