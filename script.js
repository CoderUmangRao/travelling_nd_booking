///////////////////////////////////////////////////////////////////?
/////////////////////////////// nav bar drop down ??????????????? 
(function(){
  const header = document.querySelector('.travel-header1');
  const btn = document.getElementById('th1-hamburger');
  const nav = document.getElementById('th1-nav');
  const overlay = document.getElementById('th1-overlay');

  // Toggle mobile menu
  function toggle(open){
    const willOpen = open ?? !header.classList.contains('is-open');
    header.classList.toggle('is-open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
    overlay.hidden = !willOpen;
    if(willOpen) nav.querySelector('a')?.focus();
  }
  btn?.addEventListener('click', () => toggle());
  overlay?.addEventListener('click', () => toggle(false));
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') toggle(false); });

  // Shadow on scroll
  function onScroll(){
    if(window.scrollY > 6) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
})();

////////// hero section image changer ////////////////////////////////

(function(){
  const hero = document.getElementById('hs1-hero');
  const strip = document.getElementById('hs1-thumbs');
  if(!hero || !strip) return;

  let activeBtn = strip.querySelector('.home-section1__thumb.is-active');
  const defaultBG = activeBtn ? activeBtn.dataset.bg : '';

  function setHero(bg){
    hero.style.setProperty('--hero', `url('${bg}')`);
  }
  // initial
  if(defaultBG) setHero(defaultBG);

  strip.querySelectorAll('.home-section1__thumb').forEach(btn => {
    const bg = btn.dataset.bg;

    // Hover preview (desktop)
    btn.addEventListener('pointerenter', () => setHero(bg));
    btn.addEventListener('pointerleave', () => {
      const current = activeBtn ? activeBtn.dataset.bg : defaultBG;
      setHero(current);
    });

    // Click/tap to set active
    btn.addEventListener('click', () => {
      if(activeBtn) activeBtn.classList.remove('is-active');
      btn.classList.add('is-active');
      activeBtn = btn;
      setHero(bg);
    });
  });
})();


//////////////////////////////////////////////////////////////
// ############### section 4 home page ###################

(function(){
  const wrap = document.querySelector('.home-section4__reviews');
  if(!wrap) return;
  const cards = Array.from(wrap.querySelectorAll('.home-section4__review'));
  const dots = Array.from(document.querySelectorAll('.home-section4__dots button'));
  let i = 0, timer;

  function show(n){
    i = (n + cards.length) % cards.length;
    cards.forEach(c => c.classList.remove('is-active'));
    dots.forEach(d => d.classList.remove('is-active'));
    cards[i].classList.add('is-active');
    dots[i].classList.add('is-active');
  }
  function play(){ timer = setInterval(() => show(i+1), 5000); }
  function pause(){ clearInterval(timer); }

  dots.forEach(d => d.addEventListener('click', () => { pause(); show(+d.dataset.go); play(); }));
  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', play);

  show(0); play();
})();


//////////////////////////////////////////////////////////////////////////////////
//////////// google map /////////////////////////////

(function(){
  // Centers (lng, lat)
  const VIEWS = {
    hq:     { name: 'New Delhi', center: [77.2090, 28.6139], zoom: 14 },
    branch: { name: 'Mumbai',    center: [72.8777, 19.0760], zoom: 14 },
    intl:   { name: 'Dubai',     center: [55.2708, 25.2048], zoom: 13 }
  };

  const iframe = document.getElementById('c3-osm');
  const sel = document.getElementById('c3-views');
  const fullLink = document.getElementById('c3-osm-link');
  const layerBtns = Array.from(document.querySelectorAll('.c3-btn[data-layer]'));

  let currentLayer = 'mapnik';

  function buildOSMUrl(lon, lat, z, layer){
    // compute a small bbox around center (approx ~3km radius depending on lat)
    const delta = 0.03; // deg
    const bbox = [
      (lon - delta).toFixed(5),
      (lat - delta).toFixed(5),
      (lon + delta).toFixed(5),
      (lat + delta).toFixed(5)
    ].join('%2C');

    // embed (tokenless)
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}&marker=${lat.toFixed(5)}%2C${lon.toFixed(5)}`;
  }

  function buildFullLink(lon, lat, z){
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${z}/${lat}/${lon}`;
  }

  function applyView(key){
    const v = VIEWS[key] || VIEWS.hq;
    const [lon, lat] = v.center;
    iframe.src = buildOSMUrl(lon, lat, v.zoom, currentLayer);
    fullLink.href = buildFullLink(lon, lat, v.zoom);
  }

  // init
  applyView(sel.value);

  // on location change
  sel.addEventListener('change', () => applyView(sel.value));

  // layer toggle
  layerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      layerBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentLayer = btn.dataset.layer; // mapnik | cyclemap | transportmap | hot
      applyView(sel.value);
    });
  });
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// packages filter //////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function(){
  const root     = document.querySelector('.package-section1');
  const grid     = document.getElementById('ps1-grid');
  const filters  = root.querySelectorAll('.ps1-filter');
  const searchEl = document.getElementById('ps1-search');
  const moreBtn  = document.getElementById('ps1-more');
  const emptyMsg = document.getElementById('ps1-empty');

  if(!root || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.ps1-card'));
  let currentFilter = 'all';
  let pageSize = 8;           // initially show 8
  let shown = pageSize;

  function matchFilter(card){
    if(currentFilter === 'all') return true;
    const cats = (card.getAttribute('data-cat') || '').toLowerCase().split(/\s+/);
    return cats.includes(currentFilter);
  }
  function matchSearch(card){
    const q = (searchEl?.value || '').trim().toLowerCase();
    if(!q) return true;
    return card.innerText.toLowerCase().includes(q);
  }

  function render(){
    let visibleCount = 0;
    const eligible = cards.filter(c => matchFilter(c) && matchSearch(c));

    // show/hide with progressive limit
    cards.forEach(c => c.style.display = 'none');
    eligible.slice(0, shown).forEach(c => {
      c.style.display = '';
      // small fade-in
      c.style.opacity = 0;
      requestAnimationFrame(() => {
        c.style.transition = 'opacity .18s ease';
        c.style.opacity = 1;
      });
    });

    visibleCount = Math.min(shown, eligible.length);

    // empty state
    if(emptyMsg){
      emptyMsg.style.display = eligible.length === 0 ? '' : 'none';
    }

    // read more visibility
    if(moreBtn){
      moreBtn.style.display = eligible.length > visibleCount ? '' : 'none';
    }
  }

  // Init render
  render();

  // Filter clicks (event delegation safe)
  filters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filters.forEach(b => b.classList.remove('is-active'));
      e.currentTarget.classList.add('is-active');
      currentFilter = e.currentTarget.dataset.filter || 'all';
      shown = pageSize;      // reset page size on filter change
      render();
    });
  });

  // Search
  if(searchEl){
    // prevent Enter from submitting any parent form
    searchEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') e.preventDefault(); });
    searchEl.addEventListener('input', () => { shown = pageSize; render(); });
  }

  // Read more
  if(moreBtn){
    moreBtn.addEventListener('click', () => {
      shown += pageSize;     // reveal next batch
      render();
    });
  }
});

