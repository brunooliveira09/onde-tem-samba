/* ============================================
   ONDE TEM SAMBA — Lógica Principal
   ============================================ */

const OTS_APP = (() => {

  // ── Estado ──
  let map, layer;
  let curFilter = 'todos';
  let curSearch = '';
  let allEvents = [];

  // ── Pandeiro SVG (pin icon) ──
  const PANDEIRO_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20">
      <!-- corpo do pandeiro -->
      <circle cx="16" cy="16" r="13" fill="#0D0A07" stroke="none"/>
      <!-- aro externo -->
      <circle cx="16" cy="16" r="13" fill="none" stroke="#0D0A07" stroke-width="3.5"/>
      <!-- membrana interna -->
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#0D0A07" stroke-width="1.5" stroke-dasharray="2 2.5"/>
      <!-- platinelas (3 pares) -->
      <rect x="2.5" y="14" width="3" height="4" rx="1" fill="#0D0A07" transform="rotate(-30 16 16) translate(-13 0)"/>
      <rect x="2.5" y="14" width="3" height="4" rx="1" fill="#0D0A07" transform="rotate(90 16 16) translate(-13 0)"/>
      <rect x="2.5" y="14" width="3" height="4" rx="1" fill="#0D0A07" transform="rotate(210 16 16) translate(-13 0)"/>
      <!-- ponto central -->
      <circle cx="16" cy="16" r="2.5" fill="#0D0A07"/>
    </svg>`;

  // ── Cria ícone Leaflet ──
  function makeIcon(faded) {
    const op = faded ? 0.13 : 1;
    const html = `
      <div class="ots-pin" style="opacity:${op}">
        <div class="ots-pin-head">
          <span class="ots-pin-icon">${PANDEIRO_SVG}</span>
        </div>
      </div>`;
    return L.divIcon({
      html, className: '',
      iconSize: [36, 36], iconAnchor: [18, 34], popupAnchor: [0, -36]
    });
  }

  // ── Inicializa mapa ──
  function initMap() {
    map = L.map('map', {
      center: OTS_CONFIG.map.defaultCenter,
      zoom:   OTS_CONFIG.map.defaultZoom,
      zoomControl: false,          // removemos o padrão
      attributionControl: true,
    });

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      crossOrigin: true,
    }).addTo(map);

    // Zoom no canto inferior direito
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layer = L.layerGroup().addTo(map);
  }

  // ── Helpers de data ──
  function dayType(ds) {
    return OTS_DB.dayType(ds);
  }
  function dayLabel(ds) {
    return OTS_DB.dayLabel(ds);
  }

  // ── Filtra lista local ──
  function filterEvents(events) {
    return events.filter(ev => {
      const t = dayType(ev.data);
      if (curFilter === 'hoje' && t !== 'hoje') return false;
      if (curFilter === 'fds'  && t !== 'fds')  return false;
      if (curSearch) {
        const q = curSearch.toLowerCase();
        const haystack = [ev.nome, ev.bairro, ev.local, ev.organizador_nome || ''].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  // ── Renderiza pins no mapa ──
  function renderPins(visible) {
    const ids = new Set(visible.map(e => e.id));
    layer.clearLayers();
    allEvents.forEach(ev => {
      const faded = !ids.has(ev.id);
      const m = L.marker([ev.lat, ev.lng], { icon: makeIcon(faded), zIndexOffset: faded ? 0 : 100 });
      if (!faded) {
        m.on('click', () => {
          map.panTo([ev.lat, ev.lng], { animate: true, duration: 0.4 });
          openDetail(ev);
        });
      }
      m.addTo(layer);
    });
  }

  // ── Abre detail box ──
  function openDetail(ev) {
    const ingresso = OTS_DB.formatIngresso(ev);

    // Imagem
    const imgSlot = document.getElementById('detail-img-slot');
    imgSlot.innerHTML = ev.foto_url
      ? `<img id="detail-img" src="${ev.foto_url}" alt="${ev.nome}"
           onerror="this.outerHTML='<div id=detail-img-placeholder>🥁</div>'"/>`
      : `<div id="detail-img-placeholder">🥁</div>`;

    // Tags
    document.getElementById('detail-tags').innerHTML =
      (ev.estilos || []).map(s => `<span class="dtag">${s}</span>`).join('');

    // Cabeçalho
    document.getElementById('detail-name').textContent  = ev.nome;
    document.getElementById('detail-badge').textContent = dayLabel(ev.data);

    // Meta grid
    document.getElementById('detail-meta').innerHTML = `
      <div class="dm">
        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>${ev.local}</span>
      </div>
      <div class="dm">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${ev.bairro}</span>
      </div>
      <div class="dm">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>${ev.hora} · ${ev.recorrencia || ''}</span>
      </div>
      <div class="dm">
        <svg viewBox="0 0 24 24"><path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/></svg>
        <span>${ingresso}</span>
      </div>`;

    // Botão de interesse
    document.getElementById('detail-btn').onclick = () => {
      // Em produção: salvar no Supabase tabela `interesses`
      alert(`Interesse registrado em: ${ev.nome}\n\nEm breve você receberá mais informações!`);
    };

    document.getElementById('detail').classList.add('open');
    document.getElementById('overlay').classList.add('on');
  }

  // ── Fecha detail ──
  function closeDetail() {
    document.getElementById('detail').classList.remove('open');
    document.getElementById('overlay').classList.remove('on');
  }

  // ── Render geral ──
  async function render() {
    const visible = filterEvents(allEvents);
    renderPins(visible);
  }

  // ── Sync filtros mobile com desktop ──
  function syncMobileFilters(f) {
    document.querySelectorAll('.fb').forEach(b => {
      b.classList.toggle('on', b.dataset.filter === f);
    });
  }

  // ── Carrega eventos (banco ou seed) ──
  async function loadEvents() {
    allEvents = await OTS_DB.getEventos({ tipo: curFilter, search: curSearch });
    render();
  }

  // ── Inicialização ──
  async function init() {
    initMap();

    // Bind overlay
    document.getElementById('overlay').addEventListener('click', closeDetail);
    document.getElementById('detail-close').addEventListener('click', closeDetail);

    // Bind search
    document.getElementById('searchbox').addEventListener('input', e => {
      curSearch = e.target.value.trim();
      loadEvents();
    });

    // Bind filtros (desktop + mobile) — usa data-filter
    document.querySelectorAll('.fb').forEach(btn => {
      btn.addEventListener('click', () => {
        curFilter = btn.dataset.filter;
        syncMobileFilters(curFilter);
        closeDetail();
        loadEvents();
      });
    });

    // Carrega eventos iniciais
    await loadEvents();
  }

  // API pública
  return { init, closeDetail, openDetail };

})();

// Inicia quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => OTS_APP.init());
