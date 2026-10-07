const fs = require('fs');
const path = require('path');

// Comprehensive emoji pattern
const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (['node_modules', '.git', 'dist', '.vscode', 'build'].includes(file)) return;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (/\.(ts|tsx|js|jsx|json|html|md|css|txt)$/.test(file)) {
        results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const allFiles = walk(path.resolve(__dirname, '..'));
const emojiOccurrences = [];

allFiles.forEach(file => {
  if (file.includes('check-emojis.js')) return;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(emojiRegex);
    if (match) {
      emojiOccurrences.push({
        file: path.relative(path.resolve(__dirname, '..'), file),
        lineNum: idx + 1,
        match: match[0],
        charCodes: Array.from(match[0]).map(c => c.charCodeAt(0).toString(16)),
        text: line.trim()
      });
    }
  });
});

console.log(`FOUND ${emojiOccurrences.length} POTENTIAL EMOJI/SYMBOL MATCHES:`);
emojiOccurrences.forEach(o => {
  console.log(`${o.file}:${o.lineNum} [${o.match}] -> ${o.text.substring(0, 100)}`);
});
