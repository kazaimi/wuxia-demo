import fs from 'fs';

const cookiePath = './suno_cookie.txt';

const endpoints = [
    '/v1/generate',
    '/v2/generate',
    '/api/generate',
    '/api/generate/',
    '/api/generate/v2',
    '/api/v2/generate',
    '/api/create',
    '/api/create/',
    '/api/songs/generate',
    '/api/songs/',
    '/api/clips/generate',
    '/api/clips/create',
    '/api/feed/v2',
    '/api/feed',
    '/v1/feed',
];

async function scan() {
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

    console.log(`[扫描] 开始对 studio-api-prod.suno.com 常见端点进行探测...`);
    for (const ep of endpoints) {
        try {
            // 用 empty body 发送 POST
            const res = await fetch(`https://studio-api-prod.suno.com${ep}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                body: JSON.stringify({})
            });
            console.log(`[POST] ${ep} => HTTP ${res.status}`);
        } catch (e) {
            console.log(`[POST] ${ep} => 异常: ${e.message}`);
        }
        
        try {
            // 用 GET 探测
            const res = await fetch(`https://studio-api-prod.suno.com${ep}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            console.log(`[GET ] ${ep} => HTTP ${res.status}`);
        } catch (e) {
            console.log(`[GET ] ${ep} => 异常: ${e.message}`);
        }
    }
}

scan();
