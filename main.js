function enter() {
  document.body.classList.add('ready');
  document.body.classList.remove('leaving');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enter);
} else {
  enter();
}

window.addEventListener('pageshow', function (ev) {
  enter();
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('.tile a');
  if (!link) return;

  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { window.location.href = link.href; return; }

  if (!document.body.classList.contains('leaving')) {
    document.body.classList.remove('ready');
    document.body.classList.add('leaving');
  }

  setTimeout(() => { window.location.href = link.href; }, 280);
});
