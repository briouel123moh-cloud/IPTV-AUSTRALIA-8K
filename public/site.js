const dialog = document.querySelector('#trial-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const frame = dialog.querySelector('[data-trial-frame]');
  const direct = dialog.querySelector('[data-direct]');
  const allowedOrigin = new URL(dialog.dataset.widget).origin;
  let trigger;
  document.addEventListener('click', event => {
    const link = event.target.closest?.('[data-open-trial]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (dialog.open) return;
    trigger = link;
    const url = new URL(dialog.dataset.widget);
    url.hash = new URLSearchParams({ page: location.origin + location.pathname }).toString();
    frame.src = url.href;
    direct.href = url.href;
    dialog.showModal();
  });
  dialog.querySelector('[data-close-trial]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    frame.removeAttribute('src');
    trigger?.focus();
  });
  window.addEventListener('message', event => {
    if (!dialog.open || event.origin !== allowedOrigin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'emerald-trial-close') dialog.close();
    const height = event.data?.height;
    if (event.data?.type === 'emerald-trial-size' && Number.isFinite(height) && height >= 200 && height <= 1800) {
      frame.style.height = `min(${Math.ceil(height)}px, calc(100dvh - 140px))`;
    }
  });
}

const planPicker = document.querySelector('#choose-plan');
if (planPicker) {
  function selectScreens(count) {
    for (const link of planPicker.querySelectorAll('[data-plan-months]')) {
      const months = Number(link.dataset.planMonths);
      const duration = `${months} ${months === 1 ? 'month' : 'months'}`;
      const numberOfScreens = `${count} ${count === 1 ? 'screen' : 'screens'}`;
      const url = new URL(link.href);
      url.searchParams.set('text', `Hi, IPTV Australia 8K: ${duration}, ${numberOfScreens}. AUD quote?`);
      link.href = url.href;
      link.setAttribute('aria-label', `Request ${duration} for ${numberOfScreens}`);
    }
    planPicker.querySelector('[data-screen-summary]').textContent =
      `${count} simultaneous ${count === 1 ? 'screen' : 'screens'} selected`;
  }
  planPicker.addEventListener('change', event => {
    if (event.target.name !== 'screens') return;
    const count = Number(event.target.value);
    if (Number.isInteger(count) && count >= 1 && count <= 6) selectScreens(count);
  });
  // Browsers may restore the radio state when returning from WhatsApp.
  window.addEventListener('pageshow', () => {
    selectScreens(Number(planPicker.querySelector('input[name="screens"]:checked')?.value || 1));
  });
}

const costForm = document.querySelector('#cost-calculator');
if (costForm) {
  costForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!costForm.reportValidity()) return;
    const data = new FormData(costForm);
    const total = Number(data.get('total'));
    const extras = Number(data.get('extras'));
    const months = Number(data.get('months'));
    if (![total, extras, months].every(Number.isFinite) || total <= 0 || extras < 0 || months < 1) return;
    const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', currencyDisplay: 'code' });
    costForm.querySelector('output').textContent =
      `${currency.format(total + extras)} total · ${currency.format((total + extras) / months)} per month over ${months} ${months === 1 ? 'month' : 'months'}.`;
  });
}
