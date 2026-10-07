const fs = require('fs');
const path = require('path');

// Target actual emojis (pictographs, emojis, emoticons, dingbats, miscellaneous symbols)
const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{3297}\u{3299}]/u;

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
      } else if (/\.(ts|tsx|js|jsx|json|html|md|css)$/.test(file)) {
        results.push(fullPath);
      }
    });
  } catch (e) {}
  return results;
}

const allFiles = walk(path.resolve(__dirname, '..'));
const emojiOccurrences = [];

allFiles.forEach(file => {
  if (file.includes('find-actual-emojis') || file.includes('check-emojis')) return;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(emojiRegex);
    if (match) {
      emojiOccurrences.push({
        file: path.relative(path.resolve(__dirname, '..'), file),
        lineNum: idx + 1,
        match: match[0],
        text: line.trim()
      });
    }
  });
});

console.log(`FOUND ${emojiOccurrences.length} ACTUAL EMOJI OCCURRENCES:`);
emojiOccurrences.forEach(o => {
  console.log(`${o.file}:${o.lineNum} [${o.match}] -> ${o.text}`);
});
