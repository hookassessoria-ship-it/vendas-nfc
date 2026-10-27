# Vendas NFC: prospecção, vendas e inteligência financeira

App web (mobile-first, funciona no iPhone e no computador) para operar a venda presencial de placas adesivas NFC de avaliação Google: rotas de visita, registro de visitas e vendas em poucos toques, despesas, estoque, custos, metas com semáforo, simulador de preço e análises comerciais.

Stack: React, Vite, TypeScript, Tailwind, ícones Lucide e gráficos Recharts. Sem servidor: os dados ficam no navegador (IndexedDB).

## Como rodar

```bash
npm ci               # instalação limpa; usa .npmrc com legacy-peer-deps
npm run dev          # http://localhost:5173
npm test             # 59 testes (motor financeiro, semáforo, banco, importador)
npm run build        # gera dist/ (site estático + service worker)
npm run preview      # serve o build em http://localhost:4173
node scripts/e2e.mjs # teste ponta a ponta no Chromium (com o preview rodando)
```

## Publicar na Vercel

O app é um **site estático** (sem servidor próprio) e fica na **raiz** deste repositório. Na Vercel: **Add New › Project › Import** este repositório e confira:

| Configuração | Valor |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` (raiz; não mude) |
| Install Command | `npm ci` (lockfile do npm) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Branch de produção | `main` |
| Variáveis de ambiente | nenhuma |

Esses valores já estão em `vercel.json`, então a Vercel os preenche sozinha. O mesmo arquivo:

- reescreve caminhos sem extensão (ex.: `/rotas/123`) para `index.html`, e o app converte para `#/rotas/123`. Abrir ou atualizar qualquer tela não dá 404;
- não reescreve `/assets/` nem arquivos com extensão, para que um arquivo ausente responda 404 em vez de HTML (sem loops);
- define cache longo para `/assets` (nomes com hash) e sem cache para `index.html`, `sw.js` e o manifesto.

Para conferir a URL publicada (num navegador de teste vazio, sem tocar nos seus dados):

```bash
BASE_URL=https://<url-de-producao>/ node scripts/smoke.mjs   # arquivos, 12 telas, atualização direta, caminhos, barra inferior, offline
BASE_URL=https://<url-de-producao>/ node scripts/e2e.mjs     # fluxo completo: importar os 88, visita, venda, despesa, recarregar
```

### No iPhone

Abra a URL no Safari › **Compartilhar › Adicionar à Tela de Início** › Adicionar. O app abre em tela cheia, funciona sem internet depois do primeiro acesso e o iOS deixa de apagar os dados por falta de uso.

## Onde ficam os dados (importante)

- **No próprio navegador do aparelho (IndexedDB).** Os dados sobrevivem a fechar e recarregar a página e funcionam offline. Toda gravação é imediata, então não existe fila de sincronização pendente.
- **Não há nuvem nem login.** Os dados do celular não aparecem automaticamente no computador.
- **Backup:** em **Configurações › Backup** você baixa um JSON com tudo e o restaura em outro aparelho. O app avisa quando há alterações sem backup.
- **Sem banco na nuvem de propósito.** Para ter sincronização entre aparelhos, o próximo passo seria um banco dedicado (ex.: Supabase) com login e regras de acesso por usuário. O esquema local já usa ids UUID, `createdAt`/`updatedAt`/`deletedAt` e auditoria, o que prepara essa migração.

## Importar os 88 estabelecimentos

1. Abra **Mais › Importar roteiros**.
2. Toque em **Original (CSV, 88)**. As planilhas originais de 27 a 29/10/2026 estão em `public/dados/` (o endereço exato do ponto de partida foi omitido nesta cópia pública). Você também pode enviar outro CSV ou XLSX.
3. Confira a prévia:
   - as colunas detectadas, que podem ser remapeadas;
   - novos, já existentes, duplicados e inválidos;
   - as 3 rotas detectadas pela coluna “Dia”.
4. Toque em **Importar**. São criados 88 estabelecimentos, 3 rotas (terça 28, quarta 30 e quinta 30 paradas) e as paradas na ordem do arquivo.
5. Importar de novo não duplica nada.

Notas do Google e distâncias entram sempre como **não verificadas** ou **estimativa**. Para marcar uma nota como verificada, edite o estabelecimento depois de conferir no Google Maps.

## Dados financeiros que você precisa informar

| Dado | Onde | Sem ele |
|---|---|---|
| Custo da placa: lote com valor pago ou custo manual | Finanças › Estoque (lote) ou Finanças › Custos | CPV, margens, resultado e ponto de equilíbrio aparecem como **Pendente** |
| Taxa de cada forma de pagamento (Pix, cartão, transferência) | Finanças › Custos | Contribuição marcada como **incompleta** (taxa considerada R$ 0) |
| Embalagem, personalização, outros custos por placa | Finanças › Custos | Considerados R$ 0 e sinalizados como não informados |
| Estoque inicial (quantidade) | Finanças › Estoque | Saldo de estoque fica negativo após as vendas |
| Despesas pagas: Uber, alimentação, materiais | Botão + › Registrar despesa | Resultado operacional sem essas despesas |
| Início e fim da jornada (ou horas) em cada rota | Tela da rota | Métricas por hora ficam “sem dados” |
| Metas de faturamento e contribuição por hora | Mais › Metas | Esses indicadores ficam “Sem meta” |

Depois de informar custo ou taxas, use **Aplicar custo/taxa às vendas pendentes** (Finanças › Custos) para atualizar as vendas antigas. A alteração fica registrada no histórico.

## Arquitetura

```
src/
  lib/finance/engine.ts     motor financeiro: TODAS as fórmulas (documentadas no topo do arquivo)
  lib/finance/goals.ts      semáforo: indicadores, regras editáveis e avaliação verde/amarelo/vermelho
  lib/finance/simulator.ts  simulador de preço e rentabilidade
  lib/finance/costs.ts      custo unitário (versões e média dos lotes) e estoque
  lib/finance/transport.ts  orçamento de transporte (pago × previsto)
  lib/finance/intel.ts      funil, rankings com amostra mínima e recomendações
  lib/import/parse.ts       importador CSV/XLSX (detecção de colunas, validação, deduplicação)
  db/                       Dexie (IndexedDB), ações transacionais com auditoria, demonstração e backup
  pages/                    Visão geral, Rota, Vendas, Financeiro, Inteligência, Metas, Importar e Mais
```

As telas nunca calculam indicadores por conta própria: tudo passa por `engine.ts`.

## Testes

- **`npm test` (Vitest + fake-indexeddb):**
  - venda de 1 placa e de várias;
  - desconto e taxa;
  - custo pendente;
  - venda não paga e pagamento parcial;
  - estorno e cancelamento;
  - Uber pago, previsto e vinculado à venda;
  - margem negativa e receita zero;
  - ponto de equilíbrio com margem positiva, zero e negativa;
  - mudança de preço e de custo;
  - duplicidade (idempotência e venda igual em 15 min);
  - persistência ao reabrir o banco;
  - separação demo × real;
  - importação dos 88 (CSV e XLSX) sem duplicar;
  - backup.
- **`node scripts/e2e.mjs`, no Chromium com tela de iPhone:**
  - importa os 88 sem duplicar na reimportação;
  - marca visitas com um toque, registra uma venda de 2 placas e uma despesa;
  - recarrega a página e confere que tudo continua salvo;
  - confere os indicadores e o saldo do orçamento de transporte;
  - entra e sai do modo demonstração sem tocar nos dados reais.

  As capturas ficam em `e2e-artifacts/`.

## Limitações conhecidas

- **Sem mapa nem otimização de rota.** Não há API de mapas ou rotas configurada e os endereços não têm coordenadas. A ordem das paradas é manual; a navegação abre o Google Maps a pé.
- **Notas do Google não são buscadas automaticamente.** Ficam “não verificadas” até você conferir e marcar.
- **Uber sem cotação.** O valor previsto é digitado por você; depois você confirma o valor pago.
- **Isolamento por usuário.** Não há login: cada navegador ou aparelho tem seus próprios dados.
- **Resultado operacional estimado** é gerencial: não é lucro líquido contábil nem após impostos.
- **2 alertas moderados do `npm audit`** em ferramentas de teste (Vitest, só no Windows). Não afetam o app publicado.
