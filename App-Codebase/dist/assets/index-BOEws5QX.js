(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))l(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&l(p)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();const t={files:[],filteredFiles:[],activeFile:null,activeFileData:null,activeTab:"codex",searchQuery:"",activeRealmFilter:"",theme:"light",isAiCollapsed:!1,aiMessages:[{role:"assistant",content:"Welcome to the Moirai Codex Assistant. I have read your series files and am ready to help you write, brainstorm, or explore connections."}],aiInput:"",isAiLoading:!1,editorMode:"template",editorFields:{filename:"",title:"",eyebrow:"",subtitle:"",epigraph:"",epigraphSub:"",realm:"gold",sections:[{id:"origin",eyebrow:"",heading:"",content:""}]},editorRawHtml:"",graph:{nodes:[],links:[],zoom:1,offsetX:0,offsetY:0,draggedNode:null,hoveredNode:null}};let i={};function N(){document.body.className=`theme-${t.theme}`;const e=document.getElementById("app");e.innerHTML=`
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
              <button class="ai-close-btn" id="btn-close-ai">&times;</button>
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
  `,H(),z(),E()}function H(){i.searchInput=document.getElementById("search-input"),i.realmFilters=document.getElementById("realm-filters"),i.fileListContainer=document.getElementById("file-list-container"),i.btnNewPage=document.getElementById("btn-new-page"),i.activeDocTitle=document.getElementById("active-doc-title-text"),i.activeDocFilename=document.getElementById("active-doc-filename-text"),i.navTabBtns=document.querySelectorAll(".nav-tab-btn"),i.tabCodex=document.getElementById("tab-codex"),i.tabEditor=document.getElementById("tab-editor"),i.docViewerContent=document.getElementById("doc-viewer-content"),i.editorFormContainer=document.getElementById("editor-form-container"),i.aiPanelSidebar=document.getElementById("ai-panel-sidebar"),i.aiMessagesContainer=document.getElementById("ai-messages-container"),i.aiTextareaInput=document.getElementById("ai-textarea-input"),i.btnSendAi=document.getElementById("btn-send-ai"),i.aiContextHintText=document.getElementById("ai-context-hint-text"),i.btnThemeToggle=document.getElementById("btn-theme-toggle"),i.btnToggleAi=document.getElementById("btn-toggle-ai"),i.btnCloseAi=document.getElementById("btn-close-ai"),i.graphCanvas=document.getElementById("graph-canvas"),i.btnMenuToggle=document.getElementById("btn-menu-toggle"),i.sidebar=document.querySelector(".sidebar")}function z(){i.btnThemeToggle.addEventListener("click",()=>{t.theme=t.theme==="dark"?"light":"dark",document.body.className=`theme-${t.theme}`,M()}),i.btnToggleAi.addEventListener("click",k),i.btnCloseAi.addEventListener("click",k),i.navTabBtns.forEach(e=>{e.addEventListener("click",n=>{const a=n.target.getAttribute("data-tab");b(a)})}),i.searchInput.addEventListener("input",e=>{t.searchQuery=e.target.value.toLowerCase(),C()}),i.btnNewPage.addEventListener("click",()=>{O()}),i.aiTextareaInput.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),B())}),i.btnSendAi.addEventListener("click",B),i.btnMenuToggle&&i.btnMenuToggle.addEventListener("click",e=>{e.stopPropagation(),t.isSidebarOpen=!t.isSidebarOpen,t.isSidebarOpen?i.sidebar.classList.add("open"):i.sidebar.classList.remove("open")}),i.fileListContainer.addEventListener("click",()=>{window.innerWidth<=768&&(t.isSidebarOpen=!1,i.sidebar.classList.remove("open"))}),document.querySelector(".main-pane").addEventListener("click",()=>{t.isSidebarOpen&&window.innerWidth<=768&&(t.isSidebarOpen=!1,i.sidebar.classList.remove("open"))})}function k(){t.isAiCollapsed=!t.isAiCollapsed,t.isAiCollapsed?i.aiPanelSidebar.classList.add("collapsed"):(i.aiPanelSidebar.classList.remove("collapsed"),w())}function b(e){t.activeTab=e,i.navTabBtns.forEach(n=>{n.getAttribute("data-tab")===e?n.classList.add("active"):n.classList.remove("active")}),i.tabCodex.classList.remove("active"),i.tabEditor.classList.remove("active"),e==="codex"?(i.tabCodex.classList.add("active"),M()):e==="editor"&&(i.tabEditor.classList.add("active"),F())}async function E(){try{const e=await fetch("http://localhost:3000/api/lore");if(!e.ok)throw new Error("API server returned error");t.files=await e.json(),C(),I(),G()}catch{i.fileListContainer.innerHTML=`
      <div style="color: var(--pyrthera); padding: 1rem; font-size: 0.8rem; text-align: center;">
        Failed to connect to local Express server at port 3000. Run <b>npm start</b> in App-Codebase.
      </div>
    `}}function I(){const e=["All","Zephyros","Pyrthera","Thalassor","Ferridane","Tenebralis","Luxenfall","Glacia"];i.realmFilters.innerHTML=e.map(n=>`<div class="filter-badge ${t.activeRealmFilter===n||n==="All"&&!t.activeRealmFilter?"active":""}" data-realm="${n}">${n}</div>`).join(""),i.realmFilters.querySelectorAll(".filter-badge").forEach(n=>{n.addEventListener("click",a=>{const l=a.target.getAttribute("data-realm");t.activeRealmFilter=l==="All"?"":l,I(),C()})})}function C(){t.filteredFiles=t.files.filter(e=>{const n=e.title.toLowerCase().includes(t.searchQuery),a=e.snippet.toLowerCase().includes(t.searchQuery);let l=!0;return t.activeRealmFilter&&(l=e.mentions.some(r=>r.type==="realm"&&r.name.toLowerCase()===t.activeRealmFilter.toLowerCase()),l||(l=e.title.toLowerCase().includes(t.activeRealmFilter.toLowerCase())||e.id.toLowerCase().includes(t.activeRealmFilter.toLowerCase()))),(n||a)&&l}),S()}function S(){if(t.filteredFiles.length===0){i.fileListContainer.innerHTML=`
      <div style="padding: 1.5rem; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No archives match query
      </div>
    `;return}i.fileListContainer.innerHTML=t.filteredFiles.map(e=>`
      <div class="file-item ${t.activeFile===e.id?"active":""}" data-id="${e.id}">
        <div class="file-item-title">${e.title}</div>
      </div>
    `).join(""),i.fileListContainer.querySelectorAll(".file-item").forEach(e=>{e.addEventListener("click",n=>{const a=n.currentTarget.getAttribute("data-id");L(a)})})}async function L(e){t.activeFile=e,S(),i.docViewerContent.innerHTML=`
    <div class="loading-indicator" style="padding-top: 5rem;">
      <div class="spinner"></div>
      <div>Loading lore file...</div>
    </div>
  `;try{const n=await fetch(`http://localhost:3000/api/lore/${e}`);if(!n.ok)throw new Error("Failed to load file");const a=await n.json();t.activeFileData=a,i.activeDocTitle.textContent=a.title,i.activeDocFilename.textContent=a.id,i.aiContextHintText.innerHTML=`<span>⚡</span> Context: <b>${a.title}</b>`,t.activeTab==="codex"?M():t.activeTab==="editor"&&F()}catch(n){i.docViewerContent.innerHTML=`
      <div style="color: var(--pyrthera); text-align: center; padding-top: 5rem;">
        Failed to parse document: ${n.message}
      </div>
    `}}function M(){if(!t.activeFileData)return;let e=t.activeFileData.rawHtml;const n=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i);n&&(e=n[1]),e=e.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi,""),i.docViewerContent.innerHTML=`
    <div class="lore-render-container">
      ${e}
    </div>
  `,i.docViewerContent.querySelectorAll("details.thread").forEach(r=>{const o=r.querySelector("summary");o&&(o.querySelector(".ico")||(o.innerHTML='<span class="ico">+</span>'+o.innerHTML))}),i.docViewerContent.querySelectorAll(".reveal").forEach(r=>{r.classList.add("in")}),i.docViewerContent.querySelectorAll('a[href^="#"]').forEach(r=>{r.addEventListener("click",o=>{const p=r.getAttribute("href");if(p==="#")return;o.preventDefault();const s=i.docViewerContent.querySelector(p);s&&s.scrollIntoView({behavior:"smooth",block:"start"})})}),P(i.docViewerContent,t.files)}function A(e,n){const a=e.toLowerCase();if(a.includes("zephyros")||a.includes("oracle")||a.includes("aeon"))return"zephyros";if(a.includes("pyrthera")||a.includes("uriel")||a.includes("wolf")||a.includes("wolves"))return"pyrthera";if(a.includes("thalassor")||a.includes("juno")||a.includes("sinclair")||a.includes("cloud"))return"thalassor";if(a.includes("ferridane")||a.includes("crex"))return"ferridane";if(a.includes("tenebralis")||a.includes("mavarra")||a.includes("shadow"))return"tenebralis";if(a.includes("luxenfall")||a.includes("luxania")||a.includes("alciel")||a.includes("hecate")||a.includes("light"))return"luxenfall";if(a.includes("glacia"))return"glacia";if(n&&n.length>0){const l=n.find(r=>r.type==="realm");if(l)return l.name.toLowerCase()}return"gold"}function P(e,n){const a=[];n.forEach(s=>{const c=s.title.replace(/—|·/g,"").replace(/\s+/g," ").trim();c.length>3&&a.push({text:c,target:s.id,type:A(c,s.mentions)});const d=s.id.replace(".html","").replace(/_/g," ");d.length>3&&d.toLowerCase()!==c.toLowerCase()&&a.push({text:d,target:s.id,type:A(d,s.mentions)})});const l=[{text:"Zephyros",target:"zephyros_realm_codex.html",type:"zephyros"},{text:"Pyrthera",target:"pyrthera_codex.html",type:"pyrthera"},{text:"Thalassor",target:"thalassor_realm_codex.html",type:"thalassor"},{text:"Ferridane",target:"ferridane_codex.html",type:"ferridane"},{text:"Tenebralis",target:"tenebralis_codex.html",type:"tenebralis"},{text:"Glacia",target:"realm_codex_glacia.html",type:"glacia"},{text:"Luxania",target:"luxania_codex.html",type:"luxenfall"},{text:"Luxenfall",target:"luxania_codex.html",type:"luxenfall"},{text:"Alciel",target:"Moirai_Codex_Alciel.html",type:"luxenfall"},{text:"Uriel",target:"Moirai_Codex_Uriel.html",type:"pyrthera"},{text:"Hecate",target:"GardenOfHecate_CG.html",type:"luxenfall"},{text:"Oracle",target:"moirai_lexicon.html",type:"zephyros"},{text:"Oracles",target:"moirai_lexicon.html",type:"zephyros"}];let r=[...a,...l];const o=new Set;r=r.filter(s=>{const c=s.text.toLowerCase();return o.has(c)?!1:(o.add(c),!0)}).sort((s,c)=>c.text.length-s.text.length);function p(s){if(s.nodeType===Node.TEXT_NODE){let c=s.nodeValue,d=s.parentNode;for(;d;){if(d.tagName==="A"||d.tagName==="SCRIPT"||d.tagName==="STYLE"||d.tagName==="TEXTAREA"||d.tagName==="BUTTON")return;d=d.parentNode}for(let m of r){if(m.target===t.activeFile)continue;const f=m.text.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),h=new RegExp(`\\b(${f}s?)\\b`,"i"),u=c.match(h);if(u){const v=u[0],y=c.indexOf(v),x=c.substring(0,y),$=c.substring(y+v.length),g=document.createElement("a");g.href="javascript:void(0)",g.className=`concept-link concept-${m.type}`,g.style.color=`var(--${m.type})`,g.style.fontWeight="600",g.style.textDecoration="none",g.style.borderBottom=`1.5px dashed var(--${m.type})`,g.textContent=v,g.onclick=D=>{D.preventDefault(),L(m.target)},x&&s.parentNode.insertBefore(document.createTextNode(x),s),s.parentNode.insertBefore(g,s);const T=document.createTextNode($);s.parentNode.insertBefore(T,s),s.parentNode.removeChild(s),p(T);return}}}else{const c=Array.from(s.childNodes);for(let d of c)p(d)}}p(e)}function F(){if(!t.activeFileData&&!t.isNewDocMode){i.editorFormContainer.innerHTML='<div style="text-align: center; padding-top: 3rem;">Please select a lore document from the sidebar to edit, or click "Create New Lore Page".</div>';return}const e=t.activeFileData||{id:"",title:"",rawHtml:""};t.editorRawHtml=e.rawHtml,i.editorFormContainer.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
      <h3 style="font-family: var(--font-display); font-style: normal; color: var(--accent);">Editing Lore Page</h3>
      <div style="display: flex; gap: 0.5rem;">
        <button class="graph-control-btn ${t.editorMode==="template"?"active":""}" id="btn-edit-template">Structured Fields</button>
        <button class="graph-control-btn ${t.editorMode==="raw"?"active":""}" id="btn-edit-raw">Raw HTML Source</button>
      </div>
    </div>

    <!-- Mode 1: Raw HTML Editor -->
    <div id="editor-raw-pane" class="${t.editorMode==="raw"?"":"tab-content"}">
      <div class="editor-field-group">
        <label class="editor-label">File name (e.g. genesis_chronicles.html)</label>
        <input type="text" id="raw-edit-filename" class="editor-input" value="${e.id}" ${t.isNewDocMode?"":"disabled"}>
      </div>
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">HTML Content Source</label>
        <textarea id="raw-edit-textarea" class="editor-textarea" placeholder="Paste or write HTML matching the house style template here...">${t.editorRawHtml}</textarea>
      </div>
    </div>

    <!-- Mode 2: Structured Fields Editor -->
    <div id="editor-template-pane" class="${t.editorMode==="template"?"":"tab-content"}">
      <div class="editor-field-group" style="margin-top: 1rem;">
        <label class="editor-label">File name (must end in .html)</label>
        <input type="text" id="tpl-edit-filename" class="editor-input" value="${e.id}" ${t.isNewDocMode?"":"disabled"}>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div class="editor-field-group">
          <label class="editor-label">Page Title</label>
          <input type="text" id="tpl-edit-title" class="editor-input" value="${t.isNewDocMode?"New Lore Topic":e.title}">
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
      ${t.isNewDocMode?"":'<button class="btn-secondary" id="btn-delete-lore" style="border-color: var(--pyrthera); color: var(--pyrthera);">Delete</button>'}
    </div>
  `;const n=document.getElementById("btn-edit-template"),a=document.getElementById("btn-edit-raw"),l=document.getElementById("editor-template-pane"),r=document.getElementById("editor-raw-pane");if(n.addEventListener("click",()=>{t.editorMode="template",n.classList.add("active"),a.classList.remove("active"),l.classList.remove("tab-content"),r.classList.add("tab-content")}),a.addEventListener("click",()=>{t.editorMode="raw",a.classList.add("active"),n.classList.remove("active"),r.classList.remove("tab-content"),l.classList.add("tab-content")}),t.editorMode==="template"&&!t.isNewDocMode&&e.rawHtml){const o=document.createElement("div");o.innerHTML=e.rawHtml,document.getElementById("tpl-edit-title").value=e.title;const p=o.querySelector(".eyebrow");p&&(document.getElementById("tpl-edit-eyebrow").value=p.textContent.trim());const s=o.querySelector(".subtitle");s&&(document.getElementById("tpl-edit-subtitle").value=s.textContent.trim());const c=o.querySelector(".mast-epi");if(c){const v=c.querySelector("span"),y=v?v.textContent.trim():"",x=c.innerHTML.split("<span>")[0].replace(/<[^>]+>/g,"").trim();document.getElementById("tpl-edit-epigraph").value=x,document.getElementById("tpl-edit-epigraph-sub").value=y}const d=o.querySelector(".sec-eyebrow");d&&(document.getElementById("tpl-edit-sec-eyebrow").value=d.textContent.trim());const m=o.querySelector("h2");m&&(document.getElementById("tpl-edit-sec-heading").value=m.textContent.replace(/<[^>]+>/g,"").trim());const f=Array.from(o.querySelectorAll("section.wrap p:not(.sec-eyebrow):not(.lead)")).map(v=>v.textContent.trim()).join(`

`),h=o.querySelector("section.wrap p.lead"),u=h?h.textContent.trim():"";document.getElementById("tpl-edit-sec-content").value=(u?u+`

`:"")+f}document.getElementById("btn-save-lore").addEventListener("click",q),document.getElementById("btn-cancel-edit").addEventListener("click",()=>{t.isNewDocMode=!1,b("codex")}),t.isNewDocMode||document.getElementById("btn-delete-lore").addEventListener("click",_)}function O(){t.isNewDocMode=!0,t.activeFile=null,t.activeFileData=null,t.editorMode="template",t.editorRawHtml=`<!DOCTYPE html>
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
</html>`,b("editor")}function R(){document.getElementById("tpl-edit-filename").value;const e=document.getElementById("tpl-edit-title").value,n=document.getElementById("tpl-edit-realm").value,a=document.getElementById("tpl-edit-eyebrow").value,l=document.getElementById("tpl-edit-subtitle").value,r=document.getElementById("tpl-edit-epigraph").value,o=document.getElementById("tpl-edit-epigraph-sub").value,p=document.getElementById("tpl-edit-sec-eyebrow").value,s=document.getElementById("tpl-edit-sec-heading").value,d=document.getElementById("tpl-edit-sec-content").value.split(`

`).filter(u=>u.trim().length>0);let m="";if(d.length>0){m+=`<p class="lead">${d[0]}</p>
`;for(let u=1;u<d.length;u++)m+=`    <p>${d[u]}</p>
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
  `,h=n!=="gold"?`style="--accent:var(--${n});--accent-pale:var(--${n}-pale)"`:"";return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e} — Moirai Codex</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Marcellus&display=swap" rel="stylesheet">
<style>${f}</style>
</head>
<body>
<div class="ribbon" aria-hidden="true"></div>
<main>
  <header class="mast">
    <p class="eyebrow">${a}</p>
    <h1 class="title">${e}</h1>
    <p class="subtitle">${l}</p>
    <div class="mast-mark"><div class="bar"></div></div>
    <p class="mast-epi">${r}<span>${o}</span></p>
  </header>
  
  <section id="origin" class="wrap reveal" ${h}>
    <p class="sec-eyebrow">${p}</p>
    <h2>${s}<span class="uline"></span></h2>
    ${m}
  </section>
</main>
</body>
</html>`}async function q(){let e="",n="";t.editorMode==="template"?(e=document.getElementById("tpl-edit-filename").value,n=R()):(e=document.getElementById("raw-edit-filename").value,n=document.getElementById("raw-edit-textarea").value),e.endsWith(".html")||(e+=".html");try{if(!(await fetch(`http://localhost:3000/api/lore/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawHtml:n})})).ok)throw new Error("Save operation failed");t.isNewDocMode=!1,alert(`Saved ${e} successfully!`),await E(),L(e),b("codex")}catch(a){alert(`Failed to save lore page: ${a.message}`)}}async function _(){if(confirm(`Are you absolutely sure you want to delete ${t.activeFile}?`))try{if(!(await fetch(`http://localhost:3000/api/lore/${t.activeFile}`,{method:"DELETE"})).ok)throw new Error("Delete operation failed");alert("Deleted file successfully."),t.activeFile=null,t.activeFileData=null,await E(),b("codex")}catch(e){alert(`Failed to delete file: ${e.message}`)}}function w(){i.aiMessagesContainer.innerHTML=t.aiMessages.map(e=>{const n=e.role==="assistant",a=n?"Codex Assistant":"Creative Writer",l=n?"assistant":"user";let r=e.content.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");return`
      <div class="ai-message ${l}">
        <div class="sender">${a}</div>
        <div class="msg-body">${r}</div>
      </div>
    `}).join(""),i.aiMessagesContainer.scrollTop=i.aiMessagesContainer.scrollHeight}async function B(){const e=i.aiTextareaInput.value.trim();if(!e||t.isAiLoading)return;t.aiMessages.push({role:"user",content:e}),i.aiTextareaInput.value="",w(),t.isAiLoading=!0,i.btnSendAi.disabled=!0,i.btnSendAi.textContent="...";const n="ai-chat-loader-bubble",a=document.createElement("div");a.id=n,a.className="ai-message assistant",a.innerHTML=`
    <div class="sender">Codex Assistant</div>
    <div class="msg-body">Tracing scrolls... <div class="spinner" style="width:12px; height:12px; border-width:2px; display:inline-block; vertical-align:middle; margin-left:5px;"></div></div>
  `,i.aiMessagesContainer.appendChild(a),i.aiMessagesContainer.scrollTop=i.aiMessagesContainer.scrollHeight;try{const l=await fetch("http://localhost:3000/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:t.aiMessages.slice(-8),currentDocContext:t.activeFileData})}),r=document.getElementById(n);if(r&&r.remove(),!l.ok){const p=await l.json();throw new Error(p.error||"Server error")}const o=await l.json();t.aiMessages.push({role:"assistant",content:o.reply})}catch(l){const r=document.getElementById(n);r&&r.remove(),t.aiMessages.push({role:"assistant",content:`❌ Connect failed: ${l.message}. Make sure your Gemini API key is set in .env as GEMINI_API_KEY=xxx inside your App-Codebase directory.`})}finally{t.isAiLoading=!1,i.btnSendAi.disabled=!1,i.btnSendAi.textContent="Send",w()}}function G(){t.graph.nodes=t.files.map((e,n)=>({id:e.id,label:e.title,x:window.innerWidth/2+(Math.random()-.5)*400,y:window.innerHeight/2+(Math.random()-.5)*400,vx:0,vy:0,radius:8+Math.min(e.textLength/4e3,15),mentions:e.mentions})),t.graph.links=[],t.files.forEach(e=>{e.links.forEach(n=>{const a=n.href.split("#")[0];a&&a!==e.id&&t.files.some(l=>l.id===a)&&t.graph.links.push({source:e.id,target:a,type:"link"})}),e.mentions.forEach(n=>{t.files.forEach(a=>{a.id!==e.id&&a.mentions.some(r=>r.name===n.name)&&(t.graph.links.some(o=>o.source===e.id&&o.target===a.id||o.source===a.id&&o.target===e.id)||t.graph.links.push({source:e.id,target:a.id,type:n.type,name:n.name}))})})})}window.onload=N;
