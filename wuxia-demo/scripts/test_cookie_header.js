import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    console.log(`[测试] 读取到 Cookie，长度为 ${cookie.length}`);
    
    try {
        console.log('[测试] 正在直接带上 Cookie 标头请求 https://studio-api-prod.suno.com/api/feed/v2 ...');
        const res = await fetch("https://studio-api-prod.suno.com/api/feed/v2", {
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "https://suno.com",
                "Referer": "https://suno.com/"
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
