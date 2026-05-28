import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    const match = cookie.match(/__session=([^;]+)/);
    if (!match) {
        console.error('未找到 __session');
        return;
    }
    const token = match[1].trim();
    console.log(`[测试] 提取到 __session JWT，长度为 ${token.length}`);
    
    try {
        console.log('[测试] 正在向 https://studio-api.suno.ai/v1/feed/?ids=dummy_id 发起请求...');
        const res = await fetch("https://studio-api.suno.ai/v1/feed/?ids=dummy_id", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        console.log(`[响应] HTTP ${res.status}`);
        const text = await res.text();
        console.log('[响应前 300 字符]:', text.slice(0, 300));
    } catch (e) {
        console.error('[异常]', e.message);
    }
}

test();
