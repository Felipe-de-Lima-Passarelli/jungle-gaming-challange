# KURIO — NFT Marketplace (demonstração)

Marketplace de NFTs feito com React, TypeScript, Vite, Tailwind CSS v4, TanStack Router, TanStack Query, Axios e MSW. Não há backend real nem transações reais de blockchain ou pagamentos.

## Requisitos

- Node.js 20.19+ (ou versão compatível com Vite 8)
- npm
- Chromium instalado via Playwright para executar os testes E2E

## Comandos

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
npm run audit:lighthouse
```

## Catálogo e navegação

Busca, categoria, rede, faixa de preço, ordenação, aba e página são representadas nos parâmetros da URL. O catálogo envia os filtros e a página à API simulada; voltar/avançar no histórico restaura o estado. Os itens do carrinho consultam os detalhes pelo identificador, independentemente da página do catálogo.

## Rotas

- `/` — catálogo
- `/nft/:id` — detalhes do NFT
- `/login` e `/register` — autenticação
- `/profile` — perfil do colecionador
- `/wallets` — carteiras simuladas
