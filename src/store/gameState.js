import { create } from 'zustand';
import { io } from 'socket.io-client';

export const INITIAL_POINTS = 10;
export const POINTS_PER_LEVEL = 3;

export const SKILLS_DB = [
  { id: 's1', name: '基本拳脚', type: 'outer', power: 10, reqLvl: 1, reqStr: 0, desc: '入门招式。外功。' },
  { id: 's2', name: '吐纳法', type: 'inner', power: 20, reqLvl: 1, reqInt: 0, desc: '基础内功。' },
  { id: 's3', name: '铁砂掌', type: 'outer', power: 35, reqLvl: 3, reqStr: 5, desc: '掌力刚猛。外功。' },
  { id: 's4', name: '凌波微步', type: 'motion', power: 0, reqLvl: 5, reqAgi: 8, desc: '身法诡异。身法。' },
  { id: 's5', name: '九阳神功', type: 'inner', power: 60, reqLvl: 8, reqInt: 15, desc: '生生不息。内功。' },
  { id: 's_kuihua', name: '葵花宝典', type: 'ultimate', power: 150, reqLvl: 10, reqAgi: 20, desc: '唯快不破。绝学。' },
  { id: 's_xianglong', name: '降龙十八掌', type: 'ultimate', power: 120, reqLvl: 10, reqStr: 15, desc: '爆炎猛击。绝学。' },
  { id: 's_dugu', name: '独孤九剑', type: 'ultimate', power: 160, reqLvl: 15, reqStr: 30, desc: '破尽天下。绝学。' },
  { id: 's_taiji', name: '太极拳', type: 'outer', power: 140, reqLvl: 12, reqInt: 25, desc: '以柔克刚。外功。' },
  { id: 's_kuangfeng', name: '狂风快剑', type: 'outer', power: 70, reqLvl: 10, reqAgi: 20, desc: '迅捷连绵的剑法。' },
  { id: 's_du', name: '千蛛万毒手', type: 'outer', power: 50, reqLvl: 15, reqCon: 15, desc: '阴毒武功，施展后给予对手永久剧毒。' },
  { id: 's_anran', name: '黯然销魂掌', type: 'outer', power: 130, reqLvl: 18, reqStr: 25, reqLuk: 10, desc: '威力无穷，需凄苦心境催动。' },
  { id: 's_shihou', name: '狮吼功', type: 'inner', power: 40, reqLvl: 12, reqCon: 20, desc: '音波震天，有极高概率震晕对手。' },
  { id: 's_yijin', name: '易筋经', type: 'inner', power: 0, reqLvl: 20, reqCon: 30, desc: '顶级防御，且能逼除体内一切毒素！' },
  { id: 's_xixing', name: '吸星大法', type: 'inner', power: 80, reqLvl: 15, reqInt: 20, desc: '强力吸血，吸取敌人气血化为己用。' },
  { id: 's_tiyun', name: '梯云纵', type: 'motion', power: 0, reqLvl: 10, reqAgi: 15, desc: '武当绝学，高概率闪躲。' },
  { id: 's_shenxing', name: '神行百变', type: 'motion', power: 0, reqLvl: 20, reqAgi: 30, desc: '铁剑神功，获得巨量闪躲率。' },
  { id: 's_dianxue', name: '葵花点穴手', type: 'ultimate', power: 60, reqLvl: 20, reqAgi: 25, desc: '点中死穴，封印对手释放技能（仅能平A）。' },
  { id: 's_liumai', name: '六脉神剑', type: 'ultimate', power: 180, reqLvl: 25, reqInt: 35, desc: '无形剑气，杀伤力绝顶。' },
  { id: 's_shengxin', name: '圣心诀', type: 'ultimate', power: 0, reqLvl: 30, reqCon: 40, desc: '不死神功，本场战斗重伤时原地复活！' }
];

export const TREASURES_DB = [
  { id: 't1', name: '木质佛珠', rarity: '普通', attrs: { hp: 30, atk: 4 }, effect: 'ningShen', desc: '【宁神】开局获最大血量5%护盾' },
  { id: 't2', name: '粗布披风', rarity: '普通', attrs: { dodge: 2, def: 5 }, effect: 'qingQiao', desc: '【轻巧】受到伤害减少30点' },
  { id: 't3', name: '生锈铁剑', rarity: '普通', attrs: { atk: 10 }, effect: 'poShang', desc: '【破伤】普攻额外50点真伤' },
  { id: 't4', name: '白玉短笛', rarity: '稀有', attrs: { atk: 15, dodge: 3 }, effect: 'huiChun', desc: '【回春】造成伤害时恢复自身最大生命2%' },
  { id: 't5', name: '判官双笔', rarity: '稀有', attrs: { atk: 16, dodge: 4 }, effect: 'dianXue', desc: '【点穴】攻击10%封穴目标' },
  { id: 't6', name: '冰魄银针', rarity: '稀有', attrs: { dodge: 5, crit: 3 }, effect: 'juDu', desc: '【剧毒】攻击15%使目标中毒(每回合扣3%HP，3回合)' },
  { id: 't7', name: '打狗棒', rarity: '史诗', attrs: { atk: 30, dodge: 8 }, effect: 'daGou', desc: '【打狗】攻击15%概率击晕目标' },
  { id: 't8', name: '金蛇剑', rarity: '史诗', attrs: { atk: 30, crit: 8 }, effect: 'jinShe', desc: '【金蛇】20%额外连击，免疫中毒' },
  { id: 't9', name: '软猬甲', rarity: '史诗', attrs: { hp: 250, def: 50, atk: 10 }, effect: 'ruanWei', desc: '【荆棘】反伤15%，免疫击晕与中毒' },
  { id: 't10', name: '倚天剑', rarity: '传说', attrs: { atk: 50, dodge: 10 }, effect: 'yiTian', desc: '【倚天】攻击附带15%吸血，伤害提升20%' },
  { id: 't11', name: '屠龙刀', rarity: '传说', attrs: { atk: 60, hp: 100, def: 20 }, effect: 'tuLong', desc: '【破釜沉舟】血量低于40%时提升50%伤害，减免20%受伤' },
  { id: 't12', name: '玄铁重剑', rarity: '传说', attrs: { atk: 80, dodge: -5 }, effect: 'xuanTie', desc: '【重剑】攻击必中，20%概率对敌造成内伤' },
  { id: 't13', name: '圣火令', rarity: '神话', attrs: { atk: 60, dodge: 15 }, effect: 'shengHuo', desc: '【威压】开局沉默对手2回合，攻击附带5%当前HP伤害' },
  { id: 't14', name: '绝世好剑', rarity: '神话', attrs: { hp: 150, atk: 45, def: 30, dodge: 10, crit: 10 }, effect: 'jiMie', desc: '【寂灭】5%概率直接削减目标50%HP，免疫所有异常' },
  { id: 't15', name: '达摩舍利', rarity: '神话', attrs: { hp: 300, def: 60, crit: 15 }, effect: 'niePan', desc: '【涅槃】死亡时保留1血并恢复50%HP(1场1次)' },
];

export const ATTR_MAP = { con: '体质', str: '力量', int: '智慧', agi: '敏捷', luk: '幸运' };
export const TREASURE_ATTR_MAP = { hp: '气血', atk: '攻击', def: '防御', dodge: '闪避', crit: '暴击' };

// 功法熟练度段位表
export const MASTERY_TIERS = [
  { minWins: 0, bonus: 0, label: '初习入门' },
  { minWins: 100, bonus: 0.20, label: '略有小成' },
  { minWins: 200, bonus: 0.40, label: '初窥门径' },
  { minWins: 300, bonus: 0.60, label: '渐入佳境' },
  { minWins: 400, bonus: 0.80, label: '融会贯通' },
  { minWins: 500, bonus: 1.00, label: '炉火纯青' },
  { minWins: 600, bonus: 1.20, label: '登峰造极' },
  { minWins: 700, bonus: 1.40, label: '出神入化' },
  { minWins: 800, bonus: 1.60, label: '化境归真' },
  { minWins: 900, bonus: 1.80, label: '天人合一' },
  { minWins: 1000, bonus: 2.00, label: '无上至境' },
];

// 根据胜场数获取熟练度信息
export const getSkillMastery = (skillId, masteryMap = {}) => {
  const baseId = skillId?.includes('_deg') ? skillId.split('_deg')[0] : skillId;
  const wins = masteryMap?.[baseId] || 0;
  let tier = MASTERY_TIERS[0];
  for (const t of MASTERY_TIERS) {
    if (wins >= t.minWins) tier = t;
  }
  return { wins, bonus: tier.bonus, label: tier.label };
};

export const getSkillInfo = (skillId) => {
    if (!skillId) return null;
    const isDegraded = skillId.includes('_deg');
    let baseId = skillId;
    let degradeLvl = 0;
    if (isDegraded) {
       const parts = skillId.split('_deg');
       baseId = parts[0];
       degradeLvl = parseInt(parts[1], 10);
    }
    const baseSkill = SKILLS_DB.find(s => s.id === baseId);
    if (!baseSkill) return null;
    if (degradeLvl === 0) return baseSkill;
    
    const factor = Math.pow(0.7, degradeLvl); 
    return {
       ...baseSkill,
       id: skillId,
       name: `${baseSkill.name}(残卷x${degradeLvl})`,
       power: Math.floor(baseSkill.power * factor),
       isDegraded: true,
       degradeLvl
    };
};

let socket = null;

const getNextExp = (level) => Math.floor(100 + level * 50 + Math.pow(level, 1.8) * 15);
const calculateMaxHp = (level, conAttr) => Math.min(7000, 100 + level * 15 + (conAttr || 0) * 10);

const checkMockMode = () => {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('mock=1') || window.location.search.includes('mock_battle=1') || window.location.search.includes('mock_encounter=1');
};

const isMockMode = checkMockMode();

export const useGameStore = create((set, get) => ({
  hasCreatedRole: isMockMode ? true : false,
  socketConnected: isMockMode ? true : false,
  loginChecked: isMockMode ? true : false, 
  loginError: null,
  
  player: isMockMode ? {
    name: '张无忌',
    title: '肝帝真仙',
    level: 85,
    exp: 200,
    maxExp: 1000,
    freePoints: 0,
    taskCount: 0,
    encountersToday: 0,
    lastTaskDate: new Date().toDateString(),
    secretRealmAttempts: 0,
    dailyDebuffs: [],
    silver: 100,
    hp: 7000,
    maxHp: 7000,
    attributes: { con: 30, str: 30, int: 30, agi: 30, luk: 30 },
    permanentAttributes: { con: 0, str: 0, int: 0, agi: 0, luk: 0 },
    skills: ['s1', 's2', 's5', 's_yijin'], 
    treasures: ['t10'],
    equippedSkills: { inner: 's_yijin', outer: 's1', motion: null, ultimate: null },
    equippedTreasure: 't10'
  } : {
    name: '', title: '', level: 1, exp: 0, maxExp: getNextExp(1), freePoints: 0, taskCount: 0, encountersToday: 0, lastTaskDate: new Date().toDateString(),
    secretRealmAttempts: 0, dailyDebuffs: [], silver: 0,
    hp: calculateMaxHp(1, 0), maxHp: calculateMaxHp(1, 0),
    attributes: { con: 0, str: 0, int: 0, agi: 0, luk: 0 },
    permanentAttributes: { con: 0, str: 0, int: 0, agi: 0, luk: 0 },
    skills: ['s1'], 
    treasures: [],
    equippedSkills: { inner: null, outer: 's1', motion: null, ultimate: null },
    equippedTreasure: null,
    essence: 100,
    inventoryMaterials: {
      anomalyDust: 0, soulAshes: 0, anomalyCrystal: 0,
      goldSand: 0, woodHerb: 0, waterFluid: 0, fireMarrow: 0, earthEssence: 0
    },
    equippedTreasureAttrs: {
      extraAtk: 0, extraDef: 0, extraHp: 0, extraDodge: 0, extraCrit: 0,
      stunRate: 0, poisonRate: 0, bossDamageBoost: 0
    }
  },

  onlinePlayers: isMockMode ? [
    { id: 'bot1', name: '乔峰', level: 88, isMock: true, rankIndex: 3, attributes: { con: 45, str: 50, int: 25, agi: 35, luk: 15 }, equippedTreasure: 't7' },
    { id: 'bot2', name: '灭绝师太', level: 75, isMock: true, rankIndex: 12, attributes: { con: 30, str: 35, int: 30, agi: 25, luk: 10 }, equippedTreasure: 't10' },
    { id: 'bot3', name: '东方不败', level: 92, isMock: true, rankIndex: 1, attributes: { con: 40, str: 35, int: 45, agi: 50, luk: 20 }, equippedTreasure: 't13' }
  ] : [],
  activeAuctions: [],
  realmGhosts: [],
  worldBossState: {
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
  },
  auctionHistory: [],
  broadcastQueue: [],
  battleState: (isMockMode && (typeof window === 'undefined' || !window.location.search.includes('mock_encounter=1'))) ? {
    inBattle: true,
    roomId: 'mockRoom',
    p1: {
      name: '张无忌',
      level: 85,
      hp: 5500,
      maxHp: 7000,
      equippedTreasure: 't10',
      equippedSkills: { inner: 's_yijin', outer: 's1' },
      attributes: { con: 30, str: 30, int: 30, agi: 30, luk: 30 },
      buffs: { dodge: 1, defUp: 0, shield: 200, revive: 0 },
      debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 }
    },
    p2: {
      name: '东方不败',
      level: 92,
      hp: 4200,
      maxHp: 8500,
      equippedTreasure: 't13',
      equippedSkills: { inner: 's_xixing', outer: 's_kuihua' },
      attributes: { con: 40, str: 35, int: 45, agi: 50, luk: 20 },
      buffs: { dodge: 0, defUp: 1, shield: 0, revive: 0 },
      debuffs: { stun: 0, poison: 1, silence: 0, internalWound: 0 }
    },
    logs: [
      '决斗开始！',
      '张无忌 催动【易筋经】，真气护体，防御力大增！',
      '东方不败 使出【葵花宝典】，对 张无忌 造成了 650 点伤害！'
    ],
    winner: null
  } : { inBattle: false, roomId: null, p1: null, p2: null, logs: [], winner: null },
  dailyTasks: [],

  initSocket: () => {
    if (isMockMode) return;
    if (!socket) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const serverUrl = isLocal
        ? `http://${window.location.hostname}:3000`
        : 'https://7499bfe4.r16.cpolar.top.cn';
      socket = io(serverUrl, { transports: ['polling'] });
      socket.on('connect', () => {
        set({ socketConnected: true });
        socket.emit('get_auctions');
        socket.emit('get_auction_history');
        const savedName = localStorage.getItem('wuxia_username');
        const savedPassword = localStorage.getItem('wuxia_password');
        if (savedName && savedPassword) {
           socket.emit('player_login', { name: savedName, password: savedPassword });
        } else {
           set({ loginChecked: true });
        }
      });
      
      socket.on('login_success', (playerData) => {
         // 检测是否为断线重连（即本地已有角色且名字不为空）
         const isReconnection = get().hasCreatedRole && get().player.name !== '';
         if (isReconnection) {
            console.log("[重连同步] 检测到网络重连，正在将本地最新进度同步至服务端...");
            if (socket) socket.emit('update_player', get().player);
            set({ loginChecked: true, loginError: null });
            return;
         }

         if (playerData.attributes && typeof playerData.attributes.hp !== 'undefined') {
            playerData.attributes.con = playerData.attributes.hp;
            delete playerData.attributes.hp;
         }
         delete playerData.attributes.maxHp;
         
         if (!playerData.maxHp || playerData.maxHp === 7000) {
            playerData.maxHp = calculateMaxHp(playerData.level, playerData.attributes.con);
            playerData.hp = playerData.maxHp; 
         }
         
         // Ensure properties exist for backwards compatibility with DB
         if (!playerData.treasures) playerData.treasures = [];
         if (typeof playerData.encountersToday === 'undefined') playerData.encountersToday = 0;
         if (typeof playerData.secretRealmAttempts === 'undefined') playerData.secretRealmAttempts = 0;
         if (!playerData.dailyDebuffs) playerData.dailyDebuffs = [];
         if (typeof playerData.silver === 'undefined') playerData.silver = 0;
         if (!playerData.equippedSkills) playerData.equippedSkills = { inner: null, outer: 's1', motion: null, ultimate: null };
         if (!playerData.permanentAttributes) playerData.permanentAttributes = { con: 0, str: 0, int: 0, agi: 0, luk: 0 };
         if (typeof playerData.essence === 'undefined') playerData.essence = 100;
         if (!playerData.inventoryMaterials) {
             playerData.inventoryMaterials = {
                anomalyDust: 0, soulAshes: 0, anomalyCrystal: 0,
                goldSand: 0, woodHerb: 0, waterFluid: 0, fireMarrow: 0, earthEssence: 0
             };
         }
         if (!playerData.equippedTreasureAttrs) {
             playerData.equippedTreasureAttrs = {
                extraAtk: 0, extraDef: 0, extraHp: 0, extraDodge: 0, extraCrit: 0,
                stunRate: 0, poisonRate: 0, bossDamageBoost: 0
             };
         }
         
         const today = new Date().toDateString();
         if (playerData.lastTaskDate !== today) {
            playerData.taskCount = 0;
            playerData.encountersToday = 0;
            playerData.secretRealmAttempts = 0;
            playerData.dailyDebuffs = [];
            playerData.dailyActivity = 0;
            playerData.title = '摸鱼小虾';
            playerData.lastTaskDate = today;
            socket.emit('update_player', playerData);
         }
         
         set({ hasCreatedRole: true, player: playerData, loginChecked: true, loginError: null });
      });
      
      socket.on('login_failed', (errorData) => {
         localStorage.removeItem('wuxia_username');
         localStorage.removeItem('wuxia_password');
         set({ 
            hasCreatedRole: false, 
            loginChecked: true, 
            loginError: errorData ? errorData.reason : '户籍未登入' 
         });
      });

      socket.on('online_players', (playersList) => set((state) => {
        const filteredList = (playersList || []).filter(p => p.name !== '清风');
        const myPlayer = filteredList.find(p => p.name === state.player.name);
        if (myPlayer) {
           return {
              onlinePlayers: filteredList,
              player: {
                 ...state.player,
                 rankIndex: myPlayer.rankIndex
              }
           };
        }
        return { onlinePlayers: filteredList };
      }));
      socket.on('battle_start', (data) => set({ battleState: { inBattle: true, roomId: data.roomId, p1: data.p1, p2: data.p2, logs: data.logs, winner: null } }));
      socket.on('battle_log', (actionData) => set(state => ({
        battleState: {
           ...state.battleState, p1: actionData.p1 || state.battleState.p1, p2: actionData.p2 || state.battleState.p2,
           logs: [...state.battleState.logs, actionData.log], winner: actionData.winner || state.battleState.winner
        }
      })));
      socket.on('system_reward', ({ skillId }) => {
         const sk = getSkillInfo(skillId);
         if(sk) {
            get().learnSkill(skillId);
            alert(`[大奇遇] 您在挑战中，爆出了绝学【${sk.name}】！`);
         }
      });
      socket.on('auction_update', (auctions) => {
         const cleanAuctions = (auctions || []).filter(a => a.sellerName !== '清风' && a.highestBidder !== '清风');
         set({ activeAuctions: cleanAuctions });
      });
      socket.on('auction_history', (history) => {
         const cleanHistory = (history || []).filter(h => h.sellerName !== '清风' && h.buyer !== '清风');
         set({ auctionHistory: cleanHistory });
      });
      socket.on('broadcast_message', (msg) => {
         if (msg && (msg.includes('清风') || msg.includes('清风大侠'))) return;
         set(state => ({ broadcastQueue: [...state.broadcastQueue, {id: Date.now()+Math.random(), msg}] }));
      });
      socket.on('realm_ghosts_list', (ghosts) => {
         const cleanGhosts = (ghosts || []).filter(g => g.creatorName !== '清风');
         set({ realmGhosts: cleanGhosts });
      });
      socket.on('update_player_success', (playerData) => set({ player: playerData }));
      socket.on('deploy_ghost_result', (res) => {
         if (res.success) {
            alert("神魂设伏成功！你的怨灵残影已留存于此地。");
         } else {
            alert(res.reason);
         }
      });
      const sanitizeWorldBossState = (bossState) => {
         if (!bossState) return bossState;
         const cleanFighters = { ...bossState.fighters };
         if (cleanFighters['清风']) delete cleanFighters['清风'];
         return {
            ...bossState,
            fighters: cleanFighters,
            highestBidder: bossState.highestBidder === '清风' ? '匿名大侠' : bossState.highestBidder,
            lastHitBy: bossState.lastHitBy === '清风' ? '匿名大侠' : bossState.lastHitBy,
            signups: (bossState.signups || []).filter(name => name !== '清风')
         };
      };
      socket.on('world_boss_state', (bossState) => set({ worldBossState: sanitizeWorldBossState(bossState) }));
      socket.on('world_boss_state_change', (bossState) => set({ worldBossState: sanitizeWorldBossState(bossState) }));
      socket.on('signup_world_boss_result', (res) => {
         if (res.success) {
            alert("投递请战帖登记参战成功！静候周五晚19:00大劫魔罗降临。");
         } else {
            alert(res.reason);
         }
      });
      socket.on('bid_world_boss_auction_result', (res) => {
         if (res.success) {
            alert("大尊拍卖：叫价出资成功！");
         } else {
            alert(res.reason);
         }
      });
      socket.on('kick_out', (res) => {
         localStorage.removeItem('wuxia_username');
         localStorage.removeItem('wuxia_password');
         set({ 
            hasCreatedRole: false, 
            player: { name: '', level: 1, exp: 0, maxExp: 100, freePoints: 10, attributes: { con: 10, str: 10, int: 10, agi: 10, luk: 10 }, hp: 100, maxHp: 100, silver: 10, skills: ['s1'], equippedSkills: { active1: 's1' }, treasures: [] },
            loginError: res.reason || '大侠已在别处入世，此地连接已切断。'
         });
         alert(res.reason || "大侠的名号已在别处入世，此地连接已切断！");
      });
      socket.on('auction_result', (res) => {
         if (res.success) {
            if (res.type === 'buyer') {
               alert(`【拍卖喜报】恭喜大侠！您在拍卖行中成功竞得拍品【${res.itemName}】！`);
            } else if (res.type === 'seller') {
               alert(`【拍卖喜报】大喜！您上架的拍品【${res.itemName}】已成功售出，扣除印花税费，共入账 ${res.price} 银两！`);
            }
         } else {
            if (res.type === 'seller') {
               alert(`【流拍退回】大侠，您上架的拍品【${res.itemName}】因无人竞价不幸流拍，物品已原样退回储物袋中。`);
            }
         }
      });
    }
  },

  removeBroadcast: (id) => set(state => ({ broadcastQueue: state.broadcastQueue.filter(b => b.id !== id) })),

  createRole: (name, password, attributes) => set((state) => {
    const maxHp = calculateMaxHp(1, attributes.con);
    const newPlayer = { ...state.player, name, password, attributes, hp: maxHp, maxHp, maxExp: getNextExp(1) };
    localStorage.setItem('wuxia_username', name);
    localStorage.setItem('wuxia_password', password);
    if (socket) socket.emit('player_join', newPlayer);
    return { loginError: null };
  }),

  manualLogin: (name, password) => {
     localStorage.setItem('wuxia_username', name);
     localStorage.setItem('wuxia_password', password);
     set({ loginError: null });
     if (socket) socket.emit('player_login', { name, password });
  },

  incrementTaskCount: () => set((state) => {
     const p = { ...state.player, taskCount: state.player.taskCount + 1 };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  checkDailyReset: () => set((state) => {
     if (!state.player.name) return state;
     const today = new Date().toDateString();
     if (state.player.lastTaskDate !== today) {
        const p = { ...state.player, taskCount: 0, encountersToday: 0, secretRealmAttempts: 0, dailyDebuffs: [], dailyActivity: 0, title: '摸鱼小虾', lastTaskDate: today };
        if (socket) socket.emit('update_player', p);
        return { player: p, dailyTasks: [] };
     }
     return state;
  }),

  incrementEncounterCount: () => set((state) => {
     const p = { ...state.player, encountersToday: (state.player.encountersToday || 0) + 1 };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  useSecretRealmAttempt: () => set((state) => {
     const p = { ...state.player, secretRealmAttempts: (state.player.secretRealmAttempts || 0) + 1 };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  addDailyDebuff: (debuffType) => set((state) => {
     if (!state.player.dailyDebuffs) state.player.dailyDebuffs = [];
     if (!state.player.dailyDebuffs.includes(debuffType)) {
        const p = { ...state.player, dailyDebuffs: [...state.player.dailyDebuffs, debuffType] };
        if (socket) socket.emit('update_player', p);
        return { player: p };
     }
     return state;
  }),

  equipSkill: (type, skillId) => set((state) => {
     const p = { ...state.player, equippedSkills: { ...state.player.equippedSkills, [type]: skillId } };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

    equipTreasure: (tId) => set((state) => {
       const p = { ...state.player };
       if (p.equippedTreasure !== tId) {
          p.equippedTreasure = tId;
       }
       if (socket) socket.emit('update_player', p);
       return { player: p };
    }),

  gainTreasure: (tId) => set((state) => {
     const p = { ...state.player, treasures: [...state.player.treasures, tId] };
     if (!p.equippedTreasure) p.equippedTreasure = tId;
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  gainEncounterRewards: (exp, silver, treasureIds) => set((state) => {
    let { level, exp: currentExp, maxExp, freePoints, taskCount, ...rest } = state.player;
    
    let newExp = currentExp + exp;
    let newLevel = level;
    let newFreePoints = freePoints;
    let newMaxExp = maxExp;
    while (newExp >= newMaxExp) { 
      newExp -= newMaxExp; 
      newLevel += 1; 
      newFreePoints += POINTS_PER_LEVEL;
      newMaxExp = getNextExp(newLevel);
    }
    const finalMaxHp = calculateMaxHp(newLevel, rest.attributes.con);
    
    const newSilver = (rest.silver || 0) + silver;
    
    const newTreasures = [...(rest.treasures || [])];
    let newEquippedTreasure = rest.equippedTreasure;
    treasureIds.forEach(tId => {
       newTreasures.push(tId);
       if (!newEquippedTreasure) newEquippedTreasure = tId;
    });
    
    const p = { 
       ...rest, 
       level: newLevel, 
       exp: newExp, 
       maxExp: newMaxExp, 
       freePoints: newFreePoints, 
       taskCount, 
       hp: finalMaxHp, 
       maxHp: finalMaxHp,
       silver: newSilver,
       treasures: newTreasures,
       equippedTreasure: newEquippedTreasure
    };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  gainExp: (amount) => set((state) => {
    let { level, exp, maxExp, freePoints, taskCount, hp, maxHp, ...rest } = state.player;
    exp += amount;
    while (exp >= maxExp) { 
      exp -= maxExp; 
      level += 1; 
      freePoints += POINTS_PER_LEVEL;
      maxExp = getNextExp(level);
    }
    const finalMaxHp = calculateMaxHp(level, rest.attributes.con);
    const p = { ...rest, level, exp, maxExp, freePoints, taskCount, hp: finalMaxHp, maxHp: finalMaxHp };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  addSilver: (amount) => set((state) => {
    const p = { ...state.player, silver: (state.player.silver || 0) + amount };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  gainEssence: (amount) => set((state) => {
    const curEssence = state.player.essence || 0;
    const newEssence = Math.min(500, curEssence + amount);
    const p = { ...state.player, essence: newEssence };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  gainMaterial: (materialKey, amount) => set((state) => {
    const materials = { ...(state.player.inventoryMaterials || {}) };
    materials[materialKey] = (materials[materialKey] || 0) + amount;
    const p = { ...state.player, inventoryMaterials: materials };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  addAttributes: (attrBoosts) => set((state) => {
    const newAttrs = { ...state.player.attributes };
    const newPermAttrs = { ...(state.player.permanentAttributes || { con: 0, str: 0, int: 0, agi: 0, luk: 0 }) };
    Object.entries(attrBoosts).forEach(([key, val]) => {
      newAttrs[key] = (newAttrs[key] || 0) + val;
      newPermAttrs[key] = (newPermAttrs[key] || 0) + val;
    });
    const newMaxHp = calculateMaxHp(state.player.level, newAttrs.con);
    const p = {
      ...state.player,
      attributes: newAttrs,
      permanentAttributes: newPermAttrs,
      maxHp: newMaxHp,
      hp: newMaxHp,
    };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  clearDailyDebuffs: () => set((state) => {
    const p = { ...state.player, dailyDebuffs: [] };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  resetPoints: () => set((state) => {
    const p = { ...state.player };
    const totalPoints = INITIAL_POINTS + (p.level - 1) * POINTS_PER_LEVEL;
    p.freePoints = totalPoints;
    p.attributes = { ...(p.permanentAttributes || { con: 0, str: 0, int: 0, agi: 0, luk: 0 }) };
    p.maxHp = calculateMaxHp(p.level, p.attributes.con);
    p.hp = p.maxHp;
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  // 设置单个属性值（用于滑块调整）
  setAttribute: (attrKey, newValue) => set((state) => {
    const permVal = state.player.permanentAttributes?.[attrKey] || 0;
    const oldVal = state.player.attributes[attrKey] || 0;
    const diff = newValue - oldVal;

    // 新值不能小于永久加成
    if (newValue < permVal) return state;

    // 检查是否有足够的freePoints来增加属性
    if (diff > 0 && state.player.freePoints < diff) return state;

    // 计算其他属性的当前值之和
    const otherAttrsSum = Object.entries(state.player.attributes)
      .filter(([k]) => k !== attrKey)
      .reduce((sum, [, v]) => sum + v, 0);

    // 新值不能导致总属性超过 (初始点数 + 等级奖励点数 + 永久加成)
    const permTotal = Object.values(state.player.permanentAttributes || {}).reduce((sum, v) => sum + v, 0);
    const maxTotal = INITIAL_POINTS + (state.player.level - 1) * POINTS_PER_LEVEL + permTotal;
    if (newValue + otherAttrsSum > maxTotal) return state;

    let p = { ...state.player, attributes: { ...state.player.attributes }, freePoints: state.player.freePoints - diff };
    p.attributes[attrKey] = newValue;

    if (attrKey === 'con') {
      p.maxHp = calculateMaxHp(p.level, p.attributes.con);
      p.hp = p.maxHp;
    }
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  allocatePoints: (attrKey, amount) => set((state) => {
    let p = { ...state.player, attributes: { ...state.player.attributes } };
    const addAmt = Math.min(Math.max(1, amount), p.freePoints);
    if (p.freePoints >= addAmt) {
      p.freePoints -= addAmt;
      p.attributes[attrKey] += addAmt;
      if (attrKey === 'con') {
         p.maxHp = calculateMaxHp(p.level, p.attributes.con);
         p.hp = p.maxHp;
      }
      if (socket) socket.emit('update_player', p);
      return { player: p };
    }
    return state;
  }),

  generateTasks: () => set((state) => {
    const tasks = [];
    const attrs = Object.keys(ATTR_MAP);
    
    // 方案一：定向生成不同难度的星级配置 (总计 6 个任务，比例不变：1.5个低星、3个中星、1.5个高星)
    const starConfigs = [
      Math.random() > 0.5 ? 1 : 2, // 1个[低星数] (1~2星随机)
      3,                           // 第1个[中等星数] (固定3星)
      3,                           // 第2个[中等星数] (固定3星)
      3,                           // 第3个[中等星数] (固定3星)
      Math.random() > 0.8 ? 5 : 4, // 1个[高星数] (80%出4星，20%拼脸出5星)
      // 最后一个在[低星数]和[高星数]之间随机，使整体期望比例维持在 1.5 : 3 : 1.5 (即 1:2:1)
      Math.random() > 0.5 ? (Math.random() > 0.5 ? 1 : 2) : (Math.random() > 0.8 ? 5 : 4)
    ];

    const TASK_TEMPLATE = {
      str: {
        title: "铁匠铺锤炼",
        desc: "【力量悬赏】协助铁匠铺锻造百炼寒铁，锤击千次以提炼金精砂。"
      },
      con: {
        title: "险峰采芝",
        desc: "【体质悬赏】跋涉险峰采集野生灵芝，锤炼肉身筋骨以获取乙木芝。"
      },
      agi: {
        title: "凌空送信",
        desc: "【轻功悬赏】运用踏雪无痕身法限时飞鸽传书，凌空取回玄水液。"
      },
      int: {
        title: "静室坐禅",
        desc: "【智慧悬赏】在烈火静室中静坐参禅参悟武学奥义，获赠地火髓。"
      },
      luk: {
        title: "布施积德",
        desc: "【幸运悬赏】为遭遇天灾的百姓解签布施积德行善，偶得厚土精。"
      }
    };

    starConfigs.forEach(stars => {
       const attr = attrs[Math.floor(Math.random()*attrs.length)];
       const difficulty = state.player.level * (1.2 + stars * 0.2) + stars * 2;
       const expReward = Math.floor(stars * 20 + state.player.level * Math.random() * 15);
       
       const temp = TASK_TEMPLATE[attr];
       tasks.push({
         id: 'task_' + Math.random().toString(36).substr(2, 6),
         title: `${'★'.repeat(stars)}${'☆'.repeat(5-stars)} ${temp.title}`,
         desc: `${temp.desc} 成功率受【${ATTR_MAP[attr]}】影响。推荐门槛：${Math.floor(difficulty)}`,
         stars, reqAttr: attr, difficulty, expReward, completed: false
       });
    });

    return { dailyTasks: tasks.sort((a,b)=>b.stars - a.stars) };
  }),

  completeTask: (taskId) => set((state) => {
    const tasks = state.dailyTasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
    return { dailyTasks: tasks };
  }),
  
  setTitle: (title) => set((state) => {
    const p = { ...state.player, title };
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),
  
  addActivity: (points) => {
    let upgradedTitle = null;
    let oldTitle = '';
    set((state) => {
       const p = { ...state.player };
       p.dailyActivity = (p.dailyActivity || 0) + points;
       oldTitle = p.title || '摸鱼小虾';
       let nTitle = oldTitle;
       
       const act = p.dailyActivity;
       if (act >= 250) nTitle = '肝帝真仙';
       else if (act >= 200) nTitle = '武林卷王';
       else if (act >= 120) nTitle = '江湖劳模';
       else if (act >= 60) nTitle = '勤勉游侠';
       else if (act >= 20) nTitle = '初出茅庐';
       else nTitle = '摸鱼小虾';
       
       const titleRanks = {
          '摸鱼小虾': 1, '初出茅庐': 2, '勤勉游侠': 3, 
          '江湖劳模': 4, '武林卷王': 5, '肝帝真仙': 6
       };
       const oldRank = titleRanks[oldTitle];
       const newRank = titleRanks[nTitle] || 1;
       
       if (nTitle !== oldTitle) {
          p.title = nTitle;
          if (oldRank !== undefined && newRank > oldRank) {
             upgradedTitle = nTitle;
          }
       }
       
       if (socket) socket.emit('update_player', p);
       return { player: p };
    });
    if (upgradedTitle) {
       // Return the upgrade so the frontend can optionally alert it
       return upgradedTitle;
    }
  },
  
  learnSkill: (skillId) => set((state) => {
    if (!state.player.skills.includes(skillId)) {
      const p = { ...state.player, skills: [...state.player.skills, skillId] };
      const skillInfo = getSkillInfo(skillId);
      if (skillInfo && !p.equippedSkills[skillInfo.type]) {
         p.equippedSkills = { ...p.equippedSkills, [skillInfo.type]: skillId };
      }
      if (socket) socket.emit('update_player', p);
      return { player: p };
    }
    return state;
  }),

  incrementSkillMastery: (skillIds) => set((state) => {
    const p = { ...state.player };
    const newMastery = { ...(p.skillMastery || {}) };
    skillIds.forEach(sId => {
       if (sId) {
          const baseId = sId.includes('_deg') ? sId.split('_deg')[0] : sId;
          newMastery[baseId] = (newMastery[baseId] || 0) + 1;
       }
    });
    p.skillMastery = newMastery;
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  listAuction: (type, itemToTrade, itemName, startPrice) => {
      if (socket) socket.emit('list_auction', { type, itemToTrade, itemName, startPrice, sellerName: get().player.name });
  },
  placeBid: (auctionId, bidPrice) => {
      if (socket) socket.emit('place_bid', { auctionId, bidderName: get().player.name, bidPrice });
  },
  devGrantPoints: (type, amount) => set((state) => {
    let p = { ...state.player };
    if (type === 'freePoints') {
      p.freePoints = (p.freePoints || 0) + amount;
    } else if (type === 'encountersToday') {
      p.encountersToday = Math.max(0, (p.encountersToday || 0) - amount);
    } else if (type === 'silver') {
      p.silver = (p.silver || 0) + amount;
    } else if (type === 'allAttrs') {
      p.attributes = {
         con: (p.attributes.con || 0) + amount,
         str: (p.attributes.str || 0) + amount,
         int: (p.attributes.int || 0) + amount,
         agi: (p.attributes.agi || 0) + amount,
         luk: (p.attributes.luk || 0) + amount,
      };
      p.maxHp = Math.min(7000, 100 + p.level * 15 + p.attributes.con * 10);
      p.hp = p.maxHp;
    }
    if (socket) socket.emit('update_player', p);
    return { player: p };
  }),

  fetchRealmGhosts: () => {
      if (socket) socket.emit('get_realm_ghosts');
  },
  deployGhostRemnant: (layerIndex, message) => {
      if (socket) socket.emit('deploy_ghost_remnant', { layerIndex, message });
  },
  ghostWinDividend: (ghostId) => {
      if (socket) socket.emit('ghost_win_dividend', { ghostId });
  },
  defeatRealmGhost: (ghostId) => {
      if (socket) socket.emit('defeat_realm_ghost', { ghostId });
  },

  fetchWorldBossState: () => {
      if (socket) socket.emit('get_world_boss_state');
  },
  signupWorldBoss: () => {
      if (socket) socket.emit('signup_world_boss');
  },
  challengeWorldBoss: (payload) => {
      if (socket) {
         if (typeof payload === 'object') {
            socket.emit('challenge_world_boss', payload);
         } else {
            socket.emit('challenge_world_boss', { damage: payload });
         }
      }
  },
  bidWorldBossAuction: (price) => {
      if (socket) socket.emit('bid_world_boss_auction', { price });
  },
  devControlWorldBoss: (action) => {
      if (socket) socket.emit('dev_control_world_boss', { action });
  },

  challengePlayer: (targetId) => { if (socket) socket.emit('challenge', targetId); },
  sendBattleAction: (roomId, actionData) => { if (socket) socket.emit('battle_action', { roomId, actionData }); },
  exitBattle: () => set({ battleState: { inBattle: false, roomId: null, p1: null, p2: null, logs: [], winner: null } })
}));
export const getSocket = () => socket;
