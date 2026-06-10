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
      const originalCount = realPlayersDB.length;
      realPlayersDB = realPlayersDB.filter(p => !['西门吹雪', '令狐冲', '独孤求败', '扫地僧'].includes(p.name));
      if (realPlayersDB.length !== originalCount) {
         saveDB();
         console.log(`[数据库初始化] 已清理重名的玩家账号。`);
      }
      realPlayersDB.forEach(p => {
         if (typeof p.silver === 'undefined') p.silver = 0;
         if (typeof p.essence === 'undefined') p.essence = 100;
         if (!p.inventoryMaterials) {
            p.inventoryMaterials = {
               anomalyDust: 0,
               soulAshes: 0,
               anomalyCrystal: 0,
               goldSand: 0,
               woodHerb: 0,
               waterFluid: 0,
               fireMarrow: 0,
               earthEssence: 0
            };
         }
         if (!p.equippedTreasureAttrs) {
            p.equippedTreasureAttrs = {
               extraStr: 0,
               extraCon: 0,
               extraAgi: 0,
               extraInt: 0,
               extraLuk: 0,
               extraDodge: 0,
               extraDef: 0,
               stunRate: 0,
               poisonRate: 0
            };
         }
         if (typeof p.lastLoginTime === 'undefined') {
            p.lastLoginTime = Date.now();
         }
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
   const tmpFile = DB_FILE + '.tmp';
   try {
      fs.writeFileSync(tmpFile, JSON.stringify(realPlayersDB, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
   } catch (err) {
      console.error("[系统错误] 保存玩家数据库时遭遇I/O异常:", err);
   }
};

const GHOSTS_FILE = path.join(__dirname, 'ghosts.json');
const SIGNUPS_FILE = path.join(__dirname, 'signups.json');
let secretRealmGhosts = [];
let worldBossSignups = [];

if (fs.existsSync(GHOSTS_FILE)) {
   try {
      secretRealmGhosts = JSON.parse(fs.readFileSync(GHOSTS_FILE, 'utf-8'));
   } catch(e) {
      secretRealmGhosts = [];
   }
}

if (fs.existsSync(SIGNUPS_FILE)) {
   try {
      worldBossSignups = JSON.parse(fs.readFileSync(SIGNUPS_FILE, 'utf-8'));
   } catch(e) {
      worldBossSignups = [];
   }
}

const saveGhosts = () => {
   fs.writeFileSync(GHOSTS_FILE, JSON.stringify(secretRealmGhosts, null, 2));
};

const saveSignups = () => {
   fs.writeFileSync(SIGNUPS_FILE, JSON.stringify(worldBossSignups, null, 2));
};

// 宝物品质与级别常量定义
const TREASURES_RARITY_MAP = {
  t1: '普通', t2: '普通', t3: '普通',
  t4: '稀有', t5: '稀有', t6: '稀有',
  t7: '史诗', t8: '史诗', t9: '史诗',
  t10: '传说', t11: '传说', t12: '传说',
  t13: '神话', t14: '神话', t15: '神话'
};
const RARITY_LEVELS = ['普通', '稀有', '史诗', '传说', '神话'];

const SKILLS_DB_MOCK = [
  { id: 's1', name: '基本拳脚', type: 'outer', reqLvl: 1 },
  { id: 's2', name: '吐纳法', type: 'inner', reqLvl: 1 },
  { id: 's3', name: '铁砂掌', type: 'outer', reqLvl: 3 },
  { id: 's4', name: '凌波微步', type: 'motion', reqLvl: 5 },
  { id: 's5', name: '九阳神功', type: 'inner', reqLvl: 8 },
  { id: 's_kuihua', name: '葵花宝典', type: 'ultimate', reqLvl: 10 },
  { id: 's_xianglong', name: '降龙十八掌', type: 'ultimate', reqLvl: 10 },
  { id: 's_dugu', name: '独孤九剑', type: 'ultimate', reqLvl: 15 },
  { id: 's_taiji', name: '太极拳', type: 'outer', reqLvl: 12 },
  { id: 's_kuangfeng', name: '狂风快剑', type: 'outer', reqLvl: 10 },
  { id: 's_du', name: '千蛛万毒手', type: 'outer', reqLvl: 15 },
  { id: 's_anran', name: '黯然销魂掌', type: 'outer', reqLvl: 18 },
  { id: 's_shihou', name: '狮吼功', type: 'inner', reqLvl: 12 },
  { id: 's_yijin', name: '易筋经', type: 'inner', reqLvl: 20 },
  { id: 's_xixing', name: '吸星大法', type: 'inner', reqLvl: 15 },
  { id: 's_tiyun', name: '梯云纵', type: 'motion', reqLvl: 10 },
  { id: 's_shenxing', name: '神行百变', type: 'motion', reqLvl: 20 },
  { id: 's_dianxue', name: '葵花点穴手', type: 'ultimate', reqLvl: 20 },
  { id: 's_liumai', name: '六脉神剑', type: 'ultimate', reqLvl: 25 },
  { id: 's_shengxin', name: '圣心诀', type: 'ultimate', reqLvl: 30 }
];

const TREASURES_DB_MOCK = [
  { id: 't1', name: '木质佛珠', rarity: '普通' },
  { id: 't2', name: '粗布披风', rarity: '普通' },
  { id: 't3', name: '生锈铁剑', rarity: '普通' },
  { id: 't4', name: '白玉短笛', rarity: '稀有' },
  { id: 't5', name: '判官双笔', rarity: '稀有' },
  { id: 't6', name: '冰魄银针', rarity: '稀有' },
  { id: 't7', name: '打狗棒', rarity: '史诗' },
  { id: 't8', name: '金蛇剑', rarity: '史诗' },
  { id: 't9', name: '软猬甲', rarity: '史诗' },
  { id: 't10', name: '倚天剑', rarity: '传说' },
  { id: 't11', name: '屠龙刀', rarity: '传说' },
  { id: 't12', name: '玄铁重剑', rarity: '传说' },
  { id: 't13', name: '圣火令', rarity: '神话' },
  { id: 't14', name: '绝世好剑', rarity: '神话' },
  { id: 't15', name: '达摩舍利', rarity: '神话' }
];

let worldBossState = {
   active: false,
   signupOpen: false,
   maxHp: 0,
   hp: 0,
   signups: [...worldBossSignups],
   fighters: {}, // { name: { damage: 0, count: 0, hpPercent: 1.0 } }
   lastHitBy: null,
   auctionActive: false,
   highestBid: 0,
   highestBidder: null,
   auctionEndTime: 0,
   auctionItem: null
};

// 周五时钟轮转判定
const checkWorldBossSchedule = () => {
   const now = new Date();
   const day = now.getDay(); // 0:周日, 5:周五
   const hour = now.getHours();

   if (day === 5) {
      if (hour >= 12 && hour < 19) {
         if (!worldBossState.signupOpen && !worldBossState.active && !worldBossState.auctionActive) {
            worldBossState.signupOpen = true;
            worldBossState.active = false;
            io.emit('world_boss_state_change', worldBossState);
            io.emit('broadcast_message', `*【天地异变】请战帖已开启投递！诸位大侠速往世界大厅登记参战！*`);
         }
      } else if (hour >= 19 && hour < 23) {
         if (worldBossState.signupOpen || !worldBossState.active) {
            worldBossState.signupOpen = false;
            worldBossState.active = true;
            const N = Math.max(1, worldBossState.signups.length);
            worldBossState.maxHp = 500000 + N * 800000;
            worldBossState.hp = worldBossState.maxHp;
            worldBossState.fighters = {};
            worldBossState.lastHitBy = null;
            io.emit('world_boss_state_change', worldBossState);
            io.emit('broadcast_message', `*【天劫降临】太古噬魂魔罗已降临魔殿！全服血量锁定为 ${worldBossState.maxHp}，速往讨伐！*`);
         }
      } else if (hour >= 23 && hour < 24) {
         if (worldBossState.active) {
            worldBossState.active = false;
            startWorldBossAuction();
         }
      } else {
         if (worldBossState.signupOpen || worldBossState.active || worldBossState.auctionActive) {
            resetWorldBossState();
         }
      }
   } else {
      if (worldBossState.active || worldBossState.signupOpen || worldBossState.auctionActive) {
         // 正常周期不做自动重置，保留通过开发者工具强行开启的对决测试，如果报名存在才判定
      }
   }
};

const resetWorldBossState = () => {
   worldBossState = {
      active: false,
      signupOpen: false,
      maxHp: 0,
      hp: 0,
      signups: [],
      fighters: {},
      lastHitBy: null,
      auctionActive: false,
      highestBid: 0,
      highestBidder: null,
      auctionEndTime: 0,
      auctionItem: null
   };
   worldBossSignups = [];
   saveSignups();
   io.emit('world_boss_state_change', worldBossState);
};

const startWorldBossAuction = () => {
   const godTreasures = ['t13', 't14', 't15'];
   const randomTId = godTreasures[Math.floor(Math.random() * godTreasures.length)];
   const tNames = { t13: '圣火令', t14: '绝世好剑', t15: '达摩舍利' };
   const tData = { id: randomTId, name: tNames[randomTId] };

   worldBossState.auctionActive = true;
   worldBossState.auctionItem = tData;
   worldBossState.highestBid = 0;
   worldBossState.highestBidder = null;
   worldBossState.auctionEndTime = Date.now() + 60 * 60 * 1000; 
   io.emit('world_boss_state_change', worldBossState);
   io.emit('broadcast_message', `*【天尊拍卖】太古噬魂魔罗被击退！爆出神话秘宝【${tData.name}】公开竞拍，出价高者得！*`);
};

const checkWorldBossAuctionEnd = () => {
   if (worldBossState.auctionActive && Date.now() >= worldBossState.auctionEndTime) {
      const item = worldBossState.auctionItem;
      let finalPrice = worldBossState.highestBid;
      let buyer = worldBossState.highestBidder;
      let isSystemBuy = false;

      if (!buyer || finalPrice <= 0) {
         buyer = "黑市商会";
         finalPrice = 100;
         isSystemBuy = true;
      }

      const dividendPool = Math.floor(finalPrice * 0.9);
      let totalDmg = 0;
      Object.values(worldBossState.fighters).forEach(f => {
         totalDmg += f.damage;
      });

      if (totalDmg > 0 && dividendPool > 0) {
         realPlayersDB.forEach(p => {
            const f = worldBossState.fighters[p.name];
            if (f && f.damage > 0) {
               const ratio = f.damage / totalDmg;
               const share = Math.max(1, Math.floor(dividendPool * ratio));
               p.silver = (p.silver || 0) + share;

               const onlineP = players.find(pl => pl.name === p.name);
               if (onlineP) {
                  onlineP.silver = p.silver;
                  const socketP = io.sockets.sockets.get(onlineP.id);
                  if (socketP) {
                     socketP.emit('update_player_success', p);
                     socketP.emit('broadcast_message', `*【大分红】大魔罗讨伐拍卖结标（成交价:${finalPrice}银两），你分得 ${share} 银两！*`);
                  }
               }
            }
         });
      }

      if (!isSystemBuy) {
         const winner = realPlayersDB.find(p => p.name === buyer);
         if (winner) {
            if (!winner.treasures) winner.treasures = [];
            winner.treasures.push(item.id);

            const onlineW = players.find(pl => pl.name === winner.name);
            if (onlineW) {
               onlineW.treasures = winner.treasures;
               const socketW = io.sockets.sockets.get(onlineW.id);
               if (socketW) {
                  socketW.emit('update_player_success', winner);
                  socketW.emit('broadcast_message', `*【夺宝贺电】你以 ${finalPrice} 银两拍得神话秘宝【${item.name}】！已存入储物袋。*`);
               }
            }
         }
      }

      saveDB();
      io.emit('broadcast_message', `*【大结标】竞拍物【${item.name}】由 [${buyer}] 拍得！分红已打入各挑战大侠账户！*`);
      resetWorldBossState();
   }
};

setInterval(() => {
   checkWorldBossSchedule();
   checkWorldBossAuctionEnd();
}, 5000);

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

const getLeaderboardData = () => {
    const onlineRealPlayers = players.filter(p => !p.isMock);
    const realPlayers = realPlayersDB.map(dbP => {
        const onlineP = onlineRealPlayers.find(p => p.name === dbP.name);
        if (onlineP) {
            return { ...onlineP, isOnline: true, isMock: false };
        } else {
            return { ...dbP, isOnline: false, isMock: false, id: null, isBattling: false };
        }
    });

    const npcs = MOCK_PLAYERS.map(mockP => {
        const onlineP = players.find(p => p.name === mockP.name && p.isMock);
        return { ...(onlineP || mockP), isOnline: true, isMock: true };
    });

    const all = [...realPlayers, ...npcs].filter(u => u.name !== '清风');
    return all.sort((a, b) => (a.rankIndex || 9999) - (b.rankIndex || 9999));
};

io.on('connection', (socket) => {
  console.log(`[网络提醒] 有新的客户端尝试连接外网/内网端口，连接标识码: ${socket.id}`);
  
  socket.on('player_login', (data) => {
      let username = '';
      let password = '';
      if (typeof data === 'string') {
          username = data;
      } else if (data && typeof data === 'object') {
          username = data.name;
          password = data.password;
      }

      console.log(`[入局提醒] 大侠 【${username}】 请求连接服务端...`);
      const dbPlayer = realPlayersDB.find(p => p.name === username);
      console.log(`[调试] 数据库中查找玩家: ${username}, 结果: ${dbPlayer ? '找到 - ' + dbPlayer.level + '级' : '未找到'}`);
      console.log(`[调试] 数据库中共有 ${realPlayersDB.length} 个玩家记录`);
      if (dbPlayer) {
          // 密码校验逻辑
          if (dbPlayer.password && dbPlayer.password !== password) {
              socket.emit('login_failed', { reason: '密码不正确，请重新输入！' });
              console.log(`[调试] 已发送 login_failed 给 ${username}, 原因: 密码不正确`);
              return;
          }

          // 同名挤线踢人逻辑
          const activeOnline = players.find(p => p.name === username && !p.isMock);
          if (activeOnline && activeOnline.id !== socket.id) {
             const prevSocket = io.sockets.sockets.get(activeOnline.id);
             if (prevSocket) {
                prevSocket.emit('kick_out', { reason: '大侠的名号已在别处入世，此地连接已切断。' });
                prevSocket.disconnect();
             }
          }

          // 如果老玩家没有密码，且这次输入了密码，则为其自动绑定该密码
          if (!dbPlayer.password && password) {
              dbPlayer.password = password;
              saveDB();
              console.log(`[调试] 玩家 【${username}】 首次输入密码，已在数据库自动绑定该密码`);
          }

          // 跨天数据强制在后端刷新清零
          const todayStr = new Date().toDateString();
          if (dbPlayer.lastResetDate !== todayStr) {
             dbPlayer.taskCount = 0;
             dbPlayer.encountersToday = 0;
             dbPlayer.secretRealmAttempts = 0;
             dbPlayer.dailyDebuffs = [];
             dbPlayer.dailySilverAdd = 0;
             dbPlayer.lastResetDate = todayStr;
             saveDB();
             console.log(`[每日刷新] 玩家 【${username}】 跨天数据已在后端重置为满额状态！`);
          }

          dbPlayer.lastLoginTime = Date.now();
          saveDB();

          dbPlayer.id = socket.id;
          dbPlayer.isBattling = false;
          socket.username = username; // 保存当前连接的玩家名号

          const existingIndex = players.findIndex(p => p.name === username);
          if (existingIndex >= 0) {
             players[existingIndex] = dbPlayer;
          } else {
             players.push(dbPlayer);
          }

          socket.emit('login_success', dbPlayer);
          console.log(`[调试] 已发送 login_success 给 ${username}`);
          io.emit('online_players', getLeaderboardData());
      } else {
          socket.emit('login_failed', { reason: '户籍未登入' });
          console.log(`[调试] 已发送 login_failed, 玩家不存在`);
      }
  });

  socket.on('player_join', (data) => {
      let dbPlayer = realPlayersDB.find(p => p.name === data.name);
      data.id = socket.id;
      data.isBattling = false;
      
      // 同名挤线踢人逻辑
      const activeOnline = players.find(p => p.name === data.name && !p.isMock);
      if (activeOnline && activeOnline.id !== socket.id) {
         const prevSocket = io.sockets.sockets.get(activeOnline.id);
         if (prevSocket) {
            prevSocket.emit('kick_out', { reason: '大侠的名号已在别处入世，此地连接已切断。' });
            prevSocket.disconnect();
         }
      }

      if (!dbPlayer) {
         // 禁止玩家使用与 NPC 列表中重名的名号创建新账号
         if (MOCK_NAMES.includes(data.name)) {
            socket.emit('login_failed', { reason: '此名号已被武林名宿占用' });
            return;
         }
          socket.username = data.name; // 保存当前连接的玩家名号
          data.rankIndex = 10000 + players.length;
          
          // 强制安全初始化所有玩家关键属性，杜绝创号时篡改数值
          data.level = 1;
          data.exp = 0;
          data.silver = 0;
          data.essence = 100;
          data.treasures = [];
          data.skills = ['s1'];
          data.equippedSkills = { inner: null, outer: 's1', motion: null, ultimate: null };
          data.equippedTreasure = null;

          data.inventoryMaterials = {
             anomalyDust: 0,
             soulAshes: 0,
             anomalyCrystal: 0,
             goldSand: 0,
             woodHerb: 0,
             waterFluid: 0,
             fireMarrow: 0,
             earthEssence: 0
          };
          data.equippedTreasureAttrs = {
             extraStr: 0,
             extraCon: 0,
             extraAgi: 0,
             extraInt: 0,
             extraLuk: 0,
             extraDodge: 0,
             extraDef: 0,
             stunRate: 0,
             poisonRate: 0
          };
          data.lastLoginTime = Date.now();
          realPlayersDB.push(data);
          saveDB();
          players.push(data);
          socket.emit('login_success', data);
      } else {
          // 已有同名玩家，但如果是以 player_join 重新加入，需要校验密码
          if (dbPlayer.password && dbPlayer.password !== data.password) {
             socket.emit('login_failed', { reason: '密码不正确，请重新输入！' });
             return;
          }
          socket.username = data.name; // 保存当前连接的玩家名号
          Object.assign(dbPlayer, data);
          if (typeof dbPlayer.silver === 'undefined') dbPlayer.silver = 0;
          dbPlayer.id = socket.id;
          dbPlayer.lastLoginTime = Date.now();
          
          // 跨天数据强制在后端刷新清零
          const todayStr = new Date().toDateString();
          if (dbPlayer.lastResetDate !== todayStr) {
             dbPlayer.taskCount = 0;
             dbPlayer.encountersToday = 0;
             dbPlayer.secretRealmAttempts = 0;
             dbPlayer.dailyDebuffs = [];
             dbPlayer.dailySilverAdd = 0;
             dbPlayer.lastResetDate = todayStr;
             console.log(`[每日刷新] 玩家 【${dbPlayer.name}】 创角重新进入时跨天数据已在后端重置为满额状态！`);
          }
          saveDB();
          const i = players.findIndex(p => p.name === data.name);
          if (i >= 0) players[i] = dbPlayer; else players.push(dbPlayer);
          socket.emit('login_success', dbPlayer);
      }
      io.emit('online_players', getLeaderboardData());
  });

  socket.on('update_player', (data) => {
      // 1. 越权校验：防止篡改其他玩家的数据
      if (!socket.username || data.name !== socket.username) {
         console.warn(`[防作弊警报] 客户端连接 ${socket.id} 尝试非法修改其他玩家 ${data.name} 的数据，操作被拦截！`);
         return;
      }

      const pIndex = players.findIndex(p => p.name === data.name);
      if (pIndex >= 0) {
         const dbPlayer = realPlayersDB.find(db => db.name === data.name);
         if (dbPlayer) {
            const todayStr = new Date().toDateString();
            
            // 兼容初始化每日配额计数器
            if (dbPlayer.lastResetDate !== todayStr) {
               dbPlayer.dailySilverAdd = 0;
               dbPlayer.lastResetDate = todayStr;
            }

            // 2. 每日金钱（银两）增量额度池防作弊校验
            if (data.silver !== undefined) {
               const oldSilver = dbPlayer.silver || 0;
               const newSilver = parseInt(data.silver, 10) || 0;
               const diff = newSilver - oldSilver;
               
               if (diff > 0) {
                  const encountersDiff = (data.encountersToday || 0) - (dbPlayer.encountersToday || 0);
                  const tasksDiff = (data.taskCount || 0) - (dbPlayer.taskCount || 0);
                  let maxAllowed = 0;
                  if (encountersDiff > 0) maxAllowed += encountersDiff * 100;
                  if (tasksDiff > 0) maxAllowed += tasksDiff * 5;
                  
                  if (diff > maxAllowed) {
                     console.warn(`[防作弊警报] 玩家 ${data.name} 企图在未打通奇遇/悬赏时获取银两增量 ${diff} (合理上限 ${maxAllowed})，操作被拦截！`);
                     data.silver = oldSilver;
                  }
                  const DAILY_SILVER_LIMIT = 500;
                  const currentAdded = dbPlayer.dailySilverAdd || 0;
                  
                  if (currentAdded + diff > DAILY_SILVER_LIMIT) {
                     const allowedDiff = Math.max(0, DAILY_SILVER_LIMIT - currentAdded);
                     const forceSilver = oldSilver + allowedDiff;
                     console.warn(`[防作弊警报] 玩家 ${data.name} 尝试增加银两 ${diff}，已超出今日额度上限 (今日已加: ${currentAdded}, 允许增加: ${allowedDiff})。已拦截并强制设定为: ${forceSilver}`);
                     
                     data.silver = forceSilver;
                     dbPlayer.dailySilverAdd = DAILY_SILVER_LIMIT;
                     socket.emit('broadcast_message', `*【天理昭昭】今日修行获取机缘已达极限，多余的银两化为飞灰！*`);
                  } else {
                     dbPlayer.dailySilverAdd = currentAdded + diff;
                  }
               }
            }

            // 3. 经验/等级防作弊校验
            if (data.level !== undefined) {
               const oldLevel = dbPlayer.level || 1;
               const newLevel = parseInt(data.level, 10) || 1;
                if (oldLevel >= 20 && newLevel > oldLevel + 5) {
                  console.warn(`[防作弊警报] 玩家 ${data.name} 尝试单次非法修改等级 ${oldLevel} -> ${newLevel}，已被强制拦截！`);
                  data.level = oldLevel;
                  data.exp = dbPlayer.exp || 0;
               }
            }

            // 4. 属性值防作弊校验
            if (data.attributes) {
               const oldAttrs = dbPlayer.attributes || { con: 0, str: 0, int: 0, agi: 0, luk: 0 };
               const newAttrs = data.attributes;
               const level = parseInt(data.level, 10) || dbPlayer.level || 1;
               const permTotal = Object.values(dbPlayer.permanentAttributes || {}).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
               const maxTotal = 10 + (level - 1) * 3 + permTotal;
               
               const newTotal = Object.values(newAttrs).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
               if (newTotal > maxTotal) {
                  console.warn(`[防作弊警报] 玩家 ${data.name} 尝试非法篡改属性，总属性点 ${newTotal} 超过上限 ${maxTotal}，已被强制拦截并重置属性！`);
                  data.attributes = { ...oldAttrs };
                  data.freePoints = dbPlayer.freePoints || 0;
               }
            }

             // 5. 对装备器灵和装备武学防篡改校验 (不能装备自己没有的器灵/武学)
             if (data.equippedTreasure) {
                if (!dbPlayer.treasures || !dbPlayer.treasures.includes(data.equippedTreasure)) {
                   data.equippedTreasure = dbPlayer.equippedTreasure || null;
                   data.equippedTreasureAttrs = dbPlayer.equippedTreasureAttrs || {
                      extraStr: 0, extraCon: 0, extraAgi: 0, extraInt: 0, extraLuk: 0,
                      extraDodge: 0, extraDef: 0, stunRate: 0, poisonRate: 0
                   };
                }
             }
             if (data.equippedSkills) {
                for (const type in data.equippedSkills) {
                   const sId = data.equippedSkills[type];
                   if (sId && (!dbPlayer.skills || !dbPlayer.skills.includes(sId))) {
                      data.equippedSkills[type] = dbPlayer.equippedSkills[type] || null;
                   }
                }
             }

             // 6. 技能列表强校验（不允许客户端自定义塞入新技能）
             if (data.skills) {
                data.skills = dbPlayer.skills || ['s1'];
             }

             // 7. 宝物列表增量合理性审查 (仅允许奇遇战通关增量，且数量≤3，ID合法)
             if (data.treasures) {
                const oldTreasures = dbPlayer.treasures || [];
                const newTreasures = data.treasures;
                
                if (newTreasures.length > oldTreasures.length) {
                   const diffCount = newTreasures.length - oldTreasures.length;
                   const encDiff = (data.encountersToday || 0) - (dbPlayer.encountersToday || 0);
                   
                   if (encDiff === 1 && diffCount <= 3) {
                      // 检查新增的宝物 ID 是否都在 TREASURES_DB_MOCK 中是合法的
                      const allValid = newTreasures.slice(oldTreasures.length).every(tId => TREASURES_DB_MOCK.some(t => t.id === tId));
                      if (!allValid) {
                         console.warn(`[防作弊警报] 玩家 ${data.name} 尝试添加了非法的宝物ID，操作被拦截！`);
                         data.treasures = [...oldTreasures];
                      }
                   } else {
                      console.warn(`[防作弊警报] 玩家 ${data.name} 尝试在未打奇遇或溢出奖励的情况下添加宝物 (新增数: ${diffCount}, 奇遇次数变化: ${encDiff})，操作已被拦截并还原！`);
                      data.treasures = [...oldTreasures];
                   }
                }
             }

            Object.assign(players[pIndex], data);
            Object.assign(dbPlayer, data);
            saveDB();
         }
         io.emit('online_players', getLeaderboardData());
      }
  });

  socket.on('get_realm_ghosts', () => {
      const now = Date.now();
      secretRealmGhosts = secretRealmGhosts.filter(g => now - g.createdAt < 24 * 60 * 60 * 1000);
      saveGhosts();
      socket.emit('realm_ghosts_list', secretRealmGhosts);
  });

  socket.on('deploy_ghost_remnant', ({ layerIndex, message }) => {
      const p = realPlayersDB.find(p => p.name === socket.username);
      if (!p) return;
      if (p.essence < 20) {
         socket.emit('deploy_ghost_result', { success: false, reason: '武道精魂不足20点，无法剥离神魂设伏！' });
         return;
      }
      p.essence -= 20;

      const newGhost = {
         id: "ghost_" + Date.now() + "_" + Math.floor(Math.random()*1000),
         creatorName: p.name,
         layerIndex: layerIndex,
         attributes: { ...p.attributes },
         skills: p.skills || [],
         equippedSkills: { ...p.equippedSkills },
         equippedTreasure: p.equippedTreasure,
         equippedTreasureAttrs: { ...p.equippedTreasureAttrs },
         level: p.level,
         message: message || "后辈止步，此路不通！",
         createdAt: Date.now()
      };

      secretRealmGhosts.push(newGhost);
      saveGhosts();
      saveDB();

      socket.emit('update_player_success', p);
      socket.emit('deploy_ghost_result', { success: true });
      io.emit('online_players', getLeaderboardData());
  });

   socket.on('ghost_win_dividend', ({ ghostId }) => {
       const ghost = secretRealmGhosts.find(g => g.id === ghostId);
       if (!ghost) return;
       
       // 防作弊校验：发出战胜消息者不能是该神魂的主人自己
       if (socket.username === ghost.creatorName) {
          console.warn(`[防作弊警报] 玩家 ${socket.username} 企图利用自己的神魂残影作弊分红，已被强制拦截！`);
          return;
       }
      
      const author = realPlayersDB.find(p => p.name === ghost.creatorName);
      if (author) {
         author.silver = (author.silver || 0) + 2;
         saveDB();
         
         const authorPlayer = players.find(p => p.name === author.name);
         if (authorPlayer) {
            authorPlayer.silver = author.silver;
            const authorSocket = io.sockets.sockets.get(authorPlayer.id);
            if (authorSocket) {
               authorSocket.emit('update_player_success', author);
               authorSocket.emit('broadcast_message', `*【设伏捷报】你在秘境中设下的怨灵神魂成功击败了探秘同道，获得了 2 银两分红！*`);
            }
         }
         io.emit('online_players', getLeaderboardData());
      }

      // 2. 累加触发红利次数，满 3 次时该神魂残影才彻底消散移出
      ghost.dividendCount = (ghost.dividendCount || 0) + 1;
      if (ghost.dividendCount >= 3) {
         secretRealmGhosts = secretRealmGhosts.filter(g => g.id !== ghostId);
      }
      saveGhosts();
  });

  socket.on('defeat_realm_ghost', ({ ghostId }) => {
      secretRealmGhosts = secretRealmGhosts.filter(g => g.id !== ghostId);
      saveGhosts();
  });

  socket.on('get_world_boss_state', () => {
      socket.emit('world_boss_state', worldBossState);
  });

  socket.on('signup_world_boss', () => {
      if (!worldBossState.signupOpen) {
         socket.emit('signup_world_boss_result', { success: false, reason: '当前非报名时段，请战帖通道已关闭！' });
         return;
      }
      if (worldBossState.signups.includes(socket.username)) {
         socket.emit('signup_world_boss_result', { success: false, reason: '大侠已投递过请战帖，无需重复登记！' });
         return;
      }
      worldBossState.signups.push(socket.username);
      if (!worldBossSignups.includes(socket.username)) {
         worldBossSignups.push(socket.username);
         saveSignups();
      }
      io.emit('world_boss_state_change', worldBossState);
      socket.emit('signup_world_boss_result', { success: true });
  });

  socket.on('challenge_world_boss', ({ damage, skillName, isCrit }) => {
      const p = realPlayersDB.find(p => p.name === socket.username);
      if (!p) return;
      if (!worldBossState.active) {
         socket.emit('challenge_world_boss_result', { success: false, reason: '魔罗尚未撕裂虚空降临，无法挑战！' });
         return;
      }
      if (p.essence < 10) {
         socket.emit('challenge_world_boss_result', { success: false, reason: '武道精魂不足10点，无法挑战！' });
         return;
      }

      p.essence -= 10;
      const dustAmt = 2 + Math.floor(Math.random() * 2);
      if (!p.inventoryMaterials) {
         p.inventoryMaterials = {
            anomalyDust: 0, soulAshes: 0, anomalyCrystal: 0,
            goldSand: 0, woodHerb: 0, waterFluid: 0, fireMarrow: 0, earthEssence: 0
         };
      }
      p.inventoryMaterials.anomalyDust = (p.inventoryMaterials.anomalyDust || 0) + dustAmt;
      saveDB();

      const name = p.name;
      if (!worldBossState.fighters[name]) {
         worldBossState.fighters[name] = { damage: 0, count: 0 };
      }
      worldBossState.fighters[name].damage += damage;
      worldBossState.fighters[name].count += 1;

      worldBossState.hp = Math.max(0, worldBossState.hp - damage);

      let isKill = false;
      if (worldBossState.hp <= 0 && !worldBossState.lastHitBy) {
         worldBossState.lastHitBy = name;
         isKill = true;
      }

      io.emit('world_boss_state_change', worldBossState);
      socket.emit('update_player_success', p);
      socket.emit('challenge_world_boss_result', { success: true, damage, dustAmt });
      io.emit('online_players', getLeaderboardData());

      if (isCrit || damage >= 30000) {
         io.emit('boss_fighter_strike', {
            playerName: name,
            damage: damage,
            skillName: skillName || '无双重击'
         });
      }

      if (isKill) {
         io.emit('broadcast_message', `*【天劫破除】太古噬魂魔罗已被大侠 [${name}] 完成最后一击（Last Hit）剿灭！*`);
         startWorldBossAuction();
      }
  });

  socket.on('bid_world_boss_auction', ({ price }) => {
      const p = realPlayersDB.find(p => p.name === socket.username);
      if (!p) return;
      if (!worldBossState.auctionActive) {
         socket.emit('bid_world_boss_auction_result', { success: false, reason: '拍卖尚未开启！' });
         return;
      }
      if (Date.now() >= worldBossState.auctionEndTime) {
         socket.emit('bid_world_boss_auction_result', { success: false, reason: '拍卖已结标！' });
         return;
      }
      if (p.silver < price) {
         socket.emit('bid_world_boss_auction_result', { success: false, reason: '大侠所持银两不足！' });
         return;
      }
      if (price <= worldBossState.highestBid) {
         socket.emit('bid_world_boss_auction_result', { success: false, reason: '出价必须高于当前最高竞价！' });
         return;
      }

      if (worldBossState.highestBidder) {
         const prev = realPlayersDB.find(pl => pl.name === worldBossState.highestBidder);
         if (prev) {
            prev.silver += worldBossState.highestBid;
            const onlinePrev = players.find(pl => pl.name === prev.name);
            if (onlinePrev) {
               onlinePrev.silver = prev.silver;
               const socketPrev = io.sockets.sockets.get(onlinePrev.id);
               if (socketPrev) socketPrev.emit('update_player_success', prev);
            }
         }
      }

      p.silver -= price;
      saveDB();

      worldBossState.highestBid = price;
      worldBossState.highestBidder = p.name;
      io.emit('world_boss_state_change', worldBossState);
      io.emit('online_players', getLeaderboardData());
      socket.emit('update_player_success', p);
      socket.emit('bid_world_boss_auction_result', { success: true });
      io.emit('broadcast_message', `*【天尊竞拍】大侠 [${p.name}] 对神兵叫价：${price} 银两！*`);
  });

  socket.on('dev_control_world_boss', ({ action }) => {
      if (action === 'open_signup') {
         worldBossState.signupOpen = true;
         worldBossState.active = false;
         worldBossState.auctionActive = false;
         io.emit('world_boss_state_change', worldBossState);
         io.emit('broadcast_message', `*【开发调试】周五 Boss 请战贴登记通道已被开发者强制开启！*`);
      } else if (action === 'spawn_boss') {
         worldBossState.signupOpen = false;
         worldBossState.active = true;
         worldBossState.auctionActive = false;
         const N = Math.max(1, worldBossState.signups.length);
         worldBossState.maxHp = 500000 + N * 800000;
         worldBossState.hp = worldBossState.maxHp;
         worldBossState.fighters = {};
         worldBossState.lastHitBy = null;
         io.emit('world_boss_state_change', worldBossState);
         io.emit('broadcast_message', `*【开发调试】太古噬魂魔罗已由开发者强制召降降世！*`);
      } else if (action === 'trigger_auction') {
         worldBossState.signupOpen = false;
         worldBossState.active = false;
         startWorldBossAuction();
      } else if (action === 'force_auction_end') {
         if (worldBossState.auctionActive) {
            worldBossState.auctionEndTime = Date.now() - 1000;
            checkWorldBossAuctionEnd();
         }
      } else if (action === 'reset') {
         resetWorldBossState();
         io.emit('broadcast_message', `*【开发调试】世界 Boss 状态已被开发者重置清空。*`);
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

      // 1. 起拍价正整数校验
      const startPrice = Math.floor(itemData.startPrice);
      if (isNaN(startPrice) || startPrice <= 0) {
         socket.emit('list_auction_result', { success: false, reason: '上架失败：起拍价格必须为大于0的正整数！' });
         return;
      }

      // 2. 所有权和扣除强校验
      if (itemData.type === 'treasure') {
          // 强校验背包里确实含有该秘宝
          if (!dbPlayer.treasures || !dbPlayer.treasures.includes(itemData.itemToTrade)) {
             socket.emit('list_auction_result', { success: false, reason: '上架失败：储物袋中并未拥有该宝物！' });
             return;
          }
          // 从背包移走
          const idx = dbPlayer.treasures.indexOf(itemData.itemToTrade);
          dbPlayer.treasures.splice(idx, 1);
          
          // 若是穿着的器灵，则脱下并重置洗炼词条属性，防止属性残留
          if (dbPlayer.equippedTreasure === itemData.itemToTrade) {
             dbPlayer.equippedTreasure = null;
             dbPlayer.equippedTreasureAttrs = {
                extraStr: 0, extraCon: 0, extraAgi: 0, extraInt: 0, extraLuk: 0,
                extraDodge: 0, extraDef: 0, stunRate: 0, poisonRate: 0, bossDamageBoost: 0
             };
          }
          saveDB();
          const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
          if (existingIndex >= 0) players[existingIndex] = dbPlayer;
          
      } else if (itemData.type === 'points') {
          // 强校验让渡次数为正数且卖家剩余次数充足
          const count = Math.floor(itemData.itemToTrade.count);
          if (isNaN(count) || count <= 0) {
             socket.emit('list_auction_result', { success: false, reason: '上架失败：让渡次数必须为正整数！' });
             return;
          }
          const limits = { task: 10, encounter: 5, realm: 3 };
          const limit = limits[itemData.itemToTrade.item];
          if (!limit) {
             socket.emit('list_auction_result', { success: false, reason: '上架失败：未知的次数类型让渡！' });
             return;
          }
          
          let currentUsed = 0;
          if (itemData.itemToTrade.item === 'task') currentUsed = dbPlayer.taskCount || 0;
          else if (itemData.itemToTrade.item === 'encounter') currentUsed = dbPlayer.encountersToday || 0;
          else if (itemData.itemToTrade.item === 'realm') currentUsed = dbPlayer.secretRealmAttempts || 0;
          
          if (currentUsed + count > limit) {
             socket.emit('list_auction_result', { success: false, reason: '上架失败：您今日的可让渡次数不足！' });
             return;
          }
          
          // 卖家已用计数增加（表示可用次数扣除）
          if (itemData.itemToTrade.item === 'task') dbPlayer.taskCount = (dbPlayer.taskCount || 0) + count;
          else if (itemData.itemToTrade.item === 'encounter') dbPlayer.encountersToday = (dbPlayer.encountersToday || 0) + count;
          else if (itemData.itemToTrade.item === 'realm') dbPlayer.secretRealmAttempts = (dbPlayer.secretRealmAttempts || 0) + count;
          
          saveDB();
          const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
          if (existingIndex >= 0) players[existingIndex] = dbPlayer;
      } else if (itemData.type === 'skill') {
          // 强校验卖家是否已习得该门武学，且原典保留在卖家手中，不扣除卖家功法
          const baseId = itemData.itemToTrade.split('_deg')[0];
          const hasSkill = dbPlayer.skills && dbPlayer.skills.some(s => s.split('_deg')[0] === baseId);
          if (!hasSkill) {
             socket.emit('list_auction_result', { success: false, reason: '上架失败：大侠并未习得该门武学，无法刻录手抄本！' });
             return;
          }
      } else {
          socket.emit('list_auction_result', { success: false, reason: '上架失败：不支持上架的物品类型！' });
          return;
      }

      const auction = {
         id: "auc_" + Date.now() + "_" + Math.floor(Math.random()*1000),
         sellerName: itemData.sellerName,
         type: itemData.type,
         itemToTrade: itemData.itemToTrade, 
         itemName: itemData.itemName,
         price: startPrice,
         highestBidder: null,
         endTime: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
      };
      
      activeAuctions.push(auction);
      saveDB(); // 将上架成功的变化存库
      
      socket.emit('list_auction_result', { success: true });
      socket.emit('update_player_success', dbPlayer); // 实时更新卖家的背包和属性状态！
      io.emit('auction_update', activeAuctions);
      
      let msg = `*【破劫公告】玩家 [${itemData.sellerName}] 正在黑市上架 [${itemData.itemName}]，起拍价：${startPrice}银两！*`;
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

      // 拍卖到期竞态校验拦截
      if (Date.now() >= auction.endTime) {
         socket.emit('place_bid_result', { success: false, reason: '竞价失败：该拍卖已结束，正在进行结算！' });
         return;
      }

      // 竞拍价格正整数校验与溢出拦截
      const validatedPrice = Math.floor(bidPrice);
      if (isNaN(validatedPrice) || validatedPrice <= 0) {
         socket.emit('place_bid_result', { success: false, reason: '竞价失败：出价必须是大于0的正整数！' });
         return;
      }
      if (validatedPrice <= auction.price) {
         socket.emit('place_bid_result', { success: false, reason: '竞价失败：出价必须高于当前最高竞拍价格！' });
         return;
      }
      if (dbPlayer.silver < validatedPrice) {
         socket.emit('place_bid_result', { success: false, reason: '竞价失败：大侠的银两不足以支撑此次出价！' });
         return;
      }

      // 退还前一个出价者的银两并实时通知刷新
      if (auction.highestBidder) {
         const prevBidder = realPlayersDB.find(p => p.name === auction.highestBidder);
         if (prevBidder) {
            prevBidder.silver += auction.price;
            const prevIndex = players.findIndex(p => p.name === prevBidder.name);
            if (prevIndex >= 0) players[prevIndex] = prevBidder;
            
            // 实时同步退款钱币到前出价者的前端
            const prevOnline = players.find(p => p.name === prevBidder.name);
            if (prevOnline) {
               const prevSocket = io.sockets.sockets.get(prevOnline.id);
               if (prevSocket) {
                  prevSocket.emit('update_player_success', prevBidder);
                  prevSocket.emit('broadcast_message', `*【竞价出局】有同道对 [${auction.itemName}] 出了更高价格，已退还您 ${auction.price} 银两！*`);
               }
            }
         }
      }

      // 扣除当前出价者的银两
      dbPlayer.silver -= validatedPrice;

      // 更新拍卖信息
      auction.highestBidder = bidderName;
      auction.price = validatedPrice;

      saveDB();
      
      socket.emit('place_bid_result', { success: true });
      socket.emit('update_player_success', dbPlayer); // 实时更新当前出价者的钱包银两！
      io.emit('auction_update', activeAuctions);

      const existingIndex = players.findIndex(p => p.name === dbPlayer.name);
      if (existingIndex >= 0) players[existingIndex] = dbPlayer;
      io.emit('online_players', getLeaderboardData());
   });

   socket.on('buy_black_market_item', ({ itemId }) => {
       const p = realPlayersDB.find(pl => pl.name === socket.username);
       if (!p) return;
       
       const prices = {
          item_coffee: 99,
          item_purify: 55,
          item_box1: 8,
          item_drug: 120,
          item_reset_pill: 50,
          item_heaven_token: 30,
          item_peach_nectar: 100,
          item_heaven_scroll: 150,
          item_box2: 100
       };
       
       const price = prices[itemId];
       if (price === undefined) {
          socket.emit('buy_black_market_item_result', { success: false, reason: '未知的黑市商品！' });
          return;
       }
       
       if ((p.silver || 0) < price) {
          socket.emit('buy_black_market_item_result', { success: false, reason: '银两不足！' });
          return;
       }
       
       p.silver -= price;
       
       let alertMsg = "";
       let feedbackDialogue = "货款两讫，好生利用！";
       
       if (itemId === 'item_coffee') {
          p.taskCount = 0;
          p.encountersToday = 0;
          p.secretRealmAttempts = 0;
          alertMsg = "冰爽美式下肚，疲惫一扫而空！你今天的悬赏、奇遇、秘境挑战次数已全数刷新！";
          feedbackDialogue = "好酒量！这西洋仙水味道古怪，但确有醒神奇效，大侠走好！";
       } else if (itemId === 'item_purify') {
          p.dailyDebuffs = [];
          alertMsg = "净心符燃尽，恶兆消散！你感觉全身筋骨舒泰，负面劫难悉数退去。";
          feedbackDialogue = "符纸燃尽，元神清明。大侠额头的那缕恶兆黑气已然消散。";
       } else if (itemId === 'item_box1') {
          const pool = SKILLS_DB_MOCK.filter(s => s.type !== 'ultimate' && s.type !== 'motion' && s.reqLvl <= 15);
          const sk = pool[Math.floor(Math.random() * pool.length)];
          if (!p.skills) p.skills = ['s1'];
          if (!p.skills.includes(sk.id)) p.skills.push(sk.id);
          alertMsg = `你打开破旧残卷箱，里面竟然是外功残本【${sk.name}】！`;
          feedbackDialogue = `财货两清，这本《${sk.name}》可别被其他人偷学了去！`;
       } else if (itemId === 'item_drug') {
          const allAttrs = ['con', 'str', 'int', 'agi', 'luk'];
          const shuffled = [...allAttrs].sort(() => Math.random() - 0.5);
          const count = 3 + Math.floor(Math.random() * 3);
          const chosen = shuffled.slice(0, count);
          const lines = [];
          const attrNames = { con: '体质', str: '力量', int: '智慧', agi: '敏捷', luk: '幸运' };
          
          if (!p.permanentAttributes) p.permanentAttributes = { con: 0, str: 0, int: 0, agi: 0, luk: 0 };
          if (!p.attributes) p.attributes = { con: 0, str: 0, int: 0, agi: 0, luk: 0 };
          
          chosen.forEach(attr => {
              const val = 1 + Math.floor(Math.random() * 3);
              p.permanentAttributes[attr] = (p.permanentAttributes[attr] || 0) + val;
              p.attributes[attr] = (p.attributes[attr] || 0) + val;
              lines.push(`${attrNames[attr]} +${val}`);
          });
          p.maxHp = calculateMaxHp(p.level || 1, p.attributes.con);
          p.hp = p.maxHp;
          
          alertMsg = `大补丸入口即化！你感到内功周天激荡，永久获得属性：\n${lines.join('\n')}`;
          feedbackDialogue = "老夫炼制的宝丹药力极强，感觉浑身经脉发热了吧？好生消纳！";
       } else if (itemId === 'item_reset_pill') {
          const totalPoints = 10 + ((p.level || 1) - 1) * 3;
          p.freePoints = totalPoints;
          p.attributes = { ...(p.permanentAttributes || { con: 0, str: 0, int: 0, agi: 0, luk: 0 }) };
          p.maxHp = calculateMaxHp(p.level || 1, p.attributes.con);
          p.hp = p.maxHp;
          
          alertMsg = "洗髓成功！你身上的常规分配点数已全部归零重置并全额返还，仙药加点正常保留。";
          feedbackDialogue = "伐毛洗髓，脱胎换骨！大侠现在可以重新划分你的武学潜能点数了！";
       } else if (itemId === 'item_heaven_token') {
          p.secretRealmAttempts = Math.max(0, (p.secretRealmAttempts || 0) - 5);
          alertMsg = "你出示了通天令牌，今日秘境探索已扣减 5 次使用记录（相当于获得 5 次额外秘境机会）！";
          feedbackDialogue = "令出福地开，拿着令牌去找探索长老吧，祝大侠满载而归！";
       } else if (itemId === 'item_peach_nectar') {
          let newExp = (p.exp || 0) + 1000;
          let newLevel = p.level || 1;
          let newFreePoints = p.freePoints || 0;
          const getNextExp = (lvl) => Math.min(100000, Math.floor(100 * Math.pow(1.2, lvl - 1)));
          let newMaxExp = getNextExp(newLevel);
          
          while (newExp >= newMaxExp) { 
             newExp -= newMaxExp; 
             newLevel += 1; 
             newFreePoints += 3;
             newMaxExp = getNextExp(newLevel);
          }
          p.level = newLevel;
          p.exp = newExp;
          p.maxExp = newMaxExp;
          p.freePoints = newFreePoints;
          p.maxHp = calculateMaxHp(p.level, p.attributes?.con || 0);
          p.hp = p.maxHp;
          
          alertMsg = "你饮尽蟠桃琼浆，丹田真气沸腾爆发，获得了 1000 点修为阅历！";
          feedbackDialogue = "仙酿入喉，延寿长生！想必大侠已感瓶颈有所松动了吧，妙哉！";
       } else if (itemId === 'item_heaven_scroll') {
          const pool = SKILLS_DB_MOCK.filter(s => s.type === 'ultimate');
          const sk = pool[Math.floor(Math.random() * pool.length)];
          if (!p.skills) p.skills = ['s1'];
          if (!p.skills.includes(sk.id)) p.skills.push(sk.id);
          alertMsg = `金字密文悬空入脑！你从天书密卷中豁然开悟，参透了绝学【${sk.name}】！`;
          feedbackDialogue = `此卷记载了震古烁今的武功奥义，望大侠戒骄戒躁，勤加修持！`;
       } else if (itemId === 'item_box2') {
          const pool = TREASURES_DB_MOCK.filter(t => t.rarity === '史诗' || t.rarity === '传说');
          const t = pool[Math.floor(Math.random() * pool.length)];
          if (!p.treasures) p.treasures = [];
          p.treasures.push(t.id);
          alertMsg = `盲盒裂开，流光夺目！你获得了绝世器灵宝具【${t.name}】！`;
          feedbackDialogue = `好眼力！这可是老夫千辛万苦从琅嬛禁地倒腾出来的宝贝，拿好！`;
       }

       saveDB();
       
       const onlineP = players.find(pl => pl.name === p.name);
       if (onlineP) Object.assign(onlineP, p);
       
       socket.emit('update_player_success', p);
       socket.emit('buy_black_market_item_result', {
          success: true,
          itemId,
          alertMsg,
          feedbackDialogue
       });
       io.emit('online_players', getLeaderboardData());
   });

   // 太上神炉：本命宝物重铸接口
   socket.on('synthesize_treasure', ({ treasureIds }) => {
      const p = realPlayersDB.find(pl => pl.name === socket.username);
      if (!p) return;
      
      // 1. 验证数量
      if (!treasureIds || treasureIds.length < 3 || treasureIds.length > 5) {
         socket.emit('synthesize_treasure_result', { success: false, reason: '重铸需要投入 3 ~ 5 件宝物！' });
         return;
      }
      
      // 2. 验证拥有且数量充足
      const neededCounts = {};
      for (const tId of treasureIds) {
         neededCounts[tId] = (neededCounts[tId] || 0) + 1;
      }
      
      const inventoryTreasures = p.treasures || [];
      const userCounts = {};
      for (const tId of inventoryTreasures) {
         userCounts[tId] = (userCounts[tId] || 0) + 1;
      }
      
      for (const tId in neededCounts) {
         if ((userCounts[tId] || 0) < neededCounts[tId]) {
            socket.emit('synthesize_treasure_result', { success: false, reason: '储物袋中对应的宝具不足，无法重铸！' });
            return;
         }
      }
      
      // 3. 验证消耗：50 银两，15 精魂，10 异变之尘
      if ((p.silver || 0) < 50) {
         socket.emit('synthesize_treasure_result', { success: false, reason: '重铸需要消耗 50 银两，大侠银两不足！' });
         return;
      }
      if ((p.essence || 0) < 15) {
         socket.emit('synthesize_treasure_result', { success: false, reason: '重铸需要消耗 15 点武道精魂，精魂不足！' });
         return;
      }
      if (!p.inventoryMaterials || (p.inventoryMaterials.anomalyDust || 0) < 10) {
         socket.emit('synthesize_treasure_result', { success: false, reason: '重铸需要消耗 10 个异变之尘，材料不足！' });
         return;
      }
      
      // 4. 验证品质是否完全相同
      const firstId = treasureIds[0];
      const targetRarity = TREASURES_RARITY_MAP[firstId];
      if (!targetRarity) {
         socket.emit('synthesize_treasure_result', { success: false, reason: '未知的宝物品质！' });
         return;
      }
      
      for (const tId of treasureIds) {
         if (TREASURES_RARITY_MAP[tId] !== targetRarity) {
            socket.emit('synthesize_treasure_result', { success: false, reason: '投入的所有宝物稀有度品质必须相同！' });
            return;
         }
      }
      
      // 5. 扣除消耗
      p.silver -= 50;
      p.essence -= 15;
      p.inventoryMaterials.anomalyDust -= 10;
      
      // 扣除投入的宝物，如果装备着则需要脱下
      for (const tId of treasureIds) {
         const idx = p.treasures.indexOf(tId);
         if (idx >= 0) {
            p.treasures.splice(idx, 1);
         }
         if (p.equippedTreasure === tId) {
            if (!p.treasures.includes(tId)) {
               p.equippedTreasure = null;
               p.equippedTreasureAttrs = {
                  extraStr: 0, extraCon: 0, extraAgi: 0, extraInt: 0, extraLuk: 0,
                  extraDodge: 0, extraDef: 0, stunRate: 0, poisonRate: 0
               };
            }
         }
      }
      
      // 6. 判定概率与是否升阶
      const count = treasureIds.length;
      const successRates = { 3: 0.35, 4: 0.65, 5: 1.0 };
      const rate = successRates[count] || 0.35;
      const isSuccess = Math.random() < rate;
      
      let finalRarity = targetRarity;
      const currentRarityIdx = RARITY_LEVELS.indexOf(targetRarity);
      let isUpgraded = false;
      
      if (isSuccess) {
         if (currentRarityIdx < RARITY_LEVELS.length - 1) {
            finalRarity = RARITY_LEVELS[currentRarityIdx + 1];
            isUpgraded = true;
         } else {
            // 已是神话品质，重铸重滚神话
            finalRarity = '神话';
            isUpgraded = true;
         }
      }
      
      // 7. 避同模板ID逻辑生成新宝物
      const allTreasuresOfRarity = Object.keys(TREASURES_RARITY_MAP).filter(tId => TREASURES_RARITY_MAP[tId] === finalRarity);
      const consumedSet = new Set(treasureIds);
      let candidatePool = allTreasuresOfRarity.filter(tId => !consumedSet.has(tId));
      
      if (candidatePool.length === 0) {
         candidatePool = allTreasuresOfRarity;
      }
      
      const newTreasureId = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      p.treasures.push(newTreasureId);
      
      saveDB();
      
      const onlineP = players.find(pl => pl.name === p.name);
      if (onlineP) Object.assign(onlineP, p);
      
      socket.emit('update_player_success', p);
      socket.emit('synthesize_treasure_result', {
         success: true,
         newItemId: newTreasureId,
         isUpgraded,
         isSuccess
      });
      io.emit('online_players', getLeaderboardData());
   });

   // 太上神炉：定向洗炼接口
   socket.on('refine_treasure', ({ mainTreasureId, subTreasureId, materialType, materialCount }) => {
      const p = realPlayersDB.find(pl => pl.name === socket.username);
      if (!p) return;
      
      // 1. 验证拥有情况
      if (!mainTreasureId || !subTreasureId) {
         socket.emit('refine_treasure_result', { success: false, reason: '请选择洗炼主宝物与作为消耗的副宝胚！' });
         return;
      }
      
      const neededCounts = {};
      neededCounts[mainTreasureId] = (neededCounts[mainTreasureId] || 0) + 1;
      neededCounts[subTreasureId] = (neededCounts[subTreasureId] || 0) + 1;
      
      const inventoryTreasures = p.treasures || [];
      const userCounts = {};
      for (const tId of inventoryTreasures) {
         userCounts[tId] = (userCounts[tId] || 0) + 1;
      }
      
      for (const tId in neededCounts) {
         if ((userCounts[tId] || 0) < neededCounts[tId]) {
            socket.emit('refine_treasure_result', { success: false, reason: '储物袋中对应的宝具不足，洗炼失败！' });
            return;
         }
      }
      
      // 2. 验证副宝物品质：史诗以上
      const subRarity = TREASURES_RARITY_MAP[subTreasureId];
      if (!subRarity || !['史诗', '传说', '神话'].includes(subRarity)) {
         socket.emit('refine_treasure_result', { success: false, reason: '副宝物胚子品质必须在【史诗】或以上！' });
         return;
      }
      
      // 3. 验证消耗材料与精魂
      if ((p.essence || 0) < 25) {
         socket.emit('refine_treasure_result', { success: false, reason: '洗炼需要消耗 25 点武道精魂，精魂不足！' });
         return;
      }
      if (!p.inventoryMaterials) {
         socket.emit('refine_treasure_result', { success: false, reason: '材料仓未初始化！' });
         return;
      }
      if ((p.inventoryMaterials.anomalyCrystal || 0) < 2) {
         socket.emit('refine_treasure_result', { success: false, reason: '洗炼需要消耗 2 个异变玄晶，材料不足！' });
         return;
      }
      if ((p.inventoryMaterials.soulAshes || 0) < 2) {
         socket.emit('refine_treasure_result', { success: false, reason: '洗炼需要消耗 2 个怨魂余烬，材料不足！' });
         return;
      }
      
      const validMaterialTypes = ['goldSand', 'woodHerb', 'waterFluid', 'fireMarrow', 'earthEssence'];
      if (!validMaterialTypes.includes(materialType)) {
         socket.emit('refine_treasure_result', { success: false, reason: '注入属性对应的五行材料不合法！' });
         return;
      }
      
      if (![5, 10, 20].includes(materialCount)) {
         socket.emit('refine_treasure_result', { success: false, reason: '属性材料注入数量只能为 5, 10 或 20 个！' });
         return;
      }
      
      if ((p.inventoryMaterials[materialType] || 0) < materialCount) {
         socket.emit('refine_treasure_result', { success: false, reason: `储物袋中对应的属性材料不足 ${materialCount} 个！` });
         return;
      }
      
      // 4. 执行扣除
      p.essence -= 25;
      p.inventoryMaterials.anomalyCrystal -= 2;
      p.inventoryMaterials.soulAshes -= 2;
      p.inventoryMaterials[materialType] -= materialCount;
      
      // 扣除副宝胚
      const subIdx = p.treasures.indexOf(subTreasureId);
      if (subIdx >= 0) {
         p.treasures.splice(subIdx, 1);
      }
      if (p.equippedTreasure === subTreasureId) {
         if (!p.treasures.includes(subTreasureId)) {
            p.equippedTreasure = null;
         }
      }
      
      // 5. 生成并覆盖全新器灵洗炼词条属性
      const attrMapping = {
         goldSand: 'extraStr',
         woodHerb: 'extraCon',
         waterFluid: 'extraAgi',
         fireMarrow: 'extraInt',
         earthEssence: 'extraLuk'
      };
      
      const targetAttr = attrMapping[materialType];
      const newAttrs = {
         extraStr: 0, extraCon: 0, extraAgi: 0, extraInt: 0, extraLuk: 0,
         extraDodge: 0, extraDef: 0, stunRate: 0, poisonRate: 0, bossDamageBoost: 0
      };
      
      if (materialCount === 5) {
         // I阶词条
         newAttrs[targetAttr] = Math.floor(5 + Math.random() * 6); // 5~10
         if (Math.random() < 0.15) {
            if (Math.random() < 0.5) newAttrs.extraDef = 10; else newAttrs.extraDodge = 2;
         }
      } else if (materialCount === 10) {
         // II阶词条
         newAttrs[targetAttr] = Math.floor(12 + Math.random() * 9); // 12~20
         if (Math.random() < 0.3) {
            const rand = Math.random();
            if (rand < 0.25) newAttrs.extraDef = 25;
            else if (rand < 0.5) newAttrs.extraDodge = 5;
            else if (rand < 0.75) newAttrs.stunRate = 2;
            else newAttrs.poisonRate = 2;
         }
      } else if (materialCount === 20) {
         // III阶词条
         newAttrs[targetAttr] = Math.floor(25 + Math.random() * 16); // 25~40
         const rand = Math.random();
         if (rand < 0.2) newAttrs.extraDef = 50;
         else if (rand < 0.4) newAttrs.extraDodge = 10;
         else if (rand < 0.6) newAttrs.stunRate = 5;
         else if (rand < 0.8) newAttrs.poisonRate = 5;
         else newAttrs.bossDamageBoost = 20; // 破魔：无视Boss免伤
      }
      
      p.equippedTreasureAttrs = newAttrs;
      saveDB();
      
      const onlineP = players.find(pl => pl.name === p.name);
      if (onlineP) Object.assign(onlineP, p);
      
      socket.emit('update_player_success', p);
      socket.emit('refine_treasure_result', {
         success: true,
         newAttrs
      });
      io.emit('online_players', getLeaderboardData());
   });

   socket.on('disconnect', () => {
     const username = socket.username;
     // 从全局在线 players 列表中彻底移除下线的真实玩家，防止假在线/僵尸号
     if (username) {
        const index = players.findIndex(p => p.name === username && !p.isMock);
        if (index >= 0) {
           players.splice(index, 1);
           console.log(`[网络提醒] 真实玩家 【${username}】 离线，已从在线内存列表中清理。`);
        }
     }
     
     // 如果断开连接的玩家占用了 NPC 的名字，在 players 列表中还原对应的 NPC
     if (username && MOCK_NAMES.includes(username)) {
       const originalMock = MOCK_PLAYERS.find(p => p.name === username);
       const isAlreadyBack = players.some(p => p.name === username && p.isMock);
       if (originalMock && !isAlreadyBack) {
          players.push({
             ...originalMock,
             isBattling: false // 重置其战斗状态
          });
       }
    }

    for (const roomId in battles) {
       const battle = battles[roomId];
       if (battle.p1.id === socket.id || battle.p2.id === socket.id) {
          const otherId = battle.p1.id === socket.id ? battle.p2.id : battle.p1.id;
           const otherPlayer = players.find(p => p.id === otherId);
           if (otherPlayer) {
              otherPlayer.isBattling = false;
              const otherSocket = io.sockets.sockets.get(otherId);
              if (otherSocket) {
                 otherSocket.emit('battle_log', { 
                    log: `[比武告示] 大侠的对手由于身有急事离奇退场（断开连接），切磋就此取消！`, 
                    winner: 'aborted' 
                 });
              }
           }
           delete battles[roomId];
       }
    }
    io.emit('online_players', getLeaderboardData());
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
       io.emit('online_players', getLeaderboardData());
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
              io.emit('online_players', getLeaderboardData());
              socket.leave(roomId);
           }, 100);
        }
    }
  });
});



const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`江湖信使局 2.1 无尽血战 已开启 (Server listen on ${PORT})`);
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
                       if (!buyer.skills.includes(auction.itemToTrade)) {
                           buyer.skills.push(auction.itemToTrade);
                       }
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

                    // 发送个人通知及最新的PlayerData状态，确保背包和钱币实时更新
                    const buyerSocket = io.sockets.sockets.get(players.find(p => p.name === buyer.name)?.id);
                    const sellerSocket = io.sockets.sockets.get(players.find(p => p.name === seller.name)?.id);
                    if (buyerSocket) {
                       buyerSocket.emit('auction_result', { success: true, itemName: auction.itemName, price: auction.price, type: 'buyer' });
                       buyerSocket.emit('update_player_success', buyer);
                    }
                    if (sellerSocket) {
                       sellerSocket.emit('auction_result', { success: true, itemName: auction.itemName, price: auction.price, type: 'seller' });
                       sellerSocket.emit('update_player_success', seller);
                    }

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
                    // 发送流拍通知给卖家，同步状态
                    const sellerSocket = io.sockets.sockets.get(players.find(p => p.name === seller.name)?.id);
                    if (sellerSocket) {
                       sellerSocket.emit('auction_result', { success: false, itemName: auction.itemName, type: 'seller' });
                       sellerSocket.emit('update_player_success', seller);
                    }

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
       io.emit('online_players', getLeaderboardData());
   }
}, 5000);
