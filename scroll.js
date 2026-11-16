(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 901px)');
  const hero = document.querySelector('.hero');
  const project = document.querySelector('.project-card');
  const process = document.querySelector('.process-section');
  const cards = [...document.querySelectorAll('.journey-card')];
  const steps = [...document.querySelectorAll('.process-grid li')];
  const services = [...document.querySelectorAll('.service-card')];
  const clamp = value => Math.max(0, Math.min(1, value));
  cards.forEach((card, index) => card.style.setProperty('--card-index', index));
  let frame = 0;

  function update() {
    frame = 0;
    if (reduced.matches) return;
    const height = innerHeight;
    // Read layout first; write transforms afterwards to avoid layout thrashing.
    const heroRect = hero.getBoundingClientRect();
    const projectRect = project.getBoundingClientRect();
    const processRect = process.getBoundingClientRect();
    const cardRects = cards.map(card => card.getBoundingClientRect());
    const heroProgress = clamp(-heroRect.top / heroRect.height);
    hero.style.setProperty('--hero-shift', `${heroProgress * (wide.matches ? 38 : 15)}px`);
    hero.style.setProperty('--hero-scale', 1 + heroProgress * .035);
    hero.style.setProperty('--tag-shift', `${heroProgress * -23}px`);
    const projectProgress = clamp((height - projectRect.top) / (height + projectRect.height));
    project.style.setProperty('--project-shift', `${(projectProgress - .5) * (wide.matches ? 40 : 16)}px`);
    const processProgress = clamp((height * .82 - processRect.top) / Math.max(1, processRect.height * .75));
    process.style.setProperty('--process-progress', processProgress);
    steps.forEach((step, index) => step.classList.toggle('step-active', processProgress >= index / steps.length && processProgress > .01));
    cards.forEach((card, index) => {
      const following = cardRects[index + 1];
      const overlap = wide.matches && following ? clamp((height * .65 - following.top) / (height * .45)) : 0;
      card.style.setProperty('--stack-scale', 1 - overlap * .035);
    });
  }
  function schedule() { if (!frame && !reduced.matches) frame = requestAnimationFrame(update); }
  function configure() {
    document.body.classList.toggle('scroll-ready', !reduced.matches);
    const columns = innerWidth > 800 ? 3 : innerWidth > 580 ? 2 : 1;
    services.forEach((service, index) => service.style.setProperty('--reveal-delay', `${reduced.matches ? 0 : index % columns * 80}ms`));
    if (reduced.matches) {
      cancelAnimationFrame(frame); frame = 0;
      [hero, project, process].forEach(element => ['--hero-shift', '--hero-scale', '--tag-shift', '--project-shift', '--process-progress'].forEach(property => element.style.removeProperty(property)));
      cards.forEach(card => card.style.removeProperty('--stack-scale'));
      steps.forEach(step => step.classList.remove('step-active'));
    } else schedule();
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', configure, {passive:true});
  reduced.addEventListener('change', configure);
  configure();
})();
