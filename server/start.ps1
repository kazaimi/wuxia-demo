# 设置 PowerShell 终端编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:NODE_OPTIONS = "--no-warnings"

# 启动 Node.js 服务器
node index.js
