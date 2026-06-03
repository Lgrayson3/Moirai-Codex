// Moirai Codex Frontend Application (Vanilla JS SPA)
import './index.css';

// Application State
const state = {
  files: [],
  filteredFiles: [],
  activeFile: null,
  activeFileData: null,
  activeTab: 'codex', // 'codex' | 'graph' | 'editor'
  searchQuery: '',
  activeRealmFilter: '',
  theme: 'light', // 'dark' | 'light'
  isAiCollapsed: false,
  aiMessages: [
    { role: 'assistant', content: 'Welcome to the Moirai Codex Assistant. I have read your series files and am ready to help you write, brainstorm, or explore connections.' }
  ],
  aiInput: '',
  isAiLoading: false,
  editorMode: 'template', // 'template' | 'raw'
  editorFields: {
    filename: '',
    title: '',
    eyebrow: '',
    subtitle: '',
    epigraph: '',
    epigraphSub: '',
    realm: 'gold',
    sections: [
      { id: 'origin', eyebrow: '', heading: '', content: '' }
    ]
  },
  editorRawHtml: '',
  graph: {
    nodes: [],
    links: [],
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    draggedNode: null,
    hoveredNode: null
  }
};

// Elements cache
let el = {};

// Initialize the Application
function init() {
  document.body.className = `theme-${state.theme}`;
  
  // Render main layout frame
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="prism-ribbon"></div>
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">Moirai Codex</div>
          <div class="sidebar-subtitle">Interactive Lore & Planner</div>
          <div class="search-box">
            <input type="text" id="search-input" class="search-input" placeholder="Search topics, terms, proper nouns...">
          </div>
          <div class="filter-bar" id="realm-filters"></div>
        </div>
        <div class="file-list" id="file-list-container">
          <div class="loading-indicator">
            <div class="spinner"></div>
            <div>Loading lore archives...</div>
          </div>
        </div>
        <div class="sidebar-actions">
          <button class="btn-primary" id="btn-new-page">Create New Lore Page</button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="main-pane">
        <!-- Header -->
        <header class="header-bar">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <!-- Mobile Menu Toggle Button -->
            <button class="theme-toggle-btn menu-toggle-btn" id="btn-menu-toggle" style="display: none;" title="Toggle Menu">
              <!-- Hamburger Icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="active-doc-info">
              <div class="active-doc-title" id="active-doc-title-text">Moirai Codex</div>
              <div style="display: none;" id="active-doc-filename-text">No document loaded</div>
            </div>
          </div>
          <nav class="nav-tabs">
            <button class="nav-tab-btn active" data-tab="codex">Codex Reader</button>
            <button class="nav-tab-btn" data-tab="editor">Lore Editor</button>
          </nav>
          <div class="actions-cluster">
            <button class="theme-toggle-btn" id="btn-theme-toggle" title="Toggle theme light/dark">
              <!-- Sun/Moon icon -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </button>
            <button class="btn-secondary" id="btn-toggle-ai" style="padding: 0.5rem 1rem;">Toggle Assistant</button>
          </div>
        </header>

        <!-- Workspace columns -->
        <div class="workspace-container">
          <!-- Viewport for main tabs -->
          <div class="content-viewport">
            
            <!-- Codex Tab -->
            <div class="tab-content active" id="tab-codex">
              <div class="doc-reader-width" id="doc-viewer-content">
                <div style="text-align: center; padding-top: 5rem; color: var(--text-secondary);">
                  <h1 style="font-family: var(--font-display); font-weight: normal; font-size: 2rem; margin-bottom: 1rem;">Select a file to begin</h1>
                  <p>Use the sidebar to explore topics, terms, and characters in your world.</p>
                </div>
              </div>
            </div>

            <!-- Editor Tab -->
            <div class="tab-content" id="tab-editor">
              <div class="doc-reader-width">
                <div class="editor-container" id="editor-form-container">
                  <!-- JS will dynamically populate editor panels here -->
                </div>
              </div>
            </div>

          </div>

          <!-- AI Assistant Sidebar Panel -->
          <div class="ai-panel" id="ai-panel-sidebar">
            <div class="ai-header">
              <div class="ai-title">
                <span class="gem">◆</span> AI Creative Assistant
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="graph-control-btn" id="btn-ai-settings" style="padding: 0.15rem 0.35rem; font-size: 0.65rem;" title="API Settings">🔑 Settings</button>
                <button class="ai-close-btn" id="btn-close-ai">&times;</button>
              </div>
            </div>
            <!-- API Key Setup Modal -->
            <div id="ai-settings-modal" style="display: none; padding: 1rem; background: var(--bg-card); border-bottom: 1px solid var(--border); font-size: 0.8rem; flex-direction: column; gap: 0.5rem;">
              <div>To use the AI Assistant serverless, provide your Gemini API key (stored locally):</div>
              <div style="display: flex; gap: 0.5rem;">
                <input type="password" id="gemini-api-key-input" class="editor-input" style="padding: 0.3rem; font-size: 0.8rem;" placeholder="AI Studio Key...">
                <button class="btn-primary" id="btn-save-api-key" style="width: auto; padding: 0.3rem 0.8rem; font-size: 0.75rem;">Save</button>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">Get a key from <a href="https://aistudio.google.com/" target="_blank" style="color: var(--accent);">Google AI Studio</a>.</div>
            </div>
            <div class="ai-messages" id="ai-messages-container"></div>
            <div class="ai-input-area">
              <div class="ai-context-hint" id="ai-context-hint-text">
                <span>⚡</span> Context: General Series Mode
              </div>
              <div class="ai-input-row">
                <textarea id="ai-textarea-input" class="ai-textarea" placeholder="Ask to trace a character connection, expand a lore concept, or review formatting..."></textarea>
                <button class="ai-send-btn" id="btn-send-ai">Send</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  // Cache element lookups
  cacheElements();
  // Bind listeners
  bindEvents();
  // Fetch files
  fetchLoreFiles();
}

function cacheElements() {
  el.searchInput = document.getElementById('search-input');
  el.realmFilters = document.getElementById('realm-filters');
  el.fileListContainer = document.getElementById('file-list-container');
  el.btnNewPage = document.getElementById('btn-new-page');
  el.activeDocTitle = document.getElementById('active-doc-title-text');
  el.activeDocFilename = document.getElementById('active-doc-filename-text');
  el.navTabBtns = document.querySelectorAll('.nav-tab-btn');
  el.tabCodex = document.getElementById('tab-codex');
  el.tabEditor = document.getElementById('tab-editor');
  el.docViewerContent = document.getElementById('doc-viewer-content');
  el.editorFormContainer = document.getElementById('editor-form-container');
  el.aiPanelSidebar = document.getElementById('ai-panel-sidebar');
  el.aiMessagesContainer = document.getElementById('ai-messages-container');
  el.aiTextareaInput = document.getElementById('ai-textarea-input');
  el.btnSendAi = document.getElementById('btn-send-ai');
  el.aiContextHintText = document.getElementById('ai-context-hint-text');
  el.btnThemeToggle = document.getElementById('btn-theme-toggle');
  el.btnToggleAi = document.getElementById('btn-toggle-ai');
  el.btnCloseAi = document.getElementById('btn-close-ai');
  el.btnAiSettings = document.getElementById('btn-ai-settings');
  el.aiSettingsModal = document.getElementById('ai-settings-modal');
  el.geminiApiKeyInput = document.getElementById('gemini-api-key-input');
  el.btnSaveApiKey = document.getElementById('btn-save-api-key');
  el.graphCanvas = document.getElementById('graph-canvas');
  el.btnMenuToggle = document.getElementById('btn-menu-toggle');
  el.sidebar = document.querySelector('.sidebar');
}

function bindEvents() {
  // Theme Toggle
  el.btnThemeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${state.theme}`;
    renderActiveDocument(); // Re-render content to apply theme fonts
  });

  // AI Collapse Toggles
  el.btnToggleAi.addEventListener('click', toggleAiPanel);
  el.btnCloseAi.addEventListener('click', toggleAiPanel);

  // Tab Swapping
  el.navTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Search input
  el.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    filterFiles();
  });

  // Create New Page
  el.btnNewPage.addEventListener('click', () => {
    openNewDocEditor();
  });

  // AI Assistant Chat input key listener
  el.aiTextareaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage();
    }
  });

  el.btnSendAi.addEventListener('click', sendAiMessage);

  // Mobile Menu Toggle drawer listeners
  if (el.btnMenuToggle) {
    el.btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      state.isSidebarOpen = !state.isSidebarOpen;
      if (state.isSidebarOpen) {
        el.sidebar.classList.add('open');
      } else {
        el.sidebar.classList.remove('open');
      }
    });
  }

  // Close mobile sidebar on clicking list items
  el.fileListContainer.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      state.isSidebarOpen = false;
      el.sidebar.classList.remove('open');
    }
  });

  // Tap main workspace content to close menu drawer
  document.querySelector('.main-pane').addEventListener('click', () => {
    if (state.isSidebarOpen && window.innerWidth <= 768) {
      state.isSidebarOpen = false;
      el.sidebar.classList.remove('open');
    }
  });

  // AI API settings listeners
  if (el.btnAiSettings) {
    // Populate input with existing key if saved
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    el.geminiApiKeyInput.value = savedKey;

    el.btnAiSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = el.aiSettingsModal.style.display === 'none';
      el.aiSettingsModal.style.display = isHidden ? 'flex' : 'none';
    });

    el.btnSaveApiKey.addEventListener('click', () => {
      const newKey = el.geminiApiKeyInput.value.trim();
      if (newKey) {
        localStorage.setItem('gemini_api_key', newKey);
        alert('Gemini API key saved locally!');
      } else {
        localStorage.removeItem('gemini_api_key');
        alert('Gemini API key cleared.');
      }
      el.aiSettingsModal.style.display = 'none';
    });
  }
}

function toggleAiPanel() {
  state.isAiCollapsed = !state.isAiCollapsed;
  if (state.isAiCollapsed) {
    el.aiPanelSidebar.classList.add('collapsed');
  } else {
    el.aiPanelSidebar.classList.remove('collapsed');
    renderAiMessages();
  }
}

function switchTab(tabName) {
  state.activeTab = tabName;
  el.navTabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Swap panels
  el.tabCodex.classList.remove('active');
  el.tabEditor.classList.remove('active');

  if (tabName === 'codex') {
    el.tabCodex.classList.add('active');
    renderActiveDocument();
  } else if (tabName === 'editor') {
    el.tabEditor.classList.add('active');
    if (state.isReadOnly) {
      el.editorFormContainer.innerHTML = `
        <div style="text-align: center; padding-top: 5rem; color: var(--text-secondary);">
          <h2 style="font-family: var(--font-display); font-weight: normal; font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent);">Local Editor Mode Only</h2>
          <p style="max-width: 500px; margin: 0 auto; line-height: 1.6;">Editing and creating lore pages is only supported when running the app locally with the backend server. To run locally, run <code>npm start</code> in your terminal.</p>
        </div>
      `;
    } else {
      renderEditor();
    }
  }
}

// Fetch lists of files from API
async function fetchLoreFiles() {
  try {
    const res = await fetch('http://localhost:3000/api/lore');
    if (!res.ok) throw new Error('API server returned error');
    state.files = await res.json();
    state.isReadOnly = false;
    el.btnNewPage.style.display = 'block';
    
    filterFiles();
    renderRealmFilters();
    initGraphData();
  } catch (err) {
    console.log('Local Express server not running. Falling back to static lore_db.json.');
    try {
      state.isReadOnly = true;
      el.btnNewPage.style.display = 'none'; // Disable editing creation in static mode
      
      const res = await fetch('lore_db.json');
      if (!res.ok) throw new Error('Failed to load lore database json');
      state.files = await res.json();
      
      filterFiles();
      renderRealmFilters();
      initGraphData();
    } catch (dbErr) {
      el.fileListContainer.innerHTML = `
        <div style="color: var(--pyrthera); padding: 1rem; font-size: 0.8rem; text-align: center;">
          Failed to load lore archives: ${dbErr.message}
        </div>
      `;
    }
  }
}

// Build realm filters lists
function renderRealmFilters() {
  // Collect all realms found in mentions
  const allRealms = ['All', 'Zephyros', 'Pyrthera', 'Thalassor', 'Ferridane', 'Tenebralis', 'Luxenfall', 'Glacia'];
  el.realmFilters.innerHTML = allRealms.map(realm => {
    const activeClass = (state.activeRealmFilter === realm || (realm === 'All' && !state.activeRealmFilter)) ? 'active' : '';
    return `<div class="filter-badge ${activeClass}" data-realm="${realm}">${realm}</div>`;
  }).join('');

  // Bind clicks
  el.realmFilters.querySelectorAll('.filter-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
      const realm = e.target.getAttribute('data-realm');
      state.activeRealmFilter = realm === 'All' ? '' : realm;
      renderRealmFilters();
      filterFiles();
    });
  });
}

function filterFiles() {
  state.filteredFiles = state.files.filter(file => {
    // Search match
    const titleMatch = file.title.toLowerCase().includes(state.searchQuery);
    const textMatch = file.snippet.toLowerCase().includes(state.searchQuery);
    
    // Realm filter match
    let realmMatch = true;
    if (state.activeRealmFilter) {
      realmMatch = file.mentions.some(m => m.type === 'realm' && m.name.toLowerCase() === state.activeRealmFilter.toLowerCase());
      // Special case check in title or filename too
      if (!realmMatch) {
        realmMatch = file.title.toLowerCase().includes(state.activeRealmFilter.toLowerCase()) || 
                     file.id.toLowerCase().includes(state.activeRealmFilter.toLowerCase());
      }
    }

    return (titleMatch || textMatch) && realmMatch;
  });

  renderFileList();
}

function renderFileList() {
  if (state.filteredFiles.length === 0) {
    el.fileListContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No archives match query
      </div>
    `;
    return;
  }

  el.fileListContainer.innerHTML = state.filteredFiles.map(file => {
    const isActive = state.activeFile === file.id ? 'active' : '';
    return `
      <div class="file-item ${isActive}" data-id="${file.id}">
        <div class="file-item-title">${file.title}</div>
      </div>
    `;
  }).join('');

  // Add click events
  el.fileListContainer.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const fileId = e.currentTarget.getAttribute('data-id');
      loadDocument(fileId);
    });
  });
}

// Load a single document details
async function loadDocument(filename) {
  state.activeFile = filename;
  renderFileList(); // Highlight active
  
  el.docViewerContent.innerHTML = `
    <div class="loading-indicator" style="padding-top: 5rem;">
      <div class="spinner"></div>
      <div>Loading lore file...</div>
    </div>
  `;

  try {
    let data;
    if (!state.isReadOnly) {
      const res = await fetch(`http://localhost:3000/api/lore/${filename}`);
      if (!res.ok) throw new Error('Failed to load file');
      data = await res.json();
    } else {
      data = state.files.find(f => f.id === filename);
      if (!data) throw new Error('Document not found in static package');
    }
    state.activeFileData = data;

    // Set doc titles
    el.activeDocTitle.textContent = data.title;
    el.activeDocFilename.textContent = data.id;

    // Update AI Assistant Context Hint
    el.aiContextHintText.innerHTML = `<span>⚡</span> Context: <b>${data.title}</b>`;

    // Render active tab content
    if (state.activeTab === 'codex') {
      renderActiveDocument();
    } else if (state.activeTab === 'editor') {
      switchTab('editor'); // Enforce read-only display update
    }
  } catch (err) {
    el.docViewerContent.innerHTML = `
      <div style="color: var(--pyrthera); text-align: center; padding-top: 5rem;">
        Failed to parse document: ${err.message}
      </div>
    `;
  }
}

// Renders the HTML content inside the viewport container
function renderActiveDocument() {
  if (!state.activeFileData) return;
  
  // Extract only elements inside body or render directly
  let bodyContent = state.activeFileData.rawHtml;
  
  // Attempt to isolate <body> tag contents
  const bodyMatch = bodyContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  // Remove any navigation tags inside body of original document, as we have site nav
  bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');

  el.docViewerContent.innerHTML = `
    <div class="lore-render-container">
      ${bodyContent}
    </div>
  `;

  // Bind accordions (+ toggle animations) inside the newly rendered HTML
  const details = el.docViewerContent.querySelectorAll('details.thread');
  details.forEach(detail => {
    const summary = detail.querySelector('summary');
    if (summary) {
      let ico = summary.querySelector('.ico');
      if (!ico) {
        // Inject icon if missing in HTML file
        summary.innerHTML = `<span class="ico">+</span>` + summary.innerHTML;
      }
    }
  });

  // Re-run the reveal transition animations inside the frame
  const revealEls = el.docViewerContent.querySelectorAll('.reveal');
  revealEls.forEach(e => {
    e.classList.add('in'); // Simple immediate reveal
  });

  // Hook up internal fragment anchors (click node redirects inside pages)
  el.docViewerContent.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = el.docViewerContent.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Automatically link terms to other codex pages
  autoLinkText(el.docViewerContent, state.files);
}

// Dynamically matches proper nouns, characters, and realms to other files and wraps them in custom links
function getConceptType(term, mentions) {
  const t = term.toLowerCase();
  if (t.includes('zephyros') || t.includes('oracle') || t.includes('aeon')) return 'zephyros';
  if (t.includes('pyrthera') || t.includes('uriel') || t.includes('wolf') || t.includes('wolves')) return 'pyrthera';
  if (t.includes('thalassor') || t.includes('juno') || t.includes('sinclair') || t.includes('cloud')) return 'thalassor';
  if (t.includes('ferridane') || t.includes('crex')) return 'ferridane';
  if (t.includes('tenebralis') || t.includes('mavarra') || t.includes('shadow')) return 'tenebralis';
  if (t.includes('luxenfall') || t.includes('luxania') || t.includes('alciel') || t.includes('hecate') || t.includes('light')) return 'luxenfall';
  if (t.includes('glacia')) return 'glacia';
  
  if (mentions && mentions.length > 0) {
    const realmMention = mentions.find(m => m.type === 'realm');
    if (realmMention) return realmMention.name.toLowerCase();
  }
  return 'gold';
}

function autoLinkText(rootElement, filesList) {
  const keywordsMap = [];
  
  filesList.forEach(file => {
    // Clean up title keywords
    const cleanTitle = file.title.replace(/—|·/g, '').replace(/\s+/g, ' ').trim();
    if (cleanTitle.length > 3) {
      keywordsMap.push({
        text: cleanTitle,
        target: file.id,
        type: getConceptType(cleanTitle, file.mentions)
      });
    }

    // Add specific proper nouns from the file name
    const baseId = file.id.replace('.html', '').replace(/_/g, ' ');
    if (baseId.length > 3 && baseId.toLowerCase() !== cleanTitle.toLowerCase()) {
      keywordsMap.push({
        text: baseId,
        target: file.id,
        type: getConceptType(baseId, file.mentions)
      });
    }
  });

  // Explicit mappings for major entities/proper nouns to direct them correctly
  const explicitKeys = [
    { text: 'Zephyros', target: 'zephyros_realm_codex.html', type: 'zephyros' },
    { text: 'Pyrthera', target: 'pyrthera_codex.html', type: 'pyrthera' },
    { text: 'Thalassor', target: 'thalassor_realm_codex.html', type: 'thalassor' },
    { text: 'Ferridane', target: 'ferridane_codex.html', type: 'ferridane' },
    { text: 'Tenebralis', target: 'tenebralis_codex.html', type: 'tenebralis' },
    { text: 'Glacia', target: 'realm_codex_glacia.html', type: 'glacia' },
    { text: 'Luxania', target: 'luxania_codex.html', type: 'luxenfall' },
    { text: 'Luxenfall', target: 'luxania_codex.html', type: 'luxenfall' },
    { text: 'Alciel', target: 'Moirai_Codex_Alciel.html', type: 'luxenfall' },
    { text: 'Uriel', target: 'Moirai_Codex_Uriel.html', type: 'pyrthera' },
    { text: 'Hecate', target: 'GardenOfHecate_CG.html', type: 'luxenfall' },
    { text: 'Oracle', target: 'moirai_lexicon.html', type: 'zephyros' },
    { text: 'Oracles', target: 'moirai_lexicon.html', type: 'zephyros' }
  ];

  let allKeywords = [...keywordsMap, ...explicitKeys];

  // De-duplicate and sort by text length (longest match first) to ensure greedy matching
  const seen = new Set();
  allKeywords = allKeywords.filter(k => {
    const kText = k.text.toLowerCase();
    if (seen.has(kText)) return false;
    seen.add(kText);
    return true;
  }).sort((a, b) => b.text.length - a.text.length);

  // Recurse DOM text nodes safely to replace text with link tags
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;
      
      // Prevent double-wrapping or changing nodes inside existing anchors
      let parent = node.parentNode;
      while (parent) {
        if (parent.tagName === 'A' || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA' || parent.tagName === 'BUTTON') {
          return;
        }
        parent = parent.parentNode;
      }

      for (let kw of allKeywords) {
        if (kw.target === state.activeFile) continue;

        // Matches word boundaries
        const escapedKw = kw.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b(${escapedKw}s?)\\b`, 'i');
        const match = text.match(regex);

        if (match) {
          const matchedText = match[0];
          const splitIdx = text.indexOf(matchedText);

          const beforeText = text.substring(0, splitIdx);
          const afterText = text.substring(splitIdx + matchedText.length);

          const a = document.createElement('a');
          a.href = 'javascript:void(0)';
          a.className = `concept-link concept-${kw.type}`;
          a.style.color = `var(--${kw.type})`;
          a.style.fontWeight = '600';
          a.style.textDecoration = 'none';
          a.style.borderBottom = `1.5px dashed var(--${kw.type})`;
          a.textContent = matchedText;
          
          a.onclick = (e) => {
            e.preventDefault();
            loadDocument(kw.target);
          };

          if (beforeText) {
            node.parentNode.insertBefore(document.createTextNode(beforeText), node);
          }
          node.parentNode.insertBefore(a, node);

          const remainderNode = document.createTextNode(afterText);
          node.parentNode.insertBefore(remainderNode, node);
          node.parentNode.removeChild(node);

          walk(remainderNode);
          return;
        }
      }
    } else {
      const children = Array.from(node.childNodes);
      for (let child of children) {
        walk(child);
      }
    }
  }

  walk(rootElement);
}

// Render the Editor pane
function renderEditor() {
  if (!state.activeFileData && !state.isNewDocMode) {
    el.editorFormContainer.innerHTML = `<div style="text-align: center; padding-top: 3rem;">Please select a lore document from the sidebar to edit, or click "Create New Lore Page".</div>`;
    return;
  }

  const fileData = state.activeFileData || { id: '', title: '', rawHtml: '' };

  // Sync state
  state.editorRawHtml = fileData.rawHtml;

  el.editorFormContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
      <h3 style="font-family: var(--font-display); font-style: normal; color: var(--accent);">Editing Lore Page</h3>
      <div style="display: flex; gap: 0.5rem;">
        <button class="graph-control-btn ${state.editorMode === 'template' ? 'active' : ''}" id="btn-edit-template">Structured Fields</button>
        <button class="graph-control-btn ${state.editorMode === 'raw' ? 'active' : ''}" id="btn-edit-raw">Raw HTML Source</button>
      </div>
    </div>

    <!-- Mode 1: Raw HTML Editor -->
    <div id="editor-raw-pane" class="${state.editorMode === 'raw' ? '' : 'tab-content'}">
      <div class="editor-field-group">
        <label class="editor-label">File name (e.g. genesis_chronicles.html)</label>
        <input type="text" id="raw-edit-filename" class="editor-input" value="${fileData.id}" ${state.isNewDocMode ? '' : 'disabled'}>
      </div>
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">HTML Content Source</label>
        <textarea id="raw-edit-textarea" class="editor-textarea" placeholder="Paste or write HTML matching the house style template here...">${state.editorRawHtml}</textarea>
      </div>
    </div>

    <!-- Mode 2: Structured Fields Editor -->
    <div id="editor-template-pane" class="${state.editorMode === 'template' ? '' : 'tab-content'}">
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">File name (must end in .html)</label>
        <input type="text" id="tpl-edit-filename" class="editor-input" value="${fileData.id}" ${state.isNewDocMode ? '' : 'disabled'}>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div class="editor-field-group">
          <label class="editor-label">Page Title</label>
          <input type="text" id="tpl-edit-title" class="editor-input" value="${state.isNewDocMode ? 'New Lore Topic' : fileData.title}">
        </div>
        <div class="editor-field-group">
          <label class="editor-label">Realm Accent Theme</label>
          <select id="tpl-edit-realm" class="editor-select">
            <option value="gold" ${state.editorFields.realm === 'gold' ? 'selected' : ''}>Gold (Default)</option>
            <option value="zephyros" ${state.editorFields.realm === 'zephyros' ? 'selected' : ''}>Zephyros (Green)</option>
            <option value="pyrthera" ${state.editorFields.realm === 'pyrthera' ? 'selected' : ''}>Pyrthera (Red-Orange)</option>
            <option value="thalassor" ${state.editorFields.realm === 'thalassor' ? 'selected' : ''}>Thalassor (Blue)</option>
            <option value="ferridane" ${state.editorFields.realm === 'ferridane' ? 'selected' : ''}>Ferridane (Brown-Gold)</option>
            <option value="tenebralis" ${state.editorFields.realm === 'tenebralis' ? 'selected' : ''}>Tenebralis (Violet)</option>
            <option value="luxenfall" ${state.editorFields.realm === 'luxenfall' ? 'selected' : ''}>Luxenfall (Bright Gold)</option>
            <option value="glacia" ${state.editorFields.realm === 'glacia' ? 'selected' : ''}>Glacia (Light Blue)</option>
          </select>
        </div>
      </div>

      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">Eyebrow / Category (e.g. Moirai Codex · Mythic Rendering)</label>
        <input type="text" id="tpl-edit-eyebrow" class="editor-input" value="Moirai Codex · World Building">
      </div>

      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">Subtitle Description (frame context)</label>
        <input type="text" id="tpl-edit-subtitle" class="editor-input" placeholder="A single italic description line...">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div class="editor-field-group">
          <label class="editor-label">Epigraph / Initial Quote</label>
          <input type="text" id="tpl-edit-epigraph" class="editor-input" placeholder="A profound citation or epigraph...">
        </div>
        <div class="editor-field-group">
          <label class="editor-label">Epigraph Attribution</label>
          <input type="text" id="tpl-edit-epigraph-sub" class="editor-input" placeholder="e.g. First Book of Fate">
        </div>
      </div>

      <div style="border-top: 1px dashed var(--border); margin: 1.5rem 0; padding-top: 1rem;">
        <h4 style="font-family: var(--font-interface); font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem;">Section Details</h4>
        <div class="editor-field-group">
          <label class="editor-label">Section Eyebrow</label>
          <input type="text" id="tpl-edit-sec-eyebrow" class="editor-input" placeholder="e.g. The first cause">
        </div>
        <div class="editor-field-group" style="margin-top: 0.5rem;">
          <label class="editor-label">Section Heading</label>
          <input type="text" id="tpl-edit-sec-heading" class="editor-input" placeholder="e.g. One Light, Many Roads">
        </div>
        <div class="editor-field-group" style="margin-top: 0.5rem;">
          <label class="editor-label">Main Prose Content</label>
          <textarea id="tpl-edit-sec-content" class="editor-textarea" style="min-height: 250px;" placeholder="Write paragraphs of your world lore here..."></textarea>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="editor-actions">
      <button class="btn-primary" id="btn-save-lore" style="width: auto; padding: 0.75rem 2rem;">Save Document</button>
      <button class="btn-secondary" id="btn-cancel-edit">Cancel</button>
      ${!state.isNewDocMode ? '<button class="btn-secondary" id="btn-delete-lore" style="border-color: var(--pyrthera); color: var(--pyrthera);">Delete</button>' : ''}
    </div>
  `;

  // Bind Editor panel specific events
  const btnTemplate = document.getElementById('btn-edit-template');
  const btnRaw = document.getElementById('btn-edit-raw');
  const tplPane = document.getElementById('editor-template-pane');
  const rawPane = document.getElementById('editor-raw-pane');

  btnTemplate.addEventListener('click', () => {
    state.editorMode = 'template';
    btnTemplate.classList.add('active');
    btnRaw.classList.remove('active');
    tplPane.classList.remove('tab-content');
    rawPane.classList.add('tab-content');
  });

  btnRaw.addEventListener('click', () => {
    state.editorMode = 'raw';
    btnRaw.classList.add('active');
    btnTemplate.classList.remove('active');
    rawPane.classList.remove('tab-content');
    tplPane.classList.add('tab-content');
  });

  // Bind structured fields autogenerator sync
  if (state.editorMode === 'template' && !state.isNewDocMode && fileData.rawHtml) {
    // Attempt simple parsing of existing file to populate template fields
    const doc = document.createElement('div');
    doc.innerHTML = fileData.rawHtml;
    
    document.getElementById('tpl-edit-title').value = fileData.title;
    
    const eyebrowEl = doc.querySelector('.eyebrow');
    if (eyebrowEl) document.getElementById('tpl-edit-eyebrow').value = eyebrowEl.textContent.trim();
    
    const subtitleEl = doc.querySelector('.subtitle');
    if (subtitleEl) document.getElementById('tpl-edit-subtitle').value = subtitleEl.textContent.trim();
    
    const epigraphEl = doc.querySelector('.mast-epi');
    if (epigraphEl) {
      const sub = epigraphEl.querySelector('span');
      const subText = sub ? sub.textContent.trim() : '';
      const text = epigraphEl.innerHTML.split('<span>')[0].replace(/<[^>]+>/g, '').trim();
      document.getElementById('tpl-edit-epigraph').value = text;
      document.getElementById('tpl-edit-epigraph-sub').value = subText;
    }

    const secEyebrow = doc.querySelector('.sec-eyebrow');
    if (secEyebrow) document.getElementById('tpl-edit-sec-eyebrow').value = secEyebrow.textContent.trim();

    const secH2 = doc.querySelector('h2');
    if (secH2) document.getElementById('tpl-edit-sec-heading').value = secH2.textContent.replace(/<[^>]+>/g, '').trim();

    const secBodyText = Array.from(doc.querySelectorAll('section.wrap p:not(.sec-eyebrow):not(.lead)'))
      .map(p => p.textContent.trim()).join('\n\n');
    
    const leadP = doc.querySelector('section.wrap p.lead');
    const leadText = leadP ? leadP.textContent.trim() : '';
    
    document.getElementById('tpl-edit-sec-content').value = (leadText ? leadText + '\n\n' : '') + secBodyText;
  }

  // Save click
  document.getElementById('btn-save-lore').addEventListener('click', saveLoreDocument);
  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    state.isNewDocMode = false;
    switchTab('codex');
  });

  if (!state.isNewDocMode) {
    document.getElementById('btn-delete-lore').addEventListener('click', deleteLoreDocument);
  }
}

function openNewDocEditor() {
  state.isNewDocMode = true;
  state.activeFile = null;
  state.activeFileData = null;
  state.editorMode = 'template';
  
  // Create blank structure
  state.editorRawHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Lore Topic — Moirai Codex</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Marcellus&display=swap" rel="stylesheet">
<style>
  /* Include styles verbatim from template */
</style>
</head>
<body>
<div class="ribbon" aria-hidden="true"></div>
<main>
  <header class="mast">
    <p class="eyebrow">Moirai Codex · Category</p>
    <h1 class="title">Main Title</h1>
    <p class="subtitle">A short subtitle description.</p>
    <div class="mast-mark"><div class="bar"></div></div>
    <p class="mast-epi">An epigraph or statement.<span>Subtext details.</span></p>
  </header>
  
  <section id="origin" class="wrap reveal">
    <p class="sec-eyebrow">Eyebrow</p>
    <h2>Heading<span class="uline"></span></h2>
    <p class="lead">The opening paragraph has a gold drop-cap.</p>
    <p>A second paragraph of prose details.</p>
  </section>
</main>
</body>
</html>`;

  switchTab('editor');
}

// Convert template fields to the exact Gold-on-White markup structure
function buildHtmlFromTemplate() {
  const filename = document.getElementById('tpl-edit-filename').value;
  const title = document.getElementById('tpl-edit-title').value;
  const realm = document.getElementById('tpl-edit-realm').value;
  const eyebrow = document.getElementById('tpl-edit-eyebrow').value;
  const subtitle = document.getElementById('tpl-edit-subtitle').value;
  const epigraph = document.getElementById('tpl-edit-epigraph').value;
  const epigraphSub = document.getElementById('tpl-edit-epigraph-sub').value;
  const secEyebrow = document.getElementById('tpl-edit-sec-eyebrow').value;
  const secHeading = document.getElementById('tpl-edit-sec-heading').value;
  const secContent = document.getElementById('tpl-edit-sec-content').value;

  // Split prose text by double newline to form paragraphs
  const paragraphs = secContent.split('\n\n').filter(p => p.trim().length > 0);
  
  let pMarkup = '';
  if (paragraphs.length > 0) {
    pMarkup += `<p class="lead">${paragraphs[0]}</p>\n`;
    for (let i = 1; i < paragraphs.length; i++) {
      pMarkup += `    <p>${paragraphs[i]}</p>\n`;
    }
  }

  // Load styling templates dynamically based on realm variable setup
  const cssStyle = `
  :root{
    --paper:#FBF7EE; --paper-2:#F6F0E2;
    --ink:#2B2317; --ink-soft:#5A4E3A; --rule:#E4D8BE;
    --gold:#9A7B1F; --gold-bright:#C9A227; --gold-pale:#E9DCB0; --gold-glow:rgba(201,162,39,.18);
    --zephyros:#8AA63A; --zephyros-pale:#D8E3B0;
    --pyrthera:#C7572B; --pyrthera-pale:#F0C39A;
    --thalassor:#2E6FA3; --thalassor-pale:#A9CBE4;
    --ferridane:#A66A2E; --ferridane-pale:#E0C394;
    --tenebralis:#6A3D9A; --tenebralis-pale:#C8B0E2;
    --luxenfall:#C9A227; --luxenfall-pale:#EBDCA6;
    --glacia:#5C97B8; --glacia-pale:#BDDCE8;
    --prism:linear-gradient(90deg,var(--tenebralis) 0%,var(--thalassor) 17%,var(--glacia) 30%,var(--zephyros) 45%,var(--luxenfall) 60%,var(--ferridane) 74%,var(--pyrthera) 100%);
    --maxw:760px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:"Spectral",Georgia,serif;font-weight:400;font-size:19px;line-height:1.72;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden;}
  body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(120% 80% at 8% -5%,rgba(106,61,154,.05),transparent 45%),radial-gradient(120% 80% at 105% 110%,rgba(199,87,43,.05),transparent 45%),radial-gradient(140% 90% at 100% 0%,rgba(46,111,163,.04),transparent 40%),radial-gradient(100% 100% at 50% 40%,transparent 60%,rgba(43,35,23,.05));}
  body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");}
  .ribbon{position:fixed;top:0;left:0;right:0;height:5px;z-index:60;background:var(--prism);background-size:200% 100%;animation:drift 22s linear infinite;}
  @keyframes drift{0%{background-position:0 0;}100%{background-position:200% 0;}}
  main{position:relative;z-index:1;}
  .wrap{max-width:var(--maxw);margin:0 auto;padding:0 1.4rem;}
  header.mast{text-align:center;padding:5.5rem 1.4rem 3rem;position:relative;}
  .eyebrow{font-family:"Marcellus",serif;font-size:.82rem;letter-spacing:.42em;text-transform:uppercase;color:var(--gold);margin:0 0 1.6rem;text-indent:.42em;}
  h1.title{font-family:"Fraunces",serif;font-weight:400;font-size:clamp(2.7rem,8vw,5.1rem);line-height:.98;margin:0;letter-spacing:-.01em;color:var(--ink);font-variation-settings:"opsz" 144;}
  h1.title .gilt{background:linear-gradient(95deg,var(--gold) 0%,var(--gold-bright) 45%,#EFD27A 60%,var(--gold) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-style:italic;}
  .subtitle{font-family:"Spectral",serif;font-weight:300;font-style:italic;font-size:clamp(1.05rem,2.6vw,1.35rem);color:var(--ink-soft);margin:1.5rem auto 0;max-width:38ch;line-height:1.5;}
  .mast-mark{margin:2.4rem auto 0;width:min(420px,80%);}
  .mast-mark .bar{height:3px;border-radius:2px;background:var(--prism);background-size:180% 100%;animation:drift 18s linear infinite;}
  .mast-epi{font-family:"Fraunces",serif;font-style:italic;font-weight:300;font-size:clamp(1.15rem,3vw,1.6rem);color:var(--gold);margin:2.6rem auto 0;max-width:32ch;line-height:1.4;}
  .mast-epi span{display:block;color:var(--ink-soft);font-size:.7em;font-style:normal;font-family:"Spectral";letter-spacing:.05em;margin-top:.5rem;}
  section{padding:1.5rem 0;position:relative;}
  .sec-eyebrow{font-family:"Marcellus",serif;font-size:.78rem;letter-spacing:.32em;text-transform:uppercase;color:var(--gold);margin:0 0 .5rem;}
  h2{font-family:"Fraunces",serif;font-weight:400;font-size:clamp(1.9rem,5vw,2.9rem);line-height:1.05;margin:.2rem 0 1.2rem;color:var(--ink);letter-spacing:-.01em;font-variation-settings:"opsz" 80;}
  h2 .uline{display:block;height:3px;width:108px;margin-top:.7rem;border-radius:2px;background:var(--prism);background-size:200% 100%;animation:drift 16s linear infinite;}
  p{margin:0 0 1.15rem;}
  strong{font-weight:600;color:var(--ink);}
  .lead{font-size:1.12rem;}
  .lead::first-letter{font-family:"Fraunces",serif;font-weight:400;float:left;font-size:4.4rem;line-height:.72;padding:.32rem .55rem 0 0;color:var(--gold);font-variation-settings:"opsz" 144;}
  .reveal{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease;}
  .reveal.in{opacity:1;transform:none;}
  `;

  const dynamicAccent = realm !== 'gold' ? `style="--accent:var(--${realm});--accent-pale:var(--${realm}-pale)"` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Moirai Codex</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Marcellus&display=swap" rel="stylesheet">
<style>${cssStyle}</style>
</head>
<body>
<div class="ribbon" aria-hidden="true"></div>
<main>
  <header class="mast">
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="title">${title}</h1>
    <p class="subtitle">${subtitle}</p>
    <div class="mast-mark"><div class="bar"></div></div>
    <p class="mast-epi">${epigraph}<span>${epigraphSub}</span></p>
  </header>
  
  <section id="origin" class="wrap reveal" ${dynamicAccent}>
    <p class="sec-eyebrow">${secEyebrow}</p>
    <h2>${secHeading}<span class="uline"></span></h2>
    ${pMarkup}
  </section>
</main>
</body>
</html>`;
}

// Call API to save lore file
async function saveLoreDocument() {
  let filename = '';
  let payload = '';

  if (state.editorMode === 'template') {
    filename = document.getElementById('tpl-edit-filename').value;
    payload = buildHtmlFromTemplate();
  } else {
    filename = document.getElementById('raw-edit-filename').value;
    payload = document.getElementById('raw-edit-textarea').value;
  }

  if (!filename.endsWith('.html')) {
    filename += '.html';
  }

  try {
    const res = await fetch(`http://localhost:3000/api/lore/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rawHtml: payload })
    });

    if (!res.ok) throw new Error('Save operation failed');
    
    state.isNewDocMode = false;
    alert(`Saved ${filename} successfully!`);
    
    // Refresh lists and reopen document
    await fetchLoreFiles();
    loadDocument(filename);
    switchTab('codex');
  } catch (err) {
    alert(`Failed to save lore page: ${err.message}`);
  }
}

// Call API to delete file
async function deleteLoreDocument() {
  if (!confirm(`Are you absolutely sure you want to delete ${state.activeFile}?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/lore/${state.activeFile}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Delete operation failed');

    alert(`Deleted file successfully.`);
    state.activeFile = null;
    state.activeFileData = null;
    await fetchLoreFiles();
    switchTab('codex');
  } catch (err) {
    alert(`Failed to delete file: ${err.message}`);
  }
}

// ============================================================
// AI CREATIVE ASSISTANT SIDEBAR CHAT PANEL
// ============================================================
function renderAiMessages() {
  el.aiMessagesContainer.innerHTML = state.aiMessages.map(msg => {
    const isAssistant = msg.role === 'assistant';
    const senderName = isAssistant ? 'Codex Assistant' : 'Creative Writer';
    const alignClass = isAssistant ? 'assistant' : 'user';
    
    // Simple custom markdown renderer for bold/code in assistant text
    let formattedContent = msg.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Simple code block parse
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    return `
      <div class="ai-message ${alignClass}">
        <div class="sender">${senderName}</div>
        <div class="msg-body">${formattedContent}</div>
      </div>
    `;
  }).join('');

  // Scroll to bottom
  el.aiMessagesContainer.scrollTop = el.aiMessagesContainer.scrollHeight;
}

async function sendAiMessage() {
  const query = el.aiTextareaInput.value.trim();
  if (!query || state.isAiLoading) return;

  // Add user message
  state.aiMessages.push({ role: 'user', content: query });
  el.aiTextareaInput.value = '';
  renderAiMessages();

  state.isAiLoading = true;
  el.btnSendAi.disabled = true;
  el.btnSendAi.textContent = '...';

  // Inject temporary loading bubble
  const loaderId = 'ai-chat-loader-bubble';
  const loaderBubble = document.createElement('div');
  loaderBubble.id = loaderId;
  loaderBubble.className = 'ai-message assistant';
  loaderBubble.innerHTML = `
    <div class="sender">Codex Assistant</div>
    <div class="msg-body">Tracing scrolls... <div class="spinner" style="width:12px; height:12px; border-width:2px; display:inline-block; vertical-align:middle; margin-left:5px;"></div></div>
  `;
  el.aiMessagesContainer.appendChild(loaderBubble);
  el.aiMessagesContainer.scrollTop = el.aiMessagesContainer.scrollHeight;

  try {
    let replyText = '';
    if (!state.isReadOnly) {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: state.aiMessages.slice(-8), // Send last 8 turns of context
          currentDocContext: state.activeFileData
        })
      });

      // Remove loading bubble
      const loader = document.getElementById(loaderId);
      if (loader) loader.remove();

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error');
      }

      const data = await res.json();
      replyText = data.reply;
    } else {
      // Direct browser-to-Gemini API call (Serverless Fallback)
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      if (!apiKey) {
        throw new Error('Please set your Gemini API key in the settings panel (🔑 Settings button in the AI panel header) to use the assistant on GitHub Pages.');
      }
      
      // Perform local client-side RAG selection
      const db = state.files;
      let contextItems = [];
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      db.forEach(item => {
        let score = 0;
        keywords.forEach(kw => {
          if (item.title.toLowerCase().includes(kw)) score += 10;
          if (item.mentions) {
            item.mentions.forEach(m => {
              if (m.name.toLowerCase().includes(kw)) score += 5;
            });
          }
        });
        if (score > 0) {
          contextItems.push({ id: item.id, title: item.title, score, rawHtml: item.rawHtml });
        }
      });

      contextItems.sort((a, b) => b.score - a.score);
      const topContextDocs = contextItems.slice(0, 3);

      let contextText = '';
      topContextDocs.forEach(doc => {
        contextText += `--- LORE SOURCE: ${doc.title} (${doc.id}) ---\n${stripHtml(doc.rawHtml).substring(0, 2000)}\n\n`;
      });

      if (state.activeFileData && state.activeFileData.rawHtml) {
        contextText += `--- CURRENT DOCUMENT: ${state.activeFileData.title} (${state.activeFileData.id}) ---\n${stripHtml(state.activeFileData.rawHtml).substring(0, 3000)}\n\n`;
      }

      // Format for Gemini API (contents parameter)
      // Note: We only send the message text in the prompt context
      const geminiContents = state.aiMessages.slice(-8).map(msg => {
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        };
      });

      const systemPrompt = `You are the Moirai Codex Creative AI Assistant. 
You are an expert on the user's creative writing series "Advent of Ultima", which involves themes of mythology, gods, dragons, and multi-realm exploration (Zephyros, Pyrthera, Thalassor, Ferridane, Tenebralis, Luxania, Glacia).
Use the following local lore context to answer user questions, brainstorm new plotlines, connect characters, write text matching the tone, and offer creative advice. 
If the user asks to write a new character description, lore beat, or realm details, format it in a way that matches the "Gold on White" or "Obsidian/Ember" aesthetic.

--- LOCAL LORE CONTEXT ---
${contextText || 'No specific lore files matched the current query keywords. Answer using overall series knowledge.'}
------------------------`;

      const requestBody = {
        contents: geminiContents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // Remove loading bubble
      const loader = document.getElementById(loaderId);
      if (loader) loader.remove();

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    }

    state.aiMessages.push({ role: 'assistant', content: replyText });
  } catch (err) {
    const loader = document.getElementById(loaderId);
    if (loader) loader.remove();
    state.aiMessages.push({ 
      role: 'assistant', 
      content: `❌ Request failed: ${err.message}` 
    });
  } finally {
    state.isAiLoading = false;
    el.btnSendAi.disabled = false;
    el.btnSendAi.textContent = 'Send';
    renderAiMessages();
  }
}

// ============================================================
// INTERACTIVE 2D FORCE-DIRECTED CONNECTIONS GRAPH
// ============================================================
function initGraphData() {
  // Build nodes from file list
  state.graph.nodes = state.files.map((file, i) => {
    return {
      id: file.id,
      label: file.title,
      // Random starting positions
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 400,
      vx: 0,
      vy: 0,
      radius: 8 + Math.min(file.textLength / 4000, 15), // size based on text size
      mentions: file.mentions
    };
  });

  // Build links based on mentions and file references
  state.graph.links = [];
  
  // Link by explicit relative HTML files found in a links
  state.files.forEach(file => {
    file.links.forEach(l => {
      // If href targets another html file in our list
      const targetFilename = l.href.split('#')[0];
      if (targetFilename && targetFilename !== file.id && state.files.some(f => f.id === targetFilename)) {
        // Create link
        state.graph.links.push({
          source: file.id,
          target: targetFilename,
          type: 'link'
        });
      }
    });

    // Link by entity overlap (Shared realms or key characters mentioned)
    file.mentions.forEach(mention => {
      // Find other files sharing the same mention
      state.files.forEach(otherFile => {
        if (otherFile.id !== file.id) {
          const hasSharedMention = otherFile.mentions.some(m => m.name === mention.name);
          if (hasSharedMention) {
            // Avoid duplicate links
            const alreadyLinked = state.graph.links.some(l => 
              (l.source === file.id && l.target === otherFile.id) || 
              (l.source === otherFile.id && l.target === file.id)
            );
            if (!alreadyLinked) {
              state.graph.links.push({
                source: file.id,
                target: otherFile.id,
                type: mention.type, // 'realm' or 'character'
                name: mention.name
              });
            }
          }
        }
      });
    });
  });
}

let animFrameId = null;

function initGraph() {
  const canvas = el.graphCanvas;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Fit canvas to parent viewport
  const viewport = document.getElementById('graph-viewport-container');
  canvas.width = viewport.clientWidth;
  canvas.height = viewport.clientHeight;

  // Zoom control triggers
  document.getElementById('graph-zoom-in').onclick = () => { state.graph.zoom *= 1.2; };
  document.getElementById('graph-zoom-out').onclick = () => { state.graph.zoom /= 1.2; };
  document.getElementById('graph-reset').onclick = () => {
    state.graph.zoom = 1;
    state.graph.offsetX = 0;
    state.graph.offsetY = 0;
    // Respread nodes slightly
    state.graph.nodes.forEach(n => {
      n.x = canvas.width/2 + (Math.random()-0.5)*300;
      n.y = canvas.height/2 + (Math.random()-0.5)*300;
      n.vx = 0; n.vy = 0;
    });
  };

  // Drag and hover state trackers
  let isPanning = false;
  let startPanX = 0, startPanY = 0;

  // Canvas mouse handlers
  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvas.width/2 - state.graph.offsetX) / state.graph.zoom + canvas.width/2;
    const mouseY = (e.clientY - rect.top - canvas.height/2 - state.graph.offsetY) / state.graph.zoom + canvas.height/2;

    // Check if clicked a node
    let clickedNode = null;
    for (let node of state.graph.nodes) {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (dist < node.radius + 10) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      state.graph.draggedNode = clickedNode;
    } else {
      isPanning = true;
      startPanX = e.clientX - state.graph.offsetX;
      startPanY = e.clientY - state.graph.offsetY;
    }
  };

  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvas.width/2 - state.graph.offsetX) / state.graph.zoom + canvas.width/2;
    const mouseY = (e.clientY - rect.top - canvas.height/2 - state.graph.offsetY) / state.graph.zoom + canvas.height/2;

    if (state.graph.draggedNode) {
      state.graph.draggedNode.x = mouseX;
      state.graph.draggedNode.y = mouseY;
    } else if (isPanning) {
      state.graph.offsetX = e.clientX - startPanX;
      state.graph.offsetY = e.clientY - startPanY;
    } else {
      // Update hover state
      let hovered = null;
      for (let node of state.graph.nodes) {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist < node.radius + 5) {
          hovered = node;
          break;
        }
      }
      state.graph.hoveredNode = hovered;
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
    }
  };

  canvas.onmouseup = () => {
    state.graph.draggedNode = null;
    isPanning = false;
  };

  canvas.onmouseleave = () => {
    state.graph.draggedNode = null;
    isPanning = false;
  };

  // Double click node opens it
  canvas.ondblclick = (e) => {
    if (state.graph.hoveredNode) {
      loadDocument(state.graph.hoveredNode.id);
      switchTab('codex');
    }
  };

  // Handle scroll zoom
  canvas.onwheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    state.graph.zoom = Math.max(0.1, Math.min(5, state.graph.zoom * zoomFactor));
  };

  // Force Directed Graph Physics + Render loops
  function tick() {
    if (state.activeTab !== 'graph') {
      cancelAnimationFrame(animFrameId);
      return;
    }

    const nodes = state.graph.nodes;
    const links = state.graph.links;

    // Apply physical forces
    // 1. Collision prevention & Inverse-Square Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy) || 1;
        
        // A. Hard collision push apart (boundary-to-boundary spacing)
        const minDist = nodes[i].radius + nodes[j].radius + 70; // 70px buffer spacing!
        if (dist < minDist) {
          const overlap = minDist - dist;
          const pushX = (dx / dist) * overlap * 0.5;
          const pushY = (dy / dist) * overlap * 0.5;
          
          if (nodes[i] !== state.graph.draggedNode) {
            nodes[i].x -= pushX;
            nodes[i].y -= pushY;
            nodes[i].vx -= pushX * 0.15;
            nodes[i].vy -= pushY * 0.15;
          }
          if (nodes[j] !== state.graph.draggedNode) {
            nodes[j].x += pushX;
            nodes[j].y += pushY;
            nodes[j].vx += pushX * 0.15;
            nodes[j].vy += pushY * 0.15;
          }
        }
        
        // B. Inverse-square continuous electrostatic-like repulsion
        if (dist < 450) {
          const charge = 120000; // Extremely strong repulsion at distance
          const force = charge / (dist * dist + 100);
          const forceX = (dx / dist) * force;
          const forceY = (dy / dist) * force;
          
          if (nodes[i] !== state.graph.draggedNode) {
            nodes[i].vx -= forceX * 0.06;
            nodes[i].vy -= forceY * 0.06;
          }
          if (nodes[j] !== state.graph.draggedNode) {
            nodes[j].vx += forceX * 0.06;
            nodes[j].vy += forceY * 0.06;
          }
        }
      }
    }

    // 2. Attraction along links (Hooke's Law / Springs)
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (sourceNode && targetNode) {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.hypot(dx, dy) || 1;
        const desiredDist = 120;
        const force = (dist - desiredDist) * 0.012; // Spring constant
        const forceX = (dx / dist) * force;
        const forceY = (dy / dist) * force;

        if (sourceNode !== state.graph.draggedNode) {
          sourceNode.vx += forceX;
          sourceNode.vy += forceY;
        }
        if (targetNode !== state.graph.draggedNode) {
          targetNode.vx -= forceX;
          targetNode.vy -= forceY;
        }
      }
    });

    // 3. Gravity center force pulling nodes towards center screen
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    nodes.forEach(node => {
      if (node !== state.graph.draggedNode) {
        node.vx += (centerX - node.x) * 0.005;
        node.vy += (centerY - node.y) * 0.005;

        // Apply velocity + damping friction
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.82;
        node.vy *= 0.82;
      }
    });

    // Render step
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Translate and Zoom view
    ctx.translate(canvas.width/2 + state.graph.offsetX, canvas.height/2 + state.graph.offsetY);
    ctx.scale(state.graph.zoom, state.graph.zoom);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    // Draw Links
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);

        // Highlight active connections of hovered or active node
        const isRelated = state.graph.hoveredNode && 
          (state.graph.hoveredNode.id === sourceNode.id || state.graph.hoveredNode.id === targetNode.id);
        const isActiveDoc = state.activeFile && 
          (state.activeFile === sourceNode.id || state.activeFile === targetNode.id);

        if (isRelated) {
          ctx.strokeStyle = state.theme === 'dark' ? '#E0A93F' : '#9A7B1F';
          ctx.lineWidth = 1.8;
        } else if (isActiveDoc) {
          ctx.strokeStyle = state.theme === 'dark' ? '#D96A4A' : '#C7572B';
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = state.theme === 'dark' ? '#2A1610' : '#E4D8BE';
          ctx.lineWidth = 0.6;
        }
        ctx.stroke();
      }
    });

    // Draw Nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      const isHovered = state.graph.hoveredNode === node;
      const isActiveDoc = state.activeFile === node.id;

      // Custom node color based on first realm mention
      let nodeColor = state.theme === 'dark' ? '#C08A2E' : '#9A7B1F'; // Default Gold
      if (node.mentions && node.mentions.length > 0) {
        const realmMention = node.mentions.find(m => m.type === 'realm');
        if (realmMention) {
          const rName = realmMention.name.toLowerCase();
          if (rName === 'zephyros') nodeColor = '#8AA63A';
          else if (rName === 'pyrthera') nodeColor = '#C7572B';
          else if (rName === 'thalassor') nodeColor = '#2E6FA3';
          else if (rName === 'ferridane') nodeColor = '#A66A2E';
          else if (rName === 'tenebralis') nodeColor = '#6A3D9A';
          else if (rName === 'luxenfall') nodeColor = '#C9A227';
          else if (rName === 'glacia') nodeColor = '#5C97B8';
        }
      }

      ctx.fillStyle = nodeColor;
      ctx.fill();

      // Node rings
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 4 : 2), 0, Math.PI * 2);
      ctx.strokeStyle = isHovered ? (state.theme === 'dark' ? '#FFF' : '#2B2317') : (isActiveDoc ? '#D96A4A' : 'transparent');
      ctx.lineWidth = isActiveDoc ? 2 : 1.5;
      ctx.stroke();

      // Draw text label
      ctx.fillStyle = state.theme === 'dark' ? '#E8D8BE' : '#2B2317';
      ctx.font = `600 ${isHovered ? 12 : 10}px ${state.theme === 'dark' ? 'Cinzel' : 'Marcellus'}`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y - node.radius - 6);
    });

    ctx.restore();

    // Loop
    animFrameId = requestAnimationFrame(tick);
  }

  animFrameId = requestAnimationFrame(tick);
}

// Boot up
window.onload = init;
