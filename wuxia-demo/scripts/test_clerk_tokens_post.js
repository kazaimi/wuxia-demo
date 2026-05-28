import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    
    try {
        console.log('[Clerk 流程] 1. 正在获取 Client 状态以拉取 Session ID...');
        const clientRes = await fetch("https://auth.suno.com/v1/client?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0", {
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "https://suno.com",
                "Referer": "https://suno.com/"
            }
        });
        
        if (!clientRes.ok) {
            console.error(`[失败] 获取 Client 状态失败: HTTP ${clientRes.status}`);
            return;
        }
        
        const clientData = await clientRes.json();
        const sessions = clientData.response?.sessions;
        if (!sessions || sessions.length === 0) {
            console.error('[失败] 未找到 sessions');
            return;
        }
        
        const sessionId = sessions[0].id;
        console.log(`[成功] 找到 Session ID: ${sessionId}`);
        
        // 2. 发送 POST 请求到 tokens 接口强制签署新 JWT
        console.log('[Clerk 流程] 2. 发送 POST 到 tokens 接口换取最新 JWT...');
        const tokenRes = await fetch(`https://auth.suno.com/v1/client/sessions/${sessionId}/tokens?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0`, {
            method: "POST",
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "https://suno.com",
                "Referer": "https://suno.com/"
            }
        });
        
        if (!tokenRes.ok) {
            console.error(`[失败] 换取新令牌失败: HTTP ${tokenRes.status}`);
            console.log(await tokenRes.text());
            return;
        }
        
        const tokenData = await tokenRes.json();
        const jwtToken = tokenData.jwt || tokenData.token;
        if (!jwtToken) {
            console.error('[失败] 响应未包含 jwt 字段。响应:', tokenData);
            return;
        }
        
        console.log(`[成功] 签署到了绝对新鲜的 JWT，长度为 ${jwtToken.length} 字节。`);
        
        // 3. 测试该新 JWT 鉴权
        console.log('[Clerk 流程] 3. 正在向 Suno Feed 接口发起测试验证...');
        const feedRes = await fetch("https://studio-api-prod.suno.com/api/feed/v2", {
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        console.log(`[响应] HTTP ${feedRes.status}`);
        const feedText = await feedRes.text();
        console.log('[响应前 300 字符]:', feedText.slice(0, 300));
        
    } catch (e) {
        console.error('[异常]', e.message);
    }
}

test();
