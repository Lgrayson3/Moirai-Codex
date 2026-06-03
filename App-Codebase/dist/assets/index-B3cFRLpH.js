(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))d(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&d(p)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function d(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const e={files:[],filteredFiles:[],activeFile:null,activeFileData:null,activeTab:"codex",searchQuery:"",activeRealmFilter:"",theme:"light",isAiCollapsed:!1,aiMessages:[{role:"assistant",content:"Welcome to the Moirai Codex Assistant. I have read your series files and am ready to help you write, brainstorm, or explore connections."}],aiInput:"",isAiLoading:!1,editorMode:"template",editorFields:{filename:"",title:"",eyebrow:"",subtitle:"",epigraph:"",epigraphSub:"",realm:"gold",sections:[{id:"origin",eyebrow:"",heading:"",content:""}]},editorRawHtml:"",graph:{nodes:[],links:[],zoom:1,offsetX:0,offsetY:0,draggedNode:null,hoveredNode:null}};let i={};function O(){document.body.className=`theme-${e.theme}`;const t=document.getElementById("app");t.innerHTML=`
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
  `,R(),_(),I()}function R(){i.searchInput=document.getElementById("search-input"),i.realmFilters=document.getElementById("realm-filters"),i.fileListContainer=document.getElementById("file-list-container"),i.btnNewPage=document.getElementById("btn-new-page"),i.activeDocTitle=document.getElementById("active-doc-title-text"),i.activeDocFilename=document.getElementById("active-doc-filename-text"),i.navTabBtns=document.querySelectorAll(".nav-tab-btn"),i.tabCodex=document.getElementById("tab-codex"),i.tabEditor=document.getElementById("tab-editor"),i.docViewerContent=document.getElementById("doc-viewer-content"),i.editorFormContainer=document.getElementById("editor-form-container"),i.aiPanelSidebar=document.getElementById("ai-panel-sidebar"),i.aiMessagesContainer=document.getElementById("ai-messages-container"),i.aiTextareaInput=document.getElementById("ai-textarea-input"),i.btnSendAi=document.getElementById("btn-send-ai"),i.aiContextHintText=document.getElementById("ai-context-hint-text"),i.btnThemeToggle=document.getElementById("btn-theme-toggle"),i.btnToggleAi=document.getElementById("btn-toggle-ai"),i.btnCloseAi=document.getElementById("btn-close-ai"),i.btnAiSettings=document.getElementById("btn-ai-settings"),i.aiSettingsModal=document.getElementById("ai-settings-modal"),i.geminiApiKeyInput=document.getElementById("gemini-api-key-input"),i.btnSaveApiKey=document.getElementById("btn-save-api-key"),i.graphCanvas=document.getElementById("graph-canvas"),i.btnMenuToggle=document.getElementById("btn-menu-toggle"),i.sidebar=document.querySelector(".sidebar")}function _(){if(i.btnThemeToggle.addEventListener("click",()=>{e.theme=e.theme==="dark"?"light":"dark",document.body.className=`theme-${e.theme}`,B()}),i.btnToggleAi.addEventListener("click",$),i.btnCloseAi.addEventListener("click",$),i.navTabBtns.forEach(t=>{t.addEventListener("click",a=>{const n=a.target.getAttribute("data-tab");C(n)})}),i.searchInput.addEventListener("input",t=>{e.searchQuery=t.target.value.toLowerCase(),T()}),i.btnNewPage.addEventListener("click",()=>{j()}),i.aiTextareaInput.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),N())}),i.btnSendAi.addEventListener("click",N),i.btnMenuToggle&&i.btnMenuToggle.addEventListener("click",t=>{t.stopPropagation(),e.isSidebarOpen=!e.isSidebarOpen,e.isSidebarOpen?i.sidebar.classList.add("open"):i.sidebar.classList.remove("open")}),i.fileListContainer.addEventListener("click",()=>{window.innerWidth<=768&&(e.isSidebarOpen=!1,i.sidebar.classList.remove("open"))}),document.querySelector(".main-pane").addEventListener("click",()=>{e.isSidebarOpen&&window.innerWidth<=768&&(e.isSidebarOpen=!1,i.sidebar.classList.remove("open"))}),i.btnAiSettings){const t=localStorage.getItem("gemini_api_key")||"";i.geminiApiKeyInput.value=t,i.btnAiSettings.addEventListener("click",a=>{a.stopPropagation();const n=i.aiSettingsModal.style.display==="none";i.aiSettingsModal.style.display=n?"flex":"none"}),i.btnSaveApiKey.addEventListener("click",()=>{const a=i.geminiApiKeyInput.value.trim();a?(localStorage.setItem("gemini_api_key",a),alert("Gemini API key saved locally!")):(localStorage.removeItem("gemini_api_key"),alert("Gemini API key cleared.")),i.aiSettingsModal.style.display="none"})}}function $(){e.isAiCollapsed=!e.isAiCollapsed,e.isAiCollapsed?i.aiPanelSidebar.classList.add("collapsed"):(i.aiPanelSidebar.classList.remove("collapsed"),A())}function C(t){e.activeTab=t,i.navTabBtns.forEach(a=>{a.getAttribute("data-tab")===t?a.classList.add("active"):a.classList.remove("active")}),i.tabCodex.classList.remove("active"),i.tabEditor.classList.remove("active"),t==="codex"?(i.tabCodex.classList.add("active"),B()):t==="editor"&&(i.tabEditor.classList.add("active"),e.isReadOnly?i.editorFormContainer.innerHTML=`
        <div style="text-align: center; padding-top: 5rem; color: var(--text-secondary);">
          <h2 style="font-family: var(--font-display); font-weight: normal; font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent);">Local Editor Mode Only</h2>
          <p style="max-width: 500px; margin: 0 auto; line-height: 1.6;">Editing and creating lore pages is only supported when running the app locally with the backend server. To run locally, run <code>npm start</code> in your terminal.</p>
        </div>
      `:G())}async function I(){try{const t=await fetch("http://localhost:3000/api/lore");if(!t.ok)throw new Error("API server returned error");e.files=await t.json(),e.isReadOnly=!1,i.btnNewPage.style.display="block",T(),M(),H()}catch{console.log("Local Express server not running. Falling back to static lore_db.json.");try{e.isReadOnly=!0,i.btnNewPage.style.display="none";const a=await fetch("lore_db.json");if(!a.ok)throw new Error("Failed to load lore database json");e.files=await a.json(),T(),M(),H()}catch(a){i.fileListContainer.innerHTML=`
        <div style="color: var(--pyrthera); padding: 1rem; font-size: 0.8rem; text-align: center;">
          Failed to load lore archives: ${a.message}
        </div>
      `}}}function M(){const t=["All","Zephyros","Pyrthera","Thalassor","Ferridane","Tenebralis","Luxenfall","Glacia"];i.realmFilters.innerHTML=t.map(a=>`<div class="filter-badge ${e.activeRealmFilter===a||a==="All"&&!e.activeRealmFilter?"active":""}" data-realm="${a}">${a}</div>`).join(""),i.realmFilters.querySelectorAll(".filter-badge").forEach(a=>{a.addEventListener("click",n=>{const d=n.target.getAttribute("data-realm");e.activeRealmFilter=d==="All"?"":d,M(),T()})})}function T(){e.filteredFiles=e.files.filter(t=>{const a=t.title.toLowerCase().includes(e.searchQuery),n=t.snippet.toLowerCase().includes(e.searchQuery);let d=!0;return e.activeRealmFilter&&(d=t.mentions.some(r=>r.type==="realm"&&r.name.toLowerCase()===e.activeRealmFilter.toLowerCase()),d||(d=t.title.toLowerCase().includes(e.activeRealmFilter.toLowerCase())||t.id.toLowerCase().includes(e.activeRealmFilter.toLowerCase()))),(a||n)&&d}),P()}function P(){if(e.filteredFiles.length===0){i.fileListContainer.innerHTML=`
      <div style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No archives match query
      </div>
    `;return}i.fileListContainer.innerHTML=e.filteredFiles.map(t=>`
      <div class="file-item ${e.activeFile===t.id?"active":""}" data-id="${t.id}">
        <div class="file-item-title">${t.title}</div>
      </div>
    `).join(""),i.fileListContainer.querySelectorAll(".file-item").forEach(t=>{t.addEventListener("click",a=>{const n=a.currentTarget.getAttribute("data-id");S(n)})})}async function S(t){e.activeFile=t,P(),i.docViewerContent.innerHTML=`
    <div class="loading-indicator" style="padding-top: 5rem;">
      <div class="spinner"></div>
      <div>Loading lore file...</div>
    </div>
  `;try{let a;if(e.isReadOnly){if(a=e.files.find(n=>n.id===t),!a)throw new Error("Document not found in static package")}else{const n=await fetch(`http://localhost:3000/api/lore/${t}`);if(!n.ok)throw new Error("Failed to load file");a=await n.json()}e.activeFileData=a,i.activeDocTitle.textContent=a.title,i.activeDocFilename.textContent=a.id,i.aiContextHintText.innerHTML=`<span>⚡</span> Context: <b>${a.title}</b>`,e.activeTab==="codex"?B():e.activeTab==="editor"&&C("editor")}catch(a){i.docViewerContent.innerHTML=`
      <div style="color: var(--pyrthera); text-align: center; padding-top: 5rem;">
        Failed to parse document: ${a.message}
      </div>
    `}}function B(){if(!e.activeFileData)return;let t=e.activeFileData.rawHtml;const a=t.match(/<body[^>]*>([\s\S]*?)<\/body>/i);a&&(t=a[1]),t=t.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi,""),i.docViewerContent.innerHTML=`
    <div class="lore-render-container">
      ${t}
    </div>
  `,i.docViewerContent.querySelectorAll("details.thread").forEach(r=>{const o=r.querySelector("summary");o&&(o.querySelector(".ico")||(o.innerHTML='<span class="ico">+</span>'+o.innerHTML))}),i.docViewerContent.querySelectorAll(".reveal").forEach(r=>{r.classList.add("in")}),i.docViewerContent.querySelectorAll('a[href^="#"]').forEach(r=>{r.addEventListener("click",o=>{const p=r.getAttribute("href");if(p==="#")return;o.preventDefault();const l=i.docViewerContent.querySelector(p);l&&l.scrollIntoView({behavior:"smooth",block:"start"})})}),q(i.docViewerContent,e.files)}function D(t,a){const n=t.toLowerCase();if(n.includes("zephyros")||n.includes("oracle")||n.includes("aeon"))return"zephyros";if(n.includes("pyrthera")||n.includes("uriel")||n.includes("wolf")||n.includes("wolves"))return"pyrthera";if(n.includes("thalassor")||n.includes("juno")||n.includes("sinclair")||n.includes("cloud"))return"thalassor";if(n.includes("ferridane")||n.includes("crex"))return"ferridane";if(n.includes("tenebralis")||n.includes("mavarra")||n.includes("shadow"))return"tenebralis";if(n.includes("luxenfall")||n.includes("luxania")||n.includes("alciel")||n.includes("hecate")||n.includes("light"))return"luxenfall";if(n.includes("glacia"))return"glacia";if(a&&a.length>0){const d=a.find(r=>r.type==="realm");if(d)return d.name.toLowerCase()}return"gold"}function q(t,a){const n=[];a.forEach(l=>{const c=l.title.replace(/—|·/g,"").replace(/\s+/g," ").trim();c.length>3&&n.push({text:c,target:l.id,type:D(c,l.mentions)});const s=l.id.replace(".html","").replace(/_/g," ");s.length>3&&s.toLowerCase()!==c.toLowerCase()&&n.push({text:s,target:l.id,type:D(s,l.mentions)})});const d=[{text:"Zephyros",target:"zephyros_realm_codex.html",type:"zephyros"},{text:"Pyrthera",target:"pyrthera_codex.html",type:"pyrthera"},{text:"Thalassor",target:"thalassor_realm_codex.html",type:"thalassor"},{text:"Ferridane",target:"ferridane_codex.html",type:"ferridane"},{text:"Tenebralis",target:"tenebralis_codex.html",type:"tenebralis"},{text:"Glacia",target:"realm_codex_glacia.html",type:"glacia"},{text:"Luxania",target:"luxania_codex.html",type:"luxenfall"},{text:"Luxenfall",target:"luxania_codex.html",type:"luxenfall"},{text:"Alciel",target:"Moirai_Codex_Alciel.html",type:"luxenfall"},{text:"Uriel",target:"Moirai_Codex_Uriel.html",type:"pyrthera"},{text:"Hecate",target:"GardenOfHecate_CG.html",type:"luxenfall"},{text:"Oracle",target:"moirai_lexicon.html",type:"zephyros"},{text:"Oracles",target:"moirai_lexicon.html",type:"zephyros"}];let r=[...n,...d];const o=new Set;r=r.filter(l=>{const c=l.text.toLowerCase();return o.has(c)?!1:(o.add(c),!0)}).sort((l,c)=>c.text.length-l.text.length);function p(l){if(l.nodeType===Node.TEXT_NODE){let c=l.nodeValue,s=l.parentNode;for(;s;){if(s.tagName==="A"||s.tagName==="SCRIPT"||s.tagName==="STYLE"||s.tagName==="TEXTAREA"||s.tagName==="BUTTON")return;s=s.parentNode}for(let g of r){if(g.target===e.activeFile)continue;const f=g.text.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),y=new RegExp(`\\b(${f}s?)\\b`,"i"),u=c.match(y);if(u){const h=u[0],w=c.indexOf(h),x=c.substring(0,w),k=c.substring(w+h.length),v=document.createElement("a");v.href="javascript:void(0)",v.className=`concept-link concept-${g.type}`,v.style.color=`var(--${g.type})`,v.style.fontWeight="600",v.style.textDecoration="none",v.style.borderBottom=`1.5px dashed var(--${g.type})`,v.textContent=h,v.onclick=L=>{L.preventDefault(),S(g.target)},x&&l.parentNode.insertBefore(document.createTextNode(x),l),l.parentNode.insertBefore(v,l);const b=document.createTextNode(k);l.parentNode.insertBefore(b,l),l.parentNode.removeChild(l),p(b);return}}}else{const c=Array.from(l.childNodes);for(let s of c)p(s)}}p(t)}function G(){if(!e.activeFileData&&!e.isNewDocMode){i.editorFormContainer.innerHTML='<div style="text-align: center; padding-top: 3rem;">Please select a lore document from the sidebar to edit, or click "Create New Lore Page".</div>';return}const t=e.activeFileData||{id:"",title:"",rawHtml:""};e.editorRawHtml=t.rawHtml,i.editorFormContainer.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
      <h3 style="font-family: var(--font-display); font-style: normal; color: var(--accent);">Editing Lore Page</h3>
      <div style="display: flex; gap: 0.5rem;">
        <button class="graph-control-btn ${e.editorMode==="template"?"active":""}" id="btn-edit-template">Structured Fields</button>
        <button class="graph-control-btn ${e.editorMode==="raw"?"active":""}" id="btn-edit-raw">Raw HTML Source</button>
      </div>
    </div>

    <!-- Mode 1: Raw HTML Editor -->
    <div id="editor-raw-pane" class="${e.editorMode==="raw"?"":"tab-content"}">
      <div class="editor-field-group">
        <label class="editor-label">File name (e.g. genesis_chronicles.html)</label>
        <input type="text" id="raw-edit-filename" class="editor-input" value="${t.id}" ${e.isNewDocMode?"":"disabled"}>
      </div>
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">HTML Content Source</label>
        <textarea id="raw-edit-textarea" class="editor-textarea" placeholder="Paste or write HTML matching the house style template here...">${e.editorRawHtml}</textarea>
      </div>
    </div>

    <!-- Mode 2: Structured Fields Editor -->
    <div id="editor-template-pane" class="${e.editorMode==="template"?"":"tab-content"}">
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">File name (must end in .html)</label>
        <input type="text" id="tpl-edit-filename" class="editor-input" value="${t.id}" ${e.isNewDocMode?"":"disabled"}>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div class="editor-field-group">
          <label class="editor-label">Page Title</label>
          <input type="text" id="tpl-edit-title" class="editor-input" value="${e.isNewDocMode?"New Lore Topic":t.title}">
        </div>
        <div class="editor-field-group">
          <label class="editor-label">Realm Accent Theme</label>
          <select id="tpl-edit-realm" class="editor-select">
            <option value="gold" selected>Gold (Default)</option>
            <option value="zephyros" >Zephyros (Green)</option>
            <option value="pyrthera" >Pyrthera (Red-Orange)</option>
            <option value="thalassor" >Thalassor (Blue)</option>
            <option value="ferridane" >Ferridane (Brown-Gold)</option>
            <option value="tenebralis" >Tenebralis (Violet)</option>
            <option value="luxenfall" >Luxenfall (Bright Gold)</option>
            <option value="glacia" >Glacia (Light Blue)</option>
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
      ${e.isNewDocMode?"":'<button class="btn-secondary" id="btn-delete-lore" style="border-color: var(--pyrthera); color: var(--pyrthera);">Delete</button>'}
    </div>
  `;const a=document.getElementById("btn-edit-template"),n=document.getElementById("btn-edit-raw"),d=document.getElementById("editor-template-pane"),r=document.getElementById("editor-raw-pane");if(a.addEventListener("click",()=>{e.editorMode="template",a.classList.add("active"),n.classList.remove("active"),d.classList.remove("tab-content"),r.classList.add("tab-content")}),n.addEventListener("click",()=>{e.editorMode="raw",n.classList.add("active"),a.classList.remove("active"),r.classList.remove("tab-content"),d.classList.add("tab-content")}),e.editorMode==="template"&&!e.isNewDocMode&&t.rawHtml){const o=document.createElement("div");o.innerHTML=t.rawHtml,document.getElementById("tpl-edit-title").value=t.title;const p=o.querySelector(".eyebrow");p&&(document.getElementById("tpl-edit-eyebrow").value=p.textContent.trim());const l=o.querySelector(".subtitle");l&&(document.getElementById("tpl-edit-subtitle").value=l.textContent.trim());const c=o.querySelector(".mast-epi");if(c){const h=c.querySelector("span"),w=h?h.textContent.trim():"",x=c.innerHTML.split("<span>")[0].replace(/<[^>]+>/g,"").trim();document.getElementById("tpl-edit-epigraph").value=x,document.getElementById("tpl-edit-epigraph-sub").value=w}const s=o.querySelector(".sec-eyebrow");s&&(document.getElementById("tpl-edit-sec-eyebrow").value=s.textContent.trim());const g=o.querySelector("h2");g&&(document.getElementById("tpl-edit-sec-heading").value=g.textContent.replace(/<[^>]+>/g,"").trim());const f=Array.from(o.querySelectorAll("section.wrap p:not(.sec-eyebrow):not(.lead)")).map(h=>h.textContent.trim()).join(`

`),y=o.querySelector("section.wrap p.lead"),u=y?y.textContent.trim():"";document.getElementById("tpl-edit-sec-content").value=(u?u+`

`:"")+f}document.getElementById("btn-save-lore").addEventListener("click",V),document.getElementById("btn-cancel-edit").addEventListener("click",()=>{e.isNewDocMode=!1,C("codex")}),e.isNewDocMode||document.getElementById("btn-delete-lore").addEventListener("click",W)}function j(){e.isNewDocMode=!0,e.activeFile=null,e.activeFileData=null,e.editorMode="template",e.editorRawHtml=`<!DOCTYPE html>
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
</html>`,C("editor")}function K(){document.getElementById("tpl-edit-filename").value;const t=document.getElementById("tpl-edit-title").value,a=document.getElementById("tpl-edit-realm").value,n=document.getElementById("tpl-edit-eyebrow").value,d=document.getElementById("tpl-edit-subtitle").value,r=document.getElementById("tpl-edit-epigraph").value,o=document.getElementById("tpl-edit-epigraph-sub").value,p=document.getElementById("tpl-edit-sec-eyebrow").value,l=document.getElementById("tpl-edit-sec-heading").value,s=document.getElementById("tpl-edit-sec-content").value.split(`

`).filter(u=>u.trim().length>0);let g="";if(s.length>0){g+=`<p class="lead">${s[0]}</p>
`;for(let u=1;u<s.length;u++)g+=`    <p>${s[u]}</p>
`}const f=`
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
  `,y=a!=="gold"?`style="--accent:var(--${a});--accent-pale:var(--${a}-pale)"`:"";return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t} — Moirai Codex</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Marcellus&display=swap" rel="stylesheet">
<style>${f}</style>
</head>
<body>
<div class="ribbon" aria-hidden="true"></div>
<main>
  <header class="mast">
    <p class="eyebrow">${n}</p>
    <h1 class="title">${t}</h1>
    <p class="subtitle">${d}</p>
    <div class="mast-mark"><div class="bar"></div></div>
    <p class="mast-epi">${r}<span>${o}</span></p>
  </header>
  
  <section id="origin" class="wrap reveal" ${y}>
    <p class="sec-eyebrow">${p}</p>
    <h2>${l}<span class="uline"></span></h2>
    ${g}
  </section>
</main>
</body>
</html>`}async function V(){let t="",a="";e.editorMode==="template"?(t=document.getElementById("tpl-edit-filename").value,a=K()):(t=document.getElementById("raw-edit-filename").value,a=document.getElementById("raw-edit-textarea").value),t.endsWith(".html")||(t+=".html");try{if(!(await fetch(`http://localhost:3000/api/lore/${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawHtml:a})})).ok)throw new Error("Save operation failed");e.isNewDocMode=!1,alert(`Saved ${t} successfully!`),await I(),S(t),C("codex")}catch(n){alert(`Failed to save lore page: ${n.message}`)}}async function W(){if(confirm(`Are you absolutely sure you want to delete ${e.activeFile}?`))try{if(!(await fetch(`http://localhost:3000/api/lore/${e.activeFile}`,{method:"DELETE"})).ok)throw new Error("Delete operation failed");alert("Deleted file successfully."),e.activeFile=null,e.activeFileData=null,await I(),C("codex")}catch(t){alert(`Failed to delete file: ${t.message}`)}}function A(){i.aiMessagesContainer.innerHTML=e.aiMessages.map(t=>{const a=t.role==="assistant",n=a?"Codex Assistant":"Creative Writer",d=a?"assistant":"user";let r=t.content.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");return`
      <div class="ai-message ${d}">
        <div class="sender">${n}</div>
        <div class="msg-body">${r}</div>
      </div>
    `}).join(""),i.aiMessagesContainer.scrollTop=i.aiMessagesContainer.scrollHeight}async function N(){var d,r,o,p,l;const t=i.aiTextareaInput.value.trim();if(!t||e.isAiLoading)return;e.aiMessages.push({role:"user",content:t}),i.aiTextareaInput.value="",A(),e.isAiLoading=!0,i.btnSendAi.disabled=!0,i.btnSendAi.textContent="...";const a="ai-chat-loader-bubble",n=document.createElement("div");n.id=a,n.className="ai-message assistant",n.innerHTML=`
    <div class="sender">Codex Assistant</div>
    <div class="msg-body">Tracing scrolls... <div class="spinner" style="width:12px; height:12px; border-width:2px; display:inline-block; vertical-align:middle; margin-left:5px;"></div></div>
  `,i.aiMessagesContainer.appendChild(n),i.aiMessagesContainer.scrollTop=i.aiMessagesContainer.scrollHeight;try{let c="";if(e.isReadOnly){const s=localStorage.getItem("gemini_api_key")||"";if(!s)throw new Error("Please set your Gemini API key in the settings panel (🔑 Settings button in the AI panel header) to use the assistant on GitHub Pages.");const g=e.files;let f=[];const y=t.toLowerCase().split(/\s+/).filter(m=>m.length>3);g.forEach(m=>{let E=0;y.forEach(F=>{m.title.toLowerCase().includes(F)&&(E+=10),m.mentions&&m.mentions.forEach(z=>{z.name.toLowerCase().includes(F)&&(E+=5)})}),E>0&&f.push({id:m.id,title:m.title,score:E,rawHtml:m.rawHtml})}),f.sort((m,E)=>E.score-m.score);const u=f.slice(0,3);let h="";u.forEach(m=>{h+=`--- LORE SOURCE: ${m.title} (${m.id}) ---
${stripHtml(m.rawHtml).substring(0,2e3)}

`}),e.activeFileData&&e.activeFileData.rawHtml&&(h+=`--- CURRENT DOCUMENT: ${e.activeFileData.title} (${e.activeFileData.id}) ---
${stripHtml(e.activeFileData.rawHtml).substring(0,3e3)}

`);const w=e.aiMessages.slice(-8).map(m=>({role:m.role==="user"?"user":"model",parts:[{text:m.content}]})),x=`You are the Moirai Codex Creative AI Assistant. 
You are an expert on the user's creative writing series "Advent of Ultima", which involves themes of mythology, gods, dragons, and multi-realm exploration (Zephyros, Pyrthera, Thalassor, Ferridane, Tenebralis, Luxania, Glacia).
Use the following local lore context to answer user questions, brainstorm new plotlines, connect characters, write text matching the tone, and offer creative advice. 
If the user asks to write a new character description, lore beat, or realm details, format it in a way that matches the "Gold on White" or "Obsidian/Ember" aesthetic.

--- LOCAL LORE CONTEXT ---
${h||"No specific lore files matched the current query keywords. Answer using overall series knowledge."}
------------------------`,k={contents:w,systemInstruction:{parts:[{text:x}]},generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:2048}},v=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${s}`,b=await fetch(v,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(k)}),L=document.getElementById(a);if(L&&L.remove(),!b.ok){const m=await b.text();throw new Error(`Gemini API Error (${b.status}): ${m}`)}c=((l=(p=(o=(r=(d=(await b.json()).candidates)==null?void 0:d[0])==null?void 0:r.content)==null?void 0:o.parts)==null?void 0:p[0])==null?void 0:l.text)||"No response generated."}else{const s=await fetch("http://localhost:3000/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:e.aiMessages.slice(-8),currentDocContext:e.activeFileData})}),g=document.getElementById(a);if(g&&g.remove(),!s.ok){const y=await s.json();throw new Error(y.error||"Server error")}c=(await s.json()).reply}e.aiMessages.push({role:"assistant",content:c})}catch(c){const s=document.getElementById(a);s&&s.remove(),e.aiMessages.push({role:"assistant",content:`❌ Request failed: ${c.message}`})}finally{e.isAiLoading=!1,i.btnSendAi.disabled=!1,i.btnSendAi.textContent="Send",A()}}function H(){e.graph.nodes=e.files.map((t,a)=>({id:t.id,label:t.title,x:window.innerWidth/2+(Math.random()-.5)*400,y:window.innerHeight/2+(Math.random()-.5)*400,vx:0,vy:0,radius:8+Math.min(t.textLength/4e3,15),mentions:t.mentions})),e.graph.links=[],e.files.forEach(t=>{t.links.forEach(a=>{const n=a.href.split("#")[0];n&&n!==t.id&&e.files.some(d=>d.id===n)&&e.graph.links.push({source:t.id,target:n,type:"link"})}),t.mentions.forEach(a=>{e.files.forEach(n=>{n.id!==t.id&&n.mentions.some(r=>r.name===a.name)&&(e.graph.links.some(o=>o.source===t.id&&o.target===n.id||o.source===n.id&&o.target===t.id)||e.graph.links.push({source:t.id,target:n.id,type:a.type,name:a.name}))})})})}window.onload=O;
