import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

// 使用 __dirname 获取 server 目录的绝对路径
const DB_FILE = path.join(__dirname, 'db.json');
const AUCTION_HISTORY_FILE = path.join(__dirname, 'auction_history.json');
let realPlayersDB = [];
let auctionHistory = [];

const calculateMaxHp = (level, conAttr) => Math.min(7000, 100 + level * 15 + (conAttr || 0) * 10);

if (fs.existsSync(DB_FILE)) {
   try {
      realPlayersDB = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      realPlayersDB.forEach(p => {
         if (typeof p.silver === 'undefined') p.silver = 0;
         if (p.attributes && typeof p.attributes.hp !== 'undefined') {
            p.attributes.con = p.attributes.hp;
            delete p.attributes.hp;
         }
         delete p.attributes?.maxHp;
         if (!p.maxHp || p.maxHp === 7000) {
             const finalMax = calculateMaxHp(p.level || 1, p.attributes?.con || 0);
             p.maxHp = finalMax;
             p.hp = finalMax;
         }
      });
   } catch(e) {
      console.warn("DB file damaged or unreadable, starting fresh.");
   }
}

if (fs.existsSync(AUCTION_HISTORY_FILE)) {
   try {
      auctionHistory = JSON.parse(fs.readFileSync(AUCTION_HISTORY_FILE, 'utf-8'));
   } catch(e) {
      console.warn("Auction history file damaged or unreadable, starting fresh.");
      auctionHistory = [];
   }
}

const saveAuctionHistory = () => {
   fs.writeFileSync(AUCTION_HISTORY_FILE, JSON.stringify(auctionHistory, null, 2));
};

const saveDB = () => {
   fs.writeFileSync(DB_FILE, JSON.stringify(realPlayersDB, null, 2));
};

const MOCK_NAMES = [
  '扫地僧', '东方不败', '乔峰', '虚竹', '段誉', '无崖子', '张三丰', '张无忌', '独孤求败', '王重阳', 
  '周伯通', '洪七公', '金轮法王', '郭靖', '黄药师', '欧阳锋', '令狐冲', '风清扬', '任我行', '邀月', 
  '燕南天', '西门吹雪', '叶孤城', '绝无神', '雄霸', '步惊云', '聂风', '天山童姥', '李寻欢', '阿飞', 
  '左冷禅', '岳不群', '丁春秋', '鸠摩智', '游坦之', '慕容复', '段延庆', '天机老人', '楚留香', '陆小凤', 
  '胡铁花', '花无缺', '小鱼儿', '成昆', '谢逊', '灭绝师太', '林平之', '陈家洛', '袁承志', '狄云', 
  '石破天', '丁典', '白自在', '胡一刀', '玄慈大师', '神雕大侠', '玉面飞龙', '血刀老祖', '苗人凤', '四大恶人'
];

const MOCK_PLAYERS = [];
const usedRanks = new Set();
realPlayersDB.forEach(p => { if (p.rankIndex) usedRanks.add(p.rankIndex); });

let availableRank = 1;

for (let i = 0; i < 60; i++) {
   const progression = i / 59; 
   const level = 100 - Math.floor(Math.pow(progression, 1.2) * 95); 
   
   const name = MOCK_NAMES[i % MOCK_NAMES.length];
   
   while(usedRanks.has(availableRank)) {
       availableRank++;
   }
   const rankIndex = availableRank;
   availableRank++;
   
   // 从原本每级9.3点的大魔王系数，砍到正常玩家的 3点/级 (外加初始10点分配)
   const con = Math.floor(level * 0.6) + 2;
   const str = Math.floor(level * 0.8) + 3;
   const int = Math.floor(level * 0.6) + 2;
   const agi = Math.floor(level * 0.7) + 2;
   const luk = Math.floor(level * 0.3) + 1;
   
   const finalHp = calculateMaxHp(level, con);
   let eqInner = 's2';
   let eqOuter = 's1';
   let eqMotion = null;
   let eqUltimate = null;

   if (rankIndex <= 10) {
      eqInner = Math.random() > 0.5 ? 's_yijin' : 's_xixing';
      eqOuter = Math.random() > 0.5 ? 's_anran' : 's_taiji';
      eqMotion = 's_shenxing';
      eqUltimate = Math.random() > 0.6 ? 's_shengxin' : (Math.random() > 0.5 ? 's_liumai' : 's_dugu');
   } else if (rankIndex <= 30) {
      eqInner = Math.random() > 0.5 ? 's_shihou' : 's5';
      eqOuter = Math.random() > 0.5 ? 's_du' : 's_kuangfeng';
      eqMotion = 's_tiyun';
      eqUltimate = Math.random() > 0.6 ? 's_dianxue' : (Math.random() > 0.5 ? 's_kuihua' : 's_xianglong');
   } else {
      eqInner = Math.random() > 0.5 ? 's5' : 's2';
      eqOuter = Math.random() > 0.5 ? 's3' : 's1';
      eqMotion = Math.random() > 0.5 ? 's4' : null;
      eqUltimate = null;
   }
   
   let equippedTreasure = null;
   if (rankIndex <= 3) {
      equippedTreasure = 't' + (13 + Math.floor(Math.random() * 3));
   } else if (rankIndex <= 10) {
      equippedTreasure = 't' + (10 + Math.floor(Math.random() * 3));
   } else if (rankIndex <= 20) {
      equippedTreasure = 't' + (7 + Math.floor(Math.random() * 3));
   } else if (rankIndex <= 35) {
      equippedTreasure = 't' + (4 + Math.floor(Math.random() * 3));
   } else if (rankIndex <= 50) {
      equippedTreasure = 't' + (1 + Math.floor(Math.random() * 3));
   }
   
   MOCK_PLAYERS.push({
      id: `mock_${i}`, name, level, title: `江湖风云榜 第 ${rankIndex} 席`,
      hp: finalHp, maxHp: finalHp,
      attributes: { con, str, int, agi, luk },
      equippedSkills: { inner: eqInner, outer: eqOuter, motion: eqMotion, ultimate: eqUltimate }, 
      equippedTreasure,
      isBattling: false, isMock: true, signatureSkill: eqUltimate || eqOuter, rankIndex
   });
}

let players = [...MOCK_PLAYERS];
let battles = {};
let winStreaks = {};
let activeAuctions = [];

io.on('connection', (socket) => {
  console.log(`[网络提醒] 有新的客户端尝试连接外网/内网端口，连接标识码: ${socket.id}`);
  
  socket.on('player_login', (username) => {
      console.log(`[入局提醒] 大侠 【${username}】 请求连接服务端...`);
      const dbPlayer = realPlayersDB.find(p => p.name === username);
      console.log(`[调试] 数据库中查找玩家: ${username}, 结果: ${dbPlayer ? '找到 - ' + dbPlayer.level + '级' : '未找到'}`);
      console.log(`[调试] 数据库中共有 ${realPlayersDB.length} 个玩家记录`);
      if (dbPlayer) {
         dbPlayer.id = socket.id;
         dbPlayer.isBattling = false;

         const existingIndex = players.findIndex(p => p.name === username);
         if (existingIndex >= 0) {
            players[existingIndex] = dbPlayer;
         } else {
            players.push(dbPlayer);
         }

         socket.emit('login_success', dbPlayer);
         console.log(`[调试] 已发送 login_success 给 ${username}`);
         io.emit('online_players', players.sort((a, b) => a.rankIndex - b.rankIndex));
      } else {
         socket.emit('login_failed', { reason: '户籍未登入' });
         console.log(`[调试] 已发送 login_failed, 玩家不存在`);
      }
  });

  socket.on('player_join', (data) => {
      let dbPlayer = realPlayersDB.find(p => p.name === data.name);
      data.id = socket.id;
      data.isBattling = false;
      
      if (!dbPlayer) {
         data.rankIndex = 10000 + players.length;
         if (typeof data.silver === 'undefined') data.silver = 0;
         realPlayersDB.push(data);
         saveDB();
         players.push(data);
      } else {
         Object.assign(dbPlayer, data);
         if (typeof dbPlayer.silver === 'undefined') dbPlayer.silver = 0;
         dbPlayer.id = socket.id;
         saveDB();
         const i = players.findIndex(p => p.name === data.name);
         if (i >= 0) players[i] = dbPlayer; else players.push(dbPlayer);
      }
      io.emit('online_players', players.sort((a,b)=>a.rankIndex - b.rankIndex));
  });

  socket.on('update_player', (data) => {
      const pIndex = players.findIndex(p => p.name === data.name);
     if (pIndex >= 0) {
       Object.assign(players[pIndex], data);
       const dbPlayer = realPlayersDB.find(db => db.name === data.name);
       if (dbPlayer) {
          Object.assign(dbPlayer, data);
          saveDB();
          if (data.silver !== undefined && dbPlayer.silver !== data.silver) {
              dbPlayer.silver = data.silver; 
              saveDB();
          }
       }
       io.emit('online_players', players.sort((a, b) => a.rankIndex - b.rankIndex));
     }
  });

  socket.on('get_auctions', () => {
      socket.emit('auction_update', activeAuctions);
  });
  
  socket.on('get_auction_history', () => {
      socket.emit('auction_history', auctionHistory);
  });

  socket.on('list_auction', (itemData) => {
     const dbPlayer = realPlayersDB.find(p => p.name === itemData.sellerName);
     if (!dbPlayer) return;
     const auction = {
        id: "auc_" + Date.now() + "_" + Math.floor(Math.random()*1000),
        sellerName: itemData.sellerName,
        type: itemData.type,
        itemToTrade: itemData.itemToTrade, 
        itemName: itemData.itemName,
        price: itemData.startPrice,
        highestBidder: null,
        endTime: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
     };
     if (itemData.type === 'treasure') {
         dbPlayer.treasures = dbPlayer.treasures.filter(t => t !== itemData.itemToTrade);
         if (dbPlayer.equippedTreasure === itemData.itemToTrade) dbPlayer.equippedTreasure = null;
         saveDB();
         const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
         if (existingIndex >= 0) players[existingIndex] = dbPlayer;
     } else if (itemData.type === 'points') {
         if(itemData.itemToTrade.item === 'task') dbPlayer.taskCount += itemData.itemToTrade.count;
         if(itemData.itemToTrade.item === 'encounter') dbPlayer.encountersToday += itemData.itemToTrade.count;
         if(itemData.itemToTrade.item === 'realm') dbPlayer.secretRealmAttempts += itemData.itemToTrade.count;
         saveDB();
         const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
         if (existingIndex >= 0) players[existingIndex] = dbPlayer;
     }
     activeAuctions.push(auction);
     io.emit('auction_update', activeAuctions);
     let msg = `*【破劫公告】玩家 [${itemData.sellerName}] 正在黑市上架 [${itemData.itemName}]，起拍价：${itemData.startPrice}银两！*`;
     io.emit('broadcast_message', msg);
  });

  socket.on('place_bid', ({ auctionId, bidderName, bidPrice }) => {
     const auction = activeAuctions.find(a => a.id === auctionId);
     const dbPlayer = realPlayersDB.find(p => p.name === bidderName);

     // 基本验证
     if (!auction) return;
     if (!dbPlayer) return;
     if (auction.sellerName === bidderName) return; // 不能竞拍自己的物品
     if (auction.highestBidder === bidderName) return; // 已经是最高出价者
     if (bidPrice <= auction.price) return; // 出价必须高于当前价格
     if (dbPlayer.silver < bidPrice) return; // 银两不足

     // 退还前一个出价者的银两
     if (auction.highestBidder) {
        const prevBidder = realPlayersDB.find(p => p.name === auction.highestBidder);
        if (prevBidder) {
           prevBidder.silver += auction.price;
           const prevIndex = players.findIndex(p => p.name === prevBidder.name);
           if (prevIndex >= 0) players[prevIndex] = prevBidder;
        }
     }

     // 扣除当前出价者的银两
     dbPlayer.silver -= bidPrice;

     // 更新拍卖信息
     auction.highestBidder = bidderName;
     auction.price = bidPrice;

     saveDB();
     io.emit('auction_update', activeAuctions);

     const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
     if (existingIndex >= 0) players[existingIndex] = dbPlayer;
     io.emit('online_players', players.sort((a,b)=>a.rankIndex - b.rankIndex));
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id || p.isMock);
    for (const roomId in battles) {
       const battle = battles[roomId];
       if (battle.p1.id === socket.id || battle.p2.id === socket.id) {
          const otherId = battle.p1.id === socket.id ? battle.p2.id : battle.p1.id;
          const otherPlayer = players.find(p => p.id === otherId);
          if (otherPlayer) otherPlayer.isBattling = false;
          delete battles[roomId];
       }
    }
    io.emit('online_players', players.sort((a, b) => a.rankIndex - b.rankIndex));
  });

  socket.on('challenge', (targetId) => {
     const p1 = players.find(p => p.id === socket.id);
     const p2 = players.find(p => p.id === targetId);
     
     if (p1 && p2 && !p1.isBattling && !p2.isBattling) {
       p1.isBattling = true;
       p2.isBattling = true;
       const bp1 = JSON.parse(JSON.stringify(p1));
       const bp2 = JSON.parse(JSON.stringify(p2));
       if (bp1.dailyDebuffs && bp1.dailyDebuffs.includes('血枯劫')) {
          bp1.maxHp = Math.floor(bp1.maxHp * 0.8);
          bp1.hp = Math.floor(bp1.hp * 0.8);
       }
       if (bp2.dailyDebuffs && bp2.dailyDebuffs.includes('血枯劫')) {
          bp2.maxHp = Math.floor(bp2.maxHp * 0.8);
          bp2.hp = Math.floor(bp2.hp * 0.8);
       }

       const roomId = `battle_${bp1.id}_${bp2.id}`;
       socket.join(roomId);
       
       const p2Socket = io.sockets.sockets.get(p2.id);
       if (p2Socket) p2Socket.join(roomId);
       
       battles[roomId] = { p1: bp1, p2: bp2, logs: [`[风云再起] ${bp1.name} VS ${bp2.name}！`], lastActionTime: Date.now() };
       io.to(roomId).emit('battle_start', { roomId, p1: bp1, p2: bp2, logs: battles[roomId].logs });
       io.emit('online_players', players.sort((a, b) => a.rankIndex - b.rankIndex));
     }
  });
  
  socket.on('battle_action', ({ roomId, actionData }) => {
    io.to(roomId).emit('battle_log', actionData);
    
    const battleForTimer = battles[roomId];
    if (battleForTimer) battleForTimer.lastActionTime = Date.now();
    
    if (actionData.winner) {
        const battle = battles[roomId];
        if (battle) {
           const { p1, p2 } = battle;
           const realP1 = players.find(p => p.id === p1.id);
           const realP2 = players.find(p => p.id === p2.id);
           if (realP1) realP1.isBattling = false;
           if (realP2) realP2.isBattling = false;
           
           const winnerId = actionData.winner === 'p1' ? p1.id : p2.id;
           const loserId = actionData.winner === 'p1' ? p2.id : p1.id;
           const streakKey = `${winnerId}_${loserId}`;
           const invertedKey = `${loserId}_${winnerId}`;
           
           winStreaks[invertedKey] = 0; 
           
           if (winnerId === socket.id) { 
             const target = p2;
             const attacker = p1;
             
             if (attacker.rankIndex > target.rankIndex) {
               const oldRank = attacker.rankIndex;
               const newRank = target.rankIndex;
               
               players.forEach(p => {
                 if (p.isMock && p.rankIndex >= newRank && p.rankIndex < oldRank) {
                   p.rankIndex += 1;
                   p.title = `江湖风云榜 第 ${p.rankIndex} 席`;
                 }
               });
               
               realPlayersDB.forEach(dbP => {
                 if (dbP.name !== attacker.name && dbP.rankIndex >= newRank && dbP.rankIndex < oldRank) {
                   dbP.rankIndex += 1;
                   const onlineP = players.find(p => p.name === dbP.name);
                   if (onlineP) onlineP.rankIndex = dbP.rankIndex;
                 }
               });
               
               attacker.rankIndex = newRank;
               const dbAttacker = realPlayersDB.find(db => db.name === attacker.name);
               if (dbAttacker) { dbAttacker.rankIndex = newRank; }
               saveDB();
               
               actionData.log += `\n[系统广播] 震古烁今！${attacker.name} 战胜了 ${target.name}，成功夺取了江湖第 ${newRank} 席！`;
             }
             
             if (target.isMock && target.signatureSkill && Math.random() > 0.50) {
                socket.emit('system_reward', { skillId: target.signatureSkill });
             }
           }
           
           setTimeout(() => {
              io.to(roomId).emit('battle_log', { log: actionData.log, winner: actionData.winner });
              delete battles[roomId];
              io.emit('online_players', players.sort((a, b) => a.rankIndex - b.rankIndex));
              socket.leave(roomId);
           }, 100);
        }
    }
  });
});

// ==================== 天机琴坊：大模型音乐创作接口 ====================
app.post('/api/generate-music', async (req, res) => {
    const { prompt, musicId, customToken, modelSource } = req.body;
    
    // Suno 桥接网关分支
    if (modelSource === 'suno') {
        try {
            console.log(`[天机琴坊] 收到 Suno 本地网关炼乐请求。意境: ${prompt}, 目标: ${musicId}`);
            
            const response = await fetch('http://localhost:3002/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    make_instrumental: true,
                    wait_audio: true
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Suno 桥接网关返回异常: ${response.status} - ${errText}`);
            }
            
            const sunoData = await response.json();
            // 获取生成的第一首音乐
            const finalUrl = sunoData[0]?.audio_url;
            
            if (!finalUrl) {
                throw new Error("Suno 桥接网关未成功返回音频直链。请确保您的本地 Docker 容器正确注入了 Session Cookie 且您的账号额度充足。");
            }
            
            console.log(`[天机琴坊] Suno 大模型创作成功。远程音频直链: ${finalUrl}`);
            
            // 下载并保存到 temp_generate.wav
            const publicAudioDir = path.join(__dirname, '..', 'public', 'audio');
            if (!fs.existsSync(publicAudioDir)) {
                fs.mkdirSync(publicAudioDir, { recursive: true });
            }
            
            const tempPath = path.join(publicAudioDir, 'temp_generate.wav');
            const audioRes = await fetch(finalUrl);
            if (!audioRes.ok) {
                throw new Error(`下载 Suno 音频失败: ${audioRes.statusText}`);
            }
            
            const buffer = await audioRes.arrayBuffer();
            fs.writeFileSync(tempPath, Buffer.from(buffer));
            console.log(`[天机琴坊] 临时音轨下载成功: ${tempPath}`);
            
            return res.json({
                success: true,
                url: `/audio/temp_generate.wav?t=${Date.now()}`,
                message: "Suno 大模型背景乐实时创作成功，已生成临时试听音轨！"
            });
            
        } catch (e) {
            console.error("[天机琴坊] Suno 实时创作发生异常:", e.message);
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    
    // Replicate 原生分支
    const token = customToken || process.env.REPLICATE_API_TOKEN;
    
    if (!token) {
        return res.status(400).json({
            success: false,
            error: "未配置大模型密钥。请于琴坊右上角填入您的 Replicate API Token 之后再开启炼乐。"
        });
    }
    
    try {
        console.log(`[天机琴坊] 收到 Replicate 炼乐请求。意境: ${prompt}, 目标: ${musicId}`);
        
        // 1. 发起 Replicate 预测任务 (Meta MusicGen-Melody)
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: "b05b5c77c975a082f6b50dfd7f709585199998440eb7c93c30da11de02cfc780",
                input: {
                    prompt: prompt,
                    duration: 15,
                    model_version: "melody",
                    output_format: "wav"
                }
            })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Replicate API 预测请求失败: ${response.status} - ${errText}`);
        }
        
        let prediction = await response.json();
        const predId = prediction.id;
        console.log(`[天机琴坊] 预测任务创建成功，ID: ${predId}。进入状态轮询...`);
        
        // 2. 轮询状态，最多等待约 80 秒
        let status = prediction.status;
        let finalUrl = null;
        let attempts = 0;
        
        while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled' && attempts < 40) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
            
            const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (pollRes.ok) {
                prediction = await pollRes.json();
                status = prediction.status;
                console.log(`[天机琴坊] 轮询第 ${attempts} 次。当前状态: ${status}`);
                if (status === 'succeeded') {
                    finalUrl = prediction.output;
                }
            } else {
                console.warn(`[天机琴坊] 轮询第 ${attempts} 次失败，HTTP 状态码: ${pollRes.status}`);
            }
        }
        
        if (status !== 'succeeded' || !finalUrl) {
            throw new Error(`大模型音乐生成未成功完成。最终状态: ${status}`);
        }
        
        console.log(`[天机琴坊] 大模型生成成功。音频远程下载链接: ${finalUrl}`);
        
        // 3. 下载音频数据并保存到本地 temp_generate.wav
        const publicAudioDir = path.join(__dirname, '..', 'public', 'audio');
        if (!fs.existsSync(publicAudioDir)) {
            fs.mkdirSync(publicAudioDir, { recursive: true });
        }
        
        const tempPath = path.join(publicAudioDir, 'temp_generate.wav');
        const audioRes = await fetch(finalUrl);
        if (!audioRes.ok) {
            throw new Error(`从 Replicate 镜像下载音频文件失败: ${audioRes.statusText}`);
        }
        
        const buffer = await audioRes.arrayBuffer();
        fs.writeFileSync(tempPath, Buffer.from(buffer));
        console.log(`[天机琴坊] 临时音乐已下载并保存至: ${tempPath}`);
        
        res.json({
            success: true,
            url: `/audio/temp_generate.wav?t=${Date.now()}`,
            message: "大模型音乐实时创作成功，已生成临时试听音轨！"
        });
        
    } catch (e) {
        console.error("[天机琴坊] 实时创作发生异常:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// 大模型音乐确认拓印接口
app.post('/api/confirm-music', async (req, res) => {
    const { musicId } = req.body;
    try {
        const publicAudioDir = path.join(__dirname, '..', 'public', 'audio');
        const tempPath = path.join(publicAudioDir, 'temp_generate.wav');
        const targetPath = path.join(publicAudioDir, `${musicId}.wav`);
        
        if (!fs.existsSync(tempPath)) {
            return res.status(400).json({
                success: false,
                error: "未找到新炼制的临时音轨，请先进行大模型生成。"
            });
        }
        
        // 复制临时文件覆盖目标文件
        fs.copyFileSync(tempPath, targetPath);
        // 删除临时文件
        fs.unlinkSync(tempPath);
        
        console.log(`[天机琴坊] 大模型作品已成功拓印入库，覆盖: ${targetPath}`);
        
        res.json({
            success: true,
            url: `/audio/${musicId}.wav?t=${Date.now()}`,
            message: "拓印完成，专属 AI 背景乐已刻入江湖！"
        });
    } catch (e) {
        console.error("[天机琴坊] 确认拓印发生异常:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`江湖信使局 1.5 一掷千金 已开启 (Server listen on ${PORT})`);
});

setInterval(() => {
   const now = Date.now();
   let updated = false;
   activeAuctions = activeAuctions.filter(auction => {
       if (now >= auction.endTime) {
           updated = true;
           let historyRecord = {
               id: auction.id,
               itemName: auction.itemName,
               type: auction.type,
               sellerName: auction.sellerName,
               endTime: auction.endTime,
               status: auction.highestBidder ? 'success' : 'failed',
               buyerName: auction.highestBidder || null,
               finalPrice: auction.highestBidder ? auction.price : 0
           };
           
           if (auction.highestBidder) {
               const buyer = realPlayersDB.find(p => p.name === auction.highestBidder);
               const seller = realPlayersDB.find(p => p.name === auction.sellerName);
               if (buyer && seller) {
                   if (auction.type === 'skill') {
                       if (!buyer.skills) buyer.skills = [];
                       buyer.skills.push(auction.itemToTrade);
                   } else if (auction.type === 'treasure') {
                       if (!buyer.treasures) buyer.treasures = [];
                       buyer.treasures.push(auction.itemToTrade);
                   } else if (auction.type === 'points') {
                       if(auction.itemToTrade.item === 'task') buyer.taskCount = Math.max(0, buyer.taskCount - auction.itemToTrade.count);
                       if(auction.itemToTrade.item === 'encounter') buyer.encountersToday = Math.max(0, buyer.encountersToday - auction.itemToTrade.count);
                       if(auction.itemToTrade.item === 'realm') buyer.secretRealmAttempts = Math.max(0, buyer.secretRealmAttempts - auction.itemToTrade.count);
                   }
                   seller.silver += auction.price;
                   saveDB();

                   // 发送个人通知
                   const buyerSocket = io.sockets.sockets.get(players.find(p => p.name === buyer.name)?.id);
                   const sellerSocket = io.sockets.sockets.get(players.find(p => p.name === seller.name)?.id);
                   if (buyerSocket) buyerSocket.emit('auction_result', { success: true, itemName: auction.itemName, price: auction.price, type: 'buyer' });
                   if (sellerSocket) sellerSocket.emit('auction_result', { success: true, itemName: auction.itemName, price: auction.price, type: 'seller' });

                   io.emit('broadcast_message', `*【一锤定音】恭喜 [${buyer.name}] 以 ${auction.price} 银两拍得 [${auction.itemName}]！*`);
                   const sIndex = players.findIndex(p => p.name === seller.name);
                   if(sIndex >= 0) players[sIndex] = seller;
                   const bIndex = players.findIndex(p => p.name === buyer.name);
                   if(bIndex >= 0) players[bIndex] = buyer;
               }
           } else {
               // 流拍处理
               const seller = realPlayersDB.find(p => p.name === auction.sellerName);
               if (seller) {
                   if (auction.type === 'treasure') {
                       if (!seller.treasures) seller.treasures = [];
                       seller.treasures.push(auction.itemToTrade);
                   } else if (auction.type === 'points') {
                       // 归还疲劳点数：减少已使用计数
                       if(auction.itemToTrade.item === 'task') seller.taskCount = Math.max(0, seller.taskCount - auction.itemToTrade.count);
                       if(auction.itemToTrade.item === 'encounter') seller.encountersToday = Math.max(0, seller.encountersToday - auction.itemToTrade.count);
                       if(auction.itemToTrade.item === 'realm') seller.secretRealmAttempts = Math.max(0, seller.secretRealmAttempts - auction.itemToTrade.count);
                   }
                   // 功法流拍不需要处理，因为原典保留在卖家手中

                   saveDB();
                   // 发送流拍通知给卖家
                   const sellerSocket = io.sockets.sockets.get(players.find(p => p.name === seller.name)?.id);
                   if (sellerSocket) sellerSocket.emit('auction_result', { success: false, itemName: auction.itemName, type: 'seller' });

                   const sIndex = players.findIndex(p => p.name === seller.name);
                   if(sIndex >= 0) players[sIndex] = seller;
               }
           }
           
           auctionHistory.unshift(historyRecord);
           if (auctionHistory.length > 100) {
               auctionHistory = auctionHistory.slice(0, 100);
           }
           saveAuctionHistory();
           
           return false;
       }
       return true;
   });
   
   // Clear stale battles
   for (const roomId in battles) {
      if (now - battles[roomId].lastActionTime > 15000) {
          const { p1, p2 } = battles[roomId];
          const realP1 = players.find(p => p.id === p1.id);
          const realP2 = players.find(p => p.id === p2.id);
          if (realP1) realP1.isBattling = false;
          if (realP2) realP2.isBattling = false;
          delete battles[roomId];
          updated = true;
      }
   }
   
   if (updated) {
       io.emit('auction_update', activeAuctions);
       io.emit('online_players', players.sort((a,b) => a.rankIndex - b.rankIndex));
   }
}, 5000);
