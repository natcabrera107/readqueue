// ReadQueue — front-end logic for the item list (papers / books) and comments.

// ---------- constants ----------
const STATUSES = ["to-read", "reading", "done"];
const STATUS_LABEL = { "to-read": "To-Read", reading: "Reading", done: "Done" };

// "paper" -> /api/papers , "book" -> /api/books
const apiBase = (type) => `/api/${type}s`;

// ---------- state ----------
const itemsByType = { paper: [], book: [] }; // loaded items, per tab
let activeType = "paper"; // which tab is showing
let statusFilter = "all"; // All / To-Read / Reading / Done
let searchText = ""; // text in the search box
let editingId = null; // id being edited, or null when adding
let current = null; // item shown in the comments panel: { type, id }

// ---------- element references ----------
const layout = document.getElementById("layout");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll("[data-panel]");
const filters = document.querySelectorAll(".filter");
const searchInput = document.getElementById("search");
const content = document.querySelector(".content");

const comments = document.getElementById("comments");
const commentsFor = document.getElementById("comments-for");
const commentList = document.querySelector(".comment-list");
const commentForm = document.querySelector(".comment-form");
const commentName = commentForm.querySelector(".comment-name");
const commentInput = commentForm.querySelector("textarea");

const formBackdrop = document.getElementById("item-form-backdrop");
const itemForm = document.getElementById("item-form");
const itemFormTitle = document.getElementById("item-form-title");

// ---------- helpers ----------
function panelFor(type) {
  return document.querySelector(`[data-panel="${type}s"]`);
}

function updateAddLabel() {
  document.getElementById("add-item").textContent = `+ Add ${activeType}`;
}

function findItem(type, id) {
  return itemsByType[type].find((it) => String(it._id) === String(id));
}

// Escape user-supplied text before it goes into innerHTML.
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch]
  );
}

// ---------- load + render the list ----------
async function loadItems(type) {
  try {
    const res = await fetch(apiBase(type));
    itemsByType[type] = await res.json();
  } catch (err) {
    itemsByType[type] = [];
    console.warn(`Could not load ${type}s:`, err);
  }
  renderList();
}

function cardHTML(item, index) {
  const tags = (item.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  return `
    <li class="item-card" data-type="${activeType}" data-id="${item._id}">
      <span class="item-num">${index + 1}</span>
      <div class="item-body">
        <div class="item-main">
          <h3 class="item-title">${escapeHtml(item.title) || "Untitled"}</h3>
          <p class="item-authors">${escapeHtml(item.authors || "")}</p>
          <p class="item-venue">${escapeHtml(item.venue || "")} ${escapeHtml(item.year || "")}</p>
          <div class="tags">${tags}</div>
        </div>
        <div class="item-side">
          <button class="status">${STATUS_LABEL[item.status] || "To-Read"}</button>
          <div class="item-actions">
            <button class="action action-edit">&#9998; Edit</button>
            <button class="action action-delete">&#128465; Delete</button>
          </div>
        </div>
      </div>
    </li>`;
}

function renderList() {
  const panel = panelFor(activeType);
  const text = searchText.toLowerCase();

  const items = itemsByType[activeType]
    .filter((it) => statusFilter === "all" || it.status === statusFilter)
    .filter(
      (it) =>
        !text ||
        (it.title || "").toLowerCase().includes(text) ||
        (it.authors || "").toLowerCase().includes(text)
    );

  if (items.length === 0) {
    panel.innerHTML = `<li class="item-empty">No items yet.</li>`;
    return;
  }

  panel.innerHTML = items.map((it, i) => cardHTML(it, i)).join("");

  // keep the open comment item highlighted after a re-render
  if (current) {
    const sel = panel.querySelector(`.item-card[data-id="${current.id}"]`);
    if (sel) sel.classList.add("is-selected");
  }
}

// ---------- create / edit / delete / status ----------
function openForm(item) {
  editingId = item ? item._id : null;
  // Make the type explicit: "Add paper" / "Edit book" etc.
  itemFormTitle.textContent = (item ? "Edit " : "Add ") + activeType;
  const el = itemForm.elements;
  el.title.value = item ? item.title || "" : "";
  el.authors.value = item ? item.authors || "" : "";
  el.venue.value = item ? item.venue || "" : "";
  el.year.value = item ? item.year || "" : "";
  el.tags.value = item ? (item.tags || []).join(", ") : "";
  el.status.value = item ? item.status || "to-read" : "to-read";
  formBackdrop.hidden = false;
}

function closeForm() {
  formBackdrop.hidden = true;
  editingId = null;
}

itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(itemForm); // read fields safely (avoids name clashes)
  const year = (fd.get("year") || "").trim();
  const data = {
    title: (fd.get("title") || "").trim(),
    authors: (fd.get("authors") || "").trim(),
    venue: (fd.get("venue") || "").trim(),
    year: year ? Number(year) : null,
    tags: (fd.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: fd.get("status") || "to-read",
  };
  if (!data.title) return;

  try {
    if (editingId) {
      await fetch(`${apiBase(activeType)}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(apiBase(activeType), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await loadItems(activeType);
  } catch (err) {
    console.warn("Could not save item:", err);
  }
  closeForm();
});

async function deleteItem(card) {
  const id = card.dataset.id;
  if (!confirm("Delete this item?")) return;
  try {
    await fetch(`${apiBase(activeType)}/${id}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Could not delete item:", err);
  }
  if (current && current.id === id) closeComments();
  await loadItems(activeType);
}

async function cycleStatus(card) {
  const item = findItem(activeType, card.dataset.id);
  if (!item) return;
  const next = STATUSES[(STATUSES.indexOf(item.status) + 1) % STATUSES.length];
  try {
    await fetch(`${apiBase(activeType)}/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  } catch (err) {
    console.warn("Could not update status:", err);
  }
  await loadItems(activeType);
}

// ---------- comments ----------
function renderComments(items = []) {
  commentList.innerHTML = items
    .map(
      (c) => `
      <li class="comment">
        <div class="comment-head">
          <span class="comment-author">${escapeHtml(c.author)}</span>
          <span class="comment-date">${escapeHtml(new Date(c.createdAt).toLocaleString())}</span>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </li>`
    )
    .join("");
}

function openComments(card) {
  document
    .querySelectorAll(".item-card")
    .forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");

  current = { type: card.dataset.type, id: card.dataset.id };
  const item = findItem(current.type, current.id);
  commentsFor.textContent = item ? item.title : "";
  renderComments(item ? item.comments : []);

  comments.hidden = false;
  layout.classList.add("comments-open");
}

function closeComments() {
  comments.hidden = true;
  layout.classList.remove("comments-open");
  document
    .querySelectorAll(".item-card")
    .forEach((c) => c.classList.remove("is-selected"));
  current = null;
}

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!current) return;
  const author = commentName.value.trim();
  const text = commentInput.value.trim();
  if (!author || !text) return;

  try {
    const res = await fetch(`${apiBase(current.type)}/${current.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    });
    const item = await res.json();
    renderComments(item.comments);
    const cached = findItem(current.type, current.id);
    if (cached) cached.comments = item.comments; // keep cache in sync
  } catch (err) {
    console.warn("Could not post comment:", err);
  }
  commentInput.value = "";
});

// ---------- event wiring ----------
// Tabs: switch which list is shown, load it if needed.
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");

    const target = tab.dataset.tab; // "papers" | "books"
    panels.forEach((p) => (p.hidden = p.dataset.panel !== target));

    activeType = target === "books" ? "book" : "paper";
    updateAddLabel();
    closeComments();
    loadItems(activeType);
  });
});

// Status filter buttons.
filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    filters.forEach((f) => f.classList.remove("is-active"));
    filter.classList.add("is-active");
    statusFilter = filter.dataset.status;
    renderList();
  });
});

// Search box.
searchInput.addEventListener("input", () => {
  searchText = searchInput.value;
  renderList();
});

// Add item button + form cancel.
document
  .getElementById("add-item")
  .addEventListener("click", () => openForm(null));
document
  .getElementById("item-form-cancel")
  .addEventListener("click", closeForm);

// One delegated listener for everything inside a card.
content.addEventListener("click", (e) => {
  const card = e.target.closest(".item-card");
  if (!card) return;
  if (e.target.closest(".action-edit")) {
    openForm(findItem(activeType, card.dataset.id));
  } else if (e.target.closest(".action-delete")) {
    deleteItem(card);
  } else if (e.target.closest(".status")) {
    cycleStatus(card);
  } else {
    openComments(card);
  }
});

// Close the comments panel.
document
  .getElementById("comments-close")
  .addEventListener("click", closeComments);

// ---------- start ----------
updateAddLabel();
loadItems(activeType);
