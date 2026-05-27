import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义江湖声音系统所需的 25 个音频文件名
const audioFiles = [
  { name: 'bgm_menu.mp3', type: 'bgm' },
  { name: 'bgm_battle.mp3', type: 'bgm' },
  { name: 'bgm_realm.mp3', type: 'bgm' },
  { name: 'bgm_market.mp3', type: 'bgm' },
  { name: 'sfx_click.mp3', type: 'sfx' },
  { name: 'sfx_allocate.mp3', type: 'sfx' },
  { name: 'sfx_levelup.mp3', type: 'sfx' },
  { name: 'sfx_task_accept.mp3', type: 'sfx' },
  { name: 'sfx_encounter_trigger.mp3', type: 'sfx' },
  { name: 'sfx_success.mp3', type: 'sfx' },
  { name: 'sfx_fail.mp3', type: 'sfx' },
  { name: 'sfx_coin.mp3', type: 'sfx' },
  { name: 'sfx_gavel.mp3', type: 'sfx' },
  { name: 'sfx_sword.mp3', type: 'sfx' },
  { name: 'sfx_blade.mp3', type: 'sfx' },
  { name: 'sfx_fist.mp3', type: 'sfx' },
  { name: 'sfx_magic.mp3', type: 'sfx' },
  { name: 'sfx_dodge.mp3', type: 'sfx' },
  { name: 'sfx_heal.mp3', type: 'sfx' },
  { name: 'sfx_poison.mp3', type: 'sfx' },
  { name: 'sfx_stun.mp3', type: 'sfx' },
  { name: 'sfx_silence.mp3', type: 'sfx' },
  { name: 'sfx_internal.mp3', type: 'sfx' },
  { name: 'sfx_shield.mp3', type: 'sfx' },
  { name: 'sfx_revive.mp3', type: 'sfx' }
];

// 使用国内免鉴权、免防盗链且完美支持跨域 CORS 的公共测试 MP3 作为占位源
// BGM 采用流畅优美的纯乐器测试源，SFX 采用极小的提示音测试源
const SOURCE_URLS = {
  bgm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // 约 8.9MB 的纯背景乐
  sfx: 'https://www.w3school.com.cn/i/horse.mp3'          // 极小的短促音频，便于极速部署
};

const outputDir = path.join(__dirname, '..', 'public', 'audio');

// 确保输出文件夹存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('创建本地音频目录成功:', outputDir);
}

// 串行下载函数，保证控制台日志工整输出
function downloadFile(index) {
  if (index >= audioFiles.length) {
    console.log('\n所有声音占位素材已成功部署至本地！');
    console.log('大侠可以在 public/audio/ 目录下将这些占位 MP3 直接覆盖替换为您喜欢的音频文件，游戏会自动优先播放它们！\n');
    return;
  }

  const file = audioFiles[index];
  const destPath = path.join(outputDir, file.name);
  const sourceUrl = file.type === 'bgm' ? SOURCE_URLS.bgm : SOURCE_URLS.sfx;

  console.log(`[${index + 1}/${audioFiles.length}] 正在下载并部署 ${file.name} ...`);

  const req = https.get(sourceUrl, (res) => {
    if (res.statusCode !== 200) {
      console.error(`下载 ${file.name} 失败，HTTP 状态码: ${res.statusCode}`);
      res.resume();
      downloadFile(index + 1);
      return;
    }

    const fileStream = fs.createWriteStream(destPath);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      downloadFile(index + 1);
    });
  });

  req.on('error', (err) => {
    console.error(`请求 ${file.name} 发生错误:`, err.message);
    downloadFile(index + 1);
  });
}

// 开始批量下载部署流程
downloadFile(0);
