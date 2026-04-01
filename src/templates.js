const { reactionTypes, listCategories } = require("./photos");

function layout({ title, body, script = "" }) {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    ${body}
    ${script ? `<script type="module">${script}</script>` : ""}
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLoginPage(errorMessage = "") {
  return layout({
    title: "IdeaBank Cute Gallery",
    body: `
      <main class="login-shell">
        <section class="login-card">
          <p class="eyebrow">IdeaBank Cute Gallery</p>
          <h1>귀여운 순간은<br />비밀번호 뒤에 있습니다.</h1>
          <p class="intro">사진 감상과 리액션 참여를 위해 비밀번호를 입력하세요.</p>
          <form method="post" action="/login" class="login-form">
            <label for="password">접속 비밀번호</label>
            <input id="password" name="password" type="password" placeholder="ACCESS_PASSWORD" required />
            ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}
            <button type="submit">입장하기</button>
          </form>
        </section>
        <div class="login-art">
          <div class="bubble bubble-a"></div>
          <div class="bubble bubble-b"></div>
          <div class="bubble bubble-c"></div>
        </div>
      </main>
    `
  });
}

function renderGalleryPage(payload) {
  const categories = listCategories();
  const categoryFilters = ["전체", ...categories].map((category, index) => `
    <button class="chip${index === 0 ? " active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join("");

  const photoCards = payload.photos.map((photo) => `
    <article class="photo-card" data-category="${escapeHtml(photo.category)}">
      <div class="photo-frame">
        <img src="/assets/${escapeHtml(photo.svg)}" alt="${escapeHtml(photo.title)}" />
      </div>
      <div class="photo-copy">
        <div class="photo-meta">
          <span>${escapeHtml(photo.category)}</span>
          <span>${escapeHtml(photo.mood)}</span>
        </div>
        <h3>${escapeHtml(photo.title)}</h3>
        <p>${escapeHtml(photo.description)}</p>
        <div class="photo-footer">
          <span>${escapeHtml(photo.credit)}</span>
          <strong data-total="${escapeHtml(photo.id)}">${photo.totalReactions} reactions</strong>
        </div>
      </div>
      <div class="reaction-row">
        ${reactionTypes.map((reaction) => `
          <button class="reaction-button" data-photo-id="${escapeHtml(photo.id)}" data-reaction-id="${escapeHtml(reaction.id)}">
            <span>${reaction.emoji}</span>
            <span>${escapeHtml(reaction.label)}</span>
            <strong data-count="${escapeHtml(photo.id)}:${escapeHtml(reaction.id)}">${photo.reactions[reaction.id]}</strong>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");

  const topPhotos = payload.rankings.topPhotos.map((photo, index) => `
    <li>
      <span>#${index + 1}</span>
      <strong>${escapeHtml(photo.title)}</strong>
      <em>${photo.totalReactions} reactions</em>
    </li>
  `).join("");

  const topReactions = payload.rankings.reactionTotals.map((reaction, index) => `
    <li>
      <span>#${index + 1}</span>
      <strong>${reaction.emoji} ${escapeHtml(reaction.label)}</strong>
      <em>${reaction.count} taps</em>
    </li>
  `).join("");

  return layout({
    title: "Cute Gallery",
    body: `
      <main class="page-shell">
        <section class="hero">
          <div>
            <p class="eyebrow">잠금 해제 완료</p>
            <h1>귀여운 사진을 골라<br />즉시 리액션하세요.</h1>
            <p class="intro">주제별 갤러리와 실시간 반응 순위를 한 화면에서 확인할 수 있습니다.</p>
          </div>
          <form method="post" action="/logout">
            <button class="secondary-button" type="submit">잠금으로 돌아가기</button>
          </form>
        </section>

        <section class="rank-grid">
          <article class="rank-card">
            <p class="section-label">인기 사진</p>
            <ol id="top-photos">${topPhotos}</ol>
          </article>
          <article class="rank-card accent">
            <p class="section-label">리액션 순위</p>
            <ol id="top-reactions">${topReactions}</ol>
          </article>
        </section>

        <section class="filters">
          ${categoryFilters}
        </section>

        <section class="gallery-grid" id="gallery">
          ${photoCards}
        </section>
      </main>
    `,
    script: `
      const gallery = document.getElementById("gallery");
      const chips = [...document.querySelectorAll(".chip")];

      chips.forEach((chip) => {
        chip.addEventListener("click", async () => {
          chips.forEach((entry) => entry.classList.remove("active"));
          chip.classList.add("active");
          const selected = chip.dataset.category;
          [...gallery.querySelectorAll(".photo-card")].forEach((card) => {
            const show = selected === "전체" || card.dataset.category === selected;
            card.hidden = !show;
          });
        });
      });

      async function refreshRankings() {
        const response = await fetch("/api/photos");
        const payload = await response.json();

        payload.photos.forEach((photo) => {
          const totalNode = document.querySelector('[data-total="' + photo.id + '"]');
          if (totalNode) totalNode.textContent = photo.totalReactions + " reactions";
          Object.entries(photo.reactions).forEach(([reactionId, count]) => {
            const countNode = document.querySelector('[data-count="' + photo.id + ':' + reactionId + '"]');
            if (countNode) countNode.textContent = String(count);
          });
        });

        document.getElementById("top-photos").innerHTML = payload.rankings.topPhotos.map((photo, index) =>
          '<li><span>#' + (index + 1) + '</span><strong>' + photo.title + '</strong><em>' + photo.totalReactions + ' reactions</em></li>'
        ).join("");

        document.getElementById("top-reactions").innerHTML = payload.rankings.reactionTotals.map((reaction, index) =>
          '<li><span>#' + (index + 1) + '</span><strong>' + reaction.emoji + ' ' + reaction.label + '</strong><em>' + reaction.count + ' taps</em></li>'
        ).join("");
      }

      [...document.querySelectorAll(".reaction-button")].forEach((button) => {
        button.addEventListener("click", async () => {
          button.disabled = true;
          await fetch("/api/reactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              photoId: button.dataset.photoId,
              reactionId: button.dataset.reactionId
            })
          });
          await refreshRankings();
          button.disabled = false;
        });
      });
    `
  });
}

module.exports = {
  escapeHtml,
  renderGalleryPage,
  renderLoginPage
};
