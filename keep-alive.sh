#!/bin/bash
# wuxia-demo keep-alive (SakuraFrp版 v2)
# 功能：确保后端 + frpc隧道 存活，db.json定时备份
# 隧道: 27722385 (TCP+自动HTTPS, api.rhdm69ccb.nyat.app:28074)

FRPC=~/bin/frpc
TOKEN="8qjuiy6uhqv9hoxuptw0r7tpllm8hxbh"
TUNNEL_ID="27722385"
PROJECT=/Users/asher/wuxia-demo
LOG=/tmp/wuxia-keepalive.log
TICK=0

while true; do
    TICK=$((TICK + 1))

    # 1. 确保后端运行（端口3000）
    if ! lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
        launchctl load ~/Library/LaunchAgents/com.wuxia.backend.plist 2>/dev/null
        echo "$(date) 后端重启" >> $LOG
        sleep 3
    fi

    # 2. 确保frpc隧道运行
    if ! pgrep -f "frpc -f.*${TUNNEL_ID}" >/dev/null 2>&1; then
        nohup "$FRPC" -f "${TOKEN}:${TUNNEL_ID}" >> /tmp/frpc.log 2>&1 &
        echo "$(date) frpc隧道${TUNNEL_ID}重启" >> $LOG
        sleep 5
    fi

    # 3. 备份db.json（每2小时 = 240次tick）
    if [ $((TICK % 240)) -eq 0 ]; then
        BACKUP_DIR=$PROJECT/server/backups
        mkdir -p "$BACKUP_DIR"
        cp $PROJECT/server/db.json "$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).json"
        ls -t "$BACKUP_DIR"/db_*.json 2>/dev/null | tail -n +25 | xargs rm -f 2>/dev/null
        echo "$(date) db.json备份完成" >> $LOG
    fi

    sleep 30
done
