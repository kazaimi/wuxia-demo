const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/WuxiaBackpack.jsx');
const buf = fs.readFileSync(filePath);

console.log("File size:", buf.length);

let hasNull = false;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === 0) {
     console.log(`Found null byte at index ${i}`);
     hasNull = true;
     break;
  }
}

if (!hasNull) {
   console.log("No null bytes found.");
}

// Check for non-utf8 sequences or BOM
if (buf[0] === 0xff && buf[1] === 0xfe) {
   console.log("File is encoded in UTF-16 LE BOM");
} else if (buf[0] === 0xfe && buf[1] === 0xff) {
   console.log("File is encoded in UTF-16 BE BOM");
} else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
   console.log("File has UTF-8 BOM");
} else {
   console.log("No BOM detected.");
}
