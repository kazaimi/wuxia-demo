import { create } from 'zustand';
import { io } from 'socket.io-client';

export const INITIAL_POINTS = 10;
export const POINTS_PER_LEVEL = 3;

export const SKILLS_DB = [
  { id: 's1', name: '基本拳脚', type: 'attack', power: 10, reqLvl: 1, reqStr: 0, desc: '入门招式。' },
  { id: 's2', name: '吐纳法', type: 'heal', power: 20, reqLvl: 1, reqInt: 0, desc: '基础内功。' },
  { id: 's3', name: '铁砂掌', type: 'attack', power: 35, reqLvl: 3, reqStr: 5, desc: '掌力刚猛。' },
  { id: 's4', name: '凌波微步', type: 'buff', power: 0, reqLvl: 5, reqAgi: 8, desc: '身法诡异。' },
  { id: 's5', name: '九阳神功', type: 'buff', power: 60, reqLvl: 8, reqInt: 15, desc: '生生不息。' },
  { id: 's_kuihua', name: '葵花宝典', type: 'attack', power: 150, reqLvl: 10, reqAgi: 20, desc: '唯快不破。' },
  { id: 's_xianglong', name: '降龙十八掌', type: 'attack', power: 120, reqLvl: 10, reqStr: 15, desc: '爆炎猛击。' },
  { id: 's_dugu', name: '独孤九剑', type: 'attack', power: 160, reqLvl: 15, reqStr: 30, desc: '破尽天下。' },
  { id: 's_taiji', name: '太极拳', type: 'attack', power: 140, reqLvl: 12, reqInt: 25, desc: '以柔克刚。' },
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
    name: '', title: '', level: 1, exp: 0, maxExp: getNextExp(1), freePoints: 0, taskCount: 0, lastTaskDate: new Date().toDateString(),
    hp: calculateMaxHp(1, 0), maxHp: calculateMaxHp(1, 0),
    attributes: { con: 0, str: 0, int: 0, agi: 0, luk: 0 },
    skills: ['s1'], equippedSkills: ['s1']
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
         
         const today = new Date().toDateString();
         if (playerData.lastTaskDate !== today) {
            playerData.taskCount = 0;
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
        const p = { ...state.player, taskCount: 0, lastTaskDate: today };
        if (socket) socket.emit('update_player', p);
        return { player: p, dailyTasks: [] };
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

  allocatePoint: (attrKey) => set((state) => {
    let p = { ...state.player, attributes: { ...state.player.attributes } };
    if (p.freePoints > 0) {
      p.freePoints -= 1;
      p.attributes[attrKey] += 1;
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
      if (p.equippedSkills.length < 3) p.equippedSkills = [...p.equippedSkills, skillId];
      if (socket) socket.emit('update_player', p);
      return { player: p };
    }
    return state;
  }),

  challengePlayer: (targetId) => { if (socket) socket.emit('challenge', targetId); },
  sendBattleAction: (roomId, actionData) => { if (socket) socket.emit('battle_action', { roomId, actionData }); },
  exitBattle: () => set({ battleState: { inBattle: false, roomId: null, p1: null, p2: null, logs: [], winner: null } })
}));
