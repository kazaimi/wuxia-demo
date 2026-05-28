import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    
    // 正则提取 __session 的值
    const match = cookie.match(/__session=([^;]+)/);
    if (!match) {
        console.error('Cookie 中未找到 __session 字段！');
        return;
    }
    
    const jwtToken = match[1].trim();
    console.log(`[测试] 成功提取到 __session JWT，长度为 ${jwtToken.length} 字符。`);
    
    console.log('[测试] 正在尝试直接使用该 JWT 作为 Bearer Token 请求 Suno Feed...');
    try {
        const res = await fetch("https://studio-api.prod.suno.com/v1/feed/?ids=dummy_id_to_test", {
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        const text = await res.text();
        console.log(`[响应状态] HTTP ${res.status}`);
        console.log('[响应内容] 前 300 字符:', text.slice(0, 300));
    } catch (e) {
        console.error('[异常]', e.message);
    }
}

test();
