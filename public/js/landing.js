// Basic interactions for the landing page.

// ---------- Tab switching ----------
// Show the list panel that matches the clicked tab (papers or books).
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll("[data-panel]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");

    const target = tab.dataset.tab;
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== target;
    });
  });
});

// ---------- Comments panel ----------
// Works for any item (paper or book). Each card carries data-type and data-id,
// so the only thing that differs between papers and books is the URL prefix.
const layout = document.getElementById("layout");
const comments = document.getElementById("comments");
const commentsFor = document.getElementById("comments-for");
const commentList = document.querySelector(".comment-list");
const commentForm = document.querySelector(".comment-form");
const commentName = commentForm.querySelector(".comment-name");
const commentInput = commentForm.querySelector("textarea");

// The item whose comments are currently shown: { type, id }.
let current = null;

// "paper" -> /api/papers , "book" -> /api/books
const baseUrl = (type) => `/api/${type}s`;

// Rebuild the comment list from an array of comments.
function renderComments(items = []) {
  commentList.innerHTML = items
    .map(
      (c) => `
      <li class="comment">
        <div class="comment-head">
          <span class="comment-author">${c.author}</span>
          <span class="comment-date">${new Date(c.createdAt).toLocaleString()}</span>
        </div>
        <p class="comment-text">${c.text}</p>
      </li>`
    )
    .join("");
}

// Open the comments panel for a given card.
async function openComments(card) {
  document
    .querySelectorAll(".item-card")
    .forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");

  current = { type: card.dataset.type, id: card.dataset.id };
  commentsFor.textContent = card.querySelector(".item-title").textContent;

  comments.hidden = false;
  layout.classList.add("comments-open");

  // Load this item (with its embedded comments) from the backend.
  try {
    const res = await fetch(`${baseUrl(current.type)}/${current.id}`);
    const item = await res.json();
    renderComments(item.comments);
  } catch (err) {
    // No backend yet: keep the placeholder comment that is already in the HTML.
    console.warn("Could not load comments:", err);
  }
}

// Close the comments panel and clear the selection.
function closeComments() {
  comments.hidden = true;
  layout.classList.remove("comments-open");
  document
    .querySelectorAll(".item-card")
    .forEach((c) => c.classList.remove("is-selected"));
  current = null;
}

// Event delegation: one listener handles every card, including ones added later.
document.querySelector(".content").addEventListener("click", (e) => {
  const card = e.target.closest(".item-card");
  if (card) openComments(card);
});

// The × button closes the comments panel.
document.getElementById("comments-close").addEventListener("click", closeComments);

// Post a new comment to the currently selected item.
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!current) return;

  const author = commentName.value.trim();
  const text = commentInput.value.trim();
  if (!author || !text) return; // need both a name and a comment

  try {
    const res = await fetch(`${baseUrl(current.type)}/${current.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    });
    const item = await res.json();
    renderComments(item.comments);
  } catch (err) {
    console.warn("Could not post comment:", err);
  }

  commentInput.value = "";
});
