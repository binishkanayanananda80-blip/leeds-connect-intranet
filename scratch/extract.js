const fs = require('fs');

const logContent = fs.readFileSync('scratch/log.txt', 'utf8');

// Find the diff block start
const diffStartStr = '@@ -85,337 +85,6 @@';
const startIdx = logContent.indexOf(diffStartStr);

if (startIdx === -1) {
  console.log('Diff start not found');
  process.exit(1);
}

const substring = logContent.substring(startIdx + diffStartStr.length);
const endIdx = substring.indexOf('[diff_block_end]');

if (endIdx === -1) {
  console.log('Diff end not found');
  process.exit(1);
}

const diffBlock = substring.substring(0, endIdx);
const lines = diffBlock.split('\n');

const extractedLines = [];
let capturing = false;

for (let line of lines) {
  if (line.startsWith('-')) {
    extractedLines.push(line.substring(1)); // remove the '-'
  } else if (line.startsWith(' ')) {
    extractedLines.push(line.substring(1)); // remove the space
  } else if (line.startsWith('+')) {
    // skip additions
  } else {
    // empty lines or other stuff
    if (line === '') extractedLines.push('');
  }
}

fs.writeFileSync('scratch/extracted_schema_lines.txt', extractedLines.join('\n'), 'utf8');
console.log('Extracted ' + extractedLines.length + ' lines.');
