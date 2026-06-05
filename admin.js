const adminSettings = window.SAMESET_SUPABASE || window.RAVERS_UNITE_SUPABASE || {};
const authStatus = document.querySelector(".admin-auth-status");
const loginPanel = document.querySelector(".admin-login-panel");
const adminApp = document.querySelector(".admin-app");
const googleLoginButton = document.querySelector(".admin-google-login");
const emailLoginButton = document.querySelector(".admin-email-link");
const emailLoginInput = document.querySelector(".admin-email-input");
const signOutButton = document.querySelector(".admin-sign-out");
const userEmailLabel = document.querySelector(".admin-user-email");
const refreshButton = document.querySelector(".admin-refresh");
const statusFilter = document.querySelector(".admin-status-filter");
const adminTabs = document.querySelectorAll(".admin-tab");
const recordList = document.querySelector(".admin-record-list");
const errorBox = document.querySelector(".admin-error");

let adminClient;
let currentUser;
let activeQueue = "waitlist";
let activeStatus = "all";

const queueConfig = {
  waitlist: {
    label: "Waitlist",
    table: "waitlist_signups",
    totalKey: "waitlist",
    title: (row) => row.display_name || row.email || "Waitlist signup",
    meta: (row) => [row.city, row.intent, row.favorite_djs].filter(Boolean).join(" - "),
    details: (row) => [
      ["Email", row.email],
      ["Source", row.source],
      ["Created", formatDate(row.created_at)],
    ],
    actions: true,
  },
  events: {
    label: "Events",
    table: "promoter_submissions",
    totalKey: "events",
    title: (row) => row.event_name || "Event submission",
    meta: (row) => [row.venue, row.city, row.event_date].filter(Boolean).join(" - "),
    details: (row) => [
      ["Contact", joinContact(row.contact_name, row.email)],
      ["DJs", row.dj_names],
      ["Genres", row.genres],
      ["Ticket", row.ticket_url],
      ["Notes", row.notes],
    ],
    actions: true,
  },
  partners: {
    label: "Partners",
    table: "business_inquiries",
    totalKey: "partners",
    title: (row) => row.business_name || "Business inquiry",
    meta: (row) => [row.business_type, row.city, row.best_fit].filter(Boolean).join(" - "),
    details: (row) => [
      ["Contact", joinContact(row.contact_name, row.email)],
      ["Website", row.website_url],
      ["Offer", row.offer_details],
      ["Source", row.source],
    ],
    actions: true,
  },
  djs: {
    label: "DJs",
    table: "dj_claims",
    totalKey: "djs",
    title: (row) => row.dj_name || "DJ claim",
    meta: (row) => [row.market, row.tier, row.primary_genre].filter(Boolean).join(" - "),
    details: (row) => [
      ["Contact", joinContact(row.contact_name, row.email)],
      ["Music", row.music_url],
      ["Instagram", row.instagram_url],
      ["Booking", row.booking_email],
      ["Upcoming gigs", row.upcoming_gigs],
      ["Bio", row.bio],
    ],
    actions: true,
  },
  tickets: {
    label: "Ticket clicks",
    table: "ticket_clicks",
    totalKey: "tickets",
    title: (row) => row.event_name || "Ticket click",
    meta: (row) => [row.source, formatDate(row.created_at)].filter(Boolean).join(" - "),
    details: (row) => [
      ["Destination", row.destination_url],
      ["Session", row.session_id],
      ["User", row.user_id],
    ],
    actions: false,
  },
};

function setAuthStatus(message, type = "") {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.dataset.status = type;
}

function setError(message = "") {
  if (!errorBox) return;
  errorBox.hidden = !message;
  errorBox.textContent = message;
}

function getAdminClient() {
  if (adminClient) return adminClient;
  if (!window.supabase || !adminSettings.url || !adminSettings.anonKey) return null;
  adminClient = window.supabase.createClient(adminSettings.url, adminSettings.anonKey);
  return adminClient;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function joinContact(name, email) {
  return [name, email].filter(Boolean).join(" - ");
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function updateSessionUi(user, isAdmin) {
  currentUser = user || null;
  userEmailLabel.textContent = user?.email || "Not signed in";
  signOutButton.hidden = !user;
  loginPanel.hidden = Boolean(user && isAdmin);
  adminApp.hidden = !user || !isAdmin;
}

async function checkAdminAccess(user) {
  const client = getAdminClient();
  if (!client || !user) return false;

  const { data, error } = await client.rpc("is_admin");
  if (error) {
    setError("Admin check failed. Run the updated Supabase schema, then add your email to admin_users.");
    return false;
  }

  return data === true;
}

async function initializeAdmin() {
  const client = getAdminClient();
  if (!client) {
    setAuthStatus("Add Supabase URL and anon key before using admin.", "error");
    return;
  }

  const { data } = await client.auth.getSession();
  const user = data.session?.user || null;

  if (!user) {
    updateSessionUi(null, false);
    setAuthStatus("Sign in with Google using your approved admin email.", "idle");
    return;
  }

  setAuthStatus("Checking admin access...");
  const isAdmin = await checkAdminAccess(user);
  updateSessionUi(user, isAdmin);

  if (!isAdmin) {
    setAuthStatus("Signed in, but this email is not approved in admin_users.", "error");
    return;
  }

  setAuthStatus("Admin access confirmed.", "success");
  await loadAllQueues();
}

async function signInWithGoogle() {
  const client = getAdminClient();
  if (!client) {
    setAuthStatus("Supabase is not configured yet.", "error");
    return;
  }

  await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });
}

async function sendEmailLink() {
  const client = getAdminClient();
  const email = emailLoginInput?.value.trim();

  if (!client) {
    setAuthStatus("Supabase is not configured yet.", "error");
    return;
  }

  if (!email) {
    setAuthStatus("Add your admin email first.", "error");
    return;
  }

  setAuthStatus("Sending admin sign-in link...");
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
    },
  });

  if (error) {
    setAuthStatus(error.message || "Could not send the admin email link.", "error");
    return;
  }

  setAuthStatus("Check your email for the SameSet admin sign-in link.", "success");
}

async function signOut() {
  const client = getAdminClient();
  if (client) await client.auth.signOut();
  updateSessionUi(null, false);
  setAuthStatus("Signed out.", "idle");
}

async function fetchQueueRows(config) {
  const client = getAdminClient();
  let query = client.from(config.table).select("*").order("created_at", { ascending: false }).limit(75);

  if (activeStatus !== "all" && config.actions) {
    query = query.eq("status", activeStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function loadAllQueues() {
  setError("");
  recordList.replaceChildren(makeElement("p", "admin-empty", "Loading review queues..."));

  try {
    const entries = await Promise.all(
      Object.entries(queueConfig).map(async ([key, config]) => [key, await fetchQueueRows(config)])
    );
    const queueRows = Object.fromEntries(entries);

    Object.entries(queueRows).forEach(([key, rows]) => {
      const metric = document.querySelector(`[data-admin-total="${queueConfig[key].totalKey}"]`);
      if (metric) metric.textContent = rows.length;
    });

    renderRecords(queueRows[activeQueue] || []);
  } catch (error) {
    recordList.replaceChildren();
    setError(error.message || "Could not load admin queues. Confirm your email is in admin_users.");
  }
}

function renderDetails(card, config, row) {
  const detailList = makeElement("dl", "admin-record-details");

  config.details(row).forEach(([label, value]) => {
    if (!value) return;
    const wrapper = makeElement("div");
    wrapper.append(makeElement("dt", "", label));
    const dd = makeElement("dd");
    if (String(value).startsWith("http")) {
      const link = makeElement("a", "", value);
      link.href = value;
      link.target = "_blank";
      link.rel = "noreferrer";
      dd.append(link);
    } else {
      dd.textContent = value;
    }
    wrapper.append(dd);
    detailList.append(wrapper);
  });

  card.append(detailList);
}

function renderActions(card, row) {
  const actions = makeElement("div", "admin-record-actions");
  const approve = makeElement("button", "primary-button", "Approve");
  const reject = makeElement("button", "ghost-button", "Reject");

  approve.type = "button";
  reject.type = "button";
  approve.dataset.statusAction = "approved";
  reject.dataset.statusAction = "rejected";
  approve.dataset.recordId = row.id;
  reject.dataset.recordId = row.id;

  actions.append(approve, reject);
  card.append(actions);
}

function renderRecords(rows) {
  const config = queueConfig[activeQueue];
  const fragment = document.createDocumentFragment();

  if (!rows.length) {
    fragment.append(makeElement("p", "admin-empty", "No records in this queue yet."));
    recordList.replaceChildren(fragment);
    return;
  }

  rows.forEach((row) => {
    const card = makeElement("article", "admin-record-card");
    const header = makeElement("div", "admin-record-header");
    const titleWrap = makeElement("div");
    const status = makeElement("span", `admin-record-status is-${row.status || "recorded"}`, row.status || "recorded");

    titleWrap.append(makeElement("strong", "", config.title(row)));
    titleWrap.append(makeElement("p", "", config.meta(row)));
    header.append(titleWrap, status);
    card.append(header);
    renderDetails(card, config, row);

    if (row.reviewed_at) {
      card.append(makeElement("p", "admin-reviewed", `Reviewed ${formatDate(row.reviewed_at)}`));
    }

    if (config.actions) {
      renderActions(card, row);
    }

    fragment.append(card);
  });

  recordList.replaceChildren(fragment);
}

async function updateRecordStatus(recordId, status) {
  const client = getAdminClient();
  const config = queueConfig[activeQueue];
  if (!config?.actions || !currentUser) return;

  setError("");
  const { error } = await client
    .from(config.table)
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: currentUser.id,
    })
    .eq("id", recordId);

  if (error) {
    setError(error.message || `Could not mark record ${status}.`);
    return;
  }

  await loadAllQueues();
}

googleLoginButton?.addEventListener("click", signInWithGoogle);
emailLoginButton?.addEventListener("click", sendEmailLink);
signOutButton?.addEventListener("click", signOut);
refreshButton?.addEventListener("click", loadAllQueues);

statusFilter?.addEventListener("change", () => {
  activeStatus = statusFilter.value;
  loadAllQueues();
});

adminTabs.forEach((button) => {
  button.addEventListener("click", () => {
    activeQueue = button.dataset.queue;
    adminTabs.forEach((tab) => tab.classList.toggle("is-active", tab === button));
    loadAllQueues();
  });
});

recordList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-status-action]");
  if (!button) return;
  updateRecordStatus(button.dataset.recordId, button.dataset.statusAction);
});

initializeAdmin();
