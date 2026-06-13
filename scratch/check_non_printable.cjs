const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/WuxiaBackpack.jsx');
const text = fs.readFileSync(filePath, 'utf8');

console.log("String length:", text.length);

// Check if string contains any control characters other than \t, \r, \n
const regex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
const match = text.match(regex);
if (match) {
  console.log("Found control character:", JSON.stringify(match[0]), "at index", match.index);
} else {
  console.log("No control characters found.");
}

// Let's also check if there is any other non-unicode character or invalid sequence
for (let i = 0; i < text.length; i++) {
  const code = text.charCodeAt(i);
  if (code > 0xffff) {
     console.log(`Found surrogate pair character at index ${i}: code = ${code}`);
  }
}
