const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/WuxiaBackpack.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// We locate the duplicated block and replace it
const target = `  earthEssence: {
    name: '玄黄土精',
    element: '土元素',
    desc: '厚重稳固的五行土元素精华。产自解签布施积德行善的幸运悬赏任务。是太上神炉洗炼器灵属性【额外暴击】的核心消耗材料。',
    icon: '/elem_earth.png',
    rarity: '稀有'
    rarity: '稀有'
  },
  fireMarrow: {
    name: '赤炎地髓',
    element: '火元素',
    desc: '炽热狂暴的五行火元素地髓。产自烈火静室参禅参悟的智慧悬赏任务。是太上神炉洗炼器灵属性【额外气血】的核心消耗材料。',
    icon: '/elem_fire.png',
    rarity: '稀有'
  },
  earthEssence: {
    name: '玄黄土精',
    element: '土元素',
    desc: '厚重稳固的五行土元素精华。产自解签布施积德行善的幸运悬赏任务。是太上神炉洗炼器灵属性【额外暴击】的核心消耗材料。',
    icon: '/elem_earth.png',
    rarity: '稀有'
  },`;

const replacement = `  earthEssence: {
    name: '玄黄土精',
    element: '土元素',
    desc: '厚重稳固的五行土元素精华。产自解签布施积德行善的幸运悬赏任务。是太上神炉洗炼器灵属性【额外暴击】的核心消耗材料。',
    icon: '/elem_earth.png',
    rarity: '稀有'
  },`;

if (content.includes(target)) {
   content = content.replace(target, replacement);
   console.log("Successfully fixed WuxiaBackpack.jsx duplicates!");
} else {
   console.warn("WARNING: target block not found in WuxiaBackpack.jsx. Let's do a fallback replace.");
   // Fallback using split/index search
}

// Convert back to CRLF
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log("Saved WuxiaBackpack.jsx.");
