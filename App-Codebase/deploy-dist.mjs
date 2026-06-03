import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, 'dist');
const ROOT_DIR = path.resolve(__dirname, '../');

console.log('Copying build assets to repository root for GitHub Pages...');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean old assets directory in root
const rootAssets = path.join(ROOT_DIR, 'assets');
if (fs.existsSync(rootAssets)) {
  fs.rmSync(rootAssets, { recursive: true, force: true });
}

// Copy dist contents to root
if (fs.existsSync(DIST_DIR)) {
  fs.readdirSync(DIST_DIR).forEach(item => {
    const srcPath = path.join(DIST_DIR, item);
    const destPath = path.join(ROOT_DIR, item);
    copyRecursiveSync(srcPath, destPath);
  });
  console.log('Successfully copied built assets to repository root!');
} else {
  console.error('Dist directory does not exist. Run npm run build first.');
}
