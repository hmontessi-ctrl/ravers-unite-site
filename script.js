const panel = document.querySelector(".profile-panel");
const profileToggle = document.querySelector(".profile-toggle");
const profileToggleMobile = document.querySelector(".profile-toggle-mobile");
const profileToggleInline = document.querySelector(".profile-toggle-inline");
const panelClose = document.querySelector(".panel-close");
const backdrop = document.querySelector(".backdrop");
const toast = document.querySelector(".toast");
const ticketClickCount = document.querySelector(".ticket-click-count");
const intentTabs = document.querySelectorAll(".intent-tab");
const genreChips = document.querySelectorAll(".chip");
const djChips = document.querySelectorAll(".dj-chip");
const peopleCards = document.querySelectorAll(".person-card");
const eventCards = document.querySelectorAll(".event-card");
const preferenceTags = document.querySelectorAll(".preference-tag");
const guideTabs = document.querySelectorAll(".guide-tab");
const guidePanels = document.querySelectorAll(".guide-panel");
const cardSelects = document.querySelectorAll("[data-card-select]");
const waitlistForm = document.querySelector(".waitlist-form");
const waitlistStatus = document.querySelector(".waitlist-status");
const eventSubmitForm = document.querySelector(".event-submit-form");
const eventSubmitStatus = document.querySelector(".event-submit-status");
const businessInquiryForm = document.querySelector(".business-inquiry-form");
const businessInquiryStatus = document.querySelector(".business-inquiry-status");
const djClaimForm = document.querySelector(".dj-claim-form");
const djClaimStatus = document.querySelector(".dj-claim-status");
const adminRefreshButton = document.querySelector(".admin-refresh-button");
const adminReviewList = document.querySelector(".admin-review-list");
const approvedEventGrid = document.querySelector(".approved-event-grid");
const approvedDjGrid = document.querySelector(".approved-dj-grid");
const liveEventStatus = document.querySelector('[data-live-status="events"]');
const liveDjStatus = document.querySelector('[data-live-status="djs"]');
const localEventDetails = document.querySelector(".local-event-details");
const profileForm = document.querySelector(".profile-form");
const oauthButtons = document.querySelectorAll(".oauth-button");
const authStatus = document.querySelector(".auth-status");

let activeIntent = "all";
let activeGenre = "all";
let activeDj = "all";
let toastTimer;
let ticketClicks = Number(window.localStorage.getItem("sameSetTicketClicks") || 0);
let profileSaved = window.localStorage.getItem("sameSetProfileSaved") === "true";
let supabaseClient;

const supabaseSettings = window.SAMESET_SUPABASE || window.RAVERS_UNITE_SUPABASE || {};

const genreDjMap = {
  afrohouse: ["blackcoffee", "gordo", "honeydijon", "rampa"],
  organichouse: ["blackcoffee", "camelphat", "noraenpure", "rampa", "solomun"],
  melodichouse: ["anyma", "artbat", "blackcoffee", "boris", "camelphat", "ericprydz", "noraenpure", "solomun"],
  melodictechno: ["anyma", "artbat", "blackcoffee", "boris", "camelphat", "ericprydz", "maceoplex", "noraenpure", "solomun"],
  techhouse: [
    "anotr",
    "beltran",
    "bensterling",
    "chasewest",
    "chrislake",
    "chrisstussy",
    "cloonee",
    "coleknight",
    "danmolinari",
    "denniscruz",
    "fisher",
    "johnsummit",
    "joshbaker",
    "laylabenitez",
    "lucaz",
    "lukedean",
    "maup",
    "maxstyler",
    "michaelbibi",
    "mochakk",
    "msmada",
    "pawsa",
    "rafael",
    "sethtroxler",
    "slamm",
    "sosa",
    "thunderpony",
  ],
  minimaltechhouse: [
    "ajk",
    "beltran",
    "bensterling",
    "boris",
    "brunello",
    "chrisstussy",
    "cloonee",
    "coleknight",
    "eastenddubs",
    "eddym",
    "francescodelgarda",
    "hank",
    "joshbaker",
    "locodice",
    "lucaz",
    "maxdean",
    "rossi",
    "slugg",
  ],
  deephouse: ["anotr", "blackcoffee", "camelphat", "denniscruz", "honeydijon", "jamiejones", "noraenpure", "rampa", "solomun", "vintageculture"],
  progressivehouse: ["abovebeyond", "anyma", "artbat", "boris", "camelphat", "ericprydz", "noraenpure", "vintageculture"],
  peaktimetechno: ["adambeyer", "amelie", "boris", "carlcox", "charlotte", "josephcapriati", "layton", "nicolemoudaber", "pacoosuna"],
  hardtechno: ["amelie", "ihatemodels", "indirapaganotto", "nicomoreno"],
  industrialtechno: ["ihatemodels", "indirapaganotto", "nicomoreno", "rezz"],
  electrohouse: ["diplo", "domdolla", "fisher", "johnsummit", "skrillex", "tiesto"],
  ukgarage: ["fredagain", "skrillex", "tsha"],
  basshouse: ["anotr", "chasewest", "chrislake", "domdolla", "fisher", "johnsummit", "maxstyler", "skrillex"],
  dubstep: ["excision", "skrillex", "subtronics"],
  openformat: ["diplo", "domdolla", "fredagain", "johnsummit", "skrillex", "tiesto"],
  deserthouse: ["deserthearts", "honeydijon", "luciano", "mahony", "rampa", "sethtroxler"],
  localhouse: ["ajk", "brunello", "coleknight", "danmolinari", "laylabenitez", "msmada", "rafael", "slamm", "slugg", "thunderpony"],
};

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function renderTicketClicks() {
  if (ticketClickCount) {
    ticketClickCount.textContent = ticketClicks;
  }
}

function setStatus(element, message, state = "") {
  if (!element) {
    return;
  }

  element.textContent = message;
  if (state) {
    element.dataset.state = state;
  } else {
    delete element.dataset.state;
  }
}

function getSessionId() {
  const savedSessionId = window.localStorage.getItem("sameSetSessionId");

  if (savedSessionId) {
    return savedSessionId;
  }

  const newSessionId =
    window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem("sameSetSessionId", newSessionId);
  return newSessionId;
}

function saveLocalRecord(key, payload) {
  const existingRecords = JSON.parse(window.localStorage.getItem(key) || "[]");
  existingRecords.push({ ...payload, savedAt: new Date().toISOString() });
  window.localStorage.setItem(key, JSON.stringify(existingRecords));
}

function getLocalRecords(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setAdminCount(key, value) {
  document.querySelectorAll(`[data-admin-count="${key}"]`).forEach((element) => {
    element.textContent = value;
  });
}

function appendAdminItem(fragment, label, title, meta) {
  const article = document.createElement("article");
  const badge = document.createElement("span");
  const heading = document.createElement("strong");
  const copy = document.createElement("p");

  badge.textContent = label;
  heading.textContent = title || "Untitled";
  copy.textContent = meta || "No extra details yet.";

  article.append(badge, heading, copy);
  fragment.append(article);
}

function renderAdminDashboard() {
  const waitlist = getLocalRecords("sameSetWaitlist");
  const events = getLocalRecords("sameSetEventSubmissions");
  const partners = getLocalRecords("sameSetBusinessInquiries");
  const djs = getLocalRecords("sameSetDjClaims");

  setAdminCount("waitlist", waitlist.length);
  setAdminCount("events", events.length);
  setAdminCount("partners", partners.length);
  setAdminCount("djs", djs.length);
  setAdminCount("tickets", ticketClicks);

  if (!adminReviewList) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const latestItems = [
    ...djs.map((item) => ({
      label: "DJ claim",
      title: item.dj_name,
      meta: `${item.market || "Market TBD"} - ${item.primary_genre || "Genre TBD"} - ${item.email || "No email"}`,
      savedAt: item.savedAt,
    })),
    ...events.map((item) => ({
      label: "Event",
      title: item.event_name,
      meta: `${item.venue || "Venue TBD"} - ${item.city || "City TBD"} - ${item.email || "No email"}`,
      savedAt: item.savedAt,
    })),
    ...partners.map((item) => ({
      label: "Partner",
      title: item.business_name,
      meta: `${item.business_type || "Type TBD"} - ${item.city || "City TBD"} - ${item.email || "No email"}`,
      savedAt: item.savedAt,
    })),
    ...waitlist.map((item) => ({
      label: "Waitlist",
      title: item.display_name || item.email,
      meta: `${item.city || "City TBD"} - ${item.intent || "Intent TBD"} - ${item.favorite_djs || "DJs TBD"}`,
      savedAt: item.savedAt,
    })),
  ]
    .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
    .slice(0, 8);

  if (!latestItems.length) {
    appendAdminItem(fragment, "Ready", "No local submissions yet", "Submit a DJ claim, event, partner request, or waitlist entry to test this queue.");
  } else {
    latestItems.forEach((item) => appendAdminItem(fragment, item.label, item.title, item.meta));
  }

  adminReviewList.replaceChildren(fragment);
}

function isSupabaseConfigured() {
  return Boolean(
    window.supabase?.createClient &&
      supabaseSettings.url?.startsWith("http") &&
      supabaseSettings.anonKey,
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(supabaseSettings.url, supabaseSettings.anonKey);
  }

  return supabaseClient;
}

async function insertSupabaseRow(tableName, payload) {
  const client = getSupabaseClient();

  if (!client) {
    return { synced: false };
  }

  const { error } = await client.from(tableName).insert(payload);

  if (error) {
    throw error;
  }

  return { synced: true };
}

async function getCurrentUser() {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const { data } = await client.auth.getUser();
  return data?.user || null;
}

function setLiveStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function makePublicElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function formatPublicDate(value) {
  if (!value) return ["Live", "+"];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return ["Live", "+"];
  return [
    date.toLocaleDateString("en-US", { month: "short" }),
    date.toLocaleDateString("en-US", { day: "2-digit" }),
  ];
}

function getInitials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "+";
}

function renderApprovedEventCard(eventRecord) {
  const card = makePublicElement("article", "event-card hot");
  card.dataset.genre = (eventRecord.genres || []).join(" ").toLowerCase();
  card.dataset.intent = "crew dating hookups friends";

  const [month, day] = formatPublicDate(eventRecord.starts_at);
  const dateBox = makePublicElement("div", "event-date");
  dateBox.append(makePublicElement("span", "", month), makePublicElement("strong", "", day));

  const body = makePublicElement("div");
  body.append(makePublicElement("p", "tag", "Admin approved"));
  body.append(makePublicElement("h3", "", eventRecord.title));
  body.append(
    makePublicElement(
      "p",
      "",
      [eventRecord.venue_name, eventRecord.city, (eventRecord.dj_names || []).join(", ")].filter(Boolean).join(" - ") ||
        "Approved SameSet event.",
    ),
  );

  const avatarStack = makePublicElement("div", "avatar-stack");
  avatarStack.setAttribute("aria-label", "Event tags");
  [eventRecord.city, ...(eventRecord.genres || []), ...(eventRecord.dj_names || [])].slice(0, 4).forEach((item) => {
    avatarStack.append(makePublicElement("span", "", getInitials(item)));
  });
  body.append(avatarStack);

  const actions = makePublicElement("div", "event-actions");
  const going = makePublicElement("button", "ghost-button join-button", "Going");
  going.type = "button";
  actions.append(going);

  if (eventRecord.ticket_url) {
    const link = makePublicElement("a", "ticket-link", "Tickets");
    link.href = eventRecord.ticket_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.dataset.event = eventRecord.title;
    actions.append(link);
  } else {
    actions.append(makePublicElement("span", "live-source-badge", "No ticket link yet"));
  }

  card.append(dateBox, body, actions);
  return card;
}

function renderApprovedDjCard(dj) {
  const card = makePublicElement("article", "dj-card dj-dropdown-card");
  const avatar = makePublicElement("div", "dj-avatar cyan", getInitials(dj.dj_name));
  const body = makePublicElement("div");
  body.append(makePublicElement("span", "shop-label", [dj.tier, (dj.market || []).join(", ")].filter(Boolean).join(" - ") || "Approved DJ"));
  body.append(makePublicElement("h3", "", dj.dj_name));
  body.append(
    makePublicElement(
      "p",
      "",
      [dj.primary_genre, dj.subgenre, dj.style_description].filter(Boolean).join(" / ") || "Approved SameSet DJ profile.",
    ),
  );

  const meta = makePublicElement("div", "club-meta");
  [dj.primary_genre, ...(dj.vibe_tags || []), "Follow DJ"].filter(Boolean).slice(0, 3).forEach((item) => {
    meta.append(makePublicElement("span", "", item));
  });
  body.append(meta);

  const links = makePublicElement("div", "profile-link-row");
  [
    ["Music", dj.soundcloud_url || dj.spotify_url || dj.homepage_url],
    ["Instagram", dj.instagram_url],
    ["Profile", dj.homepage_url],
  ].forEach(([label, href]) => {
    if (!href) return;
    const link = makePublicElement("a", "", label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    links.append(link);
  });

  if (!links.children.length) {
    const claimLink = makePublicElement("a", "", "Claim links");
    claimLink.href = "#dj-claim";
    links.append(claimLink);
  }

  card.append(avatar, body, links);
  return card;
}

async function loadApprovedPublicContent() {
  const client = getSupabaseClient();

  if (!client) {
    setLiveStatus(liveEventStatus, "Supabase is not connected in this browser yet.");
    setLiveStatus(liveDjStatus, "Supabase is not connected in this browser yet.");
    return;
  }

  try {
    const [{ data: events, error: eventsError }, { data: djs, error: djsError }] = await Promise.all([
      client
        .from("events")
        .select("title,city,venue_name,starts_at,genres,dj_names,ticket_url,source")
        .eq("status", "approved")
        .order("starts_at", { ascending: true, nullsFirst: false })
        .limit(6),
      client
        .from("djs")
        .select("dj_name,market,tier,primary_genre,subgenre,style_description,vibe_tags,homepage_url,instagram_url,soundcloud_url,spotify_url")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (eventsError) throw eventsError;
    if (djsError) throw djsError;

    approvedEventGrid?.replaceChildren(...(events || []).map(renderApprovedEventCard));
    approvedDjGrid?.replaceChildren(...(djs || []).map(renderApprovedDjCard));

    setLiveStatus(
      liveEventStatus,
      events?.length ? `${events.length} approved event${events.length === 1 ? "" : "s"} live from Supabase.` : "No approved events yet. Approve an event in admin to publish it here.",
    );
    setLiveStatus(
      liveDjStatus,
      djs?.length ? `${djs.length} approved DJ profile${djs.length === 1 ? "" : "s"} live from Supabase.` : "No approved DJs yet. Approve a DJ claim in admin to publish it here.",
    );
  } catch (error) {
    setLiveStatus(liveEventStatus, "Approved events could not load yet. Check the public events policy.");
    setLiveStatus(liveDjStatus, "Approved DJs could not load yet. Check the public DJs policy.");
    console.warn("Approved public content failed to load:", error);
  }
}

async function updateAuthStatus() {
  if (!authStatus) {
    return;
  }

  const client = getSupabaseClient();

  if (!client) {
    setStatus(authStatus, "Prototype mode: add Supabase keys to activate Google and Apple login.");
    return;
  }

  const user = await getCurrentUser();

  if (user) {
    setStatus(authStatus, `Signed in as ${user.email || "your account"}.`, "success");
    return;
  }

  setStatus(authStatus, "Supabase connected. Continue with Google or Apple to save your profile.", "success");
}

function openPanel() {
  panel.classList.add("open");
  backdrop.classList.add("open");
  document.body.classList.add("panel-open");
  panel.setAttribute("aria-hidden", "false");
}

function closePanel() {
  panel.classList.remove("open");
  backdrop.classList.remove("open");
  document.body.classList.remove("panel-open");
  panel.setAttribute("aria-hidden", "true");
}

function matchesIntent(card) {
  return activeIntent === "all" || card.dataset.intent.includes(activeIntent);
}

function matchesGenre(card) {
  return activeGenre === "all" || card.dataset.genre.includes(activeGenre);
}

function matchesDj(card) {
  return activeDj === "all" || card.dataset.djs.includes(activeDj);
}

function djMatchesGenre(chip) {
  return activeGenre === "all" || chip.dataset.djFilter === "all" || genreDjMap[activeGenre]?.includes(chip.dataset.djFilter);
}

function filterDjChips() {
  let selectedDjVisible = activeDj === "all";

  djChips.forEach((chip) => {
    const isVisible = djMatchesGenre(chip);
    chip.classList.toggle("hidden-by-filter", !isVisible);

    if (chip.dataset.djFilter === activeDj && isVisible) {
      selectedDjVisible = true;
    }
  });

  if (!selectedDjVisible) {
    activeDj = "all";
    djChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.djFilter === "all");
    });
  }
}

function applyFilters() {
  filterDjChips();

  peopleCards.forEach((card) => {
    card.classList.toggle(
      "hidden-by-filter",
      !matchesIntent(card) || !matchesGenre(card) || !matchesDj(card),
    );
  });

  eventCards.forEach((card) => {
    card.classList.toggle("hidden-by-filter", !matchesIntent(card));
  });
}

function updateSelectedCard(select) {
  const cardGroup = select.dataset.cardSelect;

  if (!cardGroup) {
    return;
  }

  const cards = document.querySelectorAll(`[data-card-group="${cardGroup}"]`);
  let hasVisibleCard = false;

  cards.forEach((card) => {
    const isSelected = card.dataset.cardItem === select.value;
    card.hidden = !isSelected;
    hasVisibleCard = hasVisibleCard || isSelected;
  });

  if (!hasVisibleCard && cards.length > 0) {
    cards[0].hidden = false;
    select.value = cards[0].dataset.cardItem;
  }
}

profileToggle.addEventListener("click", openPanel);
profileToggleMobile.addEventListener("click", openPanel);
profileToggleInline?.addEventListener("click", openPanel);
panelClose.addEventListener("click", closePanel);
backdrop.addEventListener("click", closePanel);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanel();
  }
});

intentTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    intentTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeIntent = tab.dataset.filter;
    applyFilters();
  });
});

genreChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    genreChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    activeGenre = chip.dataset.genreFilter;
    applyFilters();
    showToast(
      activeGenre === "all"
        ? "Showing all favorite DJs."
        : `Showing ${chip.textContent.trim()} DJs and matches.`,
    );
  });
});

djChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    djChips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    activeDj = chip.dataset.djFilter;
    applyFilters();
  });
});

preferenceTags.forEach((tag) => {
  tag.addEventListener("click", () => {
    tag.classList.toggle("active");
  });
});

guideTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    guideTabs.forEach((item) => item.classList.remove("active"));
    guidePanels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document
      .querySelector(`[data-guide-panel="${tab.dataset.guide}"]`)
      ?.classList.add("active");
  });
});

cardSelects.forEach((select) => {
  updateSelectedCard(select);
  select.addEventListener("change", () => updateSelectedCard(select));
});

document.querySelectorAll(".join-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("joined");
    button.textContent = button.classList.contains("joined") ? "You're going" : "Going";
    showToast(button.classList.contains("joined") ? "Added to your event plan." : "Removed from your event plan.");
  });
});

document.querySelectorAll(".ticket-link").forEach((link) => {
  link.addEventListener("click", async () => {
    ticketClicks += 1;
    window.localStorage.setItem("sameSetTicketClicks", String(ticketClicks));
    renderTicketClicks();
    showToast(`Ticket referral tracked: ${link.dataset.event || "partner link"}.`);

    try {
      await insertSupabaseRow("ticket_clicks", {
        event_name: link.dataset.event || link.textContent.trim(),
        destination_url: link.href,
        source: "website",
        session_id: getSessionId(),
      });
    } catch (error) {
      console.warn("Ticket click saved locally only:", error);
    }
  });
});

document.querySelectorAll(".local-event-submit").forEach((button) => {
  button.addEventListener("click", () => {
    if (localEventDetails) {
      localEventDetails.open = true;
      localEventDetails.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast("Event submission form opened.");
  });
});

waitlistForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(waitlistForm);
  const payload = {
    email: String(data.get("email") || "").trim(),
    display_name: String(data.get("displayName") || "").trim(),
    city: data.get("city"),
    intent: data.get("intent"),
    favorite_djs: String(data.get("favoriteDjs") || "").trim(),
    source: "public_website",
  };

  if (!payload.email) {
    setStatus(waitlistStatus, "Add an email so we can invite you.", "error");
    return;
  }

  setStatus(waitlistStatus, "Saving your beta spot...");

  try {
    const result = await insertSupabaseRow("waitlist_signups", payload);

    if (result.synced) {
      setStatus(waitlistStatus, "You're on the beta list. We'll invite you when profiles open.", "success");
    } else {
      saveLocalRecord("sameSetWaitlist", payload);
      setStatus(waitlistStatus, "Saved in this browser. Add Supabase keys to sync the real waitlist.", "success");
    }

    showToast("Beta spot saved.");
    waitlistForm.reset();
    renderAdminDashboard();
  } catch (error) {
    const duplicateEmail = error?.code === "23505";
    setStatus(
      waitlistStatus,
      duplicateEmail ? "That email is already on the waitlist." : "Could not save yet. Try again in a minute.",
      duplicateEmail ? "success" : "error",
    );
  }
});

eventSubmitForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(eventSubmitForm);
  const payload = {
    contact_name: String(data.get("contactName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    venue: String(data.get("venue") || "").trim(),
    city: String(data.get("city") || "").trim(),
    event_name: String(data.get("eventName") || "").trim(),
    event_date: data.get("eventDate") || null,
    dj_names: String(data.get("djNames") || "").trim(),
    genres: String(data.get("genres") || "").trim(),
    ticket_url: String(data.get("ticketUrl") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
    source: "website_submission",
  };

  if (!payload.contact_name || !payload.email || !payload.venue || !payload.city || !payload.event_name) {
    setStatus(eventSubmitStatus, "Add your name, email, venue, city, and event name.", "error");
    return;
  }

  setStatus(eventSubmitStatus, "Saving event submission...");

  try {
    const result = await insertSupabaseRow("promoter_submissions", payload);

    if (result.synced) {
      setStatus(eventSubmitStatus, "Submitted. It will go into the local event approval queue.", "success");
    } else {
      saveLocalRecord("sameSetEventSubmissions", payload);
      setStatus(eventSubmitStatus, "Saved in this browser. Add Supabase keys to sync submissions.", "success");
    }

    showToast("Local event submitted.");
    eventSubmitForm.reset();
    renderAdminDashboard();
  } catch (error) {
    setStatus(eventSubmitStatus, "Could not submit yet. Check the Supabase table and RLS policy.", "error");
  }
});

businessInquiryForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(businessInquiryForm);
  const payload = {
    contact_name: String(data.get("contactName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    business_name: String(data.get("businessName") || "").trim(),
    city: String(data.get("city") || "").trim(),
    business_type: String(data.get("businessType") || "").trim(),
    website_url: String(data.get("websiteUrl") || "").trim(),
    offer_details: String(data.get("offerDetails") || "").trim(),
    best_fit: String(data.get("bestFit") || "").trim(),
    source: "public_partner_form",
  };

  if (!payload.contact_name || !payload.email || !payload.business_name || !payload.business_type || !payload.offer_details) {
    setStatus(businessInquiryStatus, "Add your name, email, business, type, and what you want showcased.", "error");
    return;
  }

  setStatus(businessInquiryStatus, "Saving showcase request...");

  try {
    const result = await insertSupabaseRow("business_inquiries", payload);

    if (result.synced) {
      setStatus(businessInquiryStatus, "Submitted. We will review it for the partner showcase queue.", "success");
    } else {
      saveLocalRecord("sameSetBusinessInquiries", payload);
      setStatus(businessInquiryStatus, "Saved in this browser. Add Supabase keys to sync partner requests.", "success");
    }

    showToast("Business showcase request submitted.");
    businessInquiryForm.reset();
    renderAdminDashboard();
  } catch (error) {
    setStatus(businessInquiryStatus, "Could not submit yet. Check the Supabase table and RLS policy.", "error");
  }
});

djClaimForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(djClaimForm);
  const payload = {
    contact_name: String(data.get("contactName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    dj_name: String(data.get("djName") || "").trim(),
    market: String(data.get("market") || "").trim(),
    tier: String(data.get("tier") || "").trim(),
    primary_genre: String(data.get("primaryGenre") || "").trim(),
    music_url: String(data.get("musicUrl") || "").trim(),
    instagram_url: String(data.get("instagramUrl") || "").trim(),
    booking_email: String(data.get("bookingEmail") || "").trim(),
    upcoming_gigs: String(data.get("upcomingGigs") || "").trim(),
    bio: String(data.get("bio") || "").trim(),
    source: "public_dj_claim_form",
  };

  if (!payload.contact_name || !payload.email || !payload.dj_name) {
    setStatus(djClaimStatus, "Add your name, email, and DJ name.", "error");
    return;
  }

  setStatus(djClaimStatus, "Saving DJ profile claim...");

  try {
    const result = await insertSupabaseRow("dj_claims", payload);

    if (result.synced) {
      setStatus(djClaimStatus, "Submitted. It will go into the DJ profile review queue.", "success");
    } else {
      saveLocalRecord("sameSetDjClaims", payload);
      setStatus(djClaimStatus, "Saved in this browser. Add the dj_claims table to sync claims.", "success");
    }

    showToast("DJ profile claim submitted.");
    djClaimForm.reset();
    renderAdminDashboard();
  } catch (error) {
    saveLocalRecord("sameSetDjClaims", payload);
    setStatus(djClaimStatus, "Saved in this browser. Run the dj_claims schema to sync claims to Supabase.", "success");
    showToast("DJ profile claim saved locally.");
    djClaimForm.reset();
    renderAdminDashboard();
  }
});

adminRefreshButton?.addEventListener("click", () => {
  renderAdminDashboard();
  showToast("Founder dashboard refreshed.");
});

document.querySelectorAll(".buddy-button").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Solo request saved. Matching you with verified ravers.");
  });
});

document.querySelectorAll(".shop-button").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Added to the launch checklist.");
  });
});

document.querySelectorAll(".dj-card .ticket-link").forEach((link) => {
  link.addEventListener("click", () => {
    showToast("Opening this DJ's next set.");
  });
});

document.querySelectorAll(".connect-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!profileSaved) {
      openPanel();
      showToast("Build your 18+ profile first, then send matches.");
      return;
    }
    button.classList.add("connected");
    button.textContent = "Requested";
    button.disabled = true;
    showToast("Connection request sent.");
  });
});

document.querySelector(".scene-button").addEventListener("click", () => {
  const city = document.querySelector("#city-search").value.trim() || "your city";
  showToast(`Showing the ${city} scene.`);
});

oauthButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const client = getSupabaseClient();

    if (!client) {
      setStatus(authStatus, "Add your Supabase URL and public anon key, then enable this OAuth provider.", "error");
      showToast("OAuth is ready to connect once Supabase is configured.");
      return;
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: button.dataset.provider,
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });

    if (error) {
      setStatus(authStatus, `OAuth error: ${error.message}`, "error");
    }
  });
});

function buildProfilePayload(form) {
  const data = new FormData(form);
  const photos = [...form.querySelector('input[name="profilePhotos"]')?.files || []].map((file) => file.name);

  return {
    display_name: String(data.get("displayName") || "").trim(),
    age: Number(data.get("age")),
    is_18_confirmed: data.get("ageConfirm") === "on",
    photo_count: photos.length,
    photo_names: photos,
    home_scene: String(data.get("homeScene") || "").trim(),
    profile_prompt: String(data.get("profilePrompt") || "").trim(),
    intents: getCheckedValues("intent", form),
    relationship_style: data.get("relationshipStyle"),
    connection_pace: data.get("connectionPace"),
    orientation: data.get("orientation"),
    gender: data.get("gender"),
    boundaries: getCheckedValues("boundary", form),
    genres: data.get("genres"),
    favorite_djs: String(data.get("favoriteDjs") || "").trim(),
    next_event: String(data.get("nextEvent") || "").trim(),
    music_link: String(data.get("musicLink") || "").trim(),
    social_link: String(data.get("socialLink") || "").trim(),
    visibility: "active",
  };
}

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = buildProfilePayload(profileForm);

  if (!payload.is_18_confirmed || payload.age < 18) {
    showToast("Confirm you are 18+ before saving.");
    return;
  }

  try {
    const client = getSupabaseClient();
    const user = client ? await getCurrentUser() : null;

    if (client && user) {
      const { error } = await client.from("profiles").upsert({ ...payload, id: user.id });

      if (error) {
        throw error;
      }

      setStatus(authStatus, "Profile synced to your account.", "success");
      showToast("Profile saved to Supabase.");
    } else {
      window.localStorage.setItem("sameSetProfile", JSON.stringify(payload));
      showToast(client ? "Profile saved locally. Sign in to sync it." : "Profile saved locally. Add Supabase to sync.");
    }

    profileSaved = true;
    window.localStorage.setItem("sameSetProfileSaved", "true");
    closePanel();
  } catch (error) {
    showToast("Could not save profile yet. Check Supabase setup.");
    setStatus(authStatus, `Profile sync error: ${error.message}`, "error");
  }
});

function getCheckedValues(name, root = document) {
  return [...root.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function updateProfilePreview() {
  const form = profileForm;
  const previewName = document.querySelector(".preview-name");
  const previewMeta = document.querySelector(".preview-meta");

  if (!form || !previewName || !previewMeta) {
    return;
  }

  const data = new FormData(form);
  const displayName = data.get("displayName") || "Your profile";
  const age = data.get("age") || "18+";
  const intents = getCheckedValues("intent", form);
  const intentText = intents.length ? intents.join(", ") : "Choose intent";
  const genres = data.get("genres") || "Choose genres";
  const homeScene = data.get("homeScene") || "Choose scene";
  const photoCount = form.querySelector('input[name="profilePhotos"]')?.files?.length || 0;
  const photoText = photoCount ? ` - ${photoCount} photos` : "";

  previewName.textContent = `${displayName}, ${age}`;
  previewMeta.textContent = `${intentText} - ${genres} - ${homeScene}${photoText}`;
}

profileForm?.addEventListener("input", updateProfilePreview);
profileForm?.addEventListener("change", updateProfilePreview);

applyFilters();
renderTicketClicks();
renderAdminDashboard();
loadApprovedPublicContent();
updateAuthStatus();
updateProfilePreview();
