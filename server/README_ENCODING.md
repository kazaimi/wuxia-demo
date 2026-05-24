# Windows 终端中文乱码修复方案

## 问题原因
Windows PowerShell 默认使用 GBK/GB2312 编码，而 Node.js 输出使用 UTF-8 编码，两者不匹配导致中文乱码。

## 解决方案

### 方案一：修改 PowerShell 配置文件（推荐）
已在 `$PROFILE` 中添加以下配置，永久生效：

```powershell
# 设置 PowerShell 终端编码为 UTF-8
[Console]::OutputEncoding = New-Object -typename System.Text.UTF8Encoding
[Console]::InputEncoding = New-Object -typename System.Text.UTF8Encoding
$env:LESSCHARSET='utf-8'
```

配置文件位置：`C:\Users\Alex.Xu\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`

### 方案二：临时设置编码
在终端中运行：
```powershell
[Console]::OutputEncoding = New-Object -typename System.Text.UTF8Encoding
[Console]::InputEncoding = New-Object -typename System.Text.UTF8Encoding
chcp 65001
```

### 方案三：使用启动脚本
运行 `server/start.ps1` 脚本启动服务器，脚本会自动设置编码。

## 验证
启动服务器后，应该能看到正常的中文输出：
```
[拍卖行] 从磁盘恢复 0 条进行中拍卖。
江湖信使局 1.5 一掷千金 已开启 (Server listen on 3000)
[网络提醒] 有新的客户端尝试连接外网/内网端口，连接标识码: xxx
[入局提醒] 大侠 【xxx】 请求连接服务端...
```

## 注意事项
- 修改配置文件后需要重启 PowerShell 才能生效
- 如果使用其他终端（如 CMD、Windows Terminal），需要单独设置编码
- Windows Terminal 可以在设置中直接选择 UTF-8 编码
