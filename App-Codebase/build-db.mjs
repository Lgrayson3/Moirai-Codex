import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LORE_DIR = path.resolve(__dirname, '../Source-HTML');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Extract Title
function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

// Extract Sections
function extractSections(html) {
  const sections = [];
  const secRegex = /<(section|article)[^>]+id="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = secRegex.exec(html)) !== null) {
    const tag = match[1];
    const id = match[2];
    
    const searchArea = html.substring(match.index, match.index + 500);
    const hMatch = searchArea.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    let title = id;
    if (hMatch) {
      title = hMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    sections.push({ tag, id, title });
  }
  return sections;
}

// Extract Links
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

// Strip HTML
function stripHtml(html) {
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
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
  return text.replace(/\s+/g, ' ').trim();
}

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

console.log('Compiling lore database...');

const files = fs.readdirSync(LORE_DIR).filter(f => f.endsWith('.html') && f !== 'house_style_starter_template.html');
const db = files.map(file => {
  const filePath = path.join(LORE_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content) || file.replace('.html', '').replace(/_/g, ' ');
  const strippedText = stripHtml(content);
  
  return {
    id: file,
    title,
    rawHtml: content, // Include rawHtml for static mode loaded instantly by frontend
    sections: extractSections(content),
    links: extractLinks(content),
    mentions: extractEntityMentions(strippedText),
    textLength: strippedText.length,
    snippet: strippedText.substring(0, 250) + '...'
  };
});

fs.writeFileSync(
  path.join(PUBLIC_DIR, 'lore_db.json'),
  JSON.stringify(db, null, 2),
  'utf-8'
);

console.log(`Successfully compiled ${db.length} files into public/lore_db.json!`);
