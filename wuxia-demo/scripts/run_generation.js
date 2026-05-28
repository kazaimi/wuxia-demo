import fs from 'fs';
import path from 'path';

const cookiePath = './suno_cookie.txt';

async function run() {
    console.log('[测试运行] 正在读取本地 suno_cookie.txt...');
    if (!fs.existsSync(cookiePath)) {
        console.error('[错误] 本地未找到 suno_cookie.txt，请先运行提取脚本。');
        process.exit(1);
    }
    
    const cookie = fs.readFileSync(cookiePath, 'utf-8').trim();
    console.log(`[信息] 成功读取 Cookie，长度为 ${cookie.length} 字节。`);
    
    const prompt = 'peaceful zen ambient traditional chinese music, guzheng and xiao flute, slow tempo, mist and mountains';
    const musicId = 'bgm_menu';
    const modelSource = 'suno';
    
    console.log('[测试运行] 开始调用后端炼乐接口，意境为:');
    console.log(` > ${prompt}`);
    console.log('[提示] 此过程需要请求 Suno Clerk 进行鉴权并轮询任务，可能需要消耗 15-40 秒，请耐心等待...');
    
    try {
        const response = await fetch('http://localhost:3000/api/generate-music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                musicId,
                customToken: cookie,
                modelSource
            })
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error('[错误] 后端炼乐失败:', data.error || '未知错误');
            process.exit(1);
        }
        
        console.log('[成功] 大模型音乐生成成功！临时音频地址为:', data.url);
        console.log('[测试运行] 正在自动触发拓印，将其收录并覆盖 bgm_menu.wav...');
        
        const confirmRes = await fetch('http://localhost:3000/api/confirm-music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ musicId })
        });
        
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.success) {
            console.error('[错误] 拓印失败:', confirmData.error || '未知错误');
            process.exit(1);
        }
        
        console.log('[大功告成] 拓印入库成功！生成的音频已覆盖为游戏主城背景乐 (public/audio/bgm_menu.wav)。');
        console.log('[提示] 请大侠前往浏览器刷新游戏 http://localhost:5173/，即可听到大模型为您定制的仙音！');
    } catch (e) {
        console.error('[异常] 运行中捕获到异常:', e.message);
    }
}

run();
