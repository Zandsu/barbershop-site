/* ============================================================
   ДАННЫЕ — меняй здесь: телефон, адрес, соцсети, цены
   ============================================================ */
const CONFIG = {
  phoneDisplay: '+7 (700) 000-00-00',
  phoneTel: '+77000000000',
  whatsapp: '77000000000',          // номер для wa.me без плюса
  address: 'ул. Абая, 50',
  telegram: 'https://t.me/brand',
  instagram: 'https://instagram.com/brand',
};
const LEVELS = ['Барбер', 'Топ-барбер', 'Арт-директор'];
// [название, время, [цена барбер, топ-барбер, арт-директор]]
const SERVICES = [
  ['Мужская стрижка', '60 мин', [8000, 11000, 15000]],
  ['Стрижка + борода', '90 мин', [12000, 16000, 21000]],
  ['Оформление бороды', '40 мин', [5000, 7000, 9000]],
  ['Королевское бритьё', '45 мин', [6000, 8000, 10000]],
  ['Детская стрижка (до 12 лет)', '45 мин', [6000, 8000, 10000]],
  ['Отец + сын', '75 мин', [13000, 17000, 22000]],
  ['Стрижка машинкой', '30 мин', [5000, 6000, 8000]],
  ['Камуфляж седины', '30 мин', [5000, 6000, 7000]],
];
/* ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸';
const waLink = text => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* подстановка контактов */
$$('[data-phone]').forEach(el => { el.textContent = CONFIG.phoneDisplay; if (el.tagName === 'A') el.href = 'tel:' + CONFIG.phoneTel; });
$$('[data-address]').forEach(el => { el.textContent = el.closest('.facts') ? CONFIG.address : CONFIG.address + ', Шымкент'; });
$$('.wa-link').forEach(a => a.href = waLink(a.dataset.msg || 'Здравствуйте!'));
$('#tgLink').href = CONFIG.telegram;
$('#igLink').href = CONFIG.instagram;

/* шапка */
const header = $('#header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 30);
onScroll(); addEventListener('scroll', onScroll, { passive: true });

/* бургер */
const burger = $('#burger'), nav = $('#nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  header.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.closest('a,button')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* цены */
const priceList = $('#prices');
let level = 0;
function renderPrices() {
  priceList.innerHTML = SERVICES.map(([name, time, p]) =>
    `<li><span class="name">${name}</span><span class="time">${time}</span><span class="dots"></span><span class="cost">${money(p[level])}</span></li>`).join('');
}
renderPrices();
$$('.tabs [role=tab]').forEach(tab => tab.addEventListener('click', () => {
  const l = +tab.dataset.level;
  if (l === level) return;
  level = l;
  $$('.tabs [role=tab]').forEach(t => t.setAttribute('aria-selected', t === tab));
  priceList.classList.add('swap');
  setTimeout(() => { renderPrices(); priceList.classList.add('swap'); requestAnimationFrame(() => requestAnimationFrame(() => priceList.classList.remove('swap'))); }, reduced ? 0 : 250);
}));

/* появление при скролле */
const revealEls = $$('.reveal');
// ступенчатая задержка для соседних карточек
$$('.masters,.grid,.gallery,.prices').forEach(g => $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', (i % 4) * 0.1 + 's')));
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' });
  revealEls.forEach(el => io.observe(el));
} else revealEls.forEach(el => el.classList.add('in'));

/* диалоги */
function openDlg(d) { if (!d.open) d.showModal(); }
$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
});
$('#privacyLink').addEventListener('click', e => { e.preventDefault(); openDlg($('#privacyDlg')); });

/* запись */
const bookDlg = $('#bookDlg'), form = $('#bookForm'), err = $('#formErr');
$('#fService').innerHTML = SERVICES.map(s => `<option>${s[0]}</option>`).join('');
const dateEl = $('#fDate');
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateEl.min = today.toISOString().slice(0, 10);
$$('[data-book]').forEach(b => b.addEventListener('click', () => {
  $('#fLevel').value = level; err.hidden = true; openDlg(bookDlg);
}));

/* маска телефона +7 (XXX) XXX-XX-XX */
const phoneEl = form.phone;
function maskPhone() {
  let d = phoneEl.value.replace(/\D/g, '');
  if (d[0] === '7' || d[0] === '8') d = d.slice(1);
  d = d.slice(0, 10);
  let r = '+7';
  if (d.length) r += ' (' + d.slice(0, 3);
  if (d.length >= 3) r += ') ' + d.slice(3, 6);
  if (d.length >= 6) r += '-' + d.slice(6, 8);
  if (d.length >= 8) r += '-' + d.slice(8, 10);
  phoneEl.value = d.length ? r : '';
}
phoneEl.addEventListener('input', maskPhone);
phoneEl.addEventListener('focus', () => { if (!phoneEl.value) phoneEl.value = '+7 ('; });
phoneEl.addEventListener('blur', () => { if (phoneEl.value === '+7 (') phoneEl.value = ''; });

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = form.elements;
  const bad = [];
  if (!f.name.value.trim()) bad.push(f.name);
  if (f.phone.value.replace(/\D/g, '').length < 11) bad.push(f.phone);
  if (!f.date.value) bad.push(f.date);
  if (!f.time.value) bad.push(f.time);
  $$('input', form).forEach(i => i.classList.toggle('bad', bad.includes(i)));
  if (bad.length) { err.textContent = 'Проверь поля, отмеченные красным.'; err.hidden = false; bad[0].focus(); return; }
  err.hidden = true;
  const [y, m, d] = f.date.value.split('-');
  const text = `Здравствуйте! Хочу записаться в BRAND.\nИмя: ${f.name.value.trim()}\nТелефон: ${f.phone.value}\nУслуга: ${f.service.value}\nМастер: ${LEVELS[+f.level.value]}\nДата и время: ${d}.${m}.${y}, ${f.time.value}`;
  window.open(waLink(text), '_blank', 'noopener');
  bookDlg.close(); form.reset();
});

/* лайтбокс */
const lb = $('#lightbox'), lbImg = $('#lbImg');
const shots = $$('.g img');
let cur = 0;
function showShot(i) {
  cur = (i + shots.length) % shots.length;
  lbImg.src = shots[cur].src.replace(/w=\d+/, 'w=1600');
  lbImg.alt = shots[cur].alt;
}
shots.forEach((img, i) => img.closest('.g').addEventListener('click', () => { showShot(i); openDlg(lb); }));
$('.lb__prev').addEventListener('click', e => { e.stopPropagation(); showShot(cur - 1); });
$('.lb__next').addEventListener('click', e => { e.stopPropagation(); showShot(cur + 1); });
lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showShot(cur - 1); if (e.key === 'ArrowRight') showShot(cur + 1); });

/* слайдер отзывов: свайп — нативный scroll-snap, стрелки — scrollBy */
const track = $('#slider'), slides = $$('.review', track), dots = $('#dots');
dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Отзыв ${i + 1}"></button>`).join('');
const dotBtns = $$('button', dots);
const idx = () => Math.round(track.scrollLeft / track.clientWidth);
const go = i => track.scrollTo({ left: ((i + slides.length) % slides.length) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
function updDots() { const i = idx(); dotBtns.forEach((b, n) => b.setAttribute('aria-current', n === i)); }
$('#prev').addEventListener('click', () => go(idx() - 1));
$('#next').addEventListener('click', () => go(idx() + 1));
dotBtns.forEach((b, i) => b.addEventListener('click', () => go(i)));
track.addEventListener('scroll', updDots, { passive: true });
track.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(idx() - 1); if (e.key === 'ArrowRight') go(idx() + 1); });
updDots();

/* высота шапки для якорей */
document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
