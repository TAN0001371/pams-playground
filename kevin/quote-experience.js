/* Quote experience: presentation and workflow helpers kept separate from core costing. */
(function () {
  const $ = id => document.getElementById(id);
  const today = () => new Date().toISOString().slice(0, 10);
  const money = n => '$' + (Number(n) || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const value = id => ($(id) && $(id).value || '').trim();
  const input = (id, v) => { if ($(id)) $(id).value = v || ''; };
  const rawRecalc = window.recalcQuote;
  const rawSave = window.saveQuote;
  const rawLoad = window.loadQuoteIntoForm;
  const rawNew = window.newQuoteFresh;

  function pricing() {
    const c = calculateJobTotals();
    const exGst = c.subtotal + c.contingencyAmt + c.profitAmt;
    const rounding = Number(value('nqRounding')) || 0;
    const total = rounding ? Math.round((exGst * 1.1) / rounding) * rounding : exGst * 1.1;
    return { c, exGst: total / 1.1, gst: total - total / 1.1, total, rounding };
  }
  window.getQuotePricing = pricing;

  function displayPricing() {
    const p = pricing();
    if ($('sideGrandTotal')) $('sideGrandTotal').textContent = money(p.total);
    if ($('sideExGst')) $('sideExGst').textContent = money(p.exGst);
    if ($('sideGst')) $('sideGst').textContent = money(p.gst);
    if ($('sideTotalIncGst')) $('sideTotalIncGst').textContent = money(p.total);
    if ($('mobileGrandTotal')) $('mobileGrandTotal').textContent = money(p.total);
    updateWarnings();
  }
  window.recalcQuote = function () { rawRecalc(); displayPricing(); };

  function warningList() {
    syncCurrentQuoteFromDOM();
    const issues = [];
    if (!value('nqClient')) issues.push('Add a job or customer name.');
    const lines = [...(currentQuote.materials || []), ...(currentQuote.labour || []), ...(currentQuote.subbies || []), ...(currentQuote.other || [])];
    if (!lines.length) issues.push('Add at least one priced item or labour line.');
    if ((currentQuote.materials || []).some(x => !x.item || !Number(x.qty) || !Number(x.cost))) issues.push('Check materials with a blank name, quantity or cost.');
    if ((currentQuote.labour || []).some(x => !x.worker || !Number(x.hours) || !Number(x.cost))) issues.push('Check labour with a blank worker, hours or rate.');
    if (!Number(calculateJobTotals().totalHours)) issues.push('No labour hours are included — confirm that is intended.');
    return issues;
  }
  function updateWarnings() {
    const box = $('quoteWarnings'); if (!box) return;
    const issues = warningList();
    box.classList.toggle('show', issues.length > 0);
    box.innerHTML = issues.length ? '<strong>Before you send:</strong><br>' + issues.map(x => '• ' + x).join('<br>') : '';
  }

  window.setQuoteMode = function (mode) {
    const advanced = mode === 'advanced';
    document.body.classList.toggle('simple-mode', !advanced);
    $('simpleModeBtn') && $('simpleModeBtn').classList.toggle('active', !advanced);
    $('advancedModeBtn') && $('advancedModeBtn').classList.toggle('active', advanced);
    localStorage.setItem('kevinQuoteMode', advanced ? 'advanced' : 'simple');
    if ($('quoteModeNote')) $('quoteModeNote').textContent = advanced ? 'Advanced pricing — customise every part of this quote' : 'Simple quote — using your standard business settings';
    ['adv', 'sub', 'oth'].forEach(key => { const body = $('body-' + key), chevron = $('chevron-' + key); if (!body || !chevron) return; body.classList.toggle('open', advanced); chevron.classList.toggle('open', advanced); });
  };
  window.useBusinessDefaults = function () {
    input('nqContingency', '5'); input('nqProfit', '25'); input('nqOverheadPct', '100');
    recalcQuote(); showToast('Standard business settings restored.', 'success');
  };

  function quoteMeta() {
    return { quoteNumber: value('nqQuoteNumber'), quoteDate: value('nqQuoteDate') || today(), validUntil: value('nqValidUntil'), status: value('nqStatus') || 'Draft', scope: value('nqScope'), exclusions: value('nqExclusions'), rounding: Number(value('nqRounding')) || 0, xeroTaxMode: value('nqXeroTaxMode') || 'exclusive' };
  }
  function nextQuoteNumber() { return 'Q-' + new Date().getFullYear() + '-' + String((state.quotes || []).length + 1).padStart(3, '0'); }
  function setQuoteFields(q) {
    input('nqQuoteNumber', q && q.quoteNumber || (!editingQuoteId ? nextQuoteNumber() : ''));
    input('nqQuoteDate', q && q.quoteDate || q && q.date || today());
    input('nqValidUntil', q && q.validUntil || (q ? '' : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)));  input('nqStatus', q && q.status || 'Draft');
    input('nqScope', q && q.scope || ''); input('nqExclusions', q && q.exclusions || '');
    input('nqRounding', q && q.rounding || ''); input('nqXeroTaxMode', q && q.xeroTaxMode || 'exclusive');
  }

  function finishSave() {
    const editingId = editingQuoteId;
    rawSave();
    const q = editingId !== null ? state.quotes.find(x => x.id === editingId) : state.quotes[0];
    if (!q) return;
    const p = pricing();
    Object.assign(q, quoteMeta(), { exGst: p.exGst, gst: p.gst, grandTotal: p.total, costedTotal: p.c.grandTotal });
    if (!q.quoteNumber) q.quoteNumber = nextQuoteNumber();
    input('nqQuoteNumber', q.quoteNumber);
    saveState(); renderHistory(); renderOverview();
  }
  window.saveQuote = function () {
    const issues = warningList();
    if (issues.length) { showConfirm('This quote needs a quick check:\n\n' + issues.join('\n') + '\n\nSave it anyway?', finishSave); return; }
    finishSave();
  };

  function copyText(text, btn) {
    const done = () => flashCopied(btn);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  window.copyXeroTotal = function (btn) {
    const p = pricing(), meta = quoteMeta();
    copyText((value('nqClient') || 'Job') + ' — Xero invoice figures\n' +
      'Subtotal (' + (meta.xeroTaxMode === 'inclusive' ? 'GST inclusive view' : 'ex GST') + ')\t' + money(meta.xeroTaxMode === 'inclusive' ? p.total : p.exGst) + '\nGST (10%)\t' + money(p.gst) + '\nTotal (inc GST)\t' + money(p.total), btn);
  };
  window.copyQuote = function (btn) {
    const p = pricing(), c = p.c;
    copyText((value('nqClient') || 'Job') + ' — detailed costing\nMaterials\t' + money(c.matTotal) + '\nLabour\t' + money(c.labTotal) + '\nOverhead\t' + money(c.overheadCost) + '\nSubbies + other\t' + money(c.subTotal + c.otherTotal) + '\nContingency\t' + money(c.contingencyAmt) + '\nProfit\t' + money(c.profitAmt) + '\nSubtotal (ex GST)\t' + money(p.exGst) + '\nGST (10%)\t' + money(p.gst) + '\nTotal (inc GST)\t' + money(p.total), btn);
  };

  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  window.printClientQuote = function (job) {
    const q = job || { client:value('nqClient') || 'Customer', location:value('nqLocation'), materials:deepClone(currentQuote.materials), labour:deepClone(currentQuote.labour), ...quoteMeta(), ...pricing() };
    const p = job ? { exGst:Number(job.exGst || (job.grandTotal / 1.1)), gst:Number(job.gst || job.grandTotal - job.grandTotal / 1.1), total:Number(job.grandTotal) } : { exGst:q.exGst, gst:q.gst, total:q.total };
    const items = (q.materials || []).map(m => '<tr><td>'+escapeHtml(m.item)+'</td><td class="r">'+m.qty+'</td><td class="r">'+money(m.qty * m.cost * (1 + (m.markup || 0) / 100))+'</td></tr>').join('') + (q.labour || []).map(l => '<tr><td>'+escapeHtml(l.worker)+' labour ('+l.hours+' hrs)</td><td class="r">'+l.hours+'</td><td class="r">'+money(l.hours * l.cost * (1 + (l.markup || 0) / 100))+'</td></tr>').join('');
    const w = window.open('', '_blank'); if (!w) return showToast('Allow pop-ups to create the customer quote.', 'error');
    w.document.write('<!doctype html><html><head><title>Quote '+escapeHtml(q.quoteNumber || '')+'</title><style>body{font:15px Arial,sans-serif;color:#202a32;max-width:760px;margin:auto;padding:42px}h1{color:#142b3e;margin-bottom:4px}.muted{color:#65727d}table{width:100%;border-collapse:collapse;margin:25px 0}th,td{padding:10px;border-bottom:1px solid #dbe1e5;text-align:left}.r{text-align:right}.total{font-weight:bold;font-size:18px}.box{background:#f4f8f7;padding:16px;margin:20px 0;white-space:pre-line}@media print{button{display:none}body{padding:15px}}</style></head><body><button onclick="print()">Print / Save PDF</button><h1>QUOTE</h1><div class="muted">'+escapeHtml(q.quoteNumber || 'Draft quote')+' · Issued '+escapeHtml(q.quoteDate || q.date || today())+(q.validUntil ? ' · Valid until '+escapeHtml(q.validUntil) : '')+'</div><h2>'+escapeHtml(q.client)+'</h2><div class="muted">'+escapeHtml(q.location || '')+'</div>'+(q.scope ? '<div class="box"><strong>Scope of work</strong><br>'+escapeHtml(q.scope)+'</div>' : '')+'<table><tr><th>Description</th><th class="r">Qty / hrs</th><th class="r">Amount</th></tr>'+items+'</table><table><tr><td>Subtotal ex GST</td><td class="r">'+money(p.exGst)+'</td></tr><tr><td>GST (10%)</td><td class="r">'+money(p.gst)+'</td></tr><tr class="total"><td>Total including GST</td><td class="r">'+money(p.total)+'</td></tr></table>'+(q.exclusions ? '<div class="box"><strong>Notes and exclusions</strong><br>'+escapeHtml(q.exclusions)+'</div>' : '')+'<p class="muted">Thank you for the opportunity to quote this work.</p></body></html>'); w.document.close();
  };

  window.loadQuoteIntoForm = function (q) { rawLoad(q); setQuoteFields(q); recalcQuote(); };
  window.newQuoteFresh = function () { rawNew(); setQuoteFields(null); recalcQuote(); };
  const rawHistory = window.renderHistory;
  window.renderHistory = function () { rawHistory(); document.querySelectorAll('#historyList .card').forEach((card, i) => { const q = state.quotes[i]; if (!q) return; const title = card.querySelector('.flex > div'); if (title) title.insertAdjacentHTML('beforeend', ' <span class="quote-status '+escapeHtml(q.status || 'Draft')+'">'+escapeHtml(q.status || 'Draft')+'</span>' + (q.quoteNumber ? '<span style="font-size:12px;color:#888;margin-left:6px">'+escapeHtml(q.quoteNumber)+'</span>' : '')); const buttons = card.querySelector('div[style*="margin-top:6px"]'); if (buttons) buttons.insertAdjacentHTML('afterbegin', '<button class="btn btn-small btn-outline" onclick="printClientQuote(state.quotes['+i+'])">Customer PDF</button> '); }); if (window.applyHistoryFilters) window.applyHistoryFilters(); };

  window.applyHistoryFilters = function () {
    const query = value('historySearch').toLowerCase(); const status = value('historyStatusFilter');
    document.querySelectorAll('#historyList .card').forEach((card, i) => { const q = state.quotes[i] || {}; const match = (!query || (q.client || '').toLowerCase().includes(query) || (q.quoteNumber || '').toLowerCase().includes(query)) && (!status || (q.status || 'Draft') === status); card.style.display = match ? '' : 'none'; });
  };
  setQuoteFields(null);
  setQuoteMode(localStorage.getItem('kevinQuoteMode') || 'simple');
  recalcQuote();
})();