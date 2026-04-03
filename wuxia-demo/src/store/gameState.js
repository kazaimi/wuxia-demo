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
  { id: 't1', name: '木质佛珠', rarity: '普通', attrs: { con: 3, int: 2 }, effect: 'ningShen', desc: '【宁神】开局获最大血量5%护盾' },
  { id: 't2', name: '粗布披风', rarity: '普通', attrs: { agi: 5 }, effect: 'qingQiao', desc: '【轻巧】受到伤害减少30点' },
  { id: 't3', name: '生锈铁剑', rarity: '普通', attrs: { str: 5 }, effect: 'poShang', desc: '【破伤】普攻额外50点真伤' },
  { id: 't4', name: '白玉短笛', rarity: '稀有', attrs: { int: 10, agi: 5 }, effect: 'huiChun', desc: '【回春】造成伤害时恢复自身最大生命2%' },
  { id: 't5', name: '判官双笔', rarity: '稀有', attrs: { str: 8, agi: 7 }, effect: 'dianXue', desc: '【点穴】攻击10%封穴目标' },
  { id: 't6', name: '冰魄银针', rarity: '稀有', attrs: { agi: 10, luk: 5 }, effect: 'juDu', desc: '【剧毒】攻击15%使目标中毒(每回合扣3%HP，3回合)' },
  { id: 't7', name: '打狗棒', rarity: '史诗', attrs: { str: 15, agi: 15 }, effect: 'daGou', desc: '【打狗】攻击15%概率击晕目标' },
  { id: 't8', name: '金蛇剑', rarity: '史诗', attrs: { str: 15, luk: 15 }, effect: 'jinShe', desc: '【金蛇】20%额外连击，免疫中毒' },
  { id: 't9', name: '软猬甲', rarity: '史诗', attrs: { con: 25, str: 5 }, effect: 'ruanWei', desc: '【荆棘】反伤15%，免疫击晕与中毒' },
  { id: 't10', name: '倚天剑', rarity: '传说', attrs: { str: 25, agi: 15 }, effect: 'yiTian', desc: '【倚天】攻击附带15%吸血，伤害提升20%' },
  { id: 't11', name: '屠龙刀', rarity: '传说', attrs: { str: 30, con: 10 }, effect: 'tuLong', desc: '【破釜沉舟】血量低于40%时提升50%伤害，减免20%受伤' },
  { id: 't12', name: '玄铁重剑', rarity: '传说', attrs: { str: 40, agi: -10 }, effect: 'xuanTie', desc: '【重剑】攻击必中，20%概率对敌造成内伤' },
  { id: 't13', name: '圣火令', rarity: '神话', attrs: { int: 30, agi: 30 }, effect: 'shengHuo', desc: '【威压】开局沉默对手2回合，攻击附带5%当前HP伤害' },
  { id: 't14', name: '绝世好剑', rarity: '神话', attrs: { con: 15, str: 15, int: 15, agi: 15, luk: 15 }, effect: 'jiMie', desc: '【寂灭】5%概率直接削减目标50%HP，免疫所有异常' },
  { id: 't15', name: '达摩舍利', rarity: '神话', attrs: { con: 30, luk: 30 }, effect: 'niePan', desc: '【涅槃】死亡时保留1血并恢复50%HP(1场1次)' },
];

export const ATTR_MAP = { con: '体质', str: '力量', int: '智慧', agi: '敏捷', luk: '幸运' };

let socket = null;

const getNextExp = (level) => Math.floor(100 + level * 50 + Math.pow(level, 1.8) * 15);
const calculateMaxHp = (level, conAttr) => Math.min(7000, 100 + level * 15 + (conAttr || 0) * 10);

export const useGameStore = create((set, get) => ({
  hasCreatedRole: false,
  socketConnected: false,
  loginChecked: false, 
  
  player: {
    name: '', title: '', level: 1, exp: 0, maxExp: getNextExp(1), freePoints: 0, taskCount: 0, encountersToday: 0, lastTaskDate: new Date().toDateString(),
    hp: calculateMaxHp(1, 0), maxHp: calculateMaxHp(1, 0),
    attributes: { con: 0, str: 0, int: 0, agi: 0, luk: 0 },
    skills: ['s1'], 
    treasures: [],
    equippedSkills: { inner: null, outer: 's1', motion: null, ultimate: null },
    equippedTreasure: null
  },

  onlinePlayers: [],
  battleState: { inBattle: false, roomId: null, p1: null, p2: null, logs: [], winner: null },
  dailyTasks: [],

  initSocket: () => {
    if (!socket) {
      socket = io(`http://${window.location.hostname}:3000`);
      socket.on('connect', () => {
        set({ socketConnected: true });
        const savedName = localStorage.getItem('wuxia_username');
        if (savedName) {
           socket.emit('player_login', savedName);
        } else {
           set({ loginChecked: true });
        }
      });
      
      socket.on('login_success', (playerData) => {
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
         if (!playerData.equippedSkills) playerData.equippedSkills = { inner: null, outer: 's1', motion: null, ultimate: null };
         
         const today = new Date().toDateString();
         if (playerData.lastTaskDate !== today) {
            playerData.taskCount = 0;
            playerData.encountersToday = 0;
            playerData.lastTaskDate = today;
            socket.emit('update_player', playerData);
         }
         
         set({ hasCreatedRole: true, player: playerData, loginChecked: true });
      });
      
      socket.on('login_failed', () => {
         localStorage.removeItem('wuxia_username');
         set({ hasCreatedRole: false, loginChecked: true });
      });

      socket.on('online_players', (playersList) => set((state) => {
        const myPlayer = playersList.find(p => p.name === state.player.name);
        return myPlayer ? { onlinePlayers: playersList, player: { ...state.player, rankIndex: myPlayer.rankIndex } } : { onlinePlayers: playersList };
      }));
      socket.on('battle_start', (data) => set({ battleState: { inBattle: true, roomId: data.roomId, p1: data.p1, p2: data.p2, logs: data.logs, winner: null } }));
      socket.on('battle_log', (actionData) => set(state => ({
        battleState: {
           ...state.battleState, p1: actionData.p1 || state.battleState.p1, p2: actionData.p2 || state.battleState.p2,
           logs: [...state.battleState.logs, actionData.log], winner: actionData.winner || state.battleState.winner
        }
      })));
      socket.on('system_reward', ({ skillId }) => {
         const sk = SKILLS_DB.find(s=>s.id === skillId);
         if(sk) {
            get().learnSkill(skillId);
            alert(`[大奇遇] 您在挑战中，爆出了绝学【${sk.name}】！`);
         }
      });
    }
  },

  createRole: (name, attributes) => set((state) => {
    const maxHp = calculateMaxHp(1, attributes.con);
    const newPlayer = { ...state.player, name, attributes, hp: maxHp, maxHp, maxExp: getNextExp(1) };
    localStorage.setItem('wuxia_username', name);
    if (socket) socket.emit('player_join', newPlayer);
    return { hasCreatedRole: true, player: newPlayer };
  }),

  manualLogin: (name) => {
     localStorage.setItem('wuxia_username', name);
     if (socket) socket.emit('player_login', name);
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
        const p = { ...state.player, taskCount: 0, encountersToday: 0, lastTaskDate: today };
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

  equipSkill: (type, skillId) => set((state) => {
     const p = { ...state.player, equippedSkills: { ...state.player.equippedSkills, [type]: skillId } };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  equipTreasure: (tId) => set((state) => {
     const p = { ...state.player, equippedTreasure: tId };
     if (socket) socket.emit('update_player', p);
     return { player: p };
  }),

  gainTreasure: (tId) => set((state) => {
     if (!state.player.treasures.includes(tId)) {
        const p = { ...state.player, treasures: [...state.player.treasures, tId] };
        if (!p.equippedTreasure) p.equippedTreasure = tId;
        if (socket) socket.emit('update_player', p);
        return { player: p };
     }
     return state;
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

  resetPoints: () => set((state) => {
    const p = { ...state.player };
    const totalPoints = INITIAL_POINTS + (p.level - 1) * POINTS_PER_LEVEL;
    p.freePoints = totalPoints;
    p.attributes = { con: 0, str: 0, int: 0, agi: 0, luk: 0 };
    p.maxHp = calculateMaxHp(p.level, 0);
    p.hp = p.maxHp;
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
    for(let i=0; i<8; i++) {
       const r = Math.random();
       let stars = 1;
       if (r > 0.95) stars = 5;
       else if (r > 0.75) stars = 4;
       else if (r > 0.4) stars = 3;
       else if (r > 0.15) stars = 2;
       
       const attr = attrs[Math.floor(Math.random()*attrs.length)];
       const difficulty = state.player.level * 2.0 + stars * 3;
       const expReward = Math.floor(stars * 20 + state.player.level * Math.random() * 15);
       
       tasks.push({
         id: 'task_' + Math.random().toString(36).substr(2, 6),
         title: `${'★'.repeat(stars)}${'☆'.repeat(5-stars)} ${stars>=4?'血印':'飞鸽'}委托`,
         desc: `成功率受【${ATTR_MAP[attr]}】影响。推荐门槛：${Math.floor(difficulty)}`,
         stars, reqAttr: attr, difficulty, expReward, completed: false
       });
    }
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
  
  learnSkill: (skillId) => set((state) => {
    if (!state.player.skills.includes(skillId)) {
      const p = { ...state.player, skills: [...state.player.skills, skillId] };
      const skillInfo = SKILLS_DB.find(s => s.id === skillId);
      if (skillInfo && !p.equippedSkills[skillInfo.type]) {
         p.equippedSkills = { ...p.equippedSkills, [skillInfo.type]: skillId };
      }
      if (socket) socket.emit('update_player', p);
      return { player: p };
    }
    return state;
  }),

  challengePlayer: (targetId) => { if (socket) socket.emit('challenge', targetId); },
  sendBattleAction: (roomId, actionData) => { if (socket) socket.emit('battle_action', { roomId, actionData }); },
  exitBattle: () => set({ battleState: { inBattle: false, roomId: null, p1: null, p2: null, logs: [], winner: null } })
}));
