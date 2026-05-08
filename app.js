const modules = [
  { id: "home", icon: "🏠", title: "Accueil" },
  { id: "bank", icon: "💸", title: "Banque" },
  { id: "invoices", icon: "🧾", title: "Factures" },
  { id: "business", icon: "🏢", title: "Entreprises" },
  { id: "loans", icon: "🏦", title: "Prets" },
  { id: "permit-passage", icon: "🔔", title: "Permis Passage" },
  { id: "my-permit", icon: "📊", title: "Mon Permis" },
  { id: "jobs", icon: "👮", title: "Jobs RP" },
  { id: "vehicles", icon: "🚗", title: "Vehicules" },
  { id: "market", icon: "📊", title: "Bourse RP" },
  { id: "staff", icon: "📜", title: "Staff Panel" },
  { id: "system", icon: "⚙️", title: "Systeme" },
  { id: "social", icon: "🔔", title: "Social RP" },
];

const defaultState = {
  balance: 0,
  companyBalance: 0,
  transactions: [],
  invoices: [],
  businesses: [],
  loans: [],
  permit: {
    request: "Aucune demande",
    status: "Aucun permis",
    points: 0,
    infractions: 0,
    obtainedAt: "//__",
    expiresAt: "//__",
  },
  job: "Aucun emploi",
  jobApplications: [],
  vehicles: [],
  investments: [],
  messages: [],
  notifications: [],
  logs: [],
};

const storageKey = "blainville-rp-dashboard-state-v2";
let activeModule = "home";
let state = loadState();

const moduleNav = document.querySelector("#moduleNav");
const sections = Object.fromEntries(modules.map((module) => [module.id, document.querySelector(`#${module.id}`)]));

moduleNav.innerHTML = modules
  .map(
    (module) => `
      <a href="#${module.id}" data-link="${module.id}">
        <span>${module.icon} ${module.title}</span>
        <small>Dev</small>
      </a>
    `
  )
  .join("");

function loadState() {
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function money(value) {
  return `${Number(value || 0).toLocaleString("fr-CA")} $`;
}

function now() {
  return new Date().toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

function addLog(type, detail) {
  state.logs.unshift({ type, detail, date: now() });
  state.logs = state.logs.slice(0, 12);
}

function addNotification(title, detail) {
  state.notifications.unshift({ title, detail, date: now() });
  state.notifications = state.notifications.slice(0, 8);
}

function empty(text) {
  return `<div class="empty-state">${text}</div>`;
}

function card(title, body, footer = "") {
  return `
    <article class="module-card">
      <header>
        <span class="module-icon">${title.slice(0, 1).toUpperCase()}</span>
        <span class="dev-badge">En developpement</span>
      </header>
      <h4>${title}</h4>
      <p>${body}</p>
      ${footer}
    </article>
  `;
}

function listRows(items, render, emptyText) {
  if (!items.length) return empty(emptyText);
  return `<div class="activity-panel">${items.map(render).join("")}</div>`;
}

function renderHome() {
  sections.home.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Accueil</h3>
        <p>Resume du joueur, des demandes et des activites recentes.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="stats-row">
      <article class="quick-card"><span class="stat-label">Solde personnel</span><strong>${money(state.balance)}</strong></article>
      <article class="quick-card"><span class="stat-label">Factures ouvertes</span><strong>${state.invoices.filter((item) => item.status !== "Payee").length}</strong></article>
      <article class="quick-card"><span class="stat-label">Entreprises</span><strong>${state.businesses.length}</strong></article>
      <article class="quick-card"><span class="stat-label">Emploi</span><strong>${state.job}</strong></article>
    </div>
    <div class="wide-grid">
      <div class="content-grid">
        ${card("Profil joueur", "Citoyen de Blainville RP QC. Les roles et permissions seront connectes au serveur plus tard.")}
        ${card("Acces rapides", "Utilise le menu de gauche pour ouvrir un module. La page ne descend plus vers les autres categories.")}
        ${card("Etat RP", `Permis: ${state.permit.status}. Entreprise: ${state.businesses[0]?.name || "Aucune"}.`)}
      </div>
      ${listRows(
        state.notifications,
        (item) => `<div class="activity-row"><strong>${item.title}</strong><span>${item.detail} | ${item.date}</span></div>`,
        "Aucune notification pour le moment."
      )}
    </div>
  `;
}

function renderBank() {
  sections.bank.innerHTML = `
    <div class="section-header">
      <div>
        <h3>💸 Banque</h3>
        <p>Depots, retraits, virements et historique bancaire local.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="stats-row">
      <article class="quick-card"><span class="stat-label">Compte personnel</span><strong>${money(state.balance)}</strong></article>
      <article class="quick-card"><span class="stat-label">Compte entreprise</span><strong>${money(state.companyBalance)}</strong></article>
      <article class="quick-card"><span class="stat-label">Transactions</span><strong>${state.transactions.length}</strong></article>
      <article class="quick-card"><span class="stat-label">Anti-fraude</span><strong>Actif</strong></article>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="bank">
        <h4>Operation bancaire</h4>
        <label>Type
          <select name="type">
            <option>Depot</option>
            <option>Retrait</option>
            <option>Virement</option>
          </select>
        </label>
        <label>Montant<input name="amount" type="number" min="0" step="1" value="0" /></label>
        <label>Joueur / note<input name="target" placeholder="Nom du joueur ou raison" /></label>
        <button class="visual-btn primary" type="submit">Appliquer</button>
      </form>
      ${listRows(
        state.transactions,
        (item) => `<div class="activity-row"><strong>${item.type} ${money(item.amount)}</strong><span>${item.target || "Aucun detail"} | ${item.date}</span></div>`,
        "Aucune transaction."
      )}
    </div>
  `;
}

function renderInvoices() {
  sections.invoices.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🧾 Factures</h3>
        <p>Creation, paiement et suivi des factures RP.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="invoice">
        <h4>Creer une facture</h4>
        <label>Destinataire<input name="target" placeholder="Nom du joueur" /></label>
        <label>Montant<input name="amount" type="number" min="0" value="0" /></label>
        <label>Motif<textarea name="reason" placeholder="Service, salaire, amende..."></textarea></label>
        <button class="visual-btn primary" type="submit">Creer</button>
      </form>
      ${listRows(
        state.invoices,
        (item) => `
          <div class="activity-row">
            <strong>${item.target || "Sans nom"} | ${money(item.amount)}</strong>
            <span>${item.status} | ${item.reason || "Aucun motif"} <button class="mini-btn" data-pay-invoice="${item.id}" type="button">Payer</button></span>
          </div>
        `,
        "Aucune facture."
      )}
    </div>
  `;
}

function renderBusiness() {
  sections.business.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🏢 Entreprises</h3>
        <p>Creation d'entreprise avec approbation staff.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="business">
        <h4>Demande d'entreprise</h4>
        <label>Nom<input name="name" placeholder="Nom de l'entreprise" /></label>
        <label>Type d'entreprise<input name="type" placeholder="Ecris le type d'entreprise" /></label>
        <label>Description<textarea name="description" placeholder="Activite RP, employes, idee..."></textarea></label>
        <button class="visual-btn primary" type="submit">Envoyer au staff</button>
      </form>
      ${listRows(
        state.businesses,
        (item) => `<div class="activity-row"><strong>${item.name}</strong><span>${item.type || "Type non precise"} | ${item.status}</span></div>`,
        "Aucune entreprise creee."
      )}
    </div>
  `;
}

function renderLoans() {
  sections.loans.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🏦 Prets</h3>
        <p>Simulation de remboursement et demande de validation.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="loan">
        <h4>Demande de pret</h4>
        <label>Montant<input name="amount" type="number" min="0" value="0" /></label>
        <label>Duree en semaines<input name="weeks" type="number" min="1" value="1" /></label>
        <label>Raison<textarea name="reason" placeholder="Maison, vehicule, entreprise..."></textarea></label>
        <button class="visual-btn primary" type="submit">Simuler et envoyer</button>
      </form>
      ${listRows(
        state.loans,
        (item) => `<div class="activity-row"><strong>${money(item.amount)}</strong><span>${item.weeks} semaines | ${money(item.weekly)} / semaine | ${item.status}</span></div>`,
        "Aucun pret."
      )}
    </div>
  `;
}

function renderPermitPassage() {
  sections["permit-passage"].innerHTML = `
    <div class="section-header">
      <div>
        <h3>🔔 Permis Passage</h3>
        <p>Demande de permis, examen et validation.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="content-grid">
      ${card("Demande de permis", "Envoie une demande pour commencer le processus.", `<div class="actions"><button class="visual-btn primary" data-action="request-permit" type="button">Demander</button></div>`)}
      ${card("Examen", "Le resultat reste a zero tant qu'un staff ne valide pas.", `<div class="actions"><button class="visual-btn" data-action="pass-exam" type="button">Simuler examen</button></div>`)}
      ${card("Historique", `Derniere demande: ${state.permit.request}. Statut actuel: ${state.permit.status}.`)}
    </div>
  `;
}

function renderMyPermit() {
  sections["my-permit"].innerHTML = `
    <div class="section-header">
      <div>
        <h3>📊 Mon Permis</h3>
        <p>Etat du permis du joueur.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <article class="permit-card">
      <div><span>Statut</span><strong>${state.permit.status}</strong></div>
      <div><span>Points</span><strong>${state.permit.points} / 20</strong></div>
      <div><span>Infractions</span><strong>${state.permit.infractions}</strong></div>
      <div><span>Obtention</span><strong>${state.permit.obtainedAt}</strong></div>
      <div><span>Expiration</span><strong>${state.permit.expiresAt}</strong></div>
    </article>
  `;
}

function renderJobs() {
  const jobs = ["Police", "Ambulancier", "Mecanicien", "Taxi", "Avocat", "Journaliste"];
  sections.jobs.innerHTML = `
    <div class="section-header">
      <div>
        <h3>👮 Jobs RP</h3>
        <p>Metiers disponibles, candidatures et emploi actif.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="content-grid">
      ${jobs.map((job) => card(job, "Poste RP disponible. Clique pour envoyer une candidature.", `<div class="actions"><button class="visual-btn primary" data-job="${job}" type="button">Postuler</button></div>`)).join("")}
    </div>
    <div class="section-header"><div><h4>Candidatures</h4></div></div>
    ${listRows(
      state.jobApplications,
      (item) => `<div class="activity-row"><strong>${item.job}</strong><span>${item.status} | ${item.date}</span></div>`,
      "Aucune candidature."
    )}
  `;
}

function renderVehicles() {
  sections.vehicles.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🚗 Vehicules</h3>
        <p>Achat, garage et assurance RP.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="content-grid">
      ${["Compact", "SUV", "Sport"].map((type, index) => card(type, `Vehicule ${type.toLowerCase()} disponible en maquette.`, `<div class="actions"><button class="visual-btn primary" data-buy-vehicle="${type}" data-price="${(index + 1) * 0}" type="button">Acheter 0 $</button></div>`)).join("")}
    </div>
    <div class="section-header"><div><h4>Garage personnel</h4></div></div>
    ${listRows(
      state.vehicles,
      (item) => `<div class="activity-row"><strong>${item.name}</strong><span>Assurance: ${item.insured ? "Oui" : "Non"} | ${item.date}</span></div>`,
      "Garage vide."
    )}
  `;
}

function renderMarket() {
  sections.market.innerHTML = `
    <div class="section-header">
      <div>
        <h3>📊 Bourse RP</h3>
        <p>Investissements RP et actions de societes.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="investment">
        <h4>Investir</h4>
        <label>Societe<input name="company" placeholder="Nom de la societe" /></label>
        <label>Montant<input name="amount" type="number" min="0" value="0" /></label>
        <button class="visual-btn primary" type="submit">Investir</button>
      </form>
      ${listRows(
        state.investments,
        (item) => `<div class="activity-row"><strong>${item.company}</strong><span>${money(item.amount)} | Variation 0%</span></div>`,
        "Aucun investissement."
      )}
    </div>
  `;
}

function renderStaff() {
  const pendingBusinesses = state.businesses.filter((item) => item.status === "En attente staff");
  const pendingLoans = state.loans.filter((item) => item.status === "En attente staff");
  sections.staff.innerHTML = `
    <div class="section-header">
      <div>
        <h3>📜 Staff Panel</h3>
        <p>Validation des entreprises, prets, logs et audit economie.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <div class="activity-panel">
        <h4>Demandes a valider</h4>
        ${
          [...pendingBusinesses, ...pendingLoans].length
            ? [
                ...pendingBusinesses.map((item) => `<div class="activity-row"><strong>${item.name}</strong><span>Entreprise <button class="mini-btn" data-approve-business="${item.id}" type="button">Approuver</button></span></div>`),
                ...pendingLoans.map((item) => `<div class="activity-row"><strong>${money(item.amount)}</strong><span>Pret <button class="mini-btn" data-approve-loan="${item.id}" type="button">Approuver</button></span></div>`),
              ].join("")
            : `<div class="empty-state">Aucune demande staff.</div>`
        }
      </div>
      ${listRows(
        state.logs,
        (item) => `<div class="activity-row"><strong>${item.type}</strong><span>${item.detail} | ${item.date}</span></div>`,
        "Aucun log."
      )}
    </div>
  `;
}

function renderSystem() {
  sections.system.innerHTML = `
    <div class="section-header">
      <div>
        <h3>⚙️ Systeme</h3>
        <p>Controle visuel de la securite, API Discord et sauvegarde.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="content-grid">
      ${card("Anti-dupe", "Surveillance economie active en maquette.")}
      ${card("Logs Discord", `${state.logs.length} log(s) pret(s) a envoyer au bot Discord.`)}
      ${card("Sauvegarde", "Les donnees de cette maquette sont gardees dans le navigateur.", `<div class="actions"><button class="visual-btn" data-action="reset-data" type="button">Remettre a zero</button></div>`)}
    </div>
  `;
}

function renderSocial() {
  sections.social.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🔔 Social RP</h3>
        <p>Messages RP, annonces publiques et reputation.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="message">
        <h4>Publier un message</h4>
        <label>Type
          <select name="type">
            <option>Message RP</option>
            <option>Annonce publique</option>
            <option>Marketplace</option>
            <option>Evenement serveur</option>
          </select>
        </label>
        <label>Texte<textarea name="content" placeholder="Ecris ton message RP"></textarea></label>
        <button class="visual-btn primary" type="submit">Publier</button>
      </form>
      ${listRows(
        state.messages,
        (item) => `<div class="activity-row"><strong>${item.type}</strong><span>${item.content} | ${item.date}</span></div>`,
        "Aucun message social."
      )}
    </div>
  `;
}

const renderers = {
  home: renderHome,
  bank: renderBank,
  invoices: renderInvoices,
  business: renderBusiness,
  loans: renderLoans,
  "permit-passage": renderPermitPassage,
  "my-permit": renderMyPermit,
  jobs: renderJobs,
  vehicles: renderVehicles,
  market: renderMarket,
  staff: renderStaff,
  system: renderSystem,
  social: renderSocial,
};

function renderAll() {
  Object.values(renderers).forEach((render) => render());
  bindActions();
  setActiveModule(activeModule, false);
}

function setActiveModule(moduleId, scrollTop = true) {
  activeModule = modules.some((module) => module.id === moduleId) ? moduleId : "home";
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.link === activeModule);
  });
  Object.values(sections).forEach((section) => {
    section.classList.toggle("active", section.id === activeModule);
  });
  if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindActions() {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      setActiveModule(link.dataset.link);
    };
  });

  document.querySelector('[data-form="bank"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type"));
    const amount = Number(data.get("amount") || 0);
    const target = String(data.get("target") || "").trim();
    if (type === "Depot") state.balance += amount;
    if (type === "Retrait") state.balance = Math.max(0, state.balance - amount);
    if (type === "Virement") state.balance = Math.max(0, state.balance - amount);
    state.transactions.unshift({ type, amount, target, date: now() });
    addLog("Banque", `${type} ${money(amount)}`);
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="invoice"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const invoice = {
      id: crypto.randomUUID(),
      target: String(data.get("target") || "Sans nom").trim(),
      amount: Number(data.get("amount") || 0),
      reason: String(data.get("reason") || "").trim(),
      status: "A payer",
    };
    state.invoices.unshift(invoice);
    addNotification("Facture", `${invoice.target} | ${money(invoice.amount)}`);
    addLog("Facture", `Creation ${money(invoice.amount)}`);
    saveState();
    renderAll();
  });

  document.querySelectorAll("[data-pay-invoice]").forEach((button) => {
    button.onclick = () => {
      const invoice = state.invoices.find((item) => item.id === button.dataset.payInvoice);
      if (!invoice || invoice.status === "Payee") return;
      invoice.status = "Payee";
      state.balance = Math.max(0, state.balance - invoice.amount);
      addLog("Facture", `Paiement ${money(invoice.amount)}`);
      saveState();
      renderAll();
    };
  });

  document.querySelector('[data-form="business"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const business = {
      id: crypto.randomUUID(),
      name: String(data.get("name") || "Entreprise sans nom").trim(),
      type: String(data.get("type") || "").trim(),
      description: String(data.get("description") || "").trim(),
      status: "En attente staff",
    };
    state.businesses.unshift(business);
    addNotification("Entreprise", "Demande envoyee au staff");
    addLog("Entreprise", `Demande ${business.name}`);
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="loan"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get("amount") || 0);
    const weeks = Math.max(1, Number(data.get("weeks") || 1));
    const weekly = Math.ceil((amount * 1.08) / weeks);
    state.loans.unshift({
      id: crypto.randomUUID(),
      amount,
      weeks,
      weekly,
      reason: String(data.get("reason") || "").trim(),
      status: "En attente staff",
    });
    addNotification("Pret", `Demande ${money(amount)}`);
    addLog("Pret", `Simulation ${money(weekly)} / semaine`);
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="investment"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get("amount") || 0);
    state.investments.unshift({
      company: String(data.get("company") || "Societe sans nom").trim(),
      amount,
    });
    state.balance = Math.max(0, state.balance - amount);
    addLog("Bourse", `Investissement ${money(amount)}`);
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="message"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.messages.unshift({
      type: String(data.get("type")),
      content: String(data.get("content") || "Message vide").trim(),
      date: now(),
    });
    addLog("Social", "Message publie");
    saveState();
    renderAll();
  });

  document.querySelectorAll("[data-approve-business]").forEach((button) => {
    button.onclick = () => {
      const business = state.businesses.find((item) => item.id === button.dataset.approveBusiness);
      if (!business) return;
      business.status = "Approuvee";
      addNotification("Staff", `${business.name} approuvee`);
      addLog("Staff", `Entreprise approuvee: ${business.name}`);
      saveState();
      renderAll();
    };
  });

  document.querySelectorAll("[data-approve-loan]").forEach((button) => {
    button.onclick = () => {
      const loan = state.loans.find((item) => item.id === button.dataset.approveLoan);
      if (!loan) return;
      loan.status = "Approuve";
      state.balance += loan.amount;
      addNotification("Staff", `Pret approuve ${money(loan.amount)}`);
      addLog("Staff", `Pret approuve ${money(loan.amount)}`);
      saveState();
      renderAll();
    };
  });

  document.querySelectorAll("[data-job]").forEach((button) => {
    button.onclick = () => {
      state.jobApplications.unshift({ job: button.dataset.job, status: "Candidature envoyee", date: now() });
      state.job = button.dataset.job;
      addLog("Jobs", `Candidature ${button.dataset.job}`);
      saveState();
      renderAll();
    };
  });

  document.querySelectorAll("[data-buy-vehicle]").forEach((button) => {
    button.onclick = () => {
      state.vehicles.unshift({ name: button.dataset.buyVehicle, insured: false, date: now() });
      addLog("Vehicule", `Achat ${button.dataset.buyVehicle}`);
      saveState();
      renderAll();
    };
  });

  document.querySelector('[data-action="request-permit"]')?.addEventListener("click", () => {
    state.permit.request = "Demande envoyee";
    state.permit.status = "En attente";
    addNotification("Permis", "Demande envoyee");
    addLog("Permis", "Demande creee");
    saveState();
    renderAll();
  });

  document.querySelector('[data-action="pass-exam"]')?.addEventListener("click", () => {
    state.permit.request = "Examen complete";
    state.permit.status = "Valide";
    state.permit.points = 20;
    state.permit.obtainedAt = new Date().toLocaleDateString("fr-CA");
    state.permit.expiresAt = "A definir";
    addLog("Permis", "Examen simule");
    saveState();
    renderAll();
  });

  document.querySelector('[data-action="reset-data"]')?.addEventListener("click", () => {
    state = structuredClone(defaultState);
    saveState();
    renderAll();
  });
}

renderAll();
