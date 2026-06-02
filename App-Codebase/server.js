import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the folder containing original lore files
const LORE_DIR = path.resolve(__dirname, '../Source-HTML');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure lore directory exists
if (!fs.existsSync(LORE_DIR)) {
  fs.mkdirSync(LORE_DIR, { recursive: true });
}

// Simple HTML tag strippers and extractors
function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractSections(html) {
  const sections = [];
  // Find <section id="..."> or <article id="...">
  const secRegex = /<(section|article)[^>]+id="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = secRegex.exec(html)) !== null) {
    const tag = match[1];
    const id = match[2];
    
    // Attempt to find the heading close to it
    const searchArea = html.substring(match.index, match.index + 500);
    const hMatch = searchArea.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    let title = id;
    if (hMatch) {
      // Strip any inner html from heading title (like class="uline")
      title = hMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    sections.push({ tag, id, title });
  }
  return sections;
}

function extractLinks(html) {
  const links = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    links.push({ href, text });
  }
  return links;
}

function stripHtml(html) {
  // Remove script and style tags completely
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Replace HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
  // Collapse whitespace
  return text.replace(/\s+/g, ' ').trim();
}

// Core entities/realms/characters to scan for automatically to build linkages
const REALMS = ['Zephyros', 'Pyrthera', 'Thalassor', 'Ferridane', 'Tenebralis', 'Luxenia', 'Luxenfall', 'Glacia', 'Katos'];
const CHARACTERS = [
  'Alciel', 'Uriel', 'Fiacre', 'Juno Sinclair', 'Saint Cloud', 'Saint Cloud Sinclair',
  'Aracice', 'Nyx', 'Tein-Enhotep', 'Baou Cypher', 'Anberlyn', 'Raiwata', 'Rukii',
  'Crex', 'Crex Falcon Axipitre', 'Tiamat', 'Bahamut', 'Dozu', 'Edgerinne', 'Sol\'Kheret',
  'Aya', 'Eloah', 'Ayin', 'Erebus', 'Brokkae', 'Algol', 'Aeralithe', 'Hecate'
];

function extractEntityMentions(text) {
  const mentions = [];
  
  REALMS.forEach(realm => {
    if (new RegExp(`\\b${realm}\\b`, 'i').test(text)) {
      mentions.push({ type: 'realm', name: realm });
    }
  });

  CHARACTERS.forEach(char => {
    if (new RegExp(`\\b${char}\\b`, 'i').test(text)) {
      mentions.push({ type: 'character', name: char });
    }
  });

  return mentions;
}

// Read and parse all files
function loadLoreDatabase() {
  const files = fs.readdirSync(LORE_DIR).filter(f => f.endsWith('.html'));
  return files.map(file => {
    const filePath = path.join(LORE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(content) || file.replace('.html', '').replace(/_/g, ' ');
    const strippedText = stripHtml(content);
    
    return {
      id: file,
      title,
      sections: extractSections(content),
      links: extractLinks(content),
      mentions: extractEntityMentions(strippedText),
      textLength: strippedText.length,
      // We don't return rawHtml for the bulk list to keep it fast, but we index it
      snippet: strippedText.substring(0, 250) + '...'
    };
  });
}

// API: List all lore files
app.get('/api/lore', (req, res) => {
  try {
    const db = loadLoreDatabase();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load lore database', details: err.message });
  }
});

// API: Get details of a single file
app.get('/api/lore/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(LORE_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `File ${filename} not found` });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(content);
    const strippedText = stripHtml(content);

    res.json({
      id: filename,
      title,
      rawHtml: content,
      sections: extractSections(content),
      links: extractLinks(content),
      mentions: extractEntityMentions(strippedText),
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to read ${filename}`, details: err.message });
  }
});

// API: Save or create a file
app.post('/api/lore/:filename', (req, res) => {
  const { filename } = req.params;
  const { rawHtml } = req.body;
  const filePath = path.join(LORE_DIR, filename);

  if (!rawHtml) {
    return res.status(400).json({ error: 'Missing rawHtml content' });
  }

  try {
    fs.writeFileSync(filePath, rawHtml, 'utf-8');
    res.json({ success: true, message: `Saved ${filename} successfully` });
  } catch (err) {
    res.status(500).json({ error: `Failed to write ${filename}`, details: err.message });
  }
});

// API: Delete a file
app.delete('/api/lore/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(LORE_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `File ${filename} not found` });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: `Deleted ${filename} successfully` });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete ${filename}`, details: err.message });
  }
});

// API: Creative AI Assistant using Gemini API (via raw fetch to be SDK-free)
app.post('/api/ai/chat', async (req, res) => {
  const { messages, currentDocContext } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Gemini API key is not configured. Please create a .env file with GEMINI_API_KEY=your_key' 
    });
  }

  try {
    // 1. Gather context from local files relevant to the query (RAG)
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const db = loadLoreDatabase();
    
    // Find files matching keywords
    let contextItems = [];
    const keywords = lastUserMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    db.forEach(item => {
      let score = 0;
      keywords.forEach(kw => {
        if (item.title.toLowerCase().includes(kw)) score += 10;
        // Search mentions
        item.mentions.forEach(m => {
          if (m.name.toLowerCase().includes(kw)) score += 5;
        });
      });
      if (score > 0) {
        contextItems.push({ id: item.id, title: item.title, score });
      }
    });

    // Sort context by relevance
    contextItems.sort((a, b) => b.score - a.score);
    const topContextDocs = contextItems.slice(0, 3);

    // Read full text for the top matching documents
    let contextText = '';
    topContextDocs.forEach(doc => {
      const filePath = path.join(LORE_DIR, doc.id);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const text = stripHtml(content);
        contextText += `--- LORE SOURCE: ${doc.title} (${doc.id}) ---\n${text.substring(0, 2000)}\n\n`;
      }
    });

    if (currentDocContext && currentDocContext.rawHtml) {
      contextText += `--- CURRENT DOCUMENT: ${currentDocContext.title} (${currentDocContext.id}) ---\n${stripHtml(currentDocContext.rawHtml).substring(0, 3000)}\n\n`;
    }

    // 2. Format request for Gemini 1.5 Flash
    // We map frontend messages list to Gemini API format
    const geminiContents = messages.map(msg => {
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });

    // Inject system instructions into the first user message or as systemInstruction parameter
    const systemPrompt = `You are the Moirai Codex Creative AI Assistant. 
You are an expert on the user's creative writing series "Advent of Ultima", which involves themes of mythology, gods, dragons, and multi-realm exploration (Zephyros, Pyrthera, Thalassor, Ferridane, Tenebralis, Luxania, Glacia).
Use the following local lore context to answer user questions, brainstorm new plotlines, connect characters, write text matching the tone, and offer creative advice. 
If the user asks to write a new character description, lore beat, or realm details, format it in a way that matches the "Gold on White" or "Obsidian/Ember" aesthetic.

--- LOCAL LORE CONTEXT ---
${contextText || 'No specific lore files matched the current query keywords. Answer using overall series knowledge.'}
------------------------`;

    // Add system instruction to api request
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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    res.json({ reply: replyText });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI Assistant failed', details: err.message });
  }
});

// Serve frontend assets built with Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA routing
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.send('Moirai Codex server running. Frontend is not built yet (run npm run dev in development).');
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Moirai Codex local server running at:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`==================================================`);
});
