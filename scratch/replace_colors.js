const fs = require('fs');
const path = require('path');

const targetDirs = [
  'c:\\Users\\shaws\\ANGA9\\anga-dashboard\\components',
  'c:\\Users\\shaws\\ANGA9\\anga-dashboard\\app',
  'c:\\Users\\shaws\\ANGA9\\anga-dashboard\\lib'
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

let totalReplaced = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Rename yellowCta to primaryCta
  content = content.replace(/yellowCta/g, "primaryCta");

  // 2. customerTheme.ts specific updates
  if (filePath.endsWith('customerTheme.ts')) {
    content = content.replace(/primaryCta:\s*"#FFCC00"/g, 'primaryCta: "#4338CA"');
    content = content.replace(/ctaText:\s*"#1A1A2E"/g, 'ctaText: "#FFFFFF"');
  }

  // 3. Global color replacements
  content = content.replace(/#9C27B0/gi, "#4338CA"); // Purple to Indigo
  content = content.replace(/#6C47FF/gi, "#4338CA"); // Light Purple to Indigo
  content = content.replace(/#5A3AE0/gi, "#3730A3"); // Hover Light Purple to Hover Indigo

  // 4. ProductCard Cart button black outline
  if (filePath.endsWith('ProductCard.tsx')) {
    content = content.replace(
      /style=\{\{\s*color:\s*t\.textPrimary,\s*borderColor:\s*t\.border\s*\}\}/g,
      'style={{ color: "#1A1A2E", borderColor: "#1A1A2E" }}'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalReplaced++;
    console.log(`Updated: ${filePath}`);
  }
}

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  } else {
    console.log(`Directory not found: ${dir}`);
  }
});

console.log(`\nMigration complete. Total files updated: ${totalReplaced}`);
