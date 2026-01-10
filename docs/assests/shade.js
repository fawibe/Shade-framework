(function () {
  const STORAGE_KEY = "shade_v1_answers";
  const VERSION = "1.4";
  let showLowOnly = false;

  const QUESTIONS = [
    { id: "S1", axis: "S", label: "Identification des outils", title: "L’entreprise a-t-elle identifié les outils d’IA utilisés officiellement ?" },
    { id: "S2", axis: "S", label: "Shadow IT", title: "Des outils d’IA sont-ils utilisés sans validation IT ou juridique ?" },
    { id: "S3", axis: "S", label: "Cartographie des usages", title: "Une cartographie des cas d’usage IA (génération, analyse, support, etc.) a-t-elle été réalisée ?" },
    { id: "S4", axis: "S", label: "Données sensibles", title: "Des données sensibles ou confidentielles sont-elles saisies dans des outils IA ?" },
    { id: "S5", axis: "S", label: "Limites connues", title: "Les services ou métiers ont-ils connaissance des limites des outils IA utilisés ?" },
    { id: "S6", axis: "S", label: "Traçabilité", title: "L’entreprise trace-t-elle l’utilisation des IA via ses systèmes d’information ?" },

    { id: "H1", axis: "H", label: "Acceptabilité", title: "Les collaborateurs sont-ils globalement favorables à l’usage de l’IA dans leur travail ?" },
    { id: "H2", axis: "H", label: "Écoute", title: "L’entreprise a-t-elle pris le temps d’écouter les craintes ou objections liées à l’IA ?" },
    { id: "H3", axis: "H", label: "Communication interne", title: "Une communication interne a-t-elle été mise en place sur le positionnement de l’entreprise vis-à-vis de l’IA ?" },
    { id: "H4", axis: "H", label: "Politique IA", title: "Existe-t-il une politique explicite d’encouragement ou de limitation de l’IA ?" },
    { id: "H5", axis: "H", label: "Éthique numérique", title: "L’entreprise promeut-elle une approche éthique et responsable de l’usage de l’IA ?" },
    { id: "H6", axis: "H", label: "Dialogue transverse", title: "Les usages IA font-ils partie des discussions RH, RSE ou managériales ?" },

    { id: "A1", axis: "A", label: "Registre RGPD", title: "Un registre des traitements IA a-t-il été mis en place (ou intégré au registre RGPD) ?" },
    { id: "A2", axis: "A", label: "Conformité RGPD", title: "Les usages IA ont-ils été évalués selon les principes du RGPD ?" },
    { id: "A3", axis: "A", label: "Fuite de données", title: "Les risques liés à la confidentialité ou à la fuite de données sont-ils identifiés ?" },
    { id: "A4", axis: "A", label: "AI Act", title: "L’entreprise a-t-elle évalué son exposition au futur AI Act ?" },
    { id: "A5", axis: "A", label: "Fournisseurs IA", title: "Les fournisseurs d’outils IA (ex. ChatGPT, Gemini, etc.) sont-ils audités pour leur conformité ?" },
    { id: "A6", axis: "A", label: "Incident IA", title: "Des procédures sont-elles prévues en cas d’incident lié à un outil IA ?" },

    { id: "D1", axis: "D", label: "Charte IA", title: "Une charte d’usage de l’IA existe-t-elle ?" },
    { id: "D2", axis: "D", label: "Validation interne", title: "Cette charte a-t-elle été validée par la direction, les RH et/ou le DPO ?" },
    { id: "D3", axis: "D", label: "Co-construction", title: "Les collaborateurs ont-ils été associés à la rédaction de cette charte (ou consultés) ?" },
    { id: "D4", axis: "D", label: "Accessibilité", title: "La charte est-elle connue, accessible et compréhensible par tous ?" },
    { id: "D5", axis: "D", label: "Processus d’approbation", title: "Un processus de validation des outils IA (selon leur risque) est-il défini ?" },
    { id: "D6", axis: "D", label: "Gouvernance", title: "La gouvernance IA (rôles, responsabilités, arbitrage) est-elle clairement établie ?" },

    { id: "E1", axis: "E", label: "Formation initiale", title: "Une formation de base à l’IA (usages, risques, éthique) a-t-elle été dispensée ?" },
    { id: "E2", axis: "E", label: "Montée en compétences", title: "Un programme de montée en compétences IA est-il en cours ou prévu ?" },
    { id: "E3", axis: "E", label: "Sensibilisation Shadow AI", title: "Les risques spécifiques liés à la Shadow AI sont-ils abordés en formation ou communication interne ?" },
    { id: "E4", axis: "E", label: "Guides pratiques", title: "Des supports pratiques sont-ils disponibles pour bien utiliser les IA (guides, FAQ, prompts types…) ?" },
    { id: "E5", axis: "E", label: "Indicateurs", title: "Des indicateurs de pilotage (adoption, conformité, incidents) sont-ils suivis ?" },
    { id: "E6", axis: "E", label: "Revue de la politique", title: "L’entreprise a-t-elle prévu une revue régulière de sa politique IA (audit ou mise à jour) ?" },
  ];

  const AXES = [
    { key: "S", name: "Savoir", desc: "Identifier outils, usages, données, exposition." },
    { key: "H", name: "Harmoniser", desc: "Aligner pratiques, règles, exigences, standards." },
    { key: "A", name: "Anticiper", desc: "Réduire risques, préparer incidents, dépendances." },
    { key: "D", name: "Définir", desc: "Gouvernance, politiques, responsabilités, contrôles." },
    { key: "E", name: "Éduquer", desc: "Former, outiller, accompagner les usages." },
  ];

  const SCORE_LABELS = {
    0: "0 — Absent / non maîtrisé",
    1: "1 — Informel / ad hoc",
    2: "2 — Partiel / en cours",
    3: "3 — Opérationnel / mesuré"
  };

  let state = loadState();

  const acc = document.getElementById("shade-accordion");
  const live = document.getElementById("shade-live");

  renderAccordion();
  bindGlobalButtons();
  applyStateToUI();
  computeAndRender();

  function renderAccordion() {
    acc.innerHTML = "";

    for (const axis of AXES) {
      const axisQuestions = QUESTIONS.filter(q => q.axis === axis.key);

      const headingId = `heading-${axis.key}`;
      const collapseId = `collapse-${axis.key}`;

      const item = document.createElement("div");
      item.className = "accordion-item";

      item.innerHTML = `
        <h2 class="accordion-header" id="${headingId}">
          <button class="accordion-button collapsed shade-acc-btn" type="button"
            data-bs-toggle="collapse" data-bs-target="#${collapseId}"
            aria-expanded="false" aria-controls="${collapseId}">
            <span class="d-flex align-items-center w-100 gap-2">
              <span class="fw-semibold">${axis.name}</span>
              <span class="ms-auto d-inline-flex align-items-center gap-2">
                <span class="badge shade-axis-badge bg-secondary" id="badge-${axis.key}">0/18</span>
              </span>
            </span>
          </button>
        </h2>

        <div id="${collapseId}" class="accordion-collapse collapse"
          aria-labelledby="${headingId}" data-bs-parent="#shade-accordion">
          <div class="accordion-body">
            <div class="small text-muted mb-3">
              Notation : 0 = absent, 1 = informel, 2 = partiel, 3 = opérationnel. Les commentaires restent locaux.
            </div>
            <div class="vstack gap-3" id="list-${axis.key}"></div>
          </div>
        </div>
      `;

      acc.appendChild(item);

      const list = item.querySelector(`#list-${axis.key}`);
      axisQuestions.forEach(q => list.appendChild(renderQuestionCard(q)));
    }
  }

  function renderQuestionCard(q) {
    const card = document.createElement("div");
    card.className = "border rounded-4 bg-white p-3 shadow-sm shade-card";
    card.dataset.qid = q.id;

    card.innerHTML = `
      <div class="d-flex flex-wrap align-items-start gap-2">
        <div class="flex-grow-1">
          <div class="fw-bold">${escapeHtml(q.title)}</div>
          <div class="small text-muted mt-1">${escapeHtml(q.id)} — ${escapeHtml(q.label)}</div>
        </div>

        <div style="min-width: 260px;">
          <label class="small text-muted" for="score-${q.id}">Score</label>
          <select class="form-select" id="score-${q.id}">
            <option value="NA">N/A — Hors périmètre</option>
            ${[0,1,2,3].map(n => `<option value="${n}">${escapeHtml(SCORE_LABELS[n])}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="mt-3">
        <label class="small text-muted" for="comment-${q.id}">Commentaire (local)</label>
        <textarea class="form-control" id="comment-${q.id}" rows="2" placeholder="Contexte, preuve, actions à prévoir..."></textarea>
      </div>
    `;

    const scoreEl = card.querySelector(`#score-${q.id}`);
    const commentEl = card.querySelector(`#comment-${q.id}`);

    scoreEl.addEventListener("change", () => {
      state.answers[q.id] = state.answers[q.id] || { score: 0, comment: "", na: false };

      if (scoreEl.value === "NA") {
        state.answers[q.id].na = true;
        state.answers[q.id].score = 0;
      } else {
        state.answers[q.id].na = false;
        state.answers[q.id].score = parseInt(scoreEl.value, 10);
      }

      saveState();
      computeAndRender();
      announce(`Score mis à jour pour ${q.id}.`);
    });

    commentEl.addEventListener("input", debounce(() => {
      state.answers[q.id] = state.answers[q.id] || { score: 0, comment: "", na: false };
      state.answers[q.id].comment = commentEl.value || "";
      saveState();
      computeAndRender();
      announce(`Commentaire mis à jour pour ${q.id}.`);
    }, 400));

    return card;
  }

  function applyStateToUI() {
    for (const q of QUESTIONS) {
      const a = state.answers[q.id] || { score: 0, comment: "", na: false };
      const scoreEl = document.getElementById(`score-${q.id}`);
      const commentEl = document.getElementById(`comment-${q.id}`);
      if (scoreEl) scoreEl.value = a.na ? "NA" : String(a.score ?? 0);
      if (commentEl) commentEl.value = a.comment ?? "";
    }
    updateLastSaved();
  }

  function computeAndRender() {
    const totals = { S: 0, H: 0, A: 0, D: 0, E: 0 };
    const maxByAxis = { S: 0, H: 0, A: 0, D: 0, E: 0 };

    // max depends on N/A
    for (const q of QUESTIONS) {
      const a = state.answers[q.id] || { score: 0, na: false };
      if (!a.na) maxByAxis[q.axis] += 3;
      totals[q.axis] += (a.score ?? 0);
    }

    const total = Object.values(totals).reduce((a,b)=>a+b,0);
    const totalMax = Object.values(maxByAxis).reduce((a,b)=>a+b,0);

    document.getElementById("score-total").textContent = String(total);
    document.getElementById("score-max").textContent = String(totalMax);

    updateProgressUI(total, totalMax);

    // axis badges + fine color
    for (const axis of AXES) {
      const badge = document.getElementById(`badge-${axis.key}`);
      const score = totals[axis.key];
      const max = maxByAxis[axis.key];
      if (badge) {
        badge.textContent = `${score}/${max}`;
        paintBadgeFine(badge, score, max);
      }
    }

    renderPrioritiesAndInsights(totals, maxByAxis);
    renderRadar(totals, maxByAxis);
    updateAnsweredBadge();
    applyLowScoreFilter();
    paintAnsweredCards();
  }

  function updateProgressUI(total, totalMax) {
    const pb = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    const pct = totalMax > 0 ? Math.round((total / totalMax) * 100) : 0;
    pb.style.width = `${pct}%`;
    pb.setAttribute("aria-valuenow", String(total));
    pb.setAttribute("aria-valuemax", String(totalMax));

    // hue 0..120
    const hue = totalMax > 0 ? Math.round((total / totalMax) * 120) : 0;
    pb.style.backgroundColor = `hsl(${hue}, 85%, 45%)`;

    const ratio = totalMax > 0 ? (total / totalMax) : 0;

    let level = "Initial";
    let message = "Risque élevé de Shadow AI : cartographier les usages, sécuriser les données, définir des règles.";

    if (ratio > 0.25 && ratio <= 0.50) {
      level = "Basique";
      message = "Des bases existent : clarifier gouvernance, validation outils, conformité et communication interne.";
    } else if (ratio > 0.50 && ratio <= 0.75) {
      level = "Structuré";
      message = "Cadre en place : renforcer audits fournisseurs, gestion d’incident et indicateurs de pilotage.";
    } else if (ratio > 0.75) {
      level = "Maîtrisé";
      message = "Bonne maturité : maintenir l’effort, auditer régulièrement, industrialiser formation & KPI.";
    }

    document.getElementById("maturity-label").textContent = level;
    progressText.textContent = `${level} — ${message} (${pct}%)`;
  }

  function paintBadgeFine(el, score, max) {
    if (!max || max <= 0) {
      el.style.backgroundColor = "#adb5bd";
      el.style.color = "#212529";
      return;
    }
    const ratio = score / max;
    const hue = Math.round(ratio * 120);
    el.style.backgroundColor = `hsl(${hue}, 85%, 45%)`;
    el.style.color = (hue >= 55) ? "#0b0f14" : "#ffffff";
  }

  function applyLowScoreFilter() {
    const cards = document.querySelectorAll(".shade-card");
    cards.forEach(card => {
      const qid = card.dataset.qid;
      const a = state.answers[qid] || { score: 0, na: false };
      if (!showLowOnly) { card.style.display = ""; return; }
      card.style.display = (!a.na && (a.score ?? 0) <= 1) ? "" : "none";
    });
  }

  function renderPrioritiesAndInsights(totals, maxByAxis) {
    const list = document.getElementById("priorities-list");
    const meta = document.getElementById("priorities-meta");
    const insights = document.getElementById("axis-insights");
    if (!list || !meta || !insights) return;

    const rows = QUESTIONS.map(q => {
      const a = state.answers[q.id] || { score: 0, na: false };
      return { id:q.id, axis:q.axis, title:q.title, label:q.label, na:!!a.na, score:(a.score ?? 0) };
    }).filter(r => !r.na)
      .sort((a,b) => (a.score - b.score) || a.id.localeCompare(b.id));

    const top = rows.slice(0,5);
    list.innerHTML = "";

    if (!rows.length) {
      list.innerHTML = `<li class="text-muted">Aucune priorité (tout est en N/A).</li>`;
      meta.textContent = "—";
      insights.textContent = "—";
      return;
    }

    top.forEach(r => {
      const axisName = AXES.find(x => x.key === r.axis)?.name || r.axis;
      const sev =
        r.score === 0 ? `<span class="badge bg-danger ms-2">critique</span>` :
        r.score === 1 ? `<span class="badge bg-warning text-dark ms-2">faible</span>` :
        r.score === 2 ? `<span class="badge bg-info text-dark ms-2">moyen</span>` :
                        `<span class="badge bg-success ms-2">ok</span>`;

      const li = document.createElement("li");
      li.className = "mb-2";
      li.innerHTML = `
        <span class="fw-semibold">${escapeHtml(r.id)}</span>
        <span class="text-muted">(${escapeHtml(axisName)})</span> — ${escapeHtml(r.label)} ${sev}
        <div class="text-muted">${escapeHtml(r.title)}</div>
      `;
      list.appendChild(li);
    });

    meta.textContent = `${top.length} / ${rows.length}`;

    // weakest axis
    const ratios = AXES.map(ax => {
      const max = maxByAxis[ax.key];
      const score = totals[ax.key];
      const ratio = max > 0 ? (score / max) : null;
      return { name: ax.name, ratio };
    }).filter(x => x.ratio !== null)
      .sort((a,b) => a.ratio - b.ratio);

    insights.innerHTML = ratios.length
      ? `Axe le plus faible : <strong>${escapeHtml(ratios[0].name)}</strong> — priorité d’amélioration recommandée.`
      : "—";
  }

  function isAnswered(qid) {
    const a = state.answers[qid];
    if (!a) return false;
    const score = Number.isFinite(a.score) ? a.score : 0;
    const comment = (a.comment || "").trim();
    return (a.na === true) || (score !== 0) || (comment.length > 0);
  }

  function updateAnsweredBadge() {
    const el = document.getElementById("badge-answered");
    if (!el) return;
    const answered = QUESTIONS.reduce((acc, q) => acc + (isAnswered(q.id) ? 1 : 0), 0);
    el.textContent = `${answered}/${QUESTIONS.length}`;
  }

  function paintAnsweredCards() {
    const cards = document.querySelectorAll(".shade-card");
    cards.forEach(card => {
      const qid = card.dataset.qid;
      if (isAnswered(qid)) card.classList.add("is-answered");
      else card.classList.remove("is-answered");
    });
  }

  function renderRadar(totals, maxByAxis) {
    const svg = document.getElementById("shade-radar");
    if (!svg) return;

    const values = AXES.map(ax => {
      const max = maxByAxis[ax.key];
      const score = totals[ax.key];
      return (max > 0) ? Math.round((score / max) * 100) : 0;
    });

    const W = 320, H = 260;
    const cx = 160, cy = 125;
    const r = 90;
    const levels = [0.25, 0.50, 0.75, 1.0];

    const points = AXES.map((ax, i) => {
      const angle = (Math.PI * 2 * i / AXES.length) - Math.PI / 2;
      const v = values[i] / 100;
      return {
        x: cx + Math.cos(angle) * r * v,
        y: cy + Math.sin(angle) * r * v,
        lx: cx + Math.cos(angle) * (r + 25),
        ly: cy + Math.sin(angle) * (r + 25),
      };
    });

    const gridPolys = levels.map(k => {
      const pts = AXES.map((ax, i) => {
        const angle = (Math.PI * 2 * i / AXES.length) - Math.PI / 2;
        return `${cx + Math.cos(angle) * r * k},${cy + Math.sin(angle) * r * k}`;
      }).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>`;
    }).join("");

    const axisLines = AXES.map((ax, i) => {
      const angle = (Math.PI * 2 * i / AXES.length) - Math.PI / 2;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(0,0,0,0.12)" />`;
    }).join("");

    const labels = AXES.map((ax, i) => {
      const p = points[i];
      const txt = `${ax.name} (${values[i]}%)`;
      return `<text x="${p.lx}" y="${p.ly}" font-size="11" text-anchor="middle" fill="rgba(0,0,0,0.75)">${escapeHtml(txt)}</text>`;
    }).join("");

    const polyPts = points.map(p => `${p.x},${p.y}`).join(" ");
    const poly = `
      <polygon points="${polyPts}" fill="rgba(13,40,242,0.18)" stroke="rgba(13,40,242,0.65)" stroke-width="2"/>
      ${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="rgba(13,40,242,0.9)"></circle>`).join("")}
    `;

    svg.innerHTML = `
      <rect x="0" y="0" width="${W}" height="${H}" fill="transparent"></rect>
      ${gridPolys}
      ${axisLines}
      ${poly}
      ${labels}
    `;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: VERSION, answers: {}, savedAt: null };
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return { version: VERSION, answers: {}, savedAt: null };
      if (!obj.answers) obj.answers = {};
      return obj;
    } catch {
      return { version: VERSION, answers: {}, savedAt: null };
    }
  }

  function saveState() {
    state.savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateLastSaved();
  }

  function updateLastSaved() {
    const el = document.getElementById("last-saved");
    if (!el) return;
    if (!state.savedAt) { el.textContent = "—"; return; }
    const d = new Date(state.savedAt);
    el.textContent = d.toLocaleString();
  }

  function exportJSON() {
    const payload = { version: VERSION, exportedAt: new Date().toISOString(), answers: state.answers };
    downloadFile(`shade-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || !obj.answers || typeof obj.answers !== "object") throw new Error("Format invalide");
        state = { version: VERSION, answers: obj.answers, savedAt: new Date().toISOString() };
        saveState();
        applyStateToUI();
        computeAndRender();
        announce("Import terminé.");
      } catch {
        alert("Impossible d'importer ce fichier JSON (format invalide).");
      }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    const lines = [["id","axis","score","na","comment"]];
    for (const q of QUESTIONS) {
      const a = state.answers[q.id] || { score: 0, comment: "", na: false };
      lines.push([q.id, q.axis, String(a.score ?? 0), String(!!a.na), (a.comment ?? "").replace(/\r?\n/g, " ")]);
    }
    const csv = lines.map(row => row.map(csvEscape).join(",")).join("\n");
    downloadFile(`shade-${new Date().toISOString().slice(0,10)}.csv`, csv, "text/csv");
  }

  function bindGlobalButtons() {
    document.getElementById("btn-export-json").addEventListener("click", exportJSON);

    document.getElementById("input-import-json").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importJSON(file);
      e.target.value = "";
    });

    document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
    document.getElementById("btn-print").addEventListener("click", () => window.print());

    document.getElementById("btn-reset").addEventListener("click", () => {
      if (!confirm("Réinitialiser tous les scores et commentaires ? (action locale)")) return;
      state = { version: VERSION, answers: {}, savedAt: new Date().toISOString() };
      localStorage.removeItem(STORAGE_KEY);
      saveState();
      applyStateToUI();
      computeAndRender();
      announce("Réinitialisation terminée.");
    });

    document.getElementById("btn-toggle-low").addEventListener("click", () => {
      showLowOnly = !showLowOnly;
      applyLowScoreFilter();
      announce(showLowOnly ? "Affichage : faibles scores uniquement." : "Affichage : toutes les questions.");
    });

    document.getElementById("btn-open-all").addEventListener("click", () => setAllAccordion(true));
    document.getElementById("btn-close-all").addEventListener("click", () => setAllAccordion(false));
  }

  function setAllAccordion(open) {
    const nodes = acc.querySelectorAll(".accordion-collapse");
    nodes.forEach(el => {
      const c = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
      open ? c.show() : c.hide();
    });
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function debounce(fn, delay) {
    let t = null;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function announce(msg) { if (live) live.textContent = msg; }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  function csvEscape(s) {
    const v = String(s ?? "");
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  }
})();
