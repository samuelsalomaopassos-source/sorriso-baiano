# Universo Sorriso Baiano — site

Site único das três casas do Sorriso Baiano (Praia de Guaratiba, Prado–BA): Restaurante, Beach Club e Café & Bistrô.

- `index.html`, `styles.css`, `app.js` — o site (estático, sem dependências).
- `data.js` — conteúdo: casas, cardápios, pratos-história, eventos, linha do tempo.
- `assets/map-*.svg` — mapa isométrico de Guaratiba, gerado por `tools/build-map.mjs` (`node tools/build-map.mjs`).
- Cardápio pela planilha: publique a planilha Google como CSV e cole o link em `CONFIG.planilhaCsv` (app.js). Colunas: `casa, secao, turno, item, descricao, preco`.

Prévia: está com `noindex` e `robots.txt` bloqueando o Google até a aprovação do cliente.

Feito por OFFSET studio.
