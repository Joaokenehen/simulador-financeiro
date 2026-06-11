# RPG Financeiro - Simulador de Vida Adulta

## Sobre o Projeto
O RPG Financeiro (Boleto RPG) e um jogo educativo desenvolvido como um projeto de extensao universitario. O objetivo do simulador e ensinar conceitos de educacao financeira, como a importancia de manter uma reserva de emergencia, os perigos dos juros do cheque especial e o equilibrio essencial entre a saude financeira e a qualidade de vida.

O jogador passa por 12 meses (turnos) enfrentando dilemas do dia a dia. As decisoes tomadas, combinadas com tracos de personalidade (Perks) e a sorte em rolagens de um dado de 20 lados (D20), moldam o destino financeiro do personagem.

## Funcionalidades
- Sistema de Perks: Escolha tracos positivos e negativos que alteram custos, qualidade de vida e resultados dos dados.
- Mecanica de D20: Eventos com resultados variaveis (Sucesso, Neutro, Falha) baseados em sorte e modificadores matematicos.
- Gestao de Recursos: Controle seu Saldo em conta corrente, Saude Financeira, Qualidade de Vida e Reserva de Emergencia.
- Cofre Interativo: Invista ou resgate dinheiro da sua reserva de emergencia de forma dinamica durante as partidas.
- Leaderboard Global: Placar de lideres mundial alimentado por uma API para incentivar a competicao e o aprendizado.

## Tecnologias Utilizadas

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

### Backend
- Node.js
- Express
- SQLite (utilizando o modulo nativo node:sqlite)
- TypeScript

## Como Rodar Localmente

### Requisitos
- Node.js (versao 22.x ou superior recomendada devido ao modulo node:sqlite nativo)
- Gerenciador de pacotes (pnpm, npm ou yarn)

### Rodando a API (Backend)
1. Acesse a pasta do backend: `cd backend`
2. Instale as dependencias: `pnpm install`
3. Inicie o servidor: `pnpm run dev`
A API iniciara na porta 3333 (http://localhost:3333). O banco de dados SQLite sera criado automaticamente na pasta `src/database`.

### Rodando o Jogo (Frontend)
1. Abra um novo terminal e acesse a pasta do frontend: `cd frontend`
2. Instale as dependencias: `pnpm install`
3. Inicie a aplicacao de desenvolvimento: `pnpm run dev`
O jogo estara acessivel no seu navegador, geralmente no endereco http://localhost:5173.

## Implantacao (Deploy)
O projeto esta configurado para rodar em ambientes de nuvem modernos:
- O Frontend pode ser hospedado na Vercel ou Netlify.
- O Backend deve ser hospedado em servicos com suporte a Node.js e discos persistentes (como Render.com ou Railway), ou utilizando um banco em nuvem externo caso hospedado em ambientes serverless.