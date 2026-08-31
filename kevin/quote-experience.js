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
  const rawSelect = window.selectTemplate;
  const AI_REVIEW_ENDPOINT = window.QUOTE_AI_REVIEW_ENDPOINT || '';
  const CHECKLIST_ITEMS = [
    ['access', 'Access checked'],
    ['measurements', 'Measurements taken'],
    ['demolition', 'Demolition considered'],
    ['waste', 'Waste removal considered'],
    ['permits', 'Permits / plans considered'],
    ['engineering', 'Engineering considered'],
    ['materials', 'Materials confirmed'],
    ['fixtures', 'Fixtures / appliances confirmed'],
    ['subbies', 'Subcontractors considered'],
    ['finishes', 'Finishes confirmed'],
    ['exclusions', 'Exclusions explained'],
    ['customer', 'Customer sign-off ready']
  ];
  const UPSELL_LIBRARY = {
    sauna: [
      {key:'sauna-premium-heater', label:'Premium heater', reason:'A considered upgrade for comfort and faster heat-up.'},
      {key:'sauna-lighting', label:'Sauna lighting package', reason:'A specific add-on when lighting is not already included.'},
      {key:'sauna-care-kit', label:'Timber care kit', reason:'A profitable handover add-on that is easy to explain.'},
      {key:'sauna-accessories', label:'Bucket and ladle set', reason:'A small finishing add-on customers often appreciate.'}
    ],
    reno: [
      {key:'reno-premium-finish', label:'Premium finish upgrade', reason:'Offer a better finish where the scope currently says only “standard”.'},
      {key:'reno-lighting', label:'Additional lighting', reason:'A useful upgrade when electrical or lighting work is not listed.'},
      {key:'reno-storage', label:'Built-in storage', reason:'A high-value option to consider while walls or cabinetry are open.'},
      {key:'reno-final-clean', label:'Final clean and handover', reason:'A clearly priced convenience add-on at project completion.'}
    ]
  };
  let activeChecklist = {};
  let selectedUpsells = [];
  let reviewState = {signature:'', result:null, title:''};

  // ===== QUOTE HEALTH / COST COMPLETENESS =====
  const PRICING_VERSION = 2;
  function quoteTypeLabel(type) {
    return type === 'sauna' ? 'Sauna' : type === 'reno-general' ? 'Basic Reno' : type === 'custom' ? 'Custom job' : (type || 'Job');
  }
  function activeTemplateType() {
    const explicit = value('nqType');
    if (explicit) return explicit;
    const active = document.querySelector('.template-chip.active[id^="tpl-"]');
    return active ? active.id.slice(4) : 'sauna';
  }
  function syncTemplateType() {
    const type = activeTemplateType();
    input('nqType', type);
    return type;
  }
  function rowSell(row, hoursKey) {
    const qty = Number(row && (hoursKey ? row.hours : row.qty)) || 0;
    const cost = Number(row && (row.cost != null ? row.cost : row.rate)) || 0;
    return qty * cost * (1 + (Number(row && row.markup) || 0) / 100);
  }
  function savedQuoteMath(q) {
    const materials = (q.materials || []).reduce((sum, row) => sum + rowSell(row, false), 0);
    const labour = (q.labour || []).reduce((sum, row) => sum + rowSell(row, true), 0);
    const subbies = (q.subbies || []).reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
    const other = (q.other || []).reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
    const overhead = Number(q.overheadCost) || 0;
    const subtotal = Number(q.subtotal) || materials + labour + subbies + other + overhead;
    const contingency = Number(q.contingencyAmt) || subtotal * (Number(q.contingency) || 0) / 100;
    const profit = Number(q.profitAmt) || (subtotal + contingency) * (Number(q.profitPct) || 0) / 100;
    const gst = Number(q.gst) || (subtotal + contingency + profit) * 0.1;
    return {materials, labour, subbies, other, overhead, subtotal, contingency, profit, gst, total:subtotal + contingency + profit + gst};
  }
  function quoteAudit(q) {
    const materials = q.materials || [];
    const labour = q.labour || [];
    const subbies = q.subbies || [];
    const other = q.other || [];
    const names = materials.map(row => row.item || '').concat(labour.map(row => row.worker || ''), subbies.map(row => row.trade || ''), other.map(row => row.item || '')).join(' ').toLowerCase();
    const scope = String(q.scope || '').trim();
    const issues = [];
    const checks = [];
    const kevinRows = labour.filter(row => String(row.worker || '').trim().toLowerCase() === 'kevin');
    const kevinHours = kevinRows.reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const kevinCost = kevinRows.reduce((sum, row) => sum + (Number(row.hours) || 0) * (Number(row.cost != null ? row.cost : row.rate) || 0), 0);
    const kevinRate = kevinHours ? kevinCost / kevinHours : 0;
    const crewHours = labour.reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const minimumRate = getOverheadCalculations().withProfit;
    const math = savedQuoteMath(q);
    const savedTotal = Number(q.grandTotal) || 0;
    const mathDelta = savedTotal && math.total ? math.total - savedTotal : 0;

    if (!scope) issues.push('Scope is blank — inclusions and exclusions cannot be checked.');
    if (!kevinHours) issues.push('No Kevin labour hours are recorded.');
    else if (kevinRate < minimumRate) issues.push('Kevin is entered at $'+kevinRate.toFixed(0)+'/hr, below the $'+minimumRate.toFixed(0)+'/hr business minimum.');
    if (!materials.length) issues.push('No material lines are recorded.');
    if (!labour.length) issues.push('No labour lines are recorded.');
    if (!subbies.length && !other.length) checks.push('No subcontractor or other-cost lines — confirm none are needed.');
    if (scope && /demol|remove|strip[- ]?out|existing/.test(scope.toLowerCase()) && !/demol|remove|rubbish|waste|skip/.test(names)) checks.push('Scope mentions removal/demolition, but no disposal line is visible.');
    if (scope && /permit|plan|approval/.test(scope.toLowerCase()) && !/permit|plan|approval/.test(names)) checks.push('Scope mentions plans or permits, but no matching priced line is visible.');
    if (scope && /engineer|structural/.test(scope.toLowerCase()) && !/engineer|structural/.test(names)) checks.push('Scope mentions engineering, but no matching priced line is visible.');
    if (scope && /electric|lighting|light/.test(scope.toLowerCase()) && !/electric|lighting|light/.test(names)) checks.push('Scope mentions electrical or lighting, but no matching priced line is visible.');
    if (q.type === 'sauna') {
      if (!/heater/.test(names)) checks.push('No sauna heater is listed.');
      if (!/door/.test(names)) checks.push('No sauna door is listed.');
      if (!/insulation|rockwool|wool/.test(names)) checks.push('No insulation is listed.');
    }
    const markups = materials.map(row => Number(row.markup) || 0);
    if (markups.length && Math.max(...markups) - Math.min(...markups) >= 5) checks.push('Material markup varies from '+Math.min(...markups).toFixed(0)+'% to '+Math.max(...markups).toFixed(0)+'% — confirm that is intentional.');
    const outsideLabour = labour.filter(row => String(row.worker || '').trim().toLowerCase() !== 'kevin');
    if (outsideLabour.length && outsideLabour.every(row => !(Number(row.markup) || 0))) checks.push('Non-Kevin labour has 0% markup — confirm the business is not under-recovering it.');
    if (!q.pricingVersion) checks.push('Older quote record — reopen and save once to lock the current calculation.');
    if (Math.abs(mathDelta) > 0.5) checks.push('Saved total differs from its stored cost breakdown by $'+Math.abs(mathDelta).toFixed(0)+'. Recalculate before relying on it.');
    return {issues, checks, kevinHours, kevinRate, crewHours, minimumRate, math, savedTotal, mathDelta, status:issues.length ? 'needs-review' : checks.length ? 'check' : 'healthy'};
  }
  window.getQuoteAudit = quoteAudit;
  function auditForCurrentQuote() {
    syncCurrentQuoteFromDOM();
    const p = pricing();
    return quoteAudit({type:syncTemplateType(), scope:value('nqScope'), materials:currentQuote.materials, labour:currentQuote.labour, subbies:currentQuote.subbies, other:currentQuote.other, matTotal:p.c.matTotal, labTotal:p.c.labTotal, subTotal:p.c.subTotal, otherTotal:p.c.otherTotal, overheadCost:p.c.overheadCost, subtotal:p.c.subtotal, contingency:p.c.contingency, contingencyAmt:p.c.contingencyAmt, profitPct:p.c.profitPct, profitAmt:p.c.profitAmt, gst:p.c.gst, grandTotal:p.c.grandTotal, pricingVersion:PRICING_VERSION});
  }
  function auditStatusLabel(status) {
    return status === 'needs-review' ? 'Needs review' : status === 'check' ? 'Check items' : 'Looks complete';
  }
  function auditStatusClass(status) {
    return status === 'needs-review' ? 'needs-review' : status === 'check' ? 'check' : 'healthy';
  }
  function renderQuoteHealth() {
    const box = $('chargingCheck');
    if (!box) return;
    const quotes = state.quotes || [];
    if (!quotes.length) {
      if (!state.overhead.configured) return;
      box.innerHTML = '<p class="muted">Save a few jobs and this will check whether the numbers and cost categories are complete enough to rely on.</p>';
      return;
    }
    const audits = quotes.map(quoteAudit);
    const totalKevinHours = audits.reduce((sum, audit) => sum + audit.kevinHours, 0);
    const totalKevinCost = audits.reduce((sum, audit) => sum + audit.kevinHours * audit.kevinRate, 0);
    const averageKevinRate = totalKevinHours ? totalKevinCost / totalKevinHours : 0;
    const crewHours = audits.reduce((sum, audit) => sum + audit.crewHours, 0);
    const exGstRevenue = quotes.reduce((sum, q, i) => sum + (Number(q.exGst) || (Number(q.grandTotal) || audits[i].math.total) - (Number(q.gst) || 0)), 0);
    const reviewCount = audits.filter(audit => audit.status !== 'healthy').length;
    const warning = reviewCount > 0 || (averageKevinRate && averageKevinRate < audits[0].minimumRate);
    let html = '<div class="quote-health-summary '+(warning ? 'needs-review' : 'healthy')+'">';
    html += '<div class="quote-health-head"><div><strong>'+(warning ? '⚠ Saved quotes need review' : '✓ Saved quotes look complete')+'</strong><span>Revenue is not Kevin’s hourly earnings.</span></div><span class="quote-health-status '+(warning ? 'needs-review' : 'healthy')+'">'+reviewCount+' of '+quotes.length+' flagged</span></div>';
    html += '<div class="quote-health-metrics"><div><span>Kevin rate entered</span><b>$'+averageKevinRate.toFixed(0)+'/hr</b></div><div><span>Business minimum</span><b>$'+audits[0].minimumRate.toFixed(0)+'/hr</b></div><div><span>Quote value / crew hr</span><b>$'+(crewHours ? exGstRevenue / crewHours : 0).toFixed(0)+'/hr</b></div></div>';
    html += '<p class="quote-health-explainer">The quote value per crew hour includes materials, other workers, overhead, contingency, profit and GST. It must not be read as Kevin’s take-home rate.</p>';
    html += quotes.map((q, i) => {
      const audit = audits[i];
      const flags = audit.issues.concat(audit.checks).slice(0, 5);
      return '<div class="quote-health-job"><div class="quote-health-job-head"><div><strong>'+escapeHtml(q.client || 'Unnamed job')+'</strong><span>'+escapeHtml(quoteTypeLabel(q.type))+' · '+audit.crewHours+' crew hrs · $'+fmt(q.grandTotal)+'</span></div><span class="quote-health-status '+auditStatusClass(audit.status)+'">'+auditStatusLabel(audit.status)+'</span></div>'+(flags.length ? '<div class="quote-health-flags">'+flags.map(flag => '<span class="quote-health-flag '+(audit.issues.includes(flag) ? 'issue' : '')+'">'+escapeHtml(flag)+'</span>').join('')+'</div>' : '<div class="quote-health-ok">No obvious gaps from the saved data.</div>')+'<button class="btn btn-small btn-outline" onclick="editQuote('+i+')">Review this quote →</button></div>';
    }).join('');
    box.innerHTML = html + '</div>';
  }
  window.renderChargingCheck = renderQuoteHealth;

  function checklistIcon(state) {
    return state === 'done' ? '✓' : state === 'na' ? '–' : state === 'attention' ? '!' : '○';
  }
  function renderChecklist() {
    const box = $('quoteChecklist');
    if (!box) return;
    box.innerHTML = CHECKLIST_ITEMS.map(([key, label]) => {
      const state = activeChecklist[key] || '';
      return '<button type="button" class="check-pill '+(state ? 'is-'+state : '')+'" aria-pressed="'+(state === 'done')+'" title="Tap to cycle: done, not applicable, needs attention" onclick="cycleQuoteChecklist(\''+key+'\')"><span class="check-pill-icon">'+checklistIcon(state)+'</span>'+label+'</button>';
    }).join('');
  }
  window.cycleQuoteChecklist = function (key) {
    const order = ['', 'done', 'na', 'attention'];
    activeChecklist[key] = order[(order.indexOf(activeChecklist[key] || '') + 1) % order.length];
    if (!activeChecklist[key]) delete activeChecklist[key];
    renderChecklist();
    updateReviewAvailability();
  };
  function quoteTypeGroup() {
    return activeTemplateType() === 'sauna' ? 'sauna' : 'reno';
  }
  function lineText() {
    return [...(currentQuote.materials || []), ...(currentQuote.labour || []), ...(currentQuote.subbies || []), ...(currentQuote.other || [])]
      .map(x => String(x.item || x.trade || x.worker || '').toLowerCase()).join(' ');
  }
  function upsellRating(key) {
    const ratings = (state.upsellFeedback || []).filter(item => item.key === key);
    const good = ratings.filter(item => item.rating === 'good').length;
    const bad = ratings.filter(item => item.rating === 'bad').length;
    return {good, bad, rating: bad > good ? 'bad' : good > bad ? 'good' : (good || bad ? 'neutral' : '')};
  }
  function upsellFeedbackSummary() {
    return UPSELL_LIBRARY[quoteTypeGroup()].map(idea => {
      const rating = upsellRating(idea.key);
      return {key:idea.key, label:idea.label, good:rating.good, bad:rating.bad, rating:rating.rating || 'unrated', count:rating.good + rating.bad};
    });
  }
  function renderUpsellCard(idea, rating) {
    const selected = selectedUpsells.includes(idea.key);
    return '<div class="upsell-row '+(rating.rating ? 'rated-'+rating.rating : '')+'">'
      +'<button type="button" class="upsell-pill '+(selected ? 'selected' : '')+'" title="'+escapeHtml(idea.reason)+'" onclick="toggleUpsellIdea(\''+idea.key+'\')">💡 '+escapeHtml(idea.label)+(selected ? ' ✓' : '')+'<small>'+escapeHtml(idea.reason)+'</small></button>'
      +'<div class="upsell-rating" aria-label="Rate this upsell idea">'
      +'<button type="button" class="upsell-rate '+(rating.rating === 'good' ? 'active-good' : '')+'" aria-pressed="'+(rating.rating === 'good')+'" onclick="rateUpsellIdea(\''+idea.key+'\', \'good\')" title="Useful suggestion">👍 Good</button>'
      +'<button type="button" class="upsell-rate '+(rating.rating === 'bad' ? 'active-bad' : '')+'" aria-pressed="'+(rating.rating === 'bad')+'" onclick="rateUpsellIdea(\''+idea.key+'\', \'bad\')" title="Not useful for this business">👎 Bad</button>'
      +'</div></div>';
  }
  function renderUpsells() {
    const box = $('quoteUpsells');
    if (!box) return;
    const text = lineText();
    const ideas = UPSELL_LIBRARY[quoteTypeGroup()].filter(idea => {
      if (idea.key === 'sauna-premium-heater') return !/heater/.test(text);
      if (idea.key === 'sauna-lighting') return !/light|led/.test(text);
      if (idea.key === 'sauna-care-kit') return !/oil|care|maintenance/.test(text);
      if (idea.key === 'sauna-accessories') return !/bucket|ladle/.test(text);
      if (idea.key === 'reno-lighting') return !/light|electrical/.test(text);
      if (idea.key === 'reno-final-clean') return !/clean|rubbish|waste/.test(text);
      if (idea.key === 'reno-storage') return /renov|kitchen|bathroom|garage|alfresco|deck/.test((value('nqScope')+' '+text).toLowerCase());
      return true;
    });
    if (!ideas.length && activeTemplateType() === 'sauna' && !/oil|care|maintenance/.test(text)) {
      const careKit = UPSELL_LIBRARY.sauna.find(idea => idea.key === 'sauna-care-kit');
      if (careKit) ideas.push(careKit);
    }
    box.classList.toggle('show', ideas.length > 0);
    if (!ideas.length) {
      if (activeTemplateType() === 'sauna') {
        box.innerHTML = '<div class="quote-upsells-head">Potential upsell ideas <span>Rate these so the list gets smarter</span></div><div class="upsell-row"><button type="button" class="upsell-pill" title="A profitable handover add-on that is easy to explain." onclick="toggleUpsellIdea(\'sauna-care-kit\')">💡 Timber care kit<small>A profitable handover add-on that is easy to explain.</small></button><div class="upsell-rating" aria-label="Rate this upsell idea"><button type="button" class="upsell-rate" aria-pressed="false" onclick="rateUpsellIdea(\'sauna-care-kit\', \'good\')" title="Useful suggestion">👍 Good</button><button type="button" class="upsell-rate" aria-pressed="false" onclick="rateUpsellIdea(\'sauna-care-kit\', \'bad\')" title="Not useful for this business">👎 Bad</button></div></div>';
      } else {
        box.innerHTML = '';
      }
      return;
    }
    ideas.sort((a, b) => {
      const rank = {good:0, neutral:1, '':2, bad:3};
      return (rank[upsellRating(a.key).rating] ?? 2) - (rank[upsellRating(b.key).rating] ?? 2);
    });
    const visible = ideas.filter(idea => upsellRating(idea.key).rating !== 'bad');
    const hidden = ideas.filter(idea => upsellRating(idea.key).rating === 'bad');
    box.innerHTML = '<div class="quote-upsells-head">Potential upsell ideas <span>Rate these so the list gets smarter</span></div>'
      +(visible.length ? visible.map(idea => renderUpsellCard(idea, upsellRating(idea.key))).join('') : '<div class="upsell-empty">All current ideas are hidden. Open Hidden ideas if you want to reconsider one.</div>')
      +(hidden.length ? '<details class="hidden-upsells"><summary>Hidden ideas ('+hidden.length+')</summary>'+hidden.map(idea => renderUpsellCard(idea, upsellRating(idea.key))).join('')+'</details>' : '');
  }
  window.toggleUpsellIdea = function (key) {
    selectedUpsells = selectedUpsells.includes(key) ? selectedUpsells.filter(x => x !== key) : [...selectedUpsells, key];
    renderUpsells();
  };
  window.rateUpsellIdea = function (key, rating) {
    if (!['good', 'bad'].includes(rating) || !UPSELL_LIBRARY[quoteTypeGroup()].some(idea => idea.key === key)) return;
    state.upsellFeedback = Array.isArray(state.upsellFeedback) ? state.upsellFeedback : [];
    const quoteRef = value('nqQuoteNumber') || (editingQuoteId !== null ? String(editingQuoteId) : 'draft');
    const existing = state.upsellFeedback.find(item => item.key === key && item.quoteRef === quoteRef);
    const record = {key, rating, quoteRef, quoteType:quoteTypeGroup(), updatedAt:new Date().toISOString()};
    if (existing) Object.assign(existing, record);
    else state.upsellFeedback.push(record);
    if (rating === 'bad') selectedUpsells = selectedUpsells.filter(item => item !== key);
    saveState();
    renderUpsells();
    showToast(rating === 'good' ? 'Marked as a useful idea.' : 'Hidden from the main list.', rating === 'good' ? 'success' : 'info');
  };

  function pricing() {
    const c = calculateJobTotals();
    const exGst = c.subtotal + c.contingencyAmt + c.profitAmt;
    const rounding = Number(value('nqRounding')) || 0;
    const total = rounding ? Math.round((exGst * 1.1) / rounding) * rounding : exGst * 1.1;
    const finalExGst = total / 1.1;
    return { c, exGst: finalExGst, gst: total - finalExGst, total, rounding, customerTotals: customerCategoryTotals(finalExGst, c.matTotal, c.labTotal) };
  }
  window.getQuotePricing = pricing;

  function customerCategoryTotals(exGst, directMaterials, directLabour) {
    const target = Math.max(0, Number(exGst) || 0);
    const materials = Math.max(0, Number(directMaterials) || 0);
    const labour = Math.max(0, Number(directLabour) || 0);
    const direct = materials + labour;
    if (!direct) return {materials:0, labour:target};
    if (target < direct) {
      const scaledMaterials = target * (materials / direct);
      return {materials:scaledMaterials, labour:target - scaledMaterials};
    }
    const uplift = target - direct;
    const materialUplift = uplift * (materials / direct);
    return {materials:materials + materialUplift, labour:labour + (uplift - materialUplift)};
  }

  function displayPricing() {
    const p = pricing();
    if ($('sideGrandTotal')) $('sideGrandTotal').textContent = money(p.total);
    if ($('sideExGst')) $('sideExGst').textContent = money(p.exGst);
    if ($('sideGst')) $('sideGst').textContent = money(p.gst);
    if ($('sideTotalIncGst')) $('sideTotalIncGst').textContent = money(p.total);
    if ($('mobileGrandTotal')) $('mobileGrandTotal').textContent = money(p.total);
    if ($('customerSummaryMaterials')) $('customerSummaryMaterials').textContent = money(p.customerTotals.materials);
    if ($('customerSummaryLabour')) $('customerSummaryLabour').textContent = money(p.customerTotals.labour);
    if ($('customerSummaryExGst')) $('customerSummaryExGst').textContent = money(p.exGst);
    if ($('customerSummaryGst')) $('customerSummaryGst').textContent = money(p.gst);
    if ($('customerSummaryTotal')) $('customerSummaryTotal').textContent = money(p.total);
    updateWarnings();
    renderChecklist();
    renderUpsells();
    updateReviewAvailability();
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
  function nextQuoteNumber() {
    const year = new Date().getFullYear();
    const used = (state.quotes || []).map(q => String(q.quoteNumber || '').match(new RegExp('^Q-' + year + '-(\\d+)$'))).filter(Boolean).map(m => Number(m[1]));
    return 'Q-' + year + '-' + String((used.length ? Math.max(...used) : 0) + 1).padStart(3, '0');
  }
  function setQuoteFields(q) {
    input('nqQuoteNumber', q && q.quoteNumber || (!editingQuoteId ? nextQuoteNumber() : ''));
    input('nqQuoteDate', q && q.quoteDate || q && q.date || today());
    input('nqValidUntil', q && q.validUntil || (q ? '' : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)));  input('nqStatus', q && q.status || 'Draft');
    input('nqScope', q && q.scope || ''); input('nqExclusions', q && q.exclusions || '');
    input('nqRounding', q && q.rounding || ''); input('nqXeroTaxMode', q && q.xeroTaxMode || 'exclusive');
  }

  function finishSave() {
    const editingId = editingQuoteId;
    syncTemplateType();
    rawSave();
    const q = editingId !== null ? state.quotes.find(x => x.id === editingId) : state.quotes[0];
    if (!q) return;
    const p = pricing();
    Object.assign(q, quoteMeta(), { exGst: p.exGst, gst: p.gst, grandTotal: p.total, costedTotal: p.c.grandTotal, pricingVersion: PRICING_VERSION, pricingSavedAt: new Date().toISOString(), checklist: deepClone(activeChecklist), upsellIdeas: deepClone(selectedUpsells) });
    if (!q.quoteNumber) q.quoteNumber = nextQuoteNumber();
    input('nqQuoteNumber', q.quoteNumber);
    saveState(); renderHistory(); renderOverview();
  }
  window.saveQuote = function () {
    const issues = warningList();
    if (issues.length) { showConfirm('This quote needs a quick check:\n\n' + issues.join('\n') + '\n\nSave it anyway?', finishSave); return; }
    finishSave();
  };

  function renderQuoteAuditBanner(q) {
    const box = $('quoteAuditBanner');
    if (!box) return;
    if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const audit = quoteAudit(q);
    if (audit.status === 'healthy') { box.style.display = 'none'; box.innerHTML = ''; return; }
    const top = audit.issues.concat(audit.checks).slice(0, 3);
    box.innerHTML = '<strong>Quote audit: '+escapeHtml(auditStatusLabel(audit.status))+'</strong><span>This saved quote needs a review before you rely on the total.</span><div>'+top.map(item => '<span class="quote-audit-inline-pill '+(audit.issues.includes(item) ? 'issue' : '')+'">'+escapeHtml(item)+'</span>').join('')+'</div>'+(audit.status === 'check' || !q.pricingVersion ? '<button class="btn btn-small btn-outline" type="button" onclick="saveRecalculatedQuote()">Recalculate & save this quote</button>' : '');
    box.style.display = 'block';
  }
  window.saveRecalculatedQuote = function () {
    if (editingQuoteId === null) return;
    window.saveQuote();
  };

  function copyText(text, btn) {
    const done = () => flashCopied(btn);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  window.copyCustomerSummary = function (btn) {
    const p = pricing(), meta = quoteMeta();
    const subtotalLabel = meta.xeroTaxMode === 'inclusive' ? 'Subtotal (GST inclusive view)' : 'Subtotal (ex GST)';
    const subtotalValue = meta.xeroTaxMode === 'inclusive' ? p.total : p.exGst;
    copyText((value('nqClient') || 'Job') + ' — customer-facing Xero figures\n' +
      'Materials\t' + money(p.customerTotals.materials) + '\n' +
      'Labour\t' + money(p.customerTotals.labour) + '\n' +
      subtotalLabel + '\t' + money(subtotalValue) + '\nGST (10%)\t' + money(p.gst) + '\nTotal (inc GST)\t' + money(p.total), btn);
  };
  window.copyXeroTotal = window.copyCustomerSummary;
  window.copyQuote = function (btn) {
    const p = pricing(), c = p.c;
    copyText((value('nqClient') || 'Job') + ' — detailed costing\nMaterials\t' + money(c.matTotal) + '\nLabour\t' + money(c.labTotal) + '\nOverhead\t' + money(c.overheadCost) + '\nSubbies + other\t' + money(c.subTotal + c.otherTotal) + '\nContingency\t' + money(c.contingencyAmt) + '\nProfit\t' + money(c.profitAmt) + '\nSubtotal (ex GST)\t' + money(p.exGst) + '\nGST (10%)\t' + money(p.gst) + '\nTotal (inc GST)\t' + money(p.total), btn);
  };

  function historicalQuoteBreakdowns() {
    return (state.quotes || []).map(q => ({
      type: q.type === 'sauna' ? 'sauna' : 'reno',
      date: q.date || '',
      totalHours: Number(q.totalHours) || 0,
      materials: (q.materials || []).map(m => ({item:m.item || '', qty:Number(m.qty) || 0, amount:(Number(m.qty)||0) * (Number(m.cost)||0) * (1 + (Number(m.markup)||0) / 100)})),
      labour: (q.labour || []).map(l => {
        const payRate = Number(l.cost != null ? l.cost : l.rate) || 0;
        const markupPct = Number(l.markup) || 0;
        const sellRate = payRate * (1 + markupPct / 100);
        return {worker:l.worker || '', hours:Number(l.hours) || 0, payRate, markupPct, sellRate, sell:(Number(l.hours)||0) * sellRate};
      }),
      totals: {materials:Number(q.matTotal)||0, labour:Number(q.labTotal)||0, overhead:Number(q.overheadCost)||0, contingencyPct:Number(q.contingency)||0, contingency:Number(q.contingencyAmt)||0, profitPct:Number(q.profitPct)||0, profit:Number(q.profitAmt)||0, total:Number(q.grandTotal)||0}
    }));
  }
  function reviewPayload() {
    syncCurrentQuoteFromDOM();
    const p = pricing();
    const audit = auditForCurrentQuote();
    return {
      jobType: quoteTypeGroup(),
      scope: value('nqScope'),
      checklist: deepClone(activeChecklist),
      materials: (currentQuote.materials || []).map(m => ({item:m.item || '', qty:Number(m.qty)||0, unit:m.unit || '', sell:(Number(m.qty)||0) * (Number(m.cost)||0) * (1 + (Number(m.markup)||0) / 100)})),
      labour: (currentQuote.labour || []).map(l => {
        const payRate = Number(l.cost != null ? l.cost : l.rate) || 0;
        const markupPct = Number(l.markup) || 0;
        const sellRate = payRate * (1 + markupPct / 100);
        return {worker:l.worker || '', hours:Number(l.hours)||0, payRate, markupPct, sellRate, sell:(Number(l.hours)||0) * sellRate};
      }),
      totals: {materials:p.c.matTotal, labour:p.c.labTotal, subbies:p.c.subTotal, other:p.c.otherTotal, overhead:p.c.overheadCost, contingencyPct:p.c.contingency, contingency:p.c.contingencyAmt, profitPct:p.c.profitPct, profit:p.c.profitAmt, exGst:p.exGst, gst:p.gst, total:p.total},
      previousQuotes: historicalQuoteBreakdowns(),
      upsellFeedback: upsellFeedbackSummary(),
      audit: audit.issues.concat(audit.checks),
      selectedUpsells: deepClone(selectedUpsells)
    };
  }
  function reviewInput() {
    syncCurrentQuoteFromDOM();
    const p = pricing();
    return {
      version: PRICING_VERSION,
      type: syncTemplateType(),
      scope: value('nqScope'),
      exclusions: value('nqExclusions'),
      settings: {
        contingency: value('nqContingency'),
        profit: value('nqProfit'),
        overheadPct: value('nqOverheadPct'),
        rounding: value('nqRounding'),
        xeroTaxMode: value('nqXeroTaxMode'),
        overhead: state.overhead ? {configured:!!state.overhead.configured, weeks:Number(state.overhead.weeks)||0, hoursPerWeek:Number(state.overhead.hoursPerWeek)||0, targetSalary:Number(state.overhead.targetSalary)||0, expenses:deepClone(state.overhead.expenses || [])} : {}
      },
      checklist: deepClone(activeChecklist),
      materials: deepClone(currentQuote.materials || []),
      labour: deepClone(currentQuote.labour || []),
      subbies: deepClone(currentQuote.subbies || []),
      other: deepClone(currentQuote.other || []),
      totals: {materials:p.c.matTotal, labour:p.c.labTotal, subbies:p.c.subTotal, other:p.c.otherTotal, overhead:p.c.overheadCost, contingency:p.c.contingencyAmt, profit:p.c.profitAmt, exGst:p.exGst, gst:p.gst, total:p.total}
    };
  }
  function reviewSignature() {
    const text = JSON.stringify(reviewInput());
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return 'quote-review-v'+PRICING_VERSION+'-'+(hash >>> 0).toString(16);
  }
  function cachedReview(signature) {
    const cache = state.aiReviews;
    return cache && typeof cache === 'object' && !Array.isArray(cache) ? cache[signature] : null;
  }
  function saveReviewResult(signature, result, title) {
    state.aiReviews = state.aiReviews && typeof state.aiReviews === 'object' && !Array.isArray(state.aiReviews) ? state.aiReviews : {};
    state.aiReviews[signature] = {signature, result:deepClone(result), title:title || 'AI quote review', reviewedAt:new Date().toISOString()};
    saveState();
    reviewState = {signature, result, title:title || 'AI quote review'};
  }
  function reviewButtons() {
    return document.querySelectorAll('button[onclick="runQuoteReview()"]');
  }
  function updateReviewAvailability() {
    const signature = reviewSignature();
    const cached = cachedReview(signature);
    if (cached && reviewState.signature !== signature) {
      reviewState = {signature, result:cached.result, title:cached.title || 'AI quote review'};
      renderReview(cached.result, reviewState.title);
    } else if (!cached && reviewState.signature && reviewState.signature !== signature) {
      reviewState = {signature:'', result:null, title:''};
      if ($('quoteReview')) { $('quoteReview').classList.remove('show'); $('quoteReview').innerHTML = ''; }
    }
    const busy = !!window.runQuoteReview.busy;
    reviewButtons().forEach(button => {
      button.disabled = busy || !!cached;
      button.title = cached ? 'Already checked — change the quote to check again' : 'AI Check this quote';
      button.setAttribute('aria-label', cached ? 'AI check already completed for this quote version' : 'AI Check this quote');
    });
    const status = $('quoteReviewStatus');
    if (status) status.textContent = busy ? 'Reviewing this quote…' : cached ? 'Already checked for this quote. Change a costing, scope or checklist item to check again.' : 'One check per quote version. Change the quote to check again.';
  }
  window.refreshQuoteReview = updateReviewAvailability;
  function localReview() {
    const payload = reviewPayload();
    const audit = auditForCurrentQuote();
    const lineNames = payload.materials.map(x => x.item).concat(payload.labour.map(x => x.worker)).join(' ').toLowerCase();
    const scope = payload.scope.toLowerCase();
    const missing = [...audit.issues];
    const risks = [...audit.checks];
    if (/demol|remove|strip[- ]?out|existing/.test(scope) && !/demol|remove|rubbish|waste|skip/.test(lineNames)) missing.push('Demolition or disposal is mentioned but not priced.');
    if (/permit|plan|approval|engineer/.test(scope) && !/permit|plan|approval|engineer/.test(lineNames)) missing.push('Plans, permits, or engineering are mentioned but not priced.');
    if (payload.jobType === 'sauna') {
      if (!/heater/.test(lineNames)) missing.push('No sauna heater appears in the materials.');
      if (!/door/.test(lineNames)) missing.push('No sauna door appears in the materials.');
      if (!/insulation|rockwool|wool/.test(lineNames)) missing.push('No insulation appears in the materials.');
    }
    if (payload.totals.profitPct < 20) risks.push('Profit setting is below 20% — check that this is intentional.');
    Object.keys(payload.checklist).forEach(key => { if (payload.checklist[key] === 'attention') risks.push((CHECKLIST_ITEMS.find(x => x[0] === key) || ['', key])[1]+' is marked for attention.'); });
    const materialCounts = {};
    payload.previousQuotes.forEach(q => q.materials.forEach(m => { const key = m.item.trim().toLowerCase(); if (key) materialCounts[key] = (materialCounts[key] || 0) + 1; }));
    const repeated = Object.entries(materialCounts).filter(([, count]) => count >= 2).sort((a,b) => b[1] - a[1]).slice(0, 4).map(([item,count]) => item+' appeared in '+count+' previous jobs.');
    return {missing, risks, patterns:repeated, upsells:UPSELL_LIBRARY[quoteTypeGroup()].slice(0, 3).map(x => ({label:x.label, reason:x.reason})), local:true};
  }
  function renderReview(review, title) {
    const box = $('quoteReview');
    if (!box) return;
    const section = (heading, items, className) => Array.isArray(items) && items.length ? '<div class="review-card-section"><strong>'+heading+'</strong><div>'+items.map(x => '<span class="review-pill '+(className || '')+'">'+escapeHtml(typeof x === 'string' ? x : x.label || '')+(x.reason ? '<small> · '+escapeHtml(x.reason)+'</small>' : '')+'</span>').join('')+'</div></div>' : '';
    box.innerHTML = '<h3>'+escapeHtml(title || 'Quote review')+'</h3><div class="muted">These are prompts to consider, not automatic changes.</div>' + section('Worth checking', review.missing, 'warning') + section('Potential risks', review.risks, 'warning') + section('Patterns from previous jobs', review.patterns, 'good') + section('Potential upsells', review.upsells, 'good');
    box.classList.add('show');
  }
  function setReviewBusy(busy) {
    reviewButtons().forEach(button => {
      if (busy) {
        if (!button.dataset.reviewLabel) button.dataset.reviewLabel = button.textContent;
        button.disabled = true;
        button.textContent = button.title === 'AI Check this quote' ? '⏳' : '⏳ Reviewing…';
      } else {
        button.disabled = false;
        if (button.dataset.reviewLabel) button.textContent = button.dataset.reviewLabel;
      }
    });
  }
  async function aiRequestHeaders() {
    const headers = {'Content-Type':'application/json'};
    if (window.getQuoteAiIdToken) {
      const token = await window.getQuoteAiIdToken();
      if (token) headers.Authorization = 'Bearer ' + token;
    }
    return headers;
  }
  window.runQuoteReview = async function () {
    if (window.runQuoteReview.busy) return;
    const signature = reviewSignature();
    const cached = cachedReview(signature);
    if (cached) {
      reviewState = {signature, result:cached.result, title:cached.title || 'AI quote review'};
      renderReview(cached.result, reviewState.title);
      updateReviewAvailability();
      showToast('This quote version has already been checked. Change the quote before checking again.', 'info');
      return;
    }
    renderUpsells();
    const local = localReview();
    reviewState = {signature, result:local, title:AI_REVIEW_ENDPOINT ? 'Checking with AI…' : 'Quick quote review'};
    renderReview(local, AI_REVIEW_ENDPOINT ? 'Checking with AI…' : 'Quick quote review');
    if (!AI_REVIEW_ENDPOINT) {
      saveReviewResult(signature, local, 'Quick quote review');
      updateReviewAvailability();
      showToast('Quick checks are ready. Connect the secure AI endpoint for deeper suggestions.', 'info');
      return;
    }
    window.runQuoteReview.busy = true;
    setReviewBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const response = await fetch(AI_REVIEW_ENDPOINT, {method:'POST', headers:await aiRequestHeaders(), body:JSON.stringify(reviewPayload()), signal:controller.signal});
      clearTimeout(timeout);
      if (!response.ok) throw new Error('AI review returned '+response.status);
      const aiReview = await response.json();
      const result = {
        ...local,
        missing: aiReview.missing || aiReview.missingItems || local.missing,
        risks: aiReview.risks || aiReview.riskFlags || local.risks,
        patterns: aiReview.patterns || aiReview.marginFlags || local.patterns,
        upsells: aiReview.upsells || aiReview.upsellSuggestions || local.upsells
      };
      saveReviewResult(signature, result, 'AI quote review');
      renderReview(result, 'AI quote review');
    } catch (error) {
      renderReview(local, 'Quick quote review');
      showToast('AI review is unavailable, so the quick checks are shown instead.', 'info');
    } finally {
      window.runQuoteReview.busy = false;
      setReviewBusy(false);
      updateReviewAvailability();
    }
  };

  // ===== FEEDBACK / REQUESTS =====
  const FEEDBACK_APP_VERSION = 'feedback-v1';
  let feedbackEditingId = null;
  let feedbackDraftContext = null;
  let feedbackDraftType = 'Feature request';

  function feedbackContext() {
    const active = document.querySelector('.tab.active');
    return {
      screen: active ? active.id.replace(/^tab-/, '') : 'unknown',
      quoteType: activeTemplateType(),
      materialLines: (currentQuote.materials || []).length,
      labourLines: (currentQuote.labour || []).length,
      appVersion: FEEDBACK_APP_VERSION
    };
  }
  function feedbackDate(valueToFormat) {
    if (!valueToFormat) return 'Date unknown';
    const date = new Date(valueToFormat);
    return Number.isNaN(date.getTime()) ? String(valueToFormat) : date.toLocaleDateString(undefined, {day:'numeric', month:'short', year:'numeric'});
  }
  function feedbackContextLabel(context) {
    if (!context) return '';
    const bits = [];
    if (context.screen) bits.push('Screen: ' + context.screen);
    if (context.quoteType) bits.push('Quote: ' + (context.quoteType === 'reno-general' ? 'Basic Reno' : context.quoteType));
    if (context.materialLines != null) bits.push(context.materialLines + ' material lines');
    if (context.labourLines != null) bits.push(context.labourLines + ' labour lines');
    return bits.join(' · ');
  }
  function feedbackTypeClass(type) {
    if (type === 'Bug / something broken') return 'bug';
    if (type === 'Feature request') return 'feature';
    if (type === 'Upsell idea') return 'upsell';
    return 'note';
  }
  function feedbackStatusOptions(status) {
    return ['Open', 'Planned', 'Done', "Won't do"].map(option => '<option '+(option === status ? 'selected' : '')+'>'+option+'</option>').join('');
  }
  function renderFeedbackContext(context) {
    const box = $('feedbackContext');
    if (!box) return;
    const label = feedbackContextLabel(context);
    box.innerHTML = label ? '<span class="feedback-context-label">Auto-context</span><span class="feedback-context-pill">'+escapeHtml(label)+'</span><small>Customer names and locations are not included.</small>' : '';
  }
  function clearFeedbackForm() {
    input('feedbackDescription', '');
    feedbackEditingId = null;
    feedbackDraftContext = null;
    feedbackDraftType = 'Feature request';
  }
  window.newFeedbackRequest = function (type, context) {
    feedbackEditingId = null;
    feedbackDraftContext = context || feedbackContext();
    feedbackDraftType = type || 'Feature request';
    const form = $('feedbackForm');
    if (form) { form.style.display = 'block'; form.scrollIntoView({behavior:'smooth', block:'nearest'}); }
    if ($('feedbackFormHeading')) $('feedbackFormHeading').textContent = 'Write a request';
    input('feedbackDescription', '');
    setTimeout(() => $('feedbackDescription') && $('feedbackDescription').focus(), 0);
  };
  window.openFeedbackFromQuote = function () {
    const context = feedbackContext();
    switchTab('feedback');
    window.newFeedbackRequest('Bug / something broken', context);
  };
  window.cancelFeedbackRequest = function () {
    const form = $('feedbackForm');
    clearFeedbackForm();
    if (form) form.style.display = 'block';
  };
  window.saveFeedbackRequest = function () {
    const description = value('feedbackDescription');
    if (!description) { showToast('Write a request first.', 'info'); $('feedbackDescription') && $('feedbackDescription').focus(); return; }
    state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
    const now = new Date().toISOString();
    const existing = feedbackEditingId ? state.feedback.find(item => item.id === feedbackEditingId) : null;
    const title = description.split(/\n|[.!?]/)[0].trim().slice(0, 120) || 'Request';
    const record = {
      id: feedbackEditingId || 'feedback-' + Date.now(),
      type: existing && existing.type || feedbackDraftType || 'Feature request',
      priority: existing && existing.priority || 'Normal',
      title,
      description,
      status: existing && existing.status || 'Open',
      createdAt: existing && existing.createdAt || now,
      updatedAt: now,
      context: existing && existing.context || feedbackDraftContext || feedbackContext()
    };
    if (existing) Object.assign(existing, record);
    else state.feedback.unshift(record);
    saveState();
    renderFeedback();
    window.cancelFeedbackRequest();
    showToast(existing ? 'Feedback updated.' : 'Feedback saved.', 'success');
  };
  window.editFeedbackRequest = function (id) {
    const item = (state.feedback || []).find(record => record.id === id);
    if (!item) return;
    feedbackEditingId = id;
    feedbackDraftContext = item.context || null;
    feedbackDraftType = item.type || 'Feature request';
    if ($('feedbackForm')) $('feedbackForm').style.display = 'block';
    if ($('feedbackFormHeading')) $('feedbackFormHeading').textContent = 'Write a request';
    input('feedbackDescription', item.description || '');
    setTimeout(() => $('feedbackDescription') && $('feedbackDescription').focus(), 0);
  };
  window.updateFeedbackStatus = function (id, status) {
    const item = (state.feedback || []).find(record => record.id === id);
    if (!item) return;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    saveState();
    renderFeedback();
  };
  window.deleteFeedbackRequest = function (id) {
    const item = (state.feedback || []).find(record => record.id === id);
    if (!item) return;
    showConfirm('Delete this feedback request?', function () {
      state.feedback = (state.feedback || []).filter(record => record.id !== id);
      saveState();
      renderFeedback();
      showToast('Feedback deleted.', 'info');
    });
  };
  window.renderFeedback = function () {
    const list = $('feedbackList');
    if (!list) return;
    const items = state.feedback || [];
    if (!items.length) {
      list.innerHTML = '<div class="empty-state">No requests saved yet. Capture the next idea or problem while it is fresh.</div>';
      return;
    }
    list.innerHTML = items.map(item => {
      const safeStatus = item.status || 'Open';
      const safeType = item.type || 'Other';
      return '<article class="feedback-item">'
        +'<div class="feedback-item-top"><div class="feedback-tags"><span class="feedback-tag '+feedbackTypeClass(safeType)+'">Request</span><span class="feedback-tag">'+escapeHtml(safeStatus)+'</span></div><span class="feedback-date">'+escapeHtml(feedbackDate(item.updatedAt || item.createdAt))+'</span></div>'
        +'<p>'+escapeHtml(item.description || '')+'</p>'
        +'</article>';
    }).join('');
  };

  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  window.printClientQuote = function (job) {
    const current = pricing();
    const q = job || { client:value('nqClient') || 'Customer', location:value('nqLocation'), materials:deepClone(currentQuote.materials), labour:deepClone(currentQuote.labour), ...quoteMeta() };
    const p = job ? {
      exGst:Number(job.exGst != null ? job.exGst : (job.grandTotal || 0) / 1.1),
      gst:Number(job.gst != null ? job.gst : (job.grandTotal || 0) - (job.grandTotal || 0) / 1.1),
      total:Number(job.grandTotal || 0),
      customerTotals:customerCategoryTotals(Number(job.exGst != null ? job.exGst : (job.grandTotal || 0) / 1.1), job.matTotal, job.labTotal)
    } : { exGst:current.exGst, gst:current.gst, total:current.total, customerTotals:current.customerTotals };
    const w = window.open('', '_blank'); if (!w) return showToast('Allow pop-ups to create the customer quote.', 'error');
    w.document.write('<!doctype html><html><head><title>Quote '+escapeHtml(q.quoteNumber || '')+'</title><style>body{font:15px Arial,sans-serif;color:#202a32;max-width:760px;margin:auto;padding:42px}h1{color:#142b3e;margin-bottom:4px}.muted{color:#65727d}.meta{display:flex;gap:12px;flex-wrap:wrap}.quote-head{border-bottom:2px solid #142b3e;padding-bottom:16px}table{width:100%;border-collapse:collapse;margin:25px 0}th,td{padding:10px;border-bottom:1px solid #dbe1e5;text-align:left}.r{text-align:right}.total{font-weight:bold;font-size:18px}.box{background:#f4f8f7;padding:16px;margin:20px 0;white-space:pre-line}.summary-note{color:#65727d;font-size:13px;margin-top:24px}@media print{button{display:none}body{padding:15px}}</style></head><body><button onclick="print()">Print / Save PDF</button><div class="quote-head"><h1>QUOTE</h1><div class="meta muted"><span>'+escapeHtml(q.quoteNumber || 'Draft quote')+'</span><span>Issued '+escapeHtml(q.quoteDate || q.date || today())+'</span>'+(q.validUntil ? '<span>Valid until '+escapeHtml(q.validUntil)+'</span>' : '')+'</div><h2>'+escapeHtml(q.client || 'Customer')+'</h2>'+(q.location ? '<div class="muted">'+escapeHtml(q.location)+'</div>' : '')+'</div>'+(q.scope ? '<div class="box"><strong>Scope of work</strong><br>'+escapeHtml(q.scope)+'</div>' : '')+'<p class="summary-note">Pricing is shown as simple customer-facing categories. Internal overhead, contingency and profit are included in the figures.</p><table><tr><th>Description</th><th class="r">Amount</th></tr><tr><td>Materials</td><td class="r">'+money(p.customerTotals.materials)+'</td></tr><tr><td>Labour</td><td class="r">'+money(p.customerTotals.labour)+'</td></tr><tr><td>Subtotal ex GST</td><td class="r">'+money(p.exGst)+'</td></tr><tr><td>GST (10%)</td><td class="r">'+money(p.gst)+'</td></tr><tr class="total"><td>Total including GST</td><td class="r">'+money(p.total)+'</td></tr></table>'+(q.exclusions ? '<div class="box"><strong>Notes and exclusions</strong><br>'+escapeHtml(q.exclusions)+'</div>' : '')+'<p class="muted">Thank you for the opportunity to quote this work.</p></body></html>'); w.document.close();
  };

  window.selectTemplate = function (type) {
    // Some browsers restore hidden form fields without their original value.
    // Set the type explicitly so pricing, audits and upsell logic stay aligned
    // with the template the user just chose.
    input('nqType', type);
    if (rawSelect) rawSelect(type);
    input('nqType', type);
    activeChecklist = {};
    selectedUpsells = [];
    if ($('quoteReview')) $('quoteReview').classList.remove('show');
    renderChecklist();
    renderUpsells();
    reviewState = {signature:'', result:null, title:''};
    updateReviewAvailability();
  };
  document.addEventListener('click', event => {
    const chip = event.target.closest && event.target.closest('.template-chip[id^="tpl-"]');
    if (!chip) return;
    input('nqType', chip.id.slice(4));
    setTimeout(renderUpsells, 0);
  });
  window.loadQuoteIntoForm = function (q) {
    rawLoad(q);
    setQuoteFields(q);
    activeChecklist = deepClone(q && q.checklist || {});
    selectedUpsells = deepClone(q && q.upsellIdeas || []);
    if ($('quoteReview')) $('quoteReview').classList.remove('show');
    renderChecklist();
    recalcQuote();
    renderQuoteAuditBanner(q);
    reviewState = {signature:'', result:null, title:''};
    updateReviewAvailability();
  };
  window.newQuoteFresh = function () {
    activeChecklist = {};
    selectedUpsells = [];
    rawNew();
    setQuoteFields(null);
    if ($('quoteReview')) $('quoteReview').classList.remove('show');
    renderChecklist();
    recalcQuote();
    renderQuoteAuditBanner(null);
    reviewState = {signature:'', result:null, title:''};
    updateReviewAvailability();
  };
  window.refreshUpsellIdeas = renderUpsells;
  document.addEventListener('input', event => {
    if (['nqScope', 'nqExclusions'].includes(event.target && event.target.id)) updateReviewAvailability();
  });
  document.addEventListener('change', event => {
    if (['nqContingency', 'nqProfit', 'nqOverheadPct', 'nqRounding', 'nqXeroTaxMode'].includes(event.target && event.target.id)) updateReviewAvailability();
  });
  setTimeout(() => {
    syncTemplateType();
    renderUpsells();
    updateReviewAvailability();
  }, 0);
  const rawHistory = window.renderHistory;
  window.renderHistory = function () {
    rawHistory();
    document.querySelectorAll('#historyList .card').forEach((card, i) => {
      const q = state.quotes[i];
      if (!q) return;
      const title = card.querySelector('.flex > div');
      const audit = quoteAudit(q);
      if (title) title.insertAdjacentHTML('beforeend', ' <span class="quote-status '+escapeHtml(q.status || 'Draft')+'">'+escapeHtml(q.status || 'Draft')+'</span>' + (q.quoteNumber ? '<span style="font-size:12px;color:#888;margin-left:6px">'+escapeHtml(q.quoteNumber)+'</span>' : '')+'<span class="quote-health-status '+auditStatusClass(audit.status)+'">'+auditStatusLabel(audit.status)+'</span>');
      const buttons = card.querySelector('div[style*="margin-top:6px"]');
      if (buttons) buttons.insertAdjacentHTML('afterbegin', '<button class="btn btn-small btn-outline" onclick="printClientQuote(state.quotes['+i+'])">Customer PDF</button> ');
    });
    if (window.applyHistoryFilters) window.applyHistoryFilters();
  };

  window.applyHistoryFilters = function () {
    const query = value('historySearch').toLowerCase(); const status = value('historyStatusFilter');
    document.querySelectorAll('#historyList .card').forEach((card, i) => { const q = state.quotes[i] || {}; const match = (!query || (q.client || '').toLowerCase().includes(query) || (q.quoteNumber || '').toLowerCase().includes(query)) && (!status || (q.status || 'Draft') === status); card.style.display = match ? '' : 'none'; });
  };
  setQuoteFields(null);
  if (!value('nqType')) input('nqType', 'sauna');
  setQuoteMode(localStorage.getItem('kevinQuoteMode') || 'simple');
  recalcQuote();
  renderHistory();
  renderOverview();
  renderFeedback();
})();
