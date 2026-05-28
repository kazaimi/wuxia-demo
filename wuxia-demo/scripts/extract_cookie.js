import fs from 'fs';
import readline from 'readline';
import path from 'path';

const logPath = 'C:\\Users\\Alex.Xu\\.gemini\\antigravity\\brain\\19bcc891-f1eb-46e6-8753-8b0e92860790\\.system_generated\\logs\\transcript.jsonl';
const outputPath = './suno_cookie.txt';

async function extract() {
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundCookie = null;

    for await (const line of rl) {
        if (line.includes('__session=') && line.includes('singular_device_id=')) {
            try {
                const data = JSON.parse(line);
                let text = '';
                if (data.content) {
                    text += data.content;
                }
                if (data.tool_calls) {
                    text += JSON.stringify(data.tool_calls);
                }

                // 排除双引号和转义的双引号
                // 我们可以在文本中寻找 "singular_device_id=" 直到下一个未被转义的引号或者合适的长文本。
                // 观察到 Cookie 最长，我们可以直接匹配：
                const match = text.match(/singular_device_id=(?:[^"\\]|\\.)+/);
                if (match) {
                    foundCookie = match[0];
                    // 检查是否包含 __session
                    if (foundCookie.includes('__session=')) {
                        break;
                    }
                }
            } catch (e) {
                // 忽略
            }
        }
    }

    if (foundCookie) {
        // 先切除系统的 </USER_REQUEST> 标记及之后的所有内容
        if (foundCookie.includes('</USER_REQUEST>')) {
            foundCookie = foundCookie.split('</USER_REQUEST>')[0];
        }
        
        // 解码转义的特殊字符
        foundCookie = foundCookie.replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\t/g, '');
        
        // 进一步清洗尾部多余的引号、反斜杠和空白字符
        foundCookie = foundCookie.trim();
        if (foundCookie.endsWith('\\')) {
            foundCookie = foundCookie.slice(0, -1);
        }
        if (foundCookie.endsWith('"')) {
            foundCookie = foundCookie.slice(0, -1);
        }
        foundCookie = foundCookie.trim();
        
        fs.writeFileSync(outputPath, foundCookie);
        console.log(`[成功] 已提取出 Cookie，并写入了 ${outputPath}，长度为: ${foundCookie.length}`);
    } else {
        console.log('[失败] 未能在 transcript.jsonl 中提取到匹配的 Cookie！');
    }
}

extract();
