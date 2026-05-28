import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    console.log('[测试] 正在向 auth.suno.com 请求刷新 JWT Token...');
    
    try {
        const res = await fetch("https://auth.suno.com/v1/client/shared_tokens?_clerk_js_version=5.117.0&__clerk_api_version=2025-11-10", {
            method: "POST",
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "https://suno.com",
                "Referer": "https://suno.com/"
            }
        });
        
        console.log(`[响应] HTTP ${res.status}`);
        const text = await res.text();
        console.log('[响应内容前 500 字符]:', text.slice(0, 500));
        
        if (res.ok) {
            const data = JSON.parse(text);
            if (data.token) {
                console.log('[成功] 换取到了最新有效的 JWT Token，长度:', data.token.length);
            } else {
                console.log('[警报] 响应成功但未找到 token 字段。');
            }
        }
    } catch (e) {
        console.error('[异常]', e.message);
    }
}

test();
