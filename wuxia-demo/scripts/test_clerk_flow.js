import fs from 'fs';

const cookiePath = './suno_cookie.txt';

async function test() {
    if (!fs.existsSync(cookiePath)) {
        console.error('未找到 suno_cookie.txt');
        return;
    }
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    
    try {
        // 1. 获取 Clerk Client 状态
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
            console.error('[失败] 未在 Clerk 响应中找到任何 Sessions！请确认您的 Cookie 是否已失效。');
            console.log('响应内容:', JSON.stringify(clientData).slice(0, 300));
            return;
        }
        
        // 优先尝试直接从 sessions[0].last_active_token.jwt 获取 JWT 令牌
        let jwtToken = sessions[0].last_active_token?.jwt;
        const sessionId = sessions[0].id;
        
        if (jwtToken) {
            console.log(`[成功] 直接从 Client 状态中提取到了最新 JWT，长度: ${jwtToken.length} 字节。`);
        } else {
            console.log(`[信息] 未直接找到 jwt，开始用 Session ID ${sessionId} 发送 POST 换取...`);
            // 2. 使用 Session ID 换取 JWT Token
            const tokenRes = await fetch(`https://auth.suno.com/v1/client/sessions/${sessionId}/tokens?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0`, {
                method: "POST",
                headers: {
                    "Cookie": cookie,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Origin": "https://suno.com",
                    "Referer": "https://suno.com/"
                }
            });
            
            if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                jwtToken = tokenData.jwt || tokenData.token;
            }
        }
        if (!jwtToken) {
            console.error('[失败] 响应成功但未找到 jwt 字段。响应为:', JSON.stringify(tokenData));
            return;
        }
        
        console.log(`[成功] 获取到最新有效的 JWT，长度为 ${jwtToken.length} 字节。`);
        
        // 3. 带着这个新 JWT 去请求 Suno feed 接口进行身份验证
        console.log('[Clerk 流程] 3. 正在尝试请求 Suno Feed 接口...');
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
