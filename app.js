/* Universo Sorriso Baiano — app */
(() => {
  "use strict";
  const CONFIG = {
    // Versão oficial: cole aqui o link CSV publicado da planilha Google (Arquivo > Compartilhar > Publicar na Web > CSV).
    // Colunas: casa | secao | turno | item | descricao | preco
    planilhaCsv: "",
    reveillon: "2026-12-31T21:00:00-03:00",
  };
  const D = window.SB;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CORES = { "cafe-bistro": "#8e2233", restaurante: "#1fa7a2", "beach-club": "#e8743b", universo: "#0f4c6e" };
  const TURBANTES = {
    universo: ["#1fa7a2", "#e8743b", "#8e2233"],
    restaurante: ["#1fa7a2", "#168e89", "#2fc0b9"],
    "beach-club": ["#e8743b", "#2f6db5", "#f39a62"],
    "cafe-bistro": ["#8e2233", "#c8362f", "#6e1a26"],
  };
  const ORDEM = ["cafe-bistro", "restaurante", "beach-club"];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const brl = (v) => v == null ? "" : v.toLocaleString("pt-BR", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });

  /* ---------- a baiana (guardiã do universo) ---------- */
  function baiana({ corpo = true, fixa = null, cls = "" } = {}) {
    // fixa: força cores de uma casa (cards); null = segue o tema da página
    const st = fixa ? ` style="--tb1:${TURBANTES[fixa][0]};--tb2:${TURBANTES[fixa][1]};--tb3:${TURBANTES[fixa][2]}"` : "";
    const vb = corpo ? "20 6 170 254" : "26 8 132 196";
    return `<svg class="baiana ${corpo ? "" : "mini"} ${cls}" viewBox="${vb}" aria-hidden="true"${st}>
  ${corpo ? `<path class="vestido" d="M28 262 C40 236 62 226 86 228 L122 228 C146 228 166 240 176 262 Z"/>
  <path class="pele" d="M86 228 C96 238 112 238 122 228 L120 214 L86 214 Z"/>
  <g class="contas">${Array.from({ length: 15 }, (_, i) => { const t = i / 14, x = 74 + t * 62, y = 230 + Math.sin(t * Math.PI) * 18; const c = [TURBANTES.universo[0], "#f2c94c", TURBANTES.universo[1], "#fffaf0", TURBANTES.universo[2]][i % 5]; return `<circle class="conta" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${c}"/>`; }).join("")}</g>` : ""}
  <g class="cabeca">
    <path class="pele" d="M74 250 C76 226 80 206 78 188 C70 178 66 160 70 146 L124 96 C130 104 134 112 135 120 C136 124 137 127 140 131 C145 137 151 142 150 146 C149 149 145 149 141 149 C143 151 146 153 145 156 C143 158 141 158 140 159 C143 161 145 164 142 167 C139 169 137 170 137 173 C138 178 136 183 130 186 C124 189 118 190 116 196 C114 210 116 232 120 250 Z"/>
    <path class="pele2" d="M96 140 C104 137 109 147 103 155 C100 157 96 153 96 149 Z"/>
    <path d="M124 123 C127 125.5 130 125.5 133 123.5" fill="none" stroke="#2b160b" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M139 157.5 C141 158.5 142.5 158.5 144 157.5" fill="none" stroke="#3d1d10" stroke-width="1.2" stroke-linecap="round"/>
    <circle class="brinco" cx="100" cy="170" r="11"/>
    <path class="tb1" d="M122 100 C127 72 121 42 99 27 C80 14 53 18 41 34 C29 50 29 77 39 97 C45 113 52 131 66 147 C78 151 92 143 100 134 C104 120 112 106 122 100 Z"/>
    <path class="tb2" d="M121 86 C104 71 70 67 37 81 C36 73 37 65 40 57 C70 46 105 52 125 71 Z"/>
    <path class="tb3" d="M113 47 C93 35 64 35 45 45 C50 36 58 28 70 24 C87 21 103 30 113 47 Z"/>
    <g class="listras" fill="none"><path d="M44 63 C70 54 98 58 120 74"/><path d="M39 72 C68 62 100 66 122 80"/></g>
    <path class="dobra" d="M48 108 C64 100 84 100 102 112"/><path class="dobra" d="M56 126 C70 118 84 118 98 126"/><path class="dobra" d="M58 34 C70 30 86 32 98 40"/>
    <path class="tb3" d="M103 31 C110 17 128 19 129 33 C130 46 117 51 108 45 C104 41 102 36 103 31 Z"/>
    <path class="dobra" d="M110 30 C116 28 122 32 122 38"/>
  </g>
</svg>`;
  }

  /* ---------- hora do dia ---------- */
  const HORAS = { manha: "de manhã", tarde: "à tarde", "por-do-sol": "ao pôr do sol", noite: "à noite" };
  function horaReal() {
    const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
    if (h >= 5 && h < 11) return "manha";
    if (h >= 11 && h < 17) return "tarde";
    if (h >= 17 && h < 19) return "por-do-sol";
    return "noite";
  }
  let horaManual = null, horaAtual = "tarde";
  function aplicaHora(h) {
    horaAtual = h;
    if (document.body.dataset.hora !== h) { const mb = $("#mapaBase"); mb.classList.add("trocando"); setTimeout(() => mb.classList.remove("trocando"), 320); setTimeout(() => (document.body.dataset.hora = h), 180); }
    else document.body.dataset.hora = h;
    $$(".hora-opcoes button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hora === h)));
    const agora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date());
    $("#horaAgora").innerHTML = horaManual ? `Vendo Guaratiba <b>${HORAS[h]}</b>` : `Agora em Guaratiba · <b>${agora}</b>`;
    const r = $("#rodapeSaudacao");
    if (r) r.textContent = h === "noite" ? "Buona notte, Guaratiba." : h === "manha" ? "Buongiorno, Guaratiba." : "Dolce far niente.";
  }
  $$(".hora-opcoes button").forEach((b) => b.addEventListener("click", () => {
    horaManual = b.dataset.hora === horaReal() ? null : b.dataset.hora;
    aplicaHora(b.dataset.hora);
  }));
  setInterval(() => { if (!horaManual) aplicaHora(horaReal()); }, 60000);

  /* ---------- mapa ---------- */
  const mapa = $("#mapa"), janela = $("#mapaJanela");
  let META = null, camera = { s: 1, x: 0, y: 0 }, pan = { x: 0, y: 0 };
  const movel = () => innerWidth < 760;

  async function carregaMapa() {
    const [base, luzes, meta] = await Promise.all([
      fetch("assets/map-base.svg?v=20261122b").then((r) => r.text()),
      fetch("assets/map-lights.svg?v=20261122b").then((r) => r.text()),
      fetch("assets/map-meta.json?v=20261122b").then((r) => r.json()),
    ]);
    $("#mapaBase").innerHTML = base;
    $("#mapaLuzes").innerHTML = luzes;
    META = meta;
    // pinos
    $("#pinos").innerHTML = ORDEM.map((id) => {
      const c = D.casas[id], [x, y] = META[id].anchor;
      return `<button class="pino" type="button" data-ir="${id}" style="left:${x}%;top:${y}%;--pc:${CORES[id]}" aria-label="Entrar no ${c.nomeCompleto}">
        <span class="pino-tb"><span class="anel"></span>${baiana({ corpo: false, fixa: id })}</span><span>${c.nome}<small>${c.momento}</small></span></button>`;
    }).join("");
    $$(".pino").forEach((p) => p.addEventListener("click", () => (location.hash = "#/" + p.dataset.ir)));
    // baleia — detalhe escondido
    const w = $("#whale");
    if (w) {
      const fala = () => avisa("<b>Uma jubarte!</b> De julho a novembro, as baleias passam pela Costa das Baleias, bem em frente a Guaratiba.");
      w.addEventListener("click", fala);
      w.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fala(); } });
    }
    enquadra(rota().casa, true);
  }

  function enquadra(casa, imediato = false) {
    if (!META) return;
    const W = janela.clientWidth, H = janela.clientHeight;
    let s, fx, fy, ax, ay;
    if (casa === "universo") {
      if (movel()) { s = (W / 1600) * 1.3; fx = 0.52; fy = 0.5; ax = 0.5; ay = 0.5; }
      else { s = Math.min(W / (1600 * 0.98), H / (1100 * 0.82)) * (W / H > 1.2 ? 0.94 : 1); fx = 0.5; fy = 0.5; ax = W / H > 1.2 ? 0.6 : 0.5; ay = W / H > 1.2 ? 0.45 : 0.42; }
    } else {
      const [px, py] = META[casa].focus;
      s = movel() ? (W / 1600) * 3.1 : Math.min(W / (1600 * 0.97), H / (1100 * 0.84)) * 2.35;
      fx = px / 100; fy = py / 100; ax = movel() ? 0.5 : 0.62; ay = movel() ? 0.55 : 0.5;
    }
    camera = { s, x: W * ax - fx * 1600 * s, y: H * ay - fy * 1100 * s };
    pan = { x: 0, y: 0 };
    mapa.classList.toggle("sem-anim", imediato || reduz);
    aplicaCamera();
    if (imediato) requestAnimationFrame(() => mapa.classList.remove("sem-anim"));
    // pinos mantêm tamanho legível
    mapa.style.setProperty("--inv", String((movel() ? 0.74 : 1) / s));
  }
  function aplicaCamera() {
    const W = janela.clientWidth, H = janela.clientHeight, w = 1600 * camera.s, h = 1100 * camera.s;
    let x = camera.x + pan.x, y = camera.y + pan.y;
    if (w > W) x = Math.min(0, Math.max(W - w, x));
    if (h > H) y = Math.min(0, Math.max(H - h, y));
    mapa.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${camera.s.toFixed(4)})`;
  }
  // arrastar o mapa (toque/mouse) quando ele é maior que a janela
  (() => {
    let ini = null;
    janela.addEventListener("pointerdown", (e) => { if (e.target.closest(".pino,#whale")) return; ini = { x: e.clientX - pan.x, y: e.clientY - pan.y }; mapa.classList.add("sem-anim"); });
    addEventListener("pointermove", (e) => { if (!ini) return; pan = { x: e.clientX - ini.x, y: e.clientY - ini.y }; aplicaCamera(); });
    addEventListener("pointerup", () => { if (ini) { ini = null; mapa.classList.remove("sem-anim"); } });
  })();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { ajustaAlturaMovel(); enquadra(rota().casa, true); }, 120); });
  function ajustaAlturaMovel() { document.documentElement.style.setProperty("--mh", movel() ? Math.round(innerWidth * (rota().casa === "universo" ? 0.88 : 0.8)) + "px" : "62vw"); }

  /* ---------- reservas ---------- */
  function linkReserva(id, ctx = "") {
    const c = D.casas[id];
    if (c.reserva.tipo === "whatsapp") {
      const msg = encodeURIComponent(`Olá! Vim pelo site do Sorriso Baiano e quero reservar no ${c.nome}${ctx ? " — " + ctx : ""}.`);
      return `https://wa.me/${c.reserva.alvo}?text=${msg}`;
    }
    return `https://ig.me/m/${c.reserva.alvo}`;
  }
  function abreFolha(primeira) {
    const ids = primeira ? [primeira, ...ORDEM.filter((i) => i !== primeira)] : ORDEM;
    $("#folhaLista").innerHTML = ids.map((id) => {
      const c = D.casas[id], wa = c.reserva.tipo === "whatsapp";
      return `<a class="folha-op" style="--pc:${CORES[id]}" href="${linkReserva(id)}" target="_blank" rel="noopener noreferrer">
        <span class="o-tb">${baiana({ corpo: false, fixa: id })}</span>
        <span><b>${c.nome}</b><span>${c.onde} · ${c.momento}</span></span>
        <em>${wa ? "WhatsApp →" : "Direct →"}</em></a>`;
    }).join("");
    $("#folha").hidden = false;
    $(".folha-x").focus();
  }
  const fechaFolha = () => ($("#folha").hidden = true);
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-reservar]");
    if (r) { e.preventDefault(); abreFolha(r.dataset.reservar || (rota().casa !== "universo" ? rota().casa : null)); }
    if (e.target.closest("[data-fechar]")) fechaFolha();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") fechaFolha(); });

  /* ---------- aviso ---------- */
  let ta;
  function avisa(html) { const a = $("#aviso"); a.innerHTML = html; a.classList.add("on"); clearTimeout(ta); ta = setTimeout(() => a.classList.remove("on"), 5200); }

  /* ---------- vistas ---------- */
  const pratoCard = (id, i) => {
    const p = D.pratos[id], c = D.casas[p.casa];
    return `<article class="prato rv" style="--pc:${CORES[p.casa]}"><span class="p-num">${String(i + 1).padStart(2, "0")}</span>
      <div class="p-tipo">${p.tipo}</div><h3>${p.nome}</h3><p>${p.historia}</p>
      <a class="p-casa" href="#/${p.casa}"><i></i>${c.nomeCompleto}</a></article>`;
  };
  const eventoCard = (ev) => {
    const c = D.casas[ev.casa];
    if (ev.destaque) return `<article class="evento destaque rv" style="--pc:${CORES[ev.casa]}" id="reveillon">
      <div class="ev-casa"><i></i>${c.nomeCompleto}</div>
      <h3>${ev.nome}<small>A virada para ${ev.ano}, de frente para o mar</small></h3>
      <div class="contagem" id="contagem" aria-label="Contagem regressiva para o Réveillon"></div>
      <div class="ev-quando">${ev.quando}</div>
      <p>${ev.resumo}</p>
      <ul>${ev.itens.map((t) => `<li>${t}</li>`).join("")}</ul>
      <div class="preco">${ev.preco}<small>${ev.precoNota}</small></div>
      <a class="btn" href="${linkReserva(ev.casa, "Réveillon Camarote do Sorriso " + ev.ano)}" target="_blank" rel="noopener noreferrer">${ev.cta} ${icoWa}</a>
    </article>`;
    const link = ev.id === "festival" ? `<a class="ev-link" href="#pratos">${ev.cta} →</a>` : `<a class="ev-link" href="${linkReserva(ev.casa, ev.nome)}" target="_blank" rel="noopener noreferrer">${ev.cta} →</a>`;
    return `<article class="evento rv" style="--pc:${CORES[ev.casa]}"><div class="ev-casa"><i></i>${c.nome} · ${ev.ano}</div><h3>${ev.nome}</h3><div class="ev-quando">${ev.quando}</div><p>${ev.resumo}</p>${link}</article>`;
  };
  const icoWa = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`;

  function vistaUniverso() {
    $("#palcoTexto").innerHTML = `
      <p class="sobretitulo">${D.marca.lugar}</p>
      <h1 class="titulo-palco">Três casas.<br><em>Um só sorriso.</em></h1>
      <p class="lead">${D.marca.essencia} — do café da manhã ao luau, à beira-mar de Guaratiba.</p>
      <div class="palco-acoes"><a class="btn" href="#casas">Conhecer as casas</a><button class="btn btn-claro" type="button" data-reservar>Reservar</button></div>
      <div class="dica">↗ toque numa casa do mapa</div>`;
    const ag = D.eventos;
    $("#vista").innerHTML = `
    <div class="listra" aria-hidden="true"></div>
    <section class="secao estreita" id="casas">
      <p class="rotulo rv">O universo</p>
      <h2 class="grande rv">Uma baiana, <em>três jeitos</em> de receber.</h2>
      <p class="texto rv">Repare no turbante: em cada casa ele muda de cor. Turquesa no Restaurante, laranja e azul no Beach Club, vinho no Café. A mesma alma, o mesmo cuidado, em três momentos do dia em Guaratiba.</p>
      <div class="casas">${ORDEM.map((id) => { const c = D.casas[id]; return `
        <a class="casa-card rv" href="#/${id}" style="--cc:${CORES[id]}">
          <div class="cc-topo"><div class="toldo"></div><span class="cc-momento">de ${c.momento}</span><div class="cc-baiana">${baiana({ fixa: id })}</div></div>
          <div class="cc-corpo"><span class="cc-onde">${c.onde}</span><h3>${c.nome}</h3><p>${c.tagline}</p><span class="cc-ir">Entrar na casa <span>→</span></span></div>
        </a>`; }).join("")}</div>
    </section>

    <section class="secao pratos-wrap" id="pratos">
      <div style="max-width:1036px;margin:0 auto">
        <p class="rotulo rv">Histórias no prato</p>
        <h2 class="grande rv">Aqui, todo prato <em>tem nome</em> e uma história.</h2>
        <p class="texto rv">É assim que o Sorriso Baiano vai ao Festival Gastronômico de Prado todo ano: lendas, memórias e ingredientes da terra servidos à mesa. Algumas das histórias que já contamos:</p>
        <div class="pratos">${["naia", "morena-do-mar", "mamma-mia", "amana", "che-figata", "fettuccine"].map(pratoCard).join("")}</div>
      </div>
    </section>

    <section class="secao estreita" id="agenda">
      <p class="rotulo rv">Agenda</p>
      <h2 class="grande rv">Noites que <em>viram memória.</em></h2>
      <div class="agenda">${ag.map(eventoCard).join("")}</div>
    </section>

    <div class="listra" aria-hidden="true"></div>
    <section class="secao estreita" id="historia">
      <div class="historia">
        <div>
          <p class="rotulo rv">Nossa história</p>
          <h2 class="grande rv">A Bahia que encontrou <em>a Itália.</em></h2>
          <p class="citacao rv">“Há histórias que mudam o rumo da nossa vida sem que a gente perceba.”</p>
          <p class="mao rv">— Carol, chef e fundadora</p>
          <p class="texto rv">Em 1999, uma entrevista de trabalho trouxe a Carol a Guaratiba e a uma cozinha italiana. Dali nasceu o sotaque mediterrâneo que hoje mora em cada casa do Sorriso Baiano, ao lado do dendê, do coco e do peixe fresco da costa.</p>
          <div class="selo rv"><span class="selo-ico">1º</span><span><b>Melhor Atendimento</b><span>Festival Gastronômico de Prado, desde a primeira participação</span></span></div>
        </div>
        <ol class="linha-tempo">${D.historia.map(([a, t]) => `<li class="rv"><b>${a}</b><p>${t}</p></li>`).join("")}</ol>
      </div>
    </section>

    <section class="secao estreita" id="chegar" style="padding-top:0">
      <p class="rotulo rv">Como chegar</p>
      <h2 class="grande rv">Guaratiba, <em>Prado–BA.</em></h2>
      <p class="texto rv">Na Costa das Baleias, no extremo sul da Bahia. As três casas ficam a poucos passos umas das outras: o Café no Shopping Guaratiba, o Restaurante na beira da praia e o Beach Club na areia, ligados por uma passarela de madeira.</p>
      <div class="chegar">${ORDEM.map((id) => { const c = D.casas[id]; return `<a class="rv" style="--pc:${CORES[id]}" href="${c.mapa}" target="_blank" rel="noopener noreferrer"><b>${c.nome}</b><span>${c.onde}</span><em>Abrir no mapa →</em></a>`; }).join("")}</div>
    </section>`;
    iniciaContagem();
  }

  function vistaCasa(id) {
    const c = D.casas[id], idx = ORDEM.indexOf(id);
    $("#palcoTexto").innerHTML = `
      <p class="sobretitulo">${c.rotulo}</p>
      <h1 class="titulo-palco">${c.nome === "Café & Bistrô" ? `Café <em>&amp; Bistrô</em>` : c.nome === "Beach Club" ? `Beach <em>Club</em>` : `<em>Restaurante</em>`}</h1>
      <p class="lead">${c.tagline}</p>
      <div class="palco-acoes"><button class="btn" type="button" data-reservar="${id}">Reservar ${c.reserva.tipo === "whatsapp" ? icoWa : ""}</button><a class="btn btn-claro" href="#cardapio">Cardápio</a></div>`;

    const turnos = [...new Set(c.cardapio.map((s) => s.turno))];
    const eventos = D.eventos.filter((e) => e.casa === id);
    const outras = ORDEM.filter((o) => o !== id);
    $("#vista").innerHTML = `
    <div class="toldo" aria-hidden="true"></div>
    <section class="secao estreita">
      <div class="casa-intro">
        <div>
          <p class="rotulo rv">A casa</p>
          <h2 class="grande rv">${c.nomeCompleto.replace("Sorriso Baiano", "<em>Sorriso Baiano</em>")}</h2>
          ${c.sobre.map((p) => `<p class="texto rv">${p}</p>`).join("")}
          <p class="mao rv">${c.italiano}</p>
        </div>
        <aside class="rv">
          <dl class="info-lista">
            <div class="info-titulo">Horário</div>
            ${c.horario.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}
            <div class="info-titulo">Onde</div>
            <div><dt>${c.onde}</dt><dd><a href="${c.mapa}" target="_blank" rel="noopener noreferrer">Abrir no mapa</a></dd></div>
            <div><dt>Instagram</dt><dd><a href="https://www.instagram.com/${c.instagram}/" target="_blank" rel="noopener noreferrer">@${c.instagram}</a></dd></div>
          </dl>
          <div class="casa-acoes"><a class="btn" href="${linkReserva(id)}" target="_blank" rel="noopener noreferrer">${c.reserva.tipo === "whatsapp" ? "Reservar no WhatsApp " + icoWa : "Reservar pelo Direct"}</a></div>
        </aside>
      </div>
    </section>

    <section class="secao cardapio-wrap" id="cardapio">
      <div style="max-width:1180px;margin:0 auto">
        <p class="rotulo rv">Cardápio</p>
        <h2 class="grande rv">${id === "cafe-bistro" ? "Do café à <em>trattoria.</em>" : id === "beach-club" ? "Sabores de <em>frente para o mar.</em>" : "Comida baiana, <em>sotaque mediterrâneo.</em>"}</h2>
        ${turnos.length > 1 ? `<div class="turnos" role="group" aria-label="Turno"><button type="button" data-turno="dia" aria-pressed="true">De dia · até 19h</button><button type="button" data-turno="noite" aria-pressed="false">À noite · a partir das 19h</button></div>` : ""}
        <div class="menu-grade" id="menuGrade"></div>
        ${c.cardapioNota ? `<div class="menu-nota rv"><span>ⓘ</span><span><b>Prévia.</b> ${c.cardapioNota}</span></div>` : ""}
      </div>
    </section>

    ${c.pratos?.length ? `<section class="secao estreita"><p class="rotulo rv">Histórias no prato</p><h2 class="grande rv">Criações <em>com nome próprio.</em></h2><div class="pratos">${c.pratos.map(pratoCard).join("")}</div></section>` : ""}

    ${eventos.length ? `<section class="secao estreita" style="padding-top:0"><p class="rotulo rv">Agenda da casa</p><div class="agenda" style="grid-template-columns:${eventos.some((e) => e.destaque) ? "1.25fr 1fr" : "1fr 1fr"}">${eventos.map(eventoCard).join("")}</div></section>` : ""}

    <section class="secao estreita" id="instagram" style="padding-top:0">
      <p class="rotulo rv">@${c.instagram}</p>
      <h2 class="grande rv">Direto do <em>nosso Instagram.</em></h2>
      <div class="insta" id="insta">${c.instagramPosts.map(() => `<div class="insta-item"><div class="insta-vazio">Carregando…</div></div>`).join("")}</div>
    </section>

    <section class="secao estreita" style="padding-top:0">
      <p class="rotulo rv">Atravesse a passarela</p>
      <div class="outras">${outras.map((o) => { const oc = D.casas[o]; return `<a class="outra rv" href="#/${o}" style="--pc:${CORES[o]}"><span class="o-tb">${baiana({ corpo: false, fixa: o })}</span><span><small>${oc.onde} · ${oc.momento}</small><b>${oc.nomeCompleto}</b></span></a>`; }).join("")}</div>
    </section>`;

    const desenhaMenu = (turno) => {
      const secoes = c.cardapio.filter((s) => turnos.length < 2 || s.turno === turno);
      $("#menuGrade").innerHTML = secoes.map((s) => `<div class="menu-secao"><h3>${esc(s.secao)}</h3>${s.itens.map(([n, d, p]) => `<div class="menu-item"><b>${esc(n)}</b>${p != null && !Number.isNaN(p) ? `<span class="pr"><small>R$</small>${brl(p)}</span>` : "<i></i>"}${d ? `<span>${esc(d)}</span>` : ""}</div>`).join("")}</div>`).join("");
    };
    const turnoInicial = turnos.length > 1 && ["por-do-sol", "noite"].includes(horaAtual) ? "noite" : "dia";
    desenhaMenu(turnoInicial);
    $$(".turnos button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.turno === turnoInicial));
      b.addEventListener("click", () => { $$(".turnos button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); desenhaMenu(b.dataset.turno); });
    });
    iniciaContagem();
    observaInsta(c.instagramPosts);
  }

  /* ---------- instagram (carrega só quando aparece) ---------- */
  function observaInsta(posts) {
    const alvo = $("#insta");
    if (!alvo) return;
    const io = new IntersectionObserver((ents) => {
      if (!ents.some((e) => e.isIntersecting)) return;
      io.disconnect();
      alvo.innerHTML = posts.map((sc) => `<div class="insta-item"><blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${sc}/" data-instgrm-version="14"><a href="https://www.instagram.com/p/${sc}/" target="_blank" rel="noopener noreferrer">Ver no Instagram</a></blockquote></div>`).join("");
      if (window.instgrm) window.instgrm.Embeds.process();
      else { const s = document.createElement("script"); s.async = true; s.src = "https://www.instagram.com/embed.js"; document.body.appendChild(s); }
    }, { rootMargin: "300px" });
    io.observe(alvo);
  }

  /* ---------- contagem regressiva ---------- */
  let tc;
  function iniciaContagem() {
    clearInterval(tc);
    const el = $("#contagem");
    if (!el) return;
    const alvo = new Date(CONFIG.reveillon).getTime();
    const tick = () => {
      let d = Math.max(0, alvo - Date.now());
      const dias = Math.floor(d / 864e5); d -= dias * 864e5;
      const h = Math.floor(d / 36e5); d -= h * 36e5;
      const m = Math.floor(d / 6e4); const s = Math.floor((d - m * 6e4) / 1000);
      el.innerHTML = [[dias, "dias"], [h, "horas"], [m, "min"], [s, "seg"]].map(([v, l]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
    };
    tick(); tc = setInterval(tick, 1000);
  }

  /* ---------- rodapé ---------- */
  function rodape() {
    $("#rodape").innerHTML = `<div class="rodape-grade">
      <div><div class="r-marca">Sorriso <em>Baiano</em></div><p style="color:#bdb3a2;max-width:30ch">${D.marca.essencia}. Praia de Guaratiba, Prado–BA, desde ${D.marca.desde}.</p><div class="r-it" id="rodapeSaudacao" tabindex="0">Dolce far niente.</div></div>
      <div><h4>As casas</h4><ul>${ORDEM.map((id) => `<li><a href="#/${id}">${D.casas[id].nomeCompleto}</a></li>`).join("")}</ul></div>
      <div><h4>Instagram</h4><ul>${ORDEM.map((id) => `<li><a href="https://www.instagram.com/${D.casas[id].instagram}/" target="_blank" rel="noopener noreferrer">@${D.casas[id].instagram}</a></li>`).join("")}<li><a href="https://www.instagram.com/grupoguaratiba/" target="_blank" rel="noopener noreferrer">@grupoguaratiba</a></li></ul></div>
      <div><h4>Reservas</h4><ul><li><a href="${linkReserva("beach-club")}" target="_blank" rel="noopener noreferrer">Beach Club · (73) 99931-4391</a></li><li><a href="https://wa.me/5573998248376" target="_blank" rel="noopener noreferrer">Beach Club · (73) 99824-8376</a></li><li><button class="btn btn-claro" style="margin-top:8px;color:#e9dfcf" type="button" data-reservar>Escolher a casa</button></li></ul></div>
    </div>
    <div class="rodape-fim"><span>© ${new Date().getFullYear()} Universo Sorriso Baiano · Guaratiba, Prado–BA</span><span>Site por OFFSET studio</span></div>`;
    $("#rodapeSaudacao").addEventListener("click", () => avisa("<b>Dolce far niente</b> — a doçura de não fazer nada. Em Guaratiba, a gente leva isso a sério."));
    aplicaHora(horaAtual);
  }

  /* ---------- barra fixa (celular) ---------- */
  function barra(id) {
    let b = $(".barra-mobile");
    if (!b) { b = document.createElement("div"); b.className = "barra-mobile"; document.body.appendChild(b); }
    b.innerHTML = id === "universo"
      ? `<a class="btn btn-claro" href="#casas">As casas</a><button class="btn" type="button" data-reservar>Reservar</button>`
      : `<a class="btn btn-claro" href="#cardapio">Cardápio</a><button class="btn" type="button" data-reservar="${id}">Reservar</button>`;
  }

  /* ---------- revelar ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const revela = () => $$(".rv:not(.on)").forEach((el) => rio.observe(el));

  /* ---------- rotas ---------- */
  function rota() {
    const h = location.hash.replace(/^#\/?/, "");
    return { casa: D.casas[h] ? h : "universo", ancora: D.casas[h] || h === "" ? null : h };
  }
  let atual = null;
  function navega() {
    const { casa, ancora } = rota();
    if (ancora && atual) { const el = document.getElementById(ancora); if (el) el.scrollIntoView({ behavior: reduz ? "auto" : "smooth" }); return; }
    const mudou = casa !== atual;
    atual = casa;
    document.body.dataset.casa = casa;
    $("#marcaSub").textContent = casa === "universo" ? "universo" : D.casas[casa].nome.toLowerCase();
    $$(".menu a").forEach((a) => a.toggleAttribute("aria-current", a.dataset.link === casa));
    $$(".baiana").forEach((b) => { b.classList.remove("troca"); void b.getBoundingClientRect(); b.classList.add("troca"); });
    document.title = casa === "universo" ? "Sorriso Baiano · Restaurante, Beach Club e Café & Bistrô em Guaratiba, Prado–BA" : `${D.casas[casa].nomeCompleto} · Guaratiba, Prado–BA`;
    if (casa === "universo") vistaUniverso(); else vistaCasa(casa);
    barra(casa);
    ajustaAlturaMovel();
    if (mudou) { scrollTo({ top: 0, behavior: reduz ? "auto" : "smooth" }); setTimeout(() => enquadra(casa), 30); }
    revela();
    if (ancora) setTimeout(() => document.getElementById(ancora)?.scrollIntoView(), 60);
  }
  // links internos com âncora (#casas, #cardapio...) não trocam de rota
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const h = a.getAttribute("href");
    if (h.startsWith("#/")) return;
    const el = document.getElementById(h.slice(1));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduz ? "auto" : "smooth" }); }
  });

  /* ---------- topo sólido ao rolar ---------- */
  const topo = $("#topo");
  const solido = () => topo.classList.toggle("solido", scrollY > $("#palco").offsetHeight - 90 || movel());
  addEventListener("scroll", solido, { passive: true });

  /* ---------- planilha (versão oficial) ---------- */
  async function carregaPlanilha() {
    if (!CONFIG.planilhaCsv) return;
    try {
      const txt = await (await fetch(CONFIG.planilhaCsv)).text();
      const linhas = txt.trim().split(/\r?\n/).slice(1).map((l) => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim()));
      const porCasa = {};
      for (const [casa, secao, turno, item, desc, preco] of linhas) {
        if (!D.casas[casa]) continue;
        const sec = ((porCasa[casa] ||= {})[secao] ||= { secao, turno: turno || "dia", itens: [] });
        sec.itens.push([item, desc, preco ? Number(preco.replace(",", ".")) : null]);
      }
      for (const [casa, secs] of Object.entries(porCasa)) { D.casas[casa].cardapio = Object.values(secs); delete D.casas[casa].cardapioNota; }
    } catch (e) { console.warn("Planilha indisponível, usando o cardápio local.", e); }
  }

  /* ---------- início ---------- */
  $$("[data-baiana]").forEach((el) => (el.innerHTML = baiana({ corpo: false })));
  aplicaHora(horaReal());
  rodape();
  addEventListener("hashchange", navega);
  carregaPlanilha().then(() => { navega(); solido(); carregaMapa(); });
})();
