    // Fade-IN when ready
    const start = () => document.body.classList.add('ready');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else { start(); }

    // Intercept clicks for smooth fade-OUT, then navigate
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.tile a');
      if (!link) return;

      // låt modifierade klick gå igenom (ny flik mm)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      // respekt för reduced motion
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduce) { window.location.href = link.href; return; }

      document.body.classList.add('leaving');
      setTimeout(() => { window.location.href = link.href; }, 280); // matchar --fade-ms
    });