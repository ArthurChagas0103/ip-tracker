# IP Tracker — README

> Pequeno utilitário front-end para detectar e exibir informações de um IP (próprio ou informado), com mapa, dados de geolocalização e JSON cru. Feito em HTML + CSS + JS puro (sem build).

---

## 🧾 Visão geral
O **IP Tracker** é um sistema que:
- obtém o IP público do usuário (via `api.ipify.org` por padrão);
- consulta um serviço de geolocalização (por padrão `ipwho.is`);
- exibe informações chave (IP, país, cidade, ISP, ASN, timezone);
- mostra a posição aproximada em um mapa (Leaflet + OpenStreetMap);
- permite consultar qualquer outro IP;
- exporta/copía o JSON da consulta.

> Observação importante: geolocalização por IP é **aproximada** — não substitui dados obtidos por GPS ou ordens judiciais para identificação de um usuário.

---

## ✅ Recursos
- Descoberta do IP público do visitante.
- Consulta a IPs inseridos manualmente.
- Tabela com informações (país, cidade, ISP, ASN, timezone, lat/long).
- Mapa interativo (Leaflet + OSM) com marcador.
- Visualização do JSON cru, botão de copiar e de download.
- Tratamento de erros e mensagens de fallback.

---

## 🚀 Como usar (local / rápido)
1. Salve em uma pasta.
2. Abra o arquivo `index.html` no navegador (duplo clique ou `file://`).
3. A página já buscará o seu IP público e exibirá os dados. Para consultar outro IP, cole-o no campo e clique em **Consultar**.

---

## ⚙️ Configuração / Trocar API
O código usa por padrão:
- IP público: `https://api.ipify.org?format=json`
- Geolocalização: `https://ipwho.is/<IP>`

Você pode trocar por serviços que exigem chave (ex.: **IPinfo**, **MaxMind**, **AbstractAPI**) — se fizer, no front-end precisará expor a chave (não recomendado). Para privacidade/segurança, prefira usar um _backend_ que faça a requisição com a chave.

Exemplo (pseudo):  
```js
// trocar IPWHO_URL por outro serviço:
const IPWHO_URL = ip => `https://ipwho.is/${ip}`;
// para IPinfo (requer token): https://ipinfo.io/${ip}/json?token=TOKEN
```

### Variantes recomendadas
- **Modo rápido (frontend)**: mantém o arquivo atual — simples, mas expõe chamadas ao serviço público.
- **Modo privado (recomendado em produção)**: crie um endpoint no seu servidor (Node/C#/PHP) que consulta a API paga com a chave e retorna resultados ao front-end. Assim a chave não fica pública.

---

## 🔐 Privacidade e legalidade
- Consultas a serviços externos transmitem o IP consultado e podem registrar a requisição. Tenha isso em mente.
- Geolocalização por IP **não identifica** com precisão uma pessoa ou endereço.
- **Não use** o sistema para tentar identificar ou perseguir alguém por conta própria. Para incidentes de invasão, preserve logs e contate autoridades competentes / ISP via canais legais.

---

## 🛠️ Integração server-side (exemplo resumido)
**Por que usar server-side?** para proteger chaves de API, limitar requisições e manter logs.

Exemplo mínimo (Node/Express — pseudo):
```js
// GET /api/geo?ip=8.8.8.8
app.get('/api/geo', async (req,res) => {
  const ip = req.query.ip || (await fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(j=>j.ip));
  // chamar IPinfo / outro com token armazenado em process.env.IPINFO_TOKEN
  const r = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
  const data = await r.json();
  res.json(data);
});
```
No front-end, aponte as requisições para `/api/geo`.

---

## ❗ Problemas comuns & solução rápida (incluindo SRI)
- **Erro SRI (Subresource Integrity) bloqueando Leaflet**  
  Mensagem: `Failed to find a valid digest in the 'integrity' attribute ...`  
  Solução:
  - Remova os atributos `integrity` do `<link>` e `<script>`, OU
  - Use os hashes corretos do CDN (ex.: jsDelivr) conforme observado nos comentários do código, OU
  - Baixe os arquivos do Leaflet e sirva localmente.
- **`L is not defined`**  
  Causa: o script do Leaflet não carregou (SRI ou rede). Verifique console/cadeia de carregamento.
- **Latitude/Longitude faltando ou imprecisa**  
  - Pode ser que a API de geolocalização não retorne coordenadas; o mapa então mostra posição global.  
  - Lembre: geolocalização por IP é aproximada; para precisão use `navigator.geolocation` (com consentimento do usuário).

---

## ✅ Melhorias sugeridas (próximos passos)
- Mover consultas para backend para proteger chaves de API.
- Suportar múltiplos provedores (fallback entre IPWho, IPinfo e MaxMind).
- Adicionar caching no servidor para reduzir custos de API.
- Integrar verificação de reputação (AbuseIPDB / Spamhaus) ao consultar IPs.
- Permitir logs (com anonimização) para auditoria de consultas.
- Implementar testes automatizados (unit + e2e).

---

## 📌 Exemplo de uso
- Clicar em **Meu IP agora** para detectar o IP atual.
- Colar `8.8.8.8` e clicar **Consultar** para ver dados do DNS público do Google.
- Copiar o JSON via botão **Copiar JSON** para análise.

---

## 🧰 Requisitos
- Navegador moderno com suporte a `fetch`, `ES6` e `navigator.clipboard` (opcional).
- Acesso à internet para carregar CDN e chamadas às APIs.

---

## 📄 Licença
Use livremente, com atribuição (MIT-style). Não ofereço garantia — use por sua conta e risco.
