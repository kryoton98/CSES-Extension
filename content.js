// ==========================================
// 1. CONFIGURATION & HELPERS
// ==========================================

// Community-estimated difficulty ratings (Codeforces Elo scale)
const PROBLEM_RATINGS = {
  // --- Introductory ---
  "1068": 800,  "1083": 800,  "1069": 800,  "1094": 800, 
  "1070": 1000, "1071": 1100, "1072": 1200, "1092": 1100,
  "1617": 1100, "1618": 1100, "1754": 1400, "1755": 1400, 
  "1622": 1500, "1623": 1600, "1624": 1600, "1625": 1900,

  // --- Sorting & Searching ---
  "1621": 800,  "1084": 900,  "1090": 1000, "1091": 1100, 
  "1619": 1200, "1629": 1200, "1640": 1200, "1643": 1200, 
  "1074": 1200, "2183": 1400, "2216": 1400, "2217": 1500, 
  "1141": 1500, "1073": 1500, "1163": 1600, "1164": 1600, 
  "1620": 1700, "1630": 1700, "1631": 1700, "1641": 1700, 
  "1642": 1800, "1645": 1900, "1632": 2000, "2162": 2000, 
  "2168": 2000, "2169": 2100, "2428": 2200, "1076": 2200, 
  "1077": 2200, "1660": 2300, "1661": 2300, "1662": 2300,

  // --- Dynamic Programming ---
  "1633": 1100, "1634": 1200, "1635": 1300, "1636": 1300, 
  "1637": 1300, "1638": 1300, "1158": 1400, "1746": 1500, 
  "1639": 1600, "1744": 1600, "1745": 1700, "1639": 1700,
  "1093": 1800, "1745": 1800, "1145": 1900, "1140": 2000, 
  "1653": 2100, "1749": 2100, "2220": 2200, "1653": 2200,

  // --- Graph Algorithms ---
  "1192": 1100, "1193": 1200, "1666": 1200, "1667": 1300, 
  "1668": 1300, "1669": 1400, "1194": 1600, "1671": 1600, 
  "1672": 1700, "1673": 1800, "1195": 1900, "1197": 2000, 
  "1202": 2000, "1196": 2100, "1675": 1600, "1676": 1600,

  // --- Range Queries ---
  "1646": 1100, "1647": 1200, "1648": 1300, "1649": 1300,
  "1650": 1500, "1651": 1600, "1652": 1500, "1749": 1800,

  // --- Mathematics ---
  "1095": 1100, "1712": 1200, "1713": 1400, "1081": 1300,
  "1082": 1500, "1715": 1500, "1716": 1600, "1717": 1700
};

// ... (Rest of your code below) ...

// ... (Rest of your code below) ...
function getDifficultyColorClass(rating) {
  if (rating < 1200) return 'rating-easy';
  if (rating < 1600) return 'rating-med';
  if (rating < 2000) return 'rating-hard';
  return 'rating-insane';
}

function renderLaTeX(text, container) {
  if (typeof katex !== 'undefined') {
    let html = text.replace(/</g, "&lt;").replace(/\n/g, "<br>");
    html = html.replace(/\\\[(.*?)\\\]/gs, (_, m) => { try { return katex.renderToString(m, {displayMode:true, throwOnError:false}); } catch(e){ return m; } });
    html = html.replace(/\$\$(.*?)\$\$/gs, (_, m) => { try { return katex.renderToString(m, {displayMode:true, throwOnError:false}); } catch(e){ return m; } });
    html = html.replace(/\\\((.*?)\\\)/g, (_, m) => { try { return katex.renderToString(m, {displayMode:false, throwOnError:false}); } catch(e){ return m; } });
    html = html.replace(/\$(.*?)\$/g, (_, m) => { try { return katex.renderToString(m, {displayMode:false, throwOnError:false}); } catch(e){ return m; } });
    container.innerHTML = html;
  } else {
    container.innerHTML = "<i>KaTeX loading...</i>";
  }
}

// ==========================================
// 2. MODAL SYSTEM
// ==========================================
let activeTaskId = null;

function injectModal() {
  if (document.getElementById('cses-note-modal')) return;

  const html = `
    <div id="cses-note-modal-overlay">
      <div id="cses-note-modal">
        <div class="modal-header">
          <span class="modal-title" id="modal-task-title">Edit Note</span>
          <span class="close-btn" id="close-modal-x">&times;</span>
        </div>
        <div class="modal-tabs-container">
          <div class="modal-tabs">
            <button class="modal-tab active" id="tab-write">Write</button>
            <button class="modal-tab" id="tab-preview">Preview</button>
          </div>
        </div>
        <div class="modal-body">
          <textarea id="cses-note-textarea" placeholder="Write your notes here... (Supports LaTeX $...$)"></textarea>
          <div id="cses-note-preview"></div>
        </div>
        <div class="modal-footer">
          <button class="cses-btn" id="btn-cancel">Cancel</button>
          <button class="cses-btn" id="btn-save">Save</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('cses-note-modal-overlay');
  const close = () => overlay.style.display = 'none';
  
  document.getElementById('close-modal-x').onclick = close;
  document.getElementById('btn-cancel').onclick = close;
  overlay.onclick = (e) => { if(e.target === overlay) close(); };

  document.getElementById('btn-save').onclick = () => {
    const text = document.getElementById('cses-note-textarea').value;
    chrome.storage.local.set({ [activeTaskId]: text }, () => {
      // Update List Icon
      const icon = document.getElementById(`note-icon-${activeTaskId}`);
      if(icon) icon.classList.toggle('has-note', text.trim() !== "");
      // Update Sidebar
      updateSidebarNotePanel(text);
      close();
    });
  };

  const writeTab = document.getElementById('tab-write');
  const prevTab = document.getElementById('tab-preview');
  const area = document.getElementById('cses-note-textarea');
  const prevDiv = document.getElementById('cses-note-preview');

  writeTab.onclick = () => {
    writeTab.classList.add('active'); prevTab.classList.remove('active');
    area.style.display = 'block'; prevDiv.style.display = 'none';
  };
  prevTab.onclick = () => {
    writeTab.classList.remove('active'); prevTab.classList.add('active');
    area.style.display = 'none'; prevDiv.style.display = 'block';
    renderLaTeX(area.value, prevDiv);
  };
}

function openModal(id, title) {
  activeTaskId = id;
  document.getElementById('modal-task-title').innerText = title;
  const area = document.getElementById('cses-note-textarea');
  document.getElementById('tab-write').click(); 
  area.value = "Loading...";
  document.getElementById('cses-note-modal-overlay').style.display = 'flex';
  
  chrome.storage.local.get([id], (res) => {
    area.value = res[id] || "";
    area.focus();
  });
}

// ==========================================
// 3. TASK PAGE FEATURES (Sidebar, Copy)
// ==========================================

function updateSidebarNotePanel(text) {
  const el = document.getElementById('cses-sidebar-note-content');
  if (!el) return;
  if (!text || text.trim() === "") {
    el.innerText = "Click to add a note..."; el.classList.add('empty-note');
    el.style.fontStyle = ""; el.style.color = "";
  } else {
    el.classList.remove('empty-note');
    el.style.fontStyle = ""; el.style.color = "";
    renderLaTeX(text, el);
  }
}

function injectStopwatch(taskId) {
  if (document.getElementById('cses-stopwatch-widget')) return;
  const widget = document.createElement('div');
  widget.id = 'cses-stopwatch-widget';
  widget.innerHTML = `<span class="stopwatch-icon">⏱️</span><div class="stopwatch-time" id="sw-display">00:00:00</div><div class="stopwatch-label" id="sw-label">Click to Start</div>`;
  
  const sidebar = document.querySelector('.nav.sidebar');
  if (sidebar) sidebar.prepend(widget);

  let timerInterval = null, startTime = null, isRunning = false;

  const updateDisplay = () => {
    if (!isRunning) return;
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff/3600)).padStart(2,'0');
    const m = String(Math.floor((diff%3600)/60)).padStart(2,'0');
    const s = String(diff%60).padStart(2,'0');
    document.getElementById('sw-display').innerText = `${h}:${m}:${s}`;
  };

  const toggle = () => {
    if (isRunning) {
      isRunning = false; clearInterval(timerInterval);
      widget.classList.remove('running');
      document.getElementById('sw-label').innerText = "Stopped";
      chrome.storage.local.set({ [`sw-${taskId}`]: null });
    } else {
      isRunning = true; startTime = Date.now();
      widget.classList.add('running');
      document.getElementById('sw-label').innerText = "Running...";
      chrome.storage.local.set({ [`sw-${taskId}`]: startTime });
      updateDisplay();
      timerInterval = setInterval(updateDisplay, 1000);
    }
  };

  chrome.storage.local.get([`sw-${taskId}`], (res) => {
    if (res[`sw-${taskId}`]) {
      startTime = res[`sw-${taskId}`]; isRunning = true;
      widget.classList.add('running'); document.getElementById('sw-label').innerText = "Running...";
      updateDisplay();
      timerInterval = setInterval(updateDisplay, 1000);
    }
  });
  widget.onclick = toggle;
}

function injectProblemPageFeatures() {
  const taskId = window.location.href.split('/').pop();
  const taskTitle = document.querySelector('h1')?.innerText || "Problem";

  // 1. Copy Buttons
  document.querySelectorAll('.content pre').forEach(pre => {
    if (pre.parentNode.classList.contains('cses-pre-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'cses-pre-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    const btn = document.createElement('button');
    btn.innerText = 'Copy'; btn.className = 'cses-copy-btn';
    btn.onclick = (e) => {
       e.stopPropagation();
       navigator.clipboard.writeText(pre.innerText).then(() => { btn.innerText = 'Copied!'; setTimeout(() => btn.innerText = 'Copy', 2000); });
    };
    wrapper.appendChild(btn);
  });

  // 2. Sidebar Note
  if (!document.getElementById('cses-sidebar-note')) {
    const panel = document.createElement('div');
    panel.id = 'cses-sidebar-note';
    panel.innerHTML = `<div class="note-widget-header"><span>📝 My Notes</span><span class="note-widget-edit-btn">Edit</span></div><div id="cses-sidebar-note-content">Loading...</div>`;
    chrome.storage.local.get([taskId], (res) => updateSidebarNotePanel(res[taskId] || ""));
    panel.onclick = () => openModal(taskId, taskTitle);

    const sidebar = document.querySelector('.nav.sidebar');
    if (sidebar) {
      const headers = Array.from(sidebar.querySelectorAll('h4, .caption'));
      const tagsHeader = headers.find(h => h.innerText.includes('Tags'));
      if (tagsHeader) {
         let next = tagsHeader.nextElementSibling;
         while(next && next.tagName !== 'H4') next = next.nextElementSibling;
         next ? sidebar.insertBefore(panel, next) : sidebar.appendChild(panel);
      } else { sidebar.appendChild(panel); }
    }
  }
  
  // 3. Stopwatch
  injectStopwatch(taskId);
}


// ==========================================
// 4. DASHBOARD & SPEEDRUN
// ==========================================
let selectedSectionIndex = null;
let currentStats = { total: { s: 0, t: 0 }, sections: [] };

function renderSpeedrunPanel(totalSolvedNow) {
  const panel = document.createElement('div');
  panel.className = 'speedrun-panel';
  
  const setupHTML = `
    <div class="speedrun-controls"><span class="speedrun-title">🚀 Speedrun</span>
    <select class="speedrun-select" id="sr-duration"><option value="60">1 Hour</option><option value="120">2 Hours</option><option value="180">3 Hours</option><option value="240">4 Hours</option><option value="300">5 Hours</option></select>
    <button class="speedrun-btn" id="sr-start-btn">Start</button>
    <button class="speedrun-btn backup-btn" id="export-data-btn">💾 Backup Data</button></div>`;
  
  const activeHTML = `
    <div class="speedrun-controls"><span class="speedrun-title">🔥 Speedrun Active!</span><button class="speedrun-btn stop-btn" id="sr-stop-btn">End Run</button></div>
    <div class="speedrun-display"><div class="speedrun-stats">Solved: <b style="color:#fff; font-size:1.2em;" id="sr-count">0</b></div><div class="speedrun-timer" id="sr-timer">00:00:00</div></div>`;

  chrome.storage.local.get(['speedrunState'], (res) => {
    const state = res.speedrunState;
    if (state && state.endTime > Date.now()) {
      panel.innerHTML = activeHTML;
      const countEl = panel.querySelector('#sr-count');
      const timerEl = panel.querySelector('#sr-timer');
      const solvedInSession = totalSolvedNow - state.startCount;
      countEl.innerText = solvedInSession > 0 ? `+${solvedInSession}` : "0";

      const tick = () => {
        const remaining = Math.floor((state.endTime - Date.now()) / 1000);
        if (remaining <= 0) {
           panel.innerHTML = `<div style="color:#fff">🏁 <b>Time's Up!</b> You solved ${solvedInSession} problems.</div>`;
           chrome.storage.local.remove('speedrunState'); return;
        }
        const h = String(Math.floor(remaining/3600)).padStart(2,'0');
        const m = String(Math.floor((remaining%3600)/60)).padStart(2,'0');
        const s = String(remaining%60).padStart(2,'0');
        timerEl.innerText = `${h}:${m}:${s}`;
      };
      tick(); setInterval(tick, 1000);
      panel.querySelector('#sr-stop-btn').onclick = () => { if(confirm("End session?")) { chrome.storage.local.remove('speedrunState'); location.reload(); } };
    } else {
      panel.innerHTML = setupHTML;
      panel.querySelector('#sr-start-btn').onclick = () => {
        const mins = parseInt(document.getElementById('sr-duration').value);
        const newState = { endTime: Date.now() + (mins*60000), startCount: totalSolvedNow };
        chrome.storage.local.set({ speedrunState: newState }, () => location.reload());
      };
      panel.querySelector('#export-data-btn').onclick = () => {
        chrome.storage.local.get(null, (d) => {
          const url = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], {type:'application/json'}));
          const a = document.createElement('a'); a.href = url; a.download = `cses_backup.json`; a.click();
        });
      };
    }
  });
  return panel;
}

function handleListPage() {
  const tables = document.querySelectorAll('.task-list');
  if (tables.length === 0) return;

  chrome.storage.local.get(['hideRatings'], (res) => { if (res.hideRatings) document.body.classList.add('cses-hide-ratings'); });

  let totalS = 0, totalT = 0, sections = [];

  tables.forEach((table) => {
    table.querySelectorAll('.task a').forEach(link => {
       const id = link.getAttribute('href').split('/').pop();
       if (PROBLEM_RATINGS[id] && !link.querySelector('.rating-badge')) {
         const span = document.createElement('span');
         span.className = `rating-badge ${getDifficultyColorClass(PROBLEM_RATINGS[id])}`;
         span.innerText = PROBLEM_RATINGS[id];
         link.appendChild(span);
       }
    });

    let name = "Unknown";
    let curr = table.previousElementSibling;
    while(curr && curr.tagName !== 'H2') curr = curr.previousElementSibling;
    if(curr && curr.tagName === 'H2') name = curr.innerText;

    const rows = table.querySelectorAll('.task');
    if (rows.length === 0 || name === "General") return;
    let s = 0;
    rows.forEach(r => { if(r.querySelector('.task-score-icon.full') || r.querySelector('.icon.full')) s++; });
    totalS += s; totalT += rows.length;
    sections.push({ name: name, s: s, t: rows.length });
  });
  currentStats = { total: { s: totalS, t: totalT }, sections: sections };

  if (totalT > 0 && !document.getElementById('cses-stats-dashboard')) {
    const dashboard = document.createElement('div');
    dashboard.id = 'cses-stats-dashboard';
    dashboard.innerHTML = `
      <div class="dashboard-header"><div class="dashboard-title">Your Progress</div><label class="rating-toggle-wrapper"><input type="checkbox" id="hide-ratings-toggle"><span class="toggle-slider"></span><span>Hide Ratings</span></label></div>
      <div class="dashboard-left"><div class="topics-grid" id="topics-grid"></div></div>
      <div class="dashboard-right"><div class="circular-progress" id="summary-circle"><div class="circular-inner"><span class="progress-percentage" id="summary-percent">0%</span></div></div><div class="summary-details"><div class="summary-count" id="summary-text">0 / 0</div><div class="summary-context" id="summary-context">Total Progress</div></div></div>`;
    
    const content = document.querySelector('.content');
    if(content) content.insertBefore(dashboard, content.querySelector('h2') || content.firstChild);

    const grid = document.getElementById('topics-grid');
    sections.forEach((sec, idx) => {
      const pct = sec.t===0 ? 0 : (sec.s/sec.t)*100;
      const el = document.createElement('div');
      el.className = 'topic-card';
      el.innerHTML = `<div class="topic-name">${sec.name}</div><div class="topic-ratio">${sec.s}/${sec.t}</div><div class="topic-progress-bar" style="width:${pct}%"></div>`;
      el.onclick = () => {
         selectedSectionIndex = (selectedSectionIndex === idx) ? null : idx;
         document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('active'));
         if(selectedSectionIndex !== null) el.classList.add('active');
         updateSummary();
      };
      grid.appendChild(el);
    });

    updateSummary();
    const speedrunFooter = renderSpeedrunPanel(totalS);
    dashboard.appendChild(speedrunFooter);

    const toggle = document.getElementById('hide-ratings-toggle');
    chrome.storage.local.get(['hideRatings'], (res) => { toggle.checked = !!res.hideRatings; });
    toggle.onchange = (e) => {
        const isHidden = e.target.checked;
        if (isHidden) document.body.classList.add('cses-hide-ratings'); else document.body.classList.remove('cses-hide-ratings');
        chrome.storage.local.set({ hideRatings: isHidden });
    };
  }

  tables.forEach(table => {
    const head = table.querySelector('thead tr') || table.querySelector('tr');
    if(head && !head.querySelector('.extra-tools')) {
       const th = document.createElement('th'); th.innerText = "Tools"; th.className = "extra-tools"; head.appendChild(th);
    }
    table.querySelectorAll('.task').forEach(row => {
       if(row.querySelector('.tool-cell')) return;
       const link = row.querySelector('a');
       const id = link.getAttribute('href').split('/').pop();
       
       const star = document.createElement('span'); star.className = 'bookmark-icon'; star.innerHTML = '&#9734;';
       chrome.storage.local.get([`bm-${id}`], r => { if(r[`bm-${id}`]) { star.classList.add('is-bookmarked'); star.innerHTML = '&#9733;'; }});
       star.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const active = star.classList.toggle('is-bookmarked'); star.innerHTML = active?'&#9733;':'&#9734;'; chrome.storage.local.set({ [`bm-${id}`]: active }); };
       link.insertBefore(star, link.firstChild);

       const td = document.createElement('td'); td.className = 'tool-cell'; td.style.textAlign='center';
       const btn = document.createElement('span'); btn.className = 'note-icon'; btn.innerHTML = '&#9998;'; btn.id = `note-icon-${id}`;
       chrome.storage.local.get([id], r => { if(r[id] && r[id].trim()) btn.classList.add('has-note'); });
       btn.onclick = () => openModal(id, link.innerText);
       td.appendChild(btn); row.appendChild(td);
    });
  });
}

function updateSummary() {
  let s, t, label;
  if (selectedSectionIndex !== null) {
     const sec = currentStats.sections[selectedSectionIndex]; s = sec.s; t = sec.t; label = sec.name;
  } else {
     s = currentStats.total.s; t = currentStats.total.t; label = "Overall Progress";
  }
  const pct = t===0 ? 0 : Math.round((s/t)*100);
  document.getElementById('summary-percent').innerText = `${pct}%`;
  document.getElementById('summary-text').innerText = `${s} / ${t}`;
  document.getElementById('summary-context').innerText = label;
  document.getElementById('summary-circle').style.background = `conic-gradient(#3b82f6 ${pct * 3.6}deg, #333 0deg)`;
}

// ==========================================
// 5. INIT
// ==========================================
injectModal();
if (window.location.href.includes('/task/')) {
  injectProblemPageFeatures();
} else {
  handleListPage();
}