#!/bin/bash
# wuxia-demo keep-alive: 确保后端 + cpolar 隧道持续运行
# 每60秒检查一次，cpolar挂了就重启，地址变了就更新GitHub

CPOLAR=~/bin/cpolar
PROJECT=/Users/asher/wuxia-demo
LOG=/tmp/wuxia-keepalive.log

while true; do
    # 1. 确保后端运行
    if ! lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
        launchctl load ~/Library/LaunchAgents/com.wuxia.backend.plist 2>/dev/null
        echo "$(date) 后端重启" >> $LOG
        sleep 3
    fi

    # 2. 确保cpolar运行
    if ! pgrep -f "cpolar http" >/dev/null 2>&1; then
        $CPOLAR http 3000 -log=stdout >/dev/null 2>&1 &
        echo "$(date) cpolar重启" >> $LOG
        sleep 8
    fi

    # 3. 获取当前隧道地址
    TUNNEL_URL=$(curl -s http://127.0.0.1:4040/http/in 2>/dev/null | grep -oE 'https://[a-z0-9]+\.[a-z0-9]+\.[a-z]+\.[a-z]+' | head -1)

    # 4. 如果隧道地址可用，检查是否需要更新代码
    if [ -n "$TUNNEL_URL" ]; then
        # 测试隧道连通性
        HTTP_CODE=$(curl -s -m 5 -o /dev/null -w "%{http_code}" "${TUNNEL_URL}/socket.io/?EIO=4&transport=polling" 2>/dev/null)
        
        if [ "$HTTP_CODE" = "200" ]; then
            # 检查代码中的URL是否匹配
            CODE_URL=$(grep -oE "https://[a-z0-9]+\.[a-z0-9]+\.[a-z]+\.[a-z]+" $PROJECT/src/store/gameState.js 2>/dev/null | head -1)
            
            if [ "$TUNNEL_URL" != "$CODE_URL" ]; then
                echo "$(date) 更新URL: $CODE_URL -> $TUNNEL_URL" >> $LOG
                sed -i '' "s|${CODE_URL}|${TUNNEL_URL}|g" $PROJECT/src/store/gameState.js
                cd $PROJECT
                git add src/store/gameState.js
                git commit -m "chore: update cpolar URL [auto] $(date '+%Y-%m-%d %H:%M')" >/dev/null 2>&1
                GIT_SSH_COMMAND="ssh -o ConnectTimeout=10" git push origin main >/dev/null 2>&1
            fi
        fi
    fi

    sleep 60
done
