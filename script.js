/* ══════════════════════════════════════════════
   LE MEHDITERRANÉE — Scripts
   script.js
   ══════════════════════════════════════════════ */

'use strict';

// ══════════════════ UTILITAIRES ══════════════════

function toMin(h, m) {
  return h * 60 + m;
}

// ══════════════════ STATUT DU RESTAURANT ══════════════════

function getStatus(now) {
  const day = now.getDay(); // 0=Dim 1=Lun 2=Mar … 6=Sam
  const cur = toMin(now.getHours(), now.getMinutes());

  // Lundi — repos
  if (day === 1) {
    return { type: 'closed', message: "Nos chefs se reposent aujourd'hui. Rejoignez-nous demain à 11h45.", next: true };
  }

  // Samedi — dîner uniquement
  if (day === 6) {
    const s = toMin(18, 30), e = toMin(22, 30);
    if (cur >= s && cur < e)       return { type: 'open',   message: 'Grand dîner du samedi en cours — Réservation recommandée !' };
    if (cur >= s - 90 && cur < s) {
      const d = s - cur;
      const str = d < 60 ? d + ' min' : Math.floor(d / 60) + 'h' + (d % 60 ? d % 60 : '');
      return { type: 'soon', message: `Ouverture dans ${str} pour le grand dîner du samedi.`, next: true };
    }
    if (cur >= e) return { type: 'closed', message: 'Service du samedi terminé. Retrouvez-nous dimanche à 11h30.', next: true };
    return { type: 'closed', message: 'Nous ouvrons ce soir à 18h30 pour notre grand dîner.', next: true };
  }

  // Dimanche — déjeuner uniquement
  if (day === 0) {
    const s = toMin(11, 30), e = toMin(14, 30);
    if (cur >= s && cur < e) return { type: 'open',   message: 'Déjeuner dominical en service — Bienvenue en famille !' };
    if (cur >= e)             return { type: 'closed', message: 'Service du dimanche terminé. Retrouvez-nous mardi à 11h45.', next: true };
    return { type: 'closed', message: 'Nous ouvrons à 11h30 pour notre déjeuner dominical.', next: true };
  }

  // Mardi – Vendredi
  if (day >= 2 && day <= 5) {
    const ls = toMin(11, 45), le = toMin(14, 30);
    const ds = toMin(18, 30), de = toMin(22, 0);
    if (cur >= ls && cur < le) return { type: 'open',   message: 'Service du déjeuner en cours — Lumière naturelle, âme méditerranéenne.' };
    if (cur >= ds && cur < de) return { type: 'open',   message: "Service du dîner en cours — L'atmosphère du soir vous attend." };
    if (cur >= le && cur < ds) return { type: 'closed', message: 'Coupure entre les services. Nous rouvrons ce soir à 18h30.', next: true };
    if (cur >= de)             return { type: 'closed', message: `Service du soir terminé. À bientôt — ${day === 5 ? 'Samedi à 18h30' : 'Demain à 11h45'}.`, next: true };
    return { type: 'closed', message: "Nous ouvrons aujourd'hui à 11h45 pour le déjeuner.", next: true };
  }

  return { type: 'closed', message: 'Consultez nos horaires.' };
}

const STATUS_COLORS = {
  open:   { bg: 'oklch(0.88 0.06 145/.18)', border: 'oklch(0.52 0.08 145/.25)', text: 'oklch(0.28 0.1 145)',  dot: '#22c55e' },
  soon:   { bg: 'oklch(0.94 0.08 65/.2)',   border: 'oklch(0.62 0.1 65/.3)',    text: 'oklch(0.38 0.1 65)',   dot: '#f59e0b' },
  closed: { bg: 'oklch(0.96 0.015 30/.15)', border: 'oklch(0.52 0.1 30/.2)',    text: 'oklch(0.42 0.08 30)',  dot: '#f87171' },
};

function applyStatus(status) {
  const c = STATUS_COLORS[status.type];

  // Bannière principale
  const banner = document.getElementById('status-banner');
  if (banner) {
    banner.style.background  = c.bg;
    banner.style.borderColor = c.border;
  }
  const bannerText = document.getElementById('banner-text');
  if (bannerText) { bannerText.textContent = status.message; bannerText.style.color = c.text; }
  const bannerIcon = document.getElementById('banner-icon');
  if (bannerIcon) bannerIcon.style.stroke = c.text;
  const bannerDot  = document.getElementById('banner-dot');
  if (bannerDot)  bannerDot.style.background = c.dot;
  const bannerCta  = document.getElementById('banner-cta');
  if (bannerCta)  { bannerCta.style.display = status.next ? 'inline' : 'none'; bannerCta.style.color = c.text; }

  // Badge dans le header
  const badge = document.getElementById('header-badge');
  if (badge) { badge.style.background = c.bg; badge.style.border = `1px solid ${c.border}`; badge.style.color = c.text; }
  const headerDot  = document.getElementById('header-dot');
  if (headerDot)  headerDot.style.background = c.dot;
  const headerText = document.getElementById('header-status-text');
  if (headerText) headerText.textContent = status.type === 'open' ? 'Ouvert' : status.type === 'soon' ? 'Bientôt' : 'Fermé';

  // Bande sous le header (au scroll)
  const sBar = document.getElementById('header-status-bar');
  if (sBar) { sBar.style.background = c.bg; sBar.style.borderColor = c.border; sBar.style.color = c.text; }
  const sBarText = document.getElementById('header-bar-text');
  if (sBarText) sBarText.textContent = status.message;

  // Badge menu mobile
  const mb = document.getElementById('mobile-badge');
  if (mb) {
    mb.style.background = c.bg;
    mb.style.border     = `1px solid ${c.border}`;
    mb.style.color      = c.text;
    mb.innerHTML        = `<span class="status-dot" style="background:${c.dot}"></span>${status.message}`;
  }

  // Statut dans la section Horaires
  const hoursDot  = document.getElementById('hours-dot');
  if (hoursDot)  hoursDot.style.background = c.dot;
  const hoursText = document.getElementById('hours-status-text');
  if (hoursText) hoursText.textContent = status.message;
}

// Initialisation + mise à jour chaque minute
applyStatus(getStatus(new Date()));
setInterval(() => applyStatus(getStatus(new Date())), 60_000);


// ══════════════════ TABLEAU DES HORAIRES ══════════════════

const SCHEDULE = [
  { day: 'Mardi — Vendredi', dayIndex: [2,3,4,5], lunch: '11h45 — 14h30', dinner: '18h30 — 22h00', closed: false },
  { day: 'Samedi',           dayIndex: [6],        lunch: 'Fermé le midi',  dinner: '18h30 — 22h30', closed: false, gala: true },
  { day: 'Dimanche',         dayIndex: [0],        lunch: '11h30 — 14h30', dinner: 'Fermé le soir',  closed: false },
  { day: 'Lundi',            dayIndex: [1],        lunch: 'Jour de repos',  dinner: 'Jour de repos',  closed: true  },
];

function buildSchedule() {
  const today = new Date().getDay();
  const box   = document.getElementById('schedule-table');
  if (!box) return;

  let html = `<div class="schedule-head"><p>Planning de la semaine</p></div>`;

  SCHEDULE.forEach(row => {
    const isToday   = row.dayIndex.includes(today);
    const dayColor  = isToday ? 'oklch(0.88 0.08 75)' : row.closed ? 'oklch(0.55 0.01 85)' : 'oklch(0.88 0.01 85)';
    const lunchClosed  = row.lunch.startsWith('Fermé')  || row.closed;
    const dinnerClosed = row.dinner.startsWith('Fermé') || row.closed;

    html += `
      <div class="schedule-row${isToday ? ' today' : ''}">
        <div class="schedule-row-top">
          <div style="display:flex;align-items:center;gap:.5rem">
            ${isToday ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--or);flex-shrink:0"></span>` : ''}
            <p class="schedule-day" style="color:${dayColor}${row.closed ? ';font-style:italic' : ''}">${row.day}</p>
          </div>
          ${isToday ? `<span class="today-pill">Aujourd'hui</span>` : ''}
        </div>
        ${row.closed
          ? `<p style="font-size:.75rem;font-style:italic;color:oklch(0.52 0.01 85)">Jour de repos — Nos chefs se ressourcent</p>`
          : `<div class="schedule-times">
               <div>
                 <p class="schedule-time-label">Déjeuner</p>
                 <p class="schedule-time-val" style="color:${lunchClosed ? 'oklch(0.52 0.01 85)' : 'oklch(0.82 0.02 85)'};${lunchClosed ? 'font-style:italic' : ''}">${row.lunch}</p>
               </div>
               <div>
                 <p class="schedule-time-label">Dîner</p>
                 <p class="schedule-time-val" style="color:${dinnerClosed ? 'oklch(0.52 0.01 85)' : row.gala ? 'oklch(0.82 0.08 75)' : 'oklch(0.82 0.02 85)'};${dinnerClosed ? 'font-style:italic' : ''}">
                   ${row.dinner}${row.gala ? ' <span style="font-size:.65rem;color:var(--or)">★ Gala</span>' : ''}
                 </p>
               </div>
             </div>`
        }
      </div>`;
  });

  html += `<div class="schedule-note">Réservation recommandée le samedi soir. Groupes sur demande.</div>`;
  box.innerHTML = html;
}

buildSchedule();


// ══════════════════ SECTION INFOS ══════════════════

const INFO_DATA = [
  { title: 'Accessibilité',       items: ['Parking accessible fauteuils roulants', 'Entrée accessible fauteuils roulants', 'Places assises accessibles'] },
  { title: 'Services & Options',  items: ['Places en terrasse', 'Repas sur place', 'Réservations acceptées', 'Service de table'] },
  { title: 'Spécialités & Offres',items: ['Excellents cocktails', 'Excellent café', 'Excellents desserts', 'Grande sélection de vins', 'Options saines', 'Alcool, bière, spiritueux'] },
  { title: 'Ambiance',            items: ['Décontractée', 'Cosy', 'Calme', 'Romantique', 'Tendance'] },
  { title: 'Équipements',         items: ['Bar sur place', 'Toilettes', 'Parking gratuit (rue & parking)', 'Beaucoup de places de parking'] },
  { title: 'Paiements',           items: ['Cartes de crédit', 'Cartes de débit', 'Tickets restaurant', 'Paiements mobiles NFC', 'Pluxee'] },
  { title: 'Enfants & Familles',  items: ['Adapté aux enfants', 'Chaises hautes disponibles', 'Menu enfants', 'Idéal pour les groupes'] },
  { title: 'Moments Populaires',  items: ['Déjeuner', 'Dîner', 'Repas en solo', 'Catering disponible', 'Desserts & café'] },
];

const CHECK_SVG = `<svg class="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function buildInfos() {
  const grid = document.querySelector('.infos-grid');
  if (!grid) return;
  grid.innerHTML = INFO_DATA.map(cat => `
    <div class="info-card">
      <h3>${cat.title}</h3>
      <ul>
        ${cat.items.map(item => `<li>${CHECK_SVG}${item}</li>`).join('')}
      </ul>
    </div>`).join('');
}

buildInfos();


// ══════════════════ HEADER SCROLL ══════════════════

(function () {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


// ══════════════════ HERO PARALLAXE ══════════════════

(function () {
  const bg = document.getElementById('hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    bg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }, { passive: true });
})();


// ══════════════════ MENU MOBILE ══════════════════

(function () {
  const menu      = document.getElementById('mobile-menu');
  const btn       = document.getElementById('menu-btn');
  const iconMenu  = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');
  if (!menu || !btn) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    iconMenu.style.display  = open ? 'none'  : 'block';
    iconClose.style.display = open ? 'block' : 'none';
  });
})();

function closeMobileMenu() {
  const menu      = document.getElementById('mobile-menu');
  const iconMenu  = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');
  if (!menu) return;
  menu.classList.remove('open');
  if (iconMenu)  iconMenu.style.display  = 'block';
  if (iconClose) iconClose.style.display = 'none';
}


// ══════════════════ SCROLL REVEAL ══════════════════

(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


// ══════════════════ FORMULAIRE DE RÉSERVATION ══════════════════

const SERVICE_LABELS = {
  'tue-fri-lunch':   'Déjeuner en semaine (Mar–Ven, 11h45–14h30)',
  'tue-fri-dinner':  'Dîner en semaine (Mar–Ven, 18h30–22h00)',
  'saturday-dinner': 'Gala du samedi soir (18h30–22h30)',
  'sunday-lunch':    'Déjeuner dominical (Dim, 11h30–14h30)',
};

// Date minimum = aujourd'hui
(function () {
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
})();

function handleSubmit(e) {
  e.preventDefault();
  const form    = e.target;
  const name    = form.name.value.trim();
  const service = SERVICE_LABELS[form.service.value] || form.service.value;
  const area    = document.getElementById('form-area');
  if (!area) return;

  area.innerHTML = `
    <div class="form-success">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.08 145)" stroke-width="1.5" stroke-linecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h3>Demande envoyée !</h3>
      <p>Merci, <strong>${name}</strong>. Nous avons bien reçu votre demande pour <strong>${service}</strong>. Nous vous contacterons très prochainement.</p>
      <button class="btn btn-outline" style="margin-top:2rem" onclick="resetForm()">Nouvelle réservation</button>
    </div>`;
}

function resetForm() {
  location.reload();
}


// ══════════════════ ANNÉE DANS LE FOOTER ══════════════════

(function () {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = `© ${new Date().getFullYear()} Le Mehditerranée · Tous droits réservés`;
})();
