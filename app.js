const modules = [
  { id: "home", icon: "🏠", title: "Accueil" },
  { id: "bank", icon: "💸", title: "Banque" },
  { id: "invoices", icon: "🧾", title: "Factures" },
  { id: "business", icon: "🏢", title: "Entreprises" },
  { id: "loans", icon: "🏦", title: "Prets" },
  { id: "permit-passage", icon: "📝", title: "Permis Passage" },
  { id: "my-permit", icon: "📊", title: "Mon Permis" },
  { id: "jobs", icon: "👮", title: "Jobs RP" },
  { id: "vehicles", icon: "🚗", title: "Vehicules" },
  { id: "market", icon: "📈", title: "Bourse RP" },
  { id: "police", icon: "🚓", title: "Police" },
  { id: "staff", icon: "📜", title: "Staff Panel" },
  { id: "system", icon: "⚙️", title: "Systeme" },
];

const discordApiUrl = "https://discord.com/api/v10";
const discordAuthUrl = "https://discord.com/oauth2/authorize";
const discordStateKey = "blainville-dashboard-discord-state";
const storageKey = "blainville-rp-dashboard-state-v3";

const defaultState = {
  session: {
    userId: "",
    username: "",
    displayName: "",
    avatarUrl: "",
    dashboardRole: "guest",
    roles: [],
    salary: { amount: 0, label: "Aucun salaire", department: "Aucun emploi" },
    connectedAt: "",
  },
  members: [],
  salaryRoles: [],
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
    formStatus: "Lien du formulaire: arrive bientot",
  },
  job: "Aucun emploi",
  jobApplications: [],
  vehicles: [],
  investments: [],
  notifications: [],
  logs: [],
  policeEvents: [],
};

const erlcVehicles = [
  {
    team: "Civil",
    vehicles: [
      "2021 BMW X5 M Sport",
      "2021 Bugatti Chiron Pur Sport",
      "2007 Cadillac SLS",
      "2007 Chevrolet Avalanche",
      "2016 Chevrolet Camaro SS",
      "2006 Chevrolet Caprice",
      "1953 Chevrolet Corvette C1",
      "2014 Chevrolet Corvette ZR1",
      "2003 Chevrolet Express Van",
      "1994 Chevrolet Impala",
      "1984 Chevrolet K10",
      "2019 Chevrolet Silverado",
      "2002 Chevrolet Tahoe",
      "2015 Chevrolet Tahoe",
      "2005 Chrysler 300C",
      "2015 Dodge Charger",
      "2020 Dodge Charger Hellcat Widebody",
      "1969 Dodge Charger R/T",
      "2008 Dodge Challenger SRT8",
      "2014 Dodge Durango R/T",
      "2009 Dodge Ram",
      "2021 Ford Bronco",
      "1965 Ford Shelby GT500",
      "1998 Ford Crown Victoria",
      "2016 Ford Explorer",
      "2003 Ford Expedition",
      "2015 Ford F-150",
      "2015 Ford Mustang Shelby GT350",
      "2017 Ford Raptor",
      "1987 Grumman LLV",
      "2015 Honda Civic",
      "2005 Hummer H3",
      "2011 Jeep Grand Cherokee",
      "2007 Jeep Wrangler",
      "John Deere 5100M",
      "2011 Lamborghini Aventador",
      "1968 Lincoln Continental",
      "2014 Mercedes-Benz C-Class Sedan",
      "2007 Nissan GT-R",
      "1977 Pontiac Firebird TransAm",
      "1989 Toyota MR2",
      "2009 Toyota Prius",
      "1995 Toyota Tacoma",
      "Western Star 4900",
      "Pea Car",
      "Metro Bus",
    ],
  },
  {
    team: "Police / Sheriff",
    vehicles: [
      "Falcon Prime Eques",
      "Chevlon Captain PPV",
      "Bullhorn Prancer Pursuit",
      "Bullhorn Prancer Pursuit Widebody",
      "Bullhorn Pueblo Pursuit",
      "Chevlon Camion PPV",
      "Chevlon Platoro PPV",
      "Chevlon Platoro SSV",
      "Falcon Advance Interceptor",
      "Falcon Advance Utility",
      "Falcon Stallion 350 Pursuit",
      "Falcon Traveller SSV",
      "Lenco SWAT Bearcat",
      "Chevlon Amigo ZR1",
      "1981 Chevlon L/15",
      "1988 Bullhorn Diplomat",
      "2021 Falcon eStallion",
      "Police Motorcycle",
      "Prisoner Transport Van",
      "Undercover Sedan",
      "Undercover SUV",
      "SWAT Van",
    ],
  },
  {
    team: "Fire / EMS",
    vehicles: [
      "Fire Engine",
      "Tanker",
      "Heavy Rescue",
      "Paramedic SUV",
      "Bullhorn Ambulance",
      "Utility Falcon Advance+",
      "FD Bullhorn Prancer",
      "Special Operations Unit",
      "Ladder Truck",
      "International Ambulance",
      "FD Chevlon Camion",
      "Command Falcon Advance",
      "Squad Falcon Advance+",
      "Brush Falcon Advance+",
      "Medical Bus",
      "Heavy Tanker",
      "FD Mobile Command Center",
    ],
  },
  {
    team: "DOT",
    vehicles: [
      "Vellfire Evertt",
      "Flatbed Tow Truck",
      "Falcon Advance+ Roadside Assist",
      "Cone Truck",
      "Falcon Advance+ Utility",
      "Street Sweeper",
      "Falcon Advance+ Tow Truck",
      "Salt Truck",
    ],
  },
];

let activeModule = "home";
let state = loadState();
let dashboardConfig = {
  clientId: "",
  guildId: "",
  apiBaseUrl: "http://127.0.0.1:4174",
};

ensureDashboardDom();

const moduleNav = document.querySelector("#moduleNav");
const sections = Object.fromEntries(modules.map((module) => [module.id, document.querySelector(`#${module.id}`)]));
const profileName = document.querySelector("#profileName");
const profileRole = document.querySelector("#profileRole");
const discordLoginBtn = document.querySelector("#discordLoginBtn");
const syncDiscordBtn = document.querySelector("#syncDiscordBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const heroBalance = document.querySelector("#heroBalance");
const heroBusiness = document.querySelector("#heroBusiness");
const heroRole = document.querySelector("#heroRole");
const memberCount = document.querySelector("#memberCount");
const memberSearch = document.querySelector("#memberSearch");
const memberList = document.querySelector("#memberList");

function ensureDashboardDom() {
  const main = document.querySelector(".main");
  const shell = document.querySelector(".dashboard-shell");

  if (main) {
    document.querySelector("#social")?.remove();
    modules.forEach((module) => {
      if (!document.querySelector(`#${module.id}`)) {
        const section = document.createElement("section");
        section.id = module.id;
        section.className = "module-section";
        main.appendChild(section);
      }
    });
  }

  if (shell && !document.querySelector(".member-sidebar")) {
    const aside = document.createElement("aside");
    aside.className = "member-sidebar";
    aside.innerHTML = `
      <div class="member-sidebar-header">
        <p class="panel-label">Membres Discord</p>
        <strong id="memberCount">0 en ligne</strong>
      </div>
      <input id="memberSearch" class="member-search" placeholder="Rechercher un joueur" />
      <div id="memberList" class="member-list"></div>
    `;
    shell.appendChild(aside);
  }
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      ...structuredClone(defaultState),
      ...parsed,
      session: { ...structuredClone(defaultState.session), ...(parsed.session || {}) },
      permit: { ...structuredClone(defaultState.permit), ...(parsed.permit || {}) },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value) {
  return `${Number(value || 0).toLocaleString("fr-CA")} $`;
}

function now() {
  return new Date().toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" });
}

function addLog(type, detail) {
  state.logs.unshift({ type, detail, date: now() });
  state.logs = state.logs.slice(0, 20);
}

function addNotification(title, detail) {
  state.notifications.unshift({ title, detail, date: now() });
  state.notifications = state.notifications.slice(0, 10);
}

function empty(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function getVisibleModules() {
  return state.session.dashboardRole === "staff" ? modules : modules.filter((module) => module.id !== "staff");
}

function renderNav() {
  moduleNav.innerHTML = getVisibleModules()
    .map(
      (module) => `
        <a href="#${module.id}" data-link="${module.id}">
          <span>${module.icon} ${module.title}</span>
          <small>Dev</small>
        </a>
      `
    )
    .join("");
}

function getRedirectUri() {
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

function buildDiscordLoginUrl() {
  const redirectUri = getRedirectUri();
  if (!redirectUri || !dashboardConfig.clientId) return "";

  const oauthState = crypto.randomUUID();
  sessionStorage.setItem(discordStateKey, oauthState);

  const params = new URLSearchParams({
    response_type: "token",
    client_id: dashboardConfig.clientId,
    scope: "identify",
    redirect_uri: redirectUri,
    state: oauthState,
    prompt: "consent",
  });

  return `${discordAuthUrl}?${params.toString()}`;
}

async function loadDashboardConfig() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("/api/dashboard/config", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Config dashboard indisponible.");
    const config = await response.json();
    dashboardConfig = {
      clientId: config.clientId || "",
      guildId: config.guildId || "",
      apiBaseUrl: config.apiBaseUrl || "http://127.0.0.1:4174",
    };

    try {
      const botResponse = await fetch(`${dashboardConfig.apiBaseUrl}/api/dashboard/config`);
      const botConfig = await botResponse.json();
      state.salaryRoles = botConfig.salaryRoles || state.salaryRoles;
      saveState();
    } catch {
      // Le dashboard reste utilisable meme si le bot n'est pas encore pret.
    }
  } catch {
    dashboardConfig = {
      clientId: "",
      guildId: "",
      apiBaseUrl: "http://127.0.0.1:4174",
    };
  }
}

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${dashboardConfig.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: options.signal || controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.reason || "Action API impossible.");
    }
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le bot/API ne repond pas.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchDiscordUser(accessToken) {
  const response = await fetch(`${discordApiUrl}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Connexion Discord impossible.");
  return response.json();
}

async function handleDiscordCallback() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get("access_token");
  const callbackState = hash.get("state");

  if (!accessToken) return;

  const expectedState = sessionStorage.getItem(discordStateKey);
  if (expectedState && callbackState !== expectedState) {
    addNotification("Discord", "Verification de connexion refusee");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  try {
    const discordUser = await fetchDiscordUser(accessToken);
    state.session = {
      ...state.session,
      userId: discordUser.id,
      username: discordUser.username || discordUser.id,
      displayName: discordUser.global_name || discordUser.username || discordUser.id,
      avatarUrl: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
        : "",
      dashboardRole: "citoyen",
      connectedAt: now(),
    };
    saveState();
    await syncDiscordProfile();
  } catch (error) {
    addNotification("Discord", error instanceof Error ? error.message : "Connexion refusee");
  } finally {
    sessionStorage.removeItem(discordStateKey);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

async function syncDiscordProfile() {
  if (!state.session.userId) {
    addNotification("Discord", "Connecte-toi avant de synchroniser le bot");
    saveState();
    return;
  }

  const payload = await apiFetch(`/api/dashboard/me?userId=${encodeURIComponent(state.session.userId)}`);
  const profile = payload.profile;
  state.session = {
    ...state.session,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    dashboardRole: profile.dashboardRole,
    roles: profile.roles || [],
    salary: profile.salary || structuredClone(defaultState.session.salary),
    connectedAt: now(),
  };
  state.balance = profile.balance || 0;
  state.invoices = (profile.invoices || []).map((invoice, index) => ({
    id: invoice.id,
    invoiceNumber: index + 1,
    target: state.session.displayName || state.session.username,
    amount: invoice.amount || 0,
    reason: invoice.reason || "Aucune raison",
    status: "A payer",
    type: invoice.type || "amende",
  }));
  addNotification("Discord", `Profil synchronise: ${state.session.dashboardRole}`);
  addLog("Discord", `Sync ${state.session.displayName}`);
  saveState();
}

async function syncMembers() {
  try {
    const payload = await apiFetch("/api/dashboard/members");
    state.members = payload.members || [];
    saveState();
  } catch (error) {
    addNotification("Bot Discord", error instanceof Error ? error.message : "Liste des membres indisponible");
    saveState();
  }
}

async function syncPoliceEvents() {
  try {
    const payload = await apiFetch("/api/dashboard/police-events");
    state.policeEvents = payload.events || [];
    saveState();
  } catch {
    state.policeEvents = state.policeEvents || [];
  }
}

function updateAuthUi() {
  const connected = Boolean(state.session.userId);
  profileName.textContent = connected ? state.session.displayName || state.session.username : "Non connecte";
  profileRole.textContent = connected
    ? `${state.session.dashboardRole === "staff" ? "Staff" : "Citoyen"} | ${money(state.session.salary?.amount || 0)} / jour`
    : "Connexion Discord requise";
  discordLoginBtn.classList.toggle("is-hidden", connected);
  syncDiscordBtn.classList.toggle("is-hidden", !connected);
  logoutBtn.classList.toggle("is-hidden", !connected);
  heroBalance.textContent = money(state.balance);
  heroBusiness.textContent = state.businesses[0]?.name || "Aucune";
  heroRole.textContent = connected ? (state.session.dashboardRole === "staff" ? "Staff" : "Citoyen") : "Invite";
}

function renderMembersSidebar() {
  if (!memberSearch || !memberList || !memberCount) return;

  const query = memberSearch.value.trim().toLowerCase();
  const members = state.members.filter((member) => {
    const name = `${member.displayName} ${member.username}`.toLowerCase();
    return !query || name.includes(query);
  });

  memberCount.textContent = `${members.length} joueur(s)`;
  memberList.innerHTML = members.length
    ? members
        .slice(0, 80)
        .map(
          (member) => `
            <article class="member-item">
              <span class="member-avatar">${member.avatarUrl ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" />` : ""}</span>
              <span class="member-meta">
                <strong>${escapeHtml(member.displayName)}</strong>
                <span>${escapeHtml(member.salary?.department || "Aucun emploi")} | ${money(member.salary?.amount || 0)}</span>
              </span>
            </article>
          `
        )
        .join("")
    : empty("Aucun membre trouve. Lance le bot et synchronise.");
}

function memberPicker(pickerId, hiddenName) {
  const members = state.members.slice(0, 100);
  return `
    <div class="player-picker" data-picker="${pickerId}">
      <label>Rechercher un joueur<input data-picker-search="${pickerId}" placeholder="Nom Discord" /></label>
      <input type="hidden" name="${hiddenName}" data-picker-value="${pickerId}" />
      <div class="player-list">
        ${
          members.length
            ? members
                .map(
                  (member) => `
                    <button class="player-option" data-picker-option="${pickerId}" data-member-id="${member.id}" data-member-name="${escapeHtml(member.displayName.toLowerCase())}" type="button">
                      <span class="member-avatar">${member.avatarUrl ? `<img src="${escapeHtml(member.avatarUrl)}" alt="" />` : ""}</span>
                      <span class="member-meta">
                        <strong>${escapeHtml(member.displayName)}</strong>
                        <span>${escapeHtml(member.username)} | ${money(member.salary?.amount || 0)} / jour</span>
                      </span>
                    </button>
                  `
                )
                .join("")
            : `<div class="empty-state">Aucun joueur synchronise.</div>`
        }
      </div>
    </div>
  `;
}

function listRows(items, render, emptyText) {
  if (!items.length) return empty(emptyText);
  return `<div class="activity-panel">${items.map(render).join("")}</div>`;
}

function card(title, body, footer = "") {
  return `
    <article class="module-card">
      <header>
        <span class="module-icon">${escapeHtml(title.slice(0, 1).toUpperCase())}</span>
        <span class="dev-badge">En developpement</span>
      </header>
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(body)}</p>
      ${footer}
    </article>
  `;
}

function renderHome() {
  sections.home.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Accueil</h3>
        <p>Resume du joueur, roles Discord, salaire et activites recentes.</p>
      </div>
      <span class="dev-badge">Sync Discord</span>
    </div>
    <div class="stats-row">
      <article class="quick-card"><span class="stat-label">Solde personnel</span><strong>${money(state.balance)}</strong></article>
      <article class="quick-card"><span class="stat-label">Salaire journalier</span><strong>${money(state.session.salary?.amount || 0)}</strong></article>
      <article class="quick-card"><span class="stat-label">Factures ouvertes</span><strong>${state.invoices.filter((item) => item.status !== "Payee").length}</strong></article>
      <article class="quick-card"><span class="stat-label">Membres sync</span><strong>${state.members.length}</strong></article>
    </div>
    <div class="wide-grid">
      <div class="content-grid">
        ${card("Profil Discord", state.session.userId ? `${state.session.displayName} | ${state.session.dashboardRole}` : "Aucun compte Discord connecte.")}
        ${card("Salaire perso", `${state.session.salary?.department || "Aucun emploi"} - ${state.session.salary?.label || "Aucun role"} - ${money(state.session.salary?.amount || 0)} / jour`)}
        ${card("Roles", state.session.roles.length ? state.session.roles.join(", ") : "Aucun role synchronise.")}
      </div>
      ${listRows(
        state.notifications,
        (item) => `<div class="activity-row"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)} | ${escapeHtml(item.date)}</span></div>`,
        "Aucune notification."
      )}
    </div>
  `;
}

function renderBank() {
  sections.bank.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Banque</h3>
        <p>Virement vers un joueur Discord avec recherche et selection.</p>
      </div>
      <span class="dev-badge">Bot API</span>
    </div>
    <div class="stats-row">
      <article class="quick-card"><span class="stat-label">Compte personnel</span><strong>${money(state.balance)}</strong></article>
      <article class="quick-card"><span class="stat-label">Salaire</span><strong>${money(state.session.salary?.amount || 0)}</strong></article>
      <article class="quick-card"><span class="stat-label">Transactions</span><strong>${state.transactions.length}</strong></article>
      <article class="quick-card"><span class="stat-label">API banque</span><strong>${dashboardConfig.apiBaseUrl.includes("4174") ? "Locale" : "Serveur"}</strong></article>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="bank-transfer">
        <h4>Faire un virement</h4>
        ${memberPicker("bank-transfer", "toUserId")}
        <label>Montant<input name="amount" type="number" min="1" step="1" value="1" /></label>
        <label>Note<input name="note" placeholder="Raison du virement" /></label>
        <button class="visual-btn primary" type="submit">Envoyer le virement</button>
      </form>
      ${listRows(
        state.transactions,
        (item) => `<div class="activity-row"><strong>${escapeHtml(item.type)} ${money(item.amount)}</strong><span>${escapeHtml(item.target || "Aucun detail")} | ${escapeHtml(item.date)}</span></div>`,
        "Aucune transaction."
      )}
    </div>
  `;
}

function renderInvoices() {
  sections.invoices.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Factures</h3>
        <p>Creation de facture vers un joueur Discord avec recherche.</p>
      </div>
      <span class="dev-badge">Bot API</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="invoice">
        <h4>Creer une facture</h4>
        ${memberPicker("invoice-target", "targetUserId")}
        <label>Montant<input name="amount" type="number" min="1" value="1" /></label>
        <label>Type
          <select name="type">
            <option value="amende">Amende</option>
            <option value="entreprise">Entreprise</option>
          </select>
        </label>
        <label>Motif<textarea name="reason" placeholder="Service, amende, facture entreprise..."></textarea></label>
        <button class="visual-btn primary" type="submit">Creer la facture</button>
      </form>
      ${listRows(
        state.invoices,
        (item) => `
          <div class="activity-row">
            <strong>${escapeHtml(item.target || "Moi")} | ${money(item.amount)}</strong>
            <span>${escapeHtml(item.status)} | ${escapeHtml(item.reason || "Aucun motif")} <button class="mini-btn" data-pay-invoice="${item.invoiceNumber}" type="button">Payer</button></span>
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
        <h3>Entreprises</h3>
        <p>Creation d'entreprise avec approbation staff.</p>
      </div>
      <span class="dev-badge">Validation staff</span>
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
        (item) => `<div class="activity-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type || "Type non precise")} | ${escapeHtml(item.status)}</span></div>`,
        "Aucune entreprise creee."
      )}
    </div>
  `;
}

function renderLoans() {
  sections.loans.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Prets</h3>
        <p>Simulation de remboursement et demande de validation.</p>
      </div>
      <span class="dev-badge">Validation staff</span>
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
        (item) => `<div class="activity-row"><strong>${money(item.amount)}</strong><span>${item.weeks} semaines | ${money(item.weekly)} / semaine | ${escapeHtml(item.status)}</span></div>`,
        "Aucun pret."
      )}
    </div>
  `;
}

function renderPermitPassage() {
  sections["permit-passage"].innerHTML = `
    <div class="section-header">
      <div>
        <h3>Permis Passage</h3>
        <p>Formulaire de demande. Le lien officiel arrive bientot.</p>
      </div>
      <span class="dev-badge">Formulaire</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="permit">
        <h4>Demande de permis</h4>
        <label>Nom RP<input name="rpName" placeholder="Prenom Nom" /></label>
        <label>Type de permis
          <select name="permitType">
            <option>Permis de passage</option>
            <option>Permis vehicule</option>
            <option>Permis special</option>
          </select>
        </label>
        <label>Raison<textarea name="reason" placeholder="Explique la demande RP"></textarea></label>
        <button class="visual-btn primary" type="submit">Envoyer la demande</button>
      </form>
      <div class="activity-panel">
        <h4>Lien externe</h4>
        <div class="empty-state">Le lien du formulaire arrive bientot.</div>
        <div class="activity-row"><strong>Etat</strong><span>${escapeHtml(state.permit.request)}</span></div>
        <div class="activity-row"><strong>Statut</strong><span>${escapeHtml(state.permit.status)}</span></div>
      </div>
    </div>
  `;
}

function renderMyPermit() {
  sections["my-permit"].innerHTML = `
    <div class="section-header">
      <div>
        <h3>Mon Permis</h3>
        <p>Etat du permis du joueur.</p>
      </div>
      <span class="dev-badge">En developpement</span>
    </div>
    <article class="permit-card">
      <div><span>Statut</span><strong>${escapeHtml(state.permit.status)}</strong></div>
      <div><span>Points</span><strong>${state.permit.points} / 20</strong></div>
      <div><span>Infractions</span><strong>${state.permit.infractions}</strong></div>
      <div><span>Obtention</span><strong>${escapeHtml(state.permit.obtainedAt)}</strong></div>
      <div><span>Expiration</span><strong>${escapeHtml(state.permit.expiresAt)}</strong></div>
    </article>
  `;
}

function renderJobs() {
  const grouped = state.salaryRoles.reduce((groups, role) => {
    if (!groups[role.department]) groups[role.department] = [];
    groups[role.department].push(role);
    return groups;
  }, {});

  sections.jobs.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Jobs RP</h3>
        <p>Salaires personnels par roles Discord.</p>
      </div>
      <span class="dev-badge">Salaires auto</span>
    </div>
    <div class="stats-row">
      <article class="quick-card"><span class="stat-label">Mon departement</span><strong>${escapeHtml(state.session.salary?.department || "Aucun")}</strong></article>
      <article class="quick-card"><span class="stat-label">Mon grade</span><strong>${escapeHtml(state.session.salary?.label || "Aucun")}</strong></article>
      <article class="quick-card"><span class="stat-label">Mon salaire</span><strong>${money(state.session.salary?.amount || 0)}</strong></article>
      <article class="quick-card"><span class="stat-label">Roles salaire</span><strong>${state.salaryRoles.length}</strong></article>
    </div>
    <div class="content-grid">
      ${
        Object.entries(grouped).length
          ? Object.entries(grouped)
              .map(
                ([department, roles]) => `
                  <article class="module-card">
                    <header><span class="module-icon">${escapeHtml(department.slice(0, 1))}</span><span class="dev-badge">${roles.length} roles</span></header>
                    <h4>${escapeHtml(department)}</h4>
                    <div class="salary-list">
                      ${roles.map((role) => `<div class="salary-item"><strong>${escapeHtml(role.label)}</strong><span>${money(role.amount)} / jour</span></div>`).join("")}
                    </div>
                  </article>
                `
              )
              .join("")
          : empty("Lance le serveur dashboard pour charger les salaires depuis le bot.")
      }
    </div>
  `;
}

function renderVehicles() {
  const total = erlcVehicles.reduce((sum, group) => sum + group.vehicles.length, 0);
  sections.vehicles.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Vehicules ERLC</h3>
        <p>Liste visuelle des vehicules ERLC par categorie.</p>
      </div>
      <span class="dev-badge">${total} vehicules</span>
    </div>
    <div class="content-grid">
      ${erlcVehicles
        .map(
          (group) => `
            <article class="module-card">
              <header><span class="module-icon">${escapeHtml(group.team.slice(0, 1))}</span><span class="dev-badge">${group.vehicles.length}</span></header>
              <h4>${escapeHtml(group.team)}</h4>
              <div class="vehicle-list">
                ${group.vehicles.map((vehicle) => `<div class="vehicle-item"><strong>${escapeHtml(vehicle)}</strong></div>`).join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMarket() {
  sections.market.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Bourse RP</h3>
        <p>Investissements RP et actions de societes.</p>
      </div>
      <span class="dev-badge">Maquette</span>
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
        (item) => `<div class="activity-row"><strong>${escapeHtml(item.company)}</strong><span>${money(item.amount)} | Variation 0%</span></div>`,
        "Aucun investissement."
      )}
    </div>
  `;
}

function renderPolice() {
  sections.police.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Police</h3>
        <p>Amendes et arrestations envoyees depuis les salons Discord surveilles.</p>
      </div>
      <span class="dev-badge">Salons arrestation</span>
    </div>
    <div class="wide-grid">
      <form class="form-preview" data-form="fine">
        <h4>Creer une amende</h4>
        ${memberPicker("fine-target", "targetUserId")}
        <label>Montant<input name="amount" type="number" min="1" value="1" /></label>
        <label>Raison<textarea name="reason" placeholder="Infraction, arrestation, rapport..."></textarea></label>
        <button class="visual-btn primary" type="submit">Envoyer l'amende</button>
      </form>
      ${listRows(
        state.policeEvents,
        (event) => `
          <div class="activity-row">
            <strong>${escapeHtml(event.authorName || "Inconnu")}</strong>
            <span>${escapeHtml(event.content)} | ${escapeHtml(new Date(event.createdAt).toLocaleString("fr-CA"))}</span>
          </div>
        `,
        "Aucune arrestation recue. Le bot ecoute les salons 1482756676745564284 et 1482754417173332188."
      )}
    </div>
  `;
}

function renderStaff() {
  if (state.session.dashboardRole !== "staff") {
    sections.staff.innerHTML = `
      <div class="section-header">
        <div>
          <h3>Staff Panel</h3>
          <p>Acces reserve aux membres ayant le role staff Discord.</p>
        </div>
        <span class="dev-badge">Verrouille</span>
      </div>
      ${empty("Connecte-toi avec Discord et synchronise le bot pour mettre a jour les permissions.")}
    `;
    return;
  }

  const pendingBusinesses = state.businesses.filter((item) => item.status === "En attente staff");
  const pendingLoans = state.loans.filter((item) => item.status === "En attente staff");
  sections.staff.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Staff Panel</h3>
        <p>Validation des entreprises, prets, logs et audit economie.</p>
      </div>
      <span class="dev-badge">Staff Discord</span>
    </div>
    <div class="wide-grid">
      <div class="activity-panel">
        <h4>Demandes a valider</h4>
        ${
          [...pendingBusinesses, ...pendingLoans].length
            ? [
                ...pendingBusinesses.map((item) => `<div class="activity-row"><strong>${escapeHtml(item.name)}</strong><span>Entreprise <button class="mini-btn" data-approve-business="${item.id}" type="button">Approuver</button></span></div>`),
                ...pendingLoans.map((item) => `<div class="activity-row"><strong>${money(item.amount)}</strong><span>Pret <button class="mini-btn" data-approve-loan="${item.id}" type="button">Approuver</button></span></div>`),
              ].join("")
            : `<div class="empty-state">Aucune demande staff.</div>`
        }
      </div>
      ${listRows(
        state.logs,
        (item) => `<div class="activity-row"><strong>${escapeHtml(item.type)}</strong><span>${escapeHtml(item.detail)} | ${escapeHtml(item.date)}</span></div>`,
        "Aucun log."
      )}
    </div>
  `;
}

function renderSystem() {
  sections.system.innerHTML = `
    <div class="section-header">
      <div>
        <h3>Systeme</h3>
        <p>Serveur dashboard, bot Discord, API et sauvegarde locale.</p>
      </div>
      <span class="dev-badge">Node + Bot</span>
    </div>
    <div class="content-grid">
      ${card("Hebergement", "Le fichier start-dashboard.bat lance le site et demarre le bot avec le .env du dashboard.")}
      ${card("API Discord", `API bot: ${dashboardConfig.apiBaseUrl}. Client Discord: ${dashboardConfig.clientId || "non charge"}.`)}
      ${card("Sauvegarde", "Les donnees visuelles sont gardees dans le navigateur.", `<div class="actions"><button class="visual-btn" data-action="reset-data" type="button">Remettre a zero</button></div>`)}
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
  police: renderPolice,
  staff: renderStaff,
  system: renderSystem,
};

function renderAll() {
  renderNav();
  updateAuthUi();
  renderMembersSidebar();
  if (!getVisibleModules().some((module) => module.id === activeModule)) activeModule = "home";
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

function bindMemberPickers() {
  document.querySelectorAll("[data-picker-search]").forEach((input) => {
    input.oninput = () => {
      const pickerId = input.dataset.pickerSearch;
      const query = input.value.trim().toLowerCase();
      document.querySelectorAll(`[data-picker-option="${pickerId}"]`).forEach((button) => {
        button.classList.toggle("is-hidden", query && !button.dataset.memberName.includes(query));
      });
    };
  });

  document.querySelectorAll("[data-picker-option]").forEach((button) => {
    button.onclick = () => {
      const pickerId = button.dataset.pickerOption;
      const value = document.querySelector(`[data-picker-value="${pickerId}"]`);
      if (value) value.value = button.dataset.memberId;
      document.querySelectorAll(`[data-picker-option="${pickerId}"]`).forEach((option) => {
        option.classList.toggle("active", option === button);
      });
    };
  });
}

function bindActions() {
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      setActiveModule(link.dataset.link);
    };
  });

  bindMemberPickers();

  document.querySelector('[data-form="bank-transfer"]')?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const toUserId = String(data.get("toUserId") || "");
    const amount = Number(data.get("amount") || 0);
    const target = state.members.find((member) => member.id === toUserId);

    if (!state.session.userId || !toUserId) {
      addNotification("Banque", "Connecte-toi et choisis un joueur.");
      saveState();
      renderAll();
      return;
    }

    try {
      const result = await apiFetch("/api/dashboard/transfer", {
        method: "POST",
        body: JSON.stringify({ fromUserId: state.session.userId, toUserId, amount }),
      });
      state.balance = result.balance || state.balance;
      state.transactions.unshift({ type: "Virement", amount, target: target?.displayName || toUserId, date: now() });
      addLog("Banque", `Virement ${money(amount)} vers ${target?.displayName || toUserId}`);
    } catch (error) {
      addNotification("Banque", error instanceof Error ? error.message : "Virement impossible");
    }
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="invoice"]')?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitInvoiceForm(event.currentTarget, "Facture");
  });

  document.querySelector('[data-form="fine"]')?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitInvoiceForm(event.currentTarget, "Amende");
  });

  document.querySelectorAll("[data-pay-invoice]").forEach((button) => {
    button.onclick = async () => {
      if (!state.session.userId) return;
      try {
        const result = await apiFetch("/api/dashboard/pay-invoice", {
          method: "POST",
          body: JSON.stringify({ userId: state.session.userId, invoiceNumber: Number(button.dataset.payInvoice) }),
        });
        state.balance = result.balance || state.balance;
        await syncDiscordProfile();
      } catch (error) {
        addNotification("Facture", error instanceof Error ? error.message : "Paiement impossible");
      }
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
    state.loans.unshift({ id: crypto.randomUUID(), amount, weeks, weekly, status: "En attente staff" });
    addNotification("Pret", `Demande ${money(amount)}`);
    addLog("Pret", `Simulation ${money(weekly)} / semaine`);
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="permit"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.permit.request = `Demande envoyee: ${String(data.get("permitType") || "Permis")}`;
    state.permit.status = "En attente";
    addNotification("Permis", "Formulaire rempli dans le dashboard");
    addLog("Permis", String(data.get("rpName") || "Demande sans nom"));
    saveState();
    renderAll();
  });

  document.querySelector('[data-form="investment"]')?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get("amount") || 0);
    state.investments.unshift({ company: String(data.get("company") || "Societe sans nom").trim(), amount });
    state.balance = Math.max(0, state.balance - amount);
    addLog("Bourse", `Investissement ${money(amount)}`);
    saveState();
    renderAll();
  });

  document.querySelectorAll("[data-approve-business]").forEach((button) => {
    button.onclick = () => {
      const business = state.businesses.find((item) => item.id === button.dataset.approveBusiness);
      if (!business) return;
      business.status = "Approuvee";
      addNotification("Staff", `${business.name} approuvee`);
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
      saveState();
      renderAll();
    };
  });

  document.querySelector('[data-action="reset-data"]')?.addEventListener("click", () => {
    state = structuredClone(defaultState);
    saveState();
    renderAll();
  });

  discordLoginBtn.onclick = () => {
    const loginUrl = buildDiscordLoginUrl();
    if (!loginUrl) {
      addNotification("Discord", "Ouvre le dashboard avec start-dashboard.bat et verifie CLIENT_ID dans .env.");
      saveState();
      renderAll();
      return;
    }
    window.location.href = loginUrl;
  };

  syncDiscordBtn.onclick = async () => {
    try {
      await syncDiscordProfile();
      await syncMembers();
      await syncPoliceEvents();
    } catch (error) {
      addNotification("Sync", error instanceof Error ? error.message : "Sync impossible");
    }
    renderAll();
  };

  logoutBtn.onclick = () => {
    state.session = structuredClone(defaultState.session);
    saveState();
    renderAll();
  };
}

async function submitInvoiceForm(form, label) {
  const data = new FormData(form);
  const targetUserId = String(data.get("targetUserId") || "");
  const amount = Number(data.get("amount") || 0);
  const target = state.members.find((member) => member.id === targetUserId);

  if (!targetUserId) {
    addNotification(label, "Choisis un joueur dans la liste.");
    saveState();
    renderAll();
    return;
  }

  try {
    await apiFetch("/api/dashboard/invoices", {
      method: "POST",
      body: JSON.stringify({
        targetUserId,
        amount,
        reason: String(data.get("reason") || `${label} RP`).trim(),
        createdBy: state.session.userId,
        type: String(data.get("type") || "amende"),
      }),
    });
    addNotification(label, `${label} envoyee a ${target?.displayName || targetUserId}`);
    addLog(label, `${money(amount)} -> ${target?.displayName || targetUserId}`);
  } catch (error) {
    addNotification(label, error instanceof Error ? error.message : "Creation impossible");
  }
  saveState();
  renderAll();
}

if (memberSearch) {
  memberSearch.oninput = renderMembersSidebar;
}

async function init() {
  renderAll();

  try {
    await loadDashboardConfig();
    await handleDiscordCallback();
  } catch (error) {
    addNotification("Dashboard", error instanceof Error ? error.message : "Chargement partiel.");
    saveState();
  }

  renderAll();

  try {
    await syncMembers();
    await syncPoliceEvents();
    if (state.session.userId) {
      await syncDiscordProfile();
    }
  } catch {
    // Le dashboard reste visible meme si le bot n'est pas lance.
  }

  renderAll();
}

init();
