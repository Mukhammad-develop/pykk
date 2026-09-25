// PYKK template: beauty — mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('site-nav');

if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    navList.classList.toggle('open', !isOpen);
  });

  navList.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      navList.classList.remove('open');
    }
  });
}
