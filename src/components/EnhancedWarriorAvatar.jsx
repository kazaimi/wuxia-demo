import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TREASURES_DB } from '../store/gameState';

// 60位固定NPC的头像图片键值映射
export const NPC_NAME_TO_KEY = {
  '扫地僧': 'saodiseng', '东方不败': 'dongfang', '乔峰': 'qiaofeng', '萧峰': 'qiaofeng',
  '虚竹': 'xuzhu', '段誉': 'duanyu', '无崖子': 'wuyazi', '张三丰': 'zhangsanfeng',
  '张无忌': 'zhangwuji', '独孤求败': 'duguqiubai', '王重阳': 'wangchongyang',
  '周伯通': 'zhoubotong', '洪七公': 'hongqigong', '金轮法王': 'jinlunfawang',
  '郭靖': 'guojing', '黄药师': 'huangyaoshi', '欧阳锋': 'ouyangfeng',
  '令狐冲': 'linghuchong', '风清扬': 'fengqingyang', '任我行': 'renwoxing',
  '邀月': 'yaoyue', '燕南天': 'yannantian', '西门吹雪': 'ximenchuixue',
  '叶孤城': 'yegucheng', '绝无神': 'juewushen', '雄霸': 'xiongba',
  '步惊云': 'bujingyun', '聂风': 'niefeng', '天山童姥': 'tianshantonglao',
  '李寻欢': 'lixunhuan', '阿飞': 'afei', '左冷禅': 'zuolengchan',
  '岳不群': 'yuebuqun', '丁春秋': 'dingchunqiu', '鸠摩智': 'jiumozhi',
  '游坦之': 'youtanzi', '慕容复': 'murongfu', '段延庆': 'duanyanqing',
  '天机老人': 'tianjilaoren', '楚留香': 'chuliuxiang', '陆小凤': 'luxiaofeng',
  '胡铁花': 'hutiehua', '花无缺': 'huawuque', '小鱼儿': 'xiaoyuer',
  '成昆': 'chengkun', '谢逊': 'xiexun', '灭绝师太': 'miejue',
  '林平之': 'linpingzhi', '陈家洛': 'chenjialuo', '袁承志': 'yuanchengzhi',
  '狄云': 'diyun', '石破天': 'shipotian', '丁典': 'dingdian',
  '白自在': 'baizizai', '胡一刀': 'huyidao', '玄慈大师': 'xuancidashi',
  '神雕大侠': 'shendiaodaxia', '玉面飞龙': 'yumianfeilong', '血刀老祖': 'xuedaolaozu',
  '苗人凤': 'miaorenfeng', '四大恶人': 'sidaeren'
};

// 根据名字判断性别
const guessGenderByName = (name) => {
  const femaleEndings = ['月', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '仙', '姬', '娘', '姑', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊'];
  const lastChar = name?.slice(-1) || '';
  if (femaleEndings.includes(lastChar)) return 'female';

  const femaleKeywords = ['邀月', '灭绝', '童姥', '小龙女', '黄蓉', '赵敏', '周芷若', '王语嫣', '阿朱', '阿紫', '任盈盈', '岳灵珊', '李莫愁', '郭芙', '郭襄', '穆念慈'];
  for (const keyword of femaleKeywords) {
    if (name?.includes(keyword)) return 'female';
  }
  return 'male';
};

// 预设性格及对话数据库
const DEFAULT_DIALOGUES = {
  heroic: { // 刚毅/豪迈
    attack: ['看招！领教阁下高招！', '豪气吞吐，接我一掌！', '为国为民，义不容辞！', '接我这招开山裂石之劲！'],
    hit: ['唔！痛快，再来！', '好武功！但还不足以击倒我！', '这点皮外伤，何足挂齿！'],
    dodge: ['承让了！', '好险，好身手！', '身随意动，避其锋芒！'],
    heal: ['真气运转，伤势无碍！', '多谢，气血复苏了！', '浩然正气，生生不息！'],
    debuff: ['邪魔外道，岂能屈我！', '屏息凝神，固守本源！', '妖法邪术，终难成气候！'],
    dead: ['侠之大者……死而无憾！', '江湖路远……诸位保重！', '吾辈武人，马革裹尸，值了！'],
  },
  arrogant: { // 傲慢/霸道
    attack: ['顺我者昌，逆我者亡！', '萤烛之光，也敢与日月争辉？', '蝼蚁，见识一下本座的真正实力！', '这一击，便叫你灰飞烟灭！'],
    hit: ['竟敢伤本座？找死！', '唔，你竟有这等蛮力？', '放肆！本座要你十倍奉还！'],
    dodge: ['愚蠢，连本座的衣角都碰不到！', '不自量力，徒劳挣扎！', '本座身法如风，你打得中谁？'],
    heal: ['神功护体，伤势瞬息即愈！', '本座的无上修为，岂是你能揣度？', '重回巅峰，受死吧！'],
    debuff: ['下三滥的手段，也想困住本座？', '哼，垂死挣扎，微末伎俩！'],
    dead: ['本座……竟然会败给你这等庸才？', '这不可能！我怎会败！', '日月无光……本座恨啊！'],
  },
  mocking: { // 嘲讽/嬉皮/浪子
    attack: ['哈哈，看刀看剑！', '陪你玩玩，别太当真啊！', '接招，小心你那英俊的脸蛋儿！', '嘿，这招你接得住吗？'],
    hit: ['哎哟，好疼！你下手真重啊！', '啧啧，差一点就被你打趴下了。', '哎呀，大意了，大意了！'],
    dodge: ['打不着，打不着！哈哈！', '你这招是在劈柴吗？', '哎呀，偏了偏了！往哪儿打呢？'],
    heal: ['呼，活过来了，再战三百回合！', '舒服！又可以继续陪你玩了。', '嗑点灵药，满血复活！'],
    debuff: ['哎呀，手脚软了，你下毒了？', '卑鄙啊，居然搞偷袭！', '点我的穴？真是不好玩。'],
    dead: ['今天出门没看黄历，失算失算……', '不行了，老子得先睡一觉……', '江湖险恶，我先撤了……'],
  },
  cold: { // 冷酷/剑神
    attack: ['剑出，必见血。', '你出招吧。', '一击，足矣。', '死。'],
    hit: ['哼。', '见血了。', '力度不够。'],
    dodge: ['差之毫厘。', '太慢。', '虚招而已。'],
    heal: ['伤口凝结了。', '气息已平。', '无碍。'],
    debuff: ['外物岂能扰我剑心。', '静。', '无聊的伎俩。'],
    dead: ['剑断……人亡。', '朝闻道，夕死可矣……', '好一记绝招……'],
  },
  sinister: { // 邪毒/阴险
    attack: ['桀桀桀，受死吧！', '让你尝尝万毒噬骨的滋味！', '今天就是你的忌日！', '乖乖化为本座的养料吧！'],
    hit: ['可恶的家伙！', '哼，此仇必报！', '你会死得很惨，我发誓！'],
    dodge: ['滑溜的小鬼！', '桀桀，躲得过本座的爪锋吗？', '白费力气！'],
    heal: ['邪功反哺，气血回流！', '哈哈，伤势全好了，怕了吧！', '活血吞噬，重获新生！'],
    debuff: ['你敢对我用毒？', '卑鄙小人，纳命来！', '作茧自缚的蠢货！'],
    dead: ['本座做鬼也不会放过你！', '呃啊……我不甘心……', '大业未成……我不甘！'],
  },
  charming: { // 邪魅/妖娆 (女性专属)
    attack: ['咯咯咯，看招！心疼的话可要躲好了哦~', '长得这般俊俏，下手可不能轻呢。', '乖，把你的命……交给我吧。', '心疼了吗？那可要看好了！'],
    hit: ['哎呀，好狠的心，真把人家打疼了~', '咯咯，有意思……再用力些？', '哼，弄疼了本宫，可是要用命来偿的！'],
    dodge: ['小冤家，往哪儿打呢？', '抓不着，真是个心急的人儿~', '咯咯，连人家的衣角都碰不到呢。'],
    heal: ['真气温热，舒服得让人骨头都酥了呢。', '这回，人家的气血可比你更旺盛了哦。', '奴家伤势已愈，你可要当心了~'],
    debuff: ['下三滥的药，对本宫可没用。', '下毒点穴？你这小坏蛋手段倒挺多。', '讨厌，这股气息真叫人好生不快。'],
    dead: ['真是不解风情……人家这回认输了……', '能死在你的怀里，倒也不算坏……', '奴家这娇弱的身子……便宜你了……'],
  },
  timid: { // 胆怯/求饶 (男性搞笑兜底)
    attack: ['别过来啊！吃我一招！', '这可是你逼我的！', '看招，快闪开！别撞上了！'],
    hit: ['痛死我了！手下留情啊！', '别打了别打了，我认输行不行？', '救命啊！要打死人啦！'],
    dodge: ['哇！好险好险，差一点就没命了！', '菩萨保佑，躲过去了！', '别砍我，我只是个路过的！'],
    heal: ['呼，幸好我有灵丹妙药……', '别急别急，让我喘口气！', '保住小命要紧，赶紧疗伤！'],
    debuff: ['手脚不听使唤了！救命！', '我的内力怎么使不出来了？这可怎么整！'],
    dead: ['英年早逝啊……呜呜……', '好汉饶命……呃……', '我还有八十岁老母……'],
  }
};

// 根据大侠名字、配置与性别获取确定性格
const getPersonalityByName = (name, customConfig, gender) => {
  if (customConfig?.personality) return customConfig.personality;
  if (!name) return 'heroic';
  
  // 名字中含关键字则强制指定
  if (name.includes('魔') || name.includes('邪') || name.includes('毒') || name.includes('凶')) return 'sinister';
  if (name.includes('僧') || name.includes('尼') || name.includes('道')) return 'heroic';
  if (name.includes('盗') || name.includes('客') || name.includes('酒')) return 'mocking';
  if (name.includes('姬') || name.includes('仙') || name.includes('冷')) return 'cold';

  // 根据性别匹配性格列表
  const femalePersonalities = ['heroic', 'arrogant', 'mocking', 'cold', 'sinister', 'charming'];
  const malePersonalities = ['heroic', 'arrogant', 'mocking', 'cold', 'sinister', 'timid'];
  const personalities = gender === 'female' ? femalePersonalities : malePersonalities;

  // 字符和哈希，实现名字的确定性映射
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return personalities[sum % personalities.length];
};

// 增强版战斗角色卡片 - 支持状态差分和动效
const EnhancedWarriorAvatar = ({
  player,
  isLeft,
  isAttacking = false,
  isHit = false,
  isDodging = false,
  isHealing = false,
  isBuffing = false,
  isDebuffing = false,
  isDead = false,
  damageAmount = null,
  healAmount = null,
  onEffectComplete,
  effectType = null, // 接收当前战斗动效类型以计算弹道命中延迟
}) => {
  const [effectState, setEffectState] = useState('idle');
  const [showDamage, setShowDamage] = useState(false);
  const [showHeal, setShowHeal] = useState(false);
  
  // 图片资源和降级容错状态
  const [imgSrc, setImgSrc] = useState('');
  const [fallbackActive, setFallbackActive] = useState(false);
  
  const prevHpRef = useRef(player?.hp);
  const hasTriggeredDeadRef = useRef(false);

  // 气泡对话状态
  const [bubbleText, setBubbleText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const bubbleTimerRef = useRef(null);
  const lastDialogueTimeRef = useRef(0);

  // 1. NPC 特殊配置彩蛋识别
  const npcConfig = useMemo(() => {
    if (!player?.name) return null;
    for (const key of Object.keys(NPC_SPECIAL_CONFIGS)) {
      if (player.name.includes(key)) {
        return NPC_SPECIAL_CONFIGS[key];
      }
    }
    return null;
  }, [player?.name]);

  const gender = useMemo(() => guessGenderByName(player?.name), [player?.name]);
  const isFemale = gender === 'female';

  const personality = useMemo(() => getPersonalityByName(player?.name, npcConfig, gender), [player?.name, npcConfig, gender]);

  const triggerDialogue = (eventKey) => {
    // 角色阵亡后，除阵亡词条外不再说话
    if (isDead && eventKey !== 'dead') return;

    // 非阵亡词条增加触发几率限制 (25%) 以及 4秒的冷却时间
    const now = Date.now();
    if (eventKey !== 'dead') {
      if (now - lastDialogueTimeRef.current < 4000) return;
      if (Math.random() > 0.25) return;
    }
    lastDialogueTimeRef.current = now;

    let quotesList = [];
    if (npcConfig?.dialogues && npcConfig.dialogues[eventKey]) {
      quotesList = npcConfig.dialogues[eventKey];
    } else if (DEFAULT_DIALOGUES[personality] && DEFAULT_DIALOGUES[personality][eventKey]) {
      quotesList = DEFAULT_DIALOGUES[personality][eventKey];
    }

    if (quotesList && quotesList.length > 0) {
      const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
      setBubbleText(randomQuote);
      setShowBubble(true);

      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
      bubbleTimerRef.current = setTimeout(() => {
        setShowBubble(false);
      }, 1800);
    }
  };

  useEffect(() => {
    if (!isDead) {
      hasTriggeredDeadRef.current = false;
    }
  }, [isDead]);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
    };
  }, []);

  // 设置图片路径加载
  useEffect(() => {
    let key = '';
    if (player?.name) {
      for (const k of Object.keys(NPC_NAME_TO_KEY)) {
        if (player.name.includes(k)) {
          key = NPC_NAME_TO_KEY[k];
          break;
        }
      }
    }
    if (key) {
      setImgSrc(`/npc_${key}.webp`);
    } else {
      setImgSrc(isFemale ? '/wuxia_female_hero.webp' : '/wuxia_male_hero.webp');
    }
    setFallbackActive(false);
  }, [player?.name, isFemale]);

  const handleImgError = () => {
    // 专属NPC精绘加载报错（尚未生成），自动退回使用通用立绘，并激活偏色着色
    const defaultSrc = isFemale ? '/wuxia_female_hero.webp' : '/wuxia_male_hero.webp';
    if (imgSrc !== defaultSrc) {
      setImgSrc(defaultSrc);
      setFallbackActive(true);
    }
  };

  // 检测气血变化触发动效
  useEffect(() => {
    if (prevHpRef.current && player?.hp) {
      const hpDiff = player.hp - prevHpRef.current;
      if (hpDiff < 0) {
        // 根据不同招式的弹道飞行动效延迟卡牌受击反应，达到声画完美同步
        let delay = 0;
        if (effectType === 'ultimateBurst') {
          delay = 580;
        } else if (effectType === 'fistPunch') {
          delay = 400;
        }

        const triggerHit = () => {
          setEffectState('hit');
          setShowDamage(true);
          triggerDialogue('hit');
          setTimeout(() => {
            setEffectState('idle');
            setShowDamage(false);
            if (onEffectComplete) onEffectComplete();
          }, 450);
        };

        if (delay > 0) {
          const timer = setTimeout(triggerHit, delay);
          return () => clearTimeout(timer);
        } else {
          triggerHit();
        }
      } else if (hpDiff > 0) {
        setEffectState('heal');
        setShowHeal(true);
        triggerDialogue('heal');
        setTimeout(() => {
          setEffectState('idle');
          setShowHeal(false);
          if (onEffectComplete) onEffectComplete();
        }, 600);
      }
    }
    prevHpRef.current = player?.hp;
  }, [player?.hp, onEffectComplete, effectType]);

  // 外部触发的动效
  useEffect(() => {
    if (isAttacking) {
      setEffectState('attack');
      triggerDialogue('attack');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isHit) {
      let delay = 0;
      if (effectType === 'ultimateBurst') {
        delay = 580;
      } else if (effectType === 'fistPunch') {
        delay = 400;
      }

      const triggerHit = () => {
        setEffectState('hit');
        setShowDamage(true);
        triggerDialogue('hit');
        setTimeout(() => {
          setEffectState('idle');
          setShowDamage(false);
        }, 400);
      };

      if (delay > 0) {
        const timer = setTimeout(triggerHit, delay);
        return () => clearTimeout(timer);
      } else {
        triggerHit();
      }
    }
    if (isDodging) {
      setEffectState('dodge');
      triggerDialogue('dodge');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isHealing) {
      setEffectState('heal');
      setShowHeal(true);
      triggerDialogue('heal');
      setTimeout(() => {
        setEffectState('idle');
        setShowHeal(false);
      }, 600);
    }
    if (isBuffing) {
      setEffectState('buff');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isDebuffing) {
      setEffectState('debuff');
      triggerDialogue('debuff');
      setTimeout(() => setEffectState('idle'), 400);
    }
    if (isDead) {
      setEffectState('dead');
      if (!hasTriggeredDeadRef.current) {
        triggerDialogue('dead');
        hasTriggeredDeadRef.current = true;
      }
    } else if (effectState === 'dead') {
      setEffectState('idle');
    }
  }, [isAttacking, isHit, isDodging, isHealing, isBuffing, isDebuffing, isDead, effectType, effectState]);

  // 武器与宝具
  const treasure = TREASURES_DB?.find(t => t.id === player?.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  const getWeaponInfo = () => {
    if (npcConfig && npcConfig.weaponName) {
      return {
        name: npcConfig.weaponName,
        icon: npcConfig.weaponIcon,
        color: npcConfig.weaponColor
      };
    }
    const weapons = {
      'yiTian': { name: '倚天剑', icon: '🗡️', color: '#c9a227' },
      'tuLong': { name: '屠龙刀', icon: '⚔️', color: '#8b0000' },
      'xuanTie': { name: '玄铁重剑', icon: '🗡️', color: '#4a5568' },
      'jinShe': { name: '金蛇剑', icon: '🐍', color: '#d4af37' },
      'daGou': { name: '打狗棒', icon: '🪄', color: '#8b4513' },
      'dianXue': { name: '判官笔', icon: '✒️', color: '#4a5568' },
      'shengHuo': { name: '圣火令', icon: '🔥', color: '#dc2626' },
      'jiMie': { name: '绝世好剑', icon: '⚔️', color: '#6366f1' },
      'niePan': { name: '达摩舍利', icon: '📿', color: '#fbbf24' },
      'ruanWei': { name: '软猬甲', icon: '🛡️', color: '#78350f' },
    };
    return weapons[treasureEffect] || { name: '拳脚', icon: '👊', color: '#d4af37' };
  };

  const weapon = getWeaponInfo();

  // 等级决定边框和背景颜色
  const getLevelStyle = () => {
    if (npcConfig) {
      return {
        border: npcConfig.color,
        bg: 'linear-gradient(180deg, #1a1515 0%, #0d0606 100%)',
        rank: '宗师'
      };
    }
    const level = player?.level || 1;
    if (level >= 90) return { border: '#ffd700', bg: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', rank: '神话' };
    if (level >= 70) return { border: '#a855f7', bg: 'linear-gradient(180deg, #1e1a3d 0%, #0f0d1f 100%)', rank: '传说' };
    if (level >= 50) return { border: '#f97316', bg: 'linear-gradient(180deg, #2d1f1a 0%, #1a120d 100%)', rank: '史诗' };
    if (level >= 30) return { border: '#3b82f6', bg: 'linear-gradient(180deg, #1a2d3d 0%, #0d1a24 100%)', rank: '稀有' };
    if (level >= 15) return { border: '#22c55e', bg: 'linear-gradient(180deg, #1a2d24 0%, #0d1a12 100%)', rank: '优秀' };
    return { border: '#6b7280', bg: 'linear-gradient(180deg, #1f1f1f 0%, #0f0f0f 100%)', rank: '普通' };
  };

  const levelStyle = getLevelStyle();

  // 内功气场
  const innerSkill = player?.equippedSkills?.inner;
  let auraStyle = {};
  if (innerSkill === 's_yijin') auraStyle = { shadow: '0 0 30px rgba(194, 157, 56, 0.5)', glow: 'rgba(194, 157, 56, 0.3)' };
  else if (innerSkill === 's5') auraStyle = { shadow: '0 0 30px rgba(220, 38, 38, 0.5)', glow: 'rgba(220, 38, 38, 0.3)' };
  else if (innerSkill === 's_xixing') auraStyle = { shadow: '0 0 30px rgba(139, 92, 246, 0.5)', glow: 'rgba(139, 92, 246, 0.3)' };
  else if (innerSkill === 's_shihou') auraStyle = { shadow: '0 0 30px rgba(234, 88, 12, 0.5)', glow: 'rgba(234, 88, 12, 0.3)' };
  else auraStyle = { shadow: '0 0 20px rgba(212, 175, 55, 0.3)', glow: 'rgba(212, 175, 55, 0.2)' };

  // 气血比例
  const hpRatio = (player?.hp || 0) / (player?.maxHp || 7000);

  // 2. 程序化特征属性控制
  const getProceduralStyles = () => {
    const attrs = player?.attributes || { con: 10, str: 10, agi: 10 };
    const level = player?.level || 1;

    // 内功偏色滤镜
    let colorFilter = '';
    if (fallbackActive && npcConfig) {
      colorFilter = npcConfig.filter;
    } else {
      if (innerSkill === 's_yijin') {
        colorFilter = 'hue-rotate(25deg) saturate(1.4) contrast(1.1) brightness(1.05)';
      } else if (innerSkill === 's5') {
        colorFilter = 'hue-rotate(-15deg) saturate(1.5) contrast(1.1)';
      } else if (innerSkill === 's_xixing') {
        colorFilter = 'hue-rotate(240deg) saturate(1.4)';
      } else if (innerSkill === 's_shihou') {
        colorFilter = 'hue-rotate(35deg) saturate(1.3) contrast(1.05)';
      }
    }

    // 宗师年龄滤镜 (>=60级宗师古朴色彩)
    if (level >= 60 && !colorFilter.includes('grayscale')) {
      colorFilter = `${colorFilter ? colorFilter + ' ' : ''}grayscale(0.15) sepia(0.15) contrast(1.05)`;
    }

    // 濒死重伤去色
    if (hpRatio <= 0.2) {
      colorFilter = 'grayscale(1) contrast(1.2)';
    }

    return {
      // 移除 transform 缩放，保持立绘原始比例，杜绝因极端属性导致拉伸变形
      filter: colorFilter,
    };
  };

  const proceduralStyle = getProceduralStyles();

  // 3. 判断白发特征
  const level = player?.level || 1;
  const isGrandmaster = (level >= 60 || npcConfig) && imgSrc.includes('hero'); 

  // 动效样式
  const getEffectStyle = () => {
    switch (effectState) {
      case 'attack':
        return {
          animation: `${isLeft ? 'left' : 'right'}CharacterAttack 0.55s ease-out`,
          filter: 'brightness(1.3) drop-shadow(0 0 15px var(--gold))',
        };
      case 'hit':
        if (effectType === 'ultimateBurst') {
          return {
            animation: `${isLeft ? 'left' : 'right'}CharacterUltimateHit 0.65s cubic-bezier(0.15, 0.85, 0.3, 1) forwards`,
          };
        }
        return {
          animation: `${isLeft ? 'left' : 'right'}CharacterHit 0.45s ease-out`,
        };
      case 'dodge':
        return {
          animation: `${isLeft ? 'left' : 'right'}CharacterDodge 0.55s ease-out`,
          opacity: 0.75,
        };
      case 'heal':
        return {
          animation: 'healPulse 0.6s ease-out',
          filter: 'brightness(1.2)',
        };
      case 'buff':
        return {
          animation: 'buffRing 0.5s ease-out',
          boxShadow: `0 0 30px ${levelStyle.border}`,
        };
      case 'debuff':
        return {
          animation: 'debuffPulse 0.4s ease-out',
          filter: 'brightness(0.8) saturate(0.8)',
        };
      case 'dead':
        return {
          animation: 'characterDeath 0.8s ease-out forwards',
          opacity: 0.25,
        };
      default:
        return {};
    }
  };

  // Buff/Debuff 状态指示器 - 有利与不利左右位置区隔，并消除荧光
  const renderStatusIndicators = () => {
    if (!player?.buffs && !player?.debuffs) return null;

    const buffs = player.buffs || {};
    const debuffs = player.debuffs || {};

    const hasBuffs = (buffs.dodge > 0 || buffs.defUp > 0 || buffs.shield > 0 || buffs.revive > 0);
    const hasDebuffs = (debuffs.stun > 0 || debuffs.poison > 0 || debuffs.silence > 0 || debuffs.internalWound > 0);

    return (
      <>
        {/* 有利状态 (Buffs) - 挂载于卡牌左上角，靠左排列 */}
        {hasBuffs && (
          <div style={{
            position: 'absolute',
            top: '-28px',
            left: '4px',
            display: 'flex',
            gap: '3px',
            zIndex: 50,
            transform: isLeft ? 'none' : 'scaleX(-1)',
          }}>
            {buffs.dodge > 0 && <div className="wuxia-status-tag buff-dodge">闪避</div>}
            {buffs.defUp > 0 && <div className="wuxia-status-tag buff-def">防御</div>}
            {buffs.shield > 0 && <div className="wuxia-status-tag buff-shield">护盾</div>}
            {buffs.revive > 0 && <div className="wuxia-status-tag buff-revive">涅槃</div>}
          </div>
        )}

        {/* 不利状态 (Debuffs) - 挂载于卡牌右上角，靠右排列 */}
        {hasDebuffs && (
          <div style={{
            position: 'absolute',
            top: '-28px',
            right: '4px',
            display: 'flex',
            gap: '3px',
            zIndex: 50,
            transform: isLeft ? 'none' : 'scaleX(-1)',
          }}>
            {debuffs.stun > 0 && <div className="wuxia-status-tag debuff-stun">眩晕</div>}
            {debuffs.poison > 0 && <div className="wuxia-status-tag debuff-poison">中毒</div>}
            {debuffs.silence > 0 && <div className="wuxia-status-tag debuff-silence">封印</div>}
            {debuffs.internalWound > 0 && <div className="wuxia-status-tag debuff-wound">内伤</div>}
          </div>
        )}
      </>
    );
  };

  // 伤害飘字
  const renderDamageNumber = () => {
    if (!showDamage || !damageAmount) return null;
    return (
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.8rem',
        fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
        color: '#ef4444',
        textShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
        fontWeight: 'bold',
        animation: 'damageFloat 0.5s ease-out forwards',
        zIndex: 50,
      }}>
        -{damageAmount}
      </div>
    );
  };

  // 治愈飘字
  const renderHealNumber = () => {
    if (!showHeal || !healAmount) return null;
    return (
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.8rem',
        fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
        color: '#10b981',
        textShadow: '0 0 15px rgba(16, 185, 129, 0.8)',
        fontWeight: 'bold',
        animation: 'damageFloat 0.6s ease-out forwards',
        zIndex: 50,
      }}>
        +{healAmount}
      </div>
    );
  };

  // 受击红色闪光遮罩
  const renderHitFlash = () => {
    if (effectState !== 'hit') return null;
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(220, 20, 60, 0.4), transparent 70%)',
        borderRadius: '8px',
        animation: 'hitFlash 0.3s ease-out forwards',
        zIndex: 10,
      }} />
    );
  };

  // 4. 武器本命气劲流光粒子图层
  const renderWeaponAura = () => {
    if (isDead) return null;
    let particles = null;
    if (player?.equippedTreasure === 't8' || weapon.name.includes('金蛇')) {
      particles = (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          <path d="M 20,40 Q 80,10 160,40 T 160,200" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="5 15" opacity="0.6" style={{ animation: 'swordQi 2s linear infinite' }} />
        </svg>
      );
    } else if (player?.equippedTreasure === 't13' || weapon.name.includes('圣火')) {
      particles = (
        <div style={{ position: 'absolute', bottom: '60px', left: '10px', right: '10px', height: '80px', pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', opacity: 0.6, animation: 'poisonBubble 1.2s infinite' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', opacity: 0.5, animation: 'poisonBubble 1.6s infinite 0.4s' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '80%', width: '5px', height: '5px', borderRadius: '50%', background: '#b91c1c', opacity: 0.7, animation: 'poisonBubble 1s infinite 0.2s' }} />
        </div>
      );
    } else if (player?.equippedTreasure === 't7' || weapon.name.includes('打狗')) {
      particles = (
        <div style={{ position: 'absolute', bottom: '60px', left: '10px', right: '10px', height: '80px', pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', left: '30%', width: '6px', height: '12px', background: '#22c55e', borderRadius: '1px', opacity: 0.4, transform: 'rotate(25deg)', animation: 'debuffFall 2s infinite' }} />
          <div style={{ position: 'absolute', top: '20px', left: '70%', width: '6px', height: '12px', background: '#059669', borderRadius: '1px', opacity: 0.4, transform: 'rotate(45deg)', animation: 'debuffFall 2.4s infinite 0.5s' }} />
        </div>
      );
    } else if (weapon.name.includes('剑') || weapon.name.includes('刀')) {
      particles = (
        <div className="sword-qi" style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 5, borderRadius: '8px' }} />
      );
    }
    return particles;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
      position: 'relative',
    }}>
      {/* 状态指示器 */}
      {renderStatusIndicators()}

      {/* 气泡对话框 */}
      {showBubble && (
        <div style={{
          position: 'absolute',
          bottom: '215px',
          left: '50%',
          transform: isLeft ? 'translateX(-50%)' : 'translateX(-50%) scaleX(-1)', // 纠正中心点平移与镜像翻转
          zIndex: 100,
        }}>
          <div className="wuxia-speech-bubble">
            <div className="wuxia-speech-bubble-arrow" />
            <div className="wuxia-speech-bubble-content">
              {bubbleText}
            </div>
          </div>
        </div>
      )}

      {/* 绝学命中受击卡牌残影 */}
      {effectState === 'hit' && effectType === 'ultimateBurst' && (
        <>
          <div 
            className="wuxia-hero-card"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '130px',
              height: '180px',
              background: levelStyle.bg,
              border: `2px solid ${levelStyle.border}77`,
              boxShadow: auraStyle.shadow,
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'ghostTrail1 0.45s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
            }}
          >
            {imgSrc && (
              <img 
                src={imgSrc} 
                alt="" 
                className="wuxia-hero-portrait"
                style={{ opacity: 0.35, ...proceduralStyle }}
                onError={handleImgError}
              />
            )}
          </div>
          <div 
            className="wuxia-hero-card"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '130px',
              height: '180px',
              background: levelStyle.bg,
              border: `2px solid ${levelStyle.border}44`,
              boxShadow: auraStyle.shadow,
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'ghostTrail2 0.6s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
            }}
          >
            {imgSrc && (
              <img 
                src={imgSrc} 
                alt="" 
                className="wuxia-hero-portrait"
                style={{ opacity: 0.2, ...proceduralStyle }}
                onError={handleImgError}
              />
            )}
          </div>
        </>
      )}

      {/* 水墨暗黑国风人物卡片 */}
      <div 
        className={`wuxia-hero-card ${hpRatio <= 0.2 ? 'critical-blood' : ''} ${!isDead ? 'shimmer-active' : ''}`}
        style={{
          background: levelStyle.bg,
          border: `2px solid ${levelStyle.border}`,
          boxShadow: auraStyle.shadow,
          transition: 'all 0.3s ease',
          ...getEffectStyle(),
        }}
      >
        {/* 受击闪光 */}
        {renderHitFlash()}

        {/* 顶部装饰条 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${levelStyle.border}, transparent)`,
          zIndex: 6,
        }} />

        {/* 夔纹/回纹四角古风装饰 */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderLeft: `2.5px solid ${levelStyle.border}`, borderTop: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderRight: `2.5px solid ${levelStyle.border}`, borderTop: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderLeft: `2.5px solid ${levelStyle.border}`, borderBottom: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderRight: `2.5px solid ${levelStyle.border}`, borderBottom: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />

        {/* 性别水墨标志 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '0.8rem',
          opacity: 0.6,
          color: levelStyle.border,
          fontFamily: '"Ma Shan Zheng", cursive',
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {isFemale ? '坤' : '乾'}
        </div>

        {/* 等级标签名帖 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '1px 6px',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: '3px',
          fontSize: '0.7rem',
          color: levelStyle.border,
          fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
          border: `1px solid ${levelStyle.border}35`,
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {levelStyle.rank}
        </div>

        {/* 动态太极气旋背景 */}
        {!isDead && <div className="wuxia-card-taiji" />}

        {/* 水墨精绘立绘图像 */}
        {imgSrc && (
          <img 
            src={imgSrc} 
            alt={player?.name} 
            className="wuxia-hero-portrait"
            onError={handleImgError}
            style={{
              opacity: isDead ? 0.15 : hpRatio <= 0.2 ? 0.75 : 0.9,
              ...proceduralStyle,
            }}
          />
        )}

        {/* 动态特征：银发/白发气劲（一代宗师专属） */}
        {isGrandmaster && !isDead && (
          <svg style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', pointerEvents: 'none', zIndex: 3 }}>
            <path d="M 10,25 Q 40,5 70,25" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="2 4" style={{ animation: 'swordQi 1.5s linear infinite' }} />
            <path d="M 20,20 Q 40,8 60,20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          </svg>
        )}

        {/* 动态特征：神秘黑色斗笠面纱（初出茅庐新手专属） */}
        {false && (
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '30%',
            width: '40%',
            height: '35px',
            background: 'linear-gradient(to bottom, rgba(15,10,10,0.9) 10%, rgba(15,10,10,0.75) 50%, rgba(15,10,10,0.0) 100%)',
            borderBottom: '1px solid rgba(194, 157, 56, 0.15)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
            zIndex: 4,
            pointerEvents: 'none',
            borderRadius: '2px',
          }} />
        )}

        {/* 本命宝具流电气劲 */}
        {renderWeaponAura()}

        {/* 死亡时覆盖冰裂墨痕 */}
        {isDead && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 7, pointerEvents: 'none' }}>
            <line x1="15" y1="15" x2="115" y2="165" stroke="#000" strokeWidth="2.5" opacity="0.8" strokeDasharray="5 5" />
            <line x1="115" y1="15" x2="15" y2="165" stroke="#000" strokeWidth="2" opacity="0.8" strokeDasharray="3 7" />
            <circle cx="65" cy="90" r="30" fill="none" stroke="#0d0606" strokeWidth="1.5" strokeDasharray="2 4" />
          </svg>
        )}

        {/* 底部信息名牌面板 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '6px 8px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(10,5,5,0.98) 70%)',
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {/* 名字 */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#f0f0f0',
            fontFamily: '"Ma Shan Zheng", cursive',
            letterSpacing: '1px',
            marginBottom: '2px',
            textShadow: '0 0 10px rgba(0,0,0,0.9)',
          }}>
            {player?.name}
          </div>

          {/* 武器 */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            color: weapon.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
          }}>
            <span>{weapon.icon}</span>
            <span style={{ fontFamily: '"Ma Shan Zheng", sans-serif' }}>{weapon.name}</span>
          </div>
        </div>

        {/* 气血条与气血数值 */}
        <div style={{
          position: 'absolute',
          bottom: '38px',
          left: '10px',
          right: '10px',
          height: '4px',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: '2px',
          overflow: 'hidden',
          border: '1px solid rgba(194, 157, 56, 0.15)',
          zIndex: 6,
        }}>
          <div style={{
            width: `${hpRatio * 100}%`,
            height: '100%',
            background: hpRatio <= 0.2
              ? 'linear-gradient(90deg, #b91c1c, #ef4444)'
              : hpRatio <= 0.5
                ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                : isLeft
                  ? 'linear-gradient(90deg, #0f766e, #00a86b)'
                  : 'linear-gradient(90deg, #b91c1c, #dc2626)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '44px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '0.6rem',
          color: '#e0e0e0',
          fontFamily: 'monospace',
          zIndex: 6,
          textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)',
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {Math.floor(player?.hp || 0)} / {Math.floor(player?.maxHp || 7000)}
        </div>

        {/* 伤害飘字层 */}
        {renderDamageNumber()}
        {renderHealNumber()}
      </div>
    </div>
  );
};

// 4. 特殊 NPC 原著数据与经典台词配置库
export const NPC_SPECIAL_CONFIGS = {
  '扫地僧': {
    quote: '大凡武功修为，必须有慈悲之佛法相辅。',
    comment: '大智若愚，藏经阁中扫尽红尘。',
    color: '#9ca3af',
    filter: 'grayscale(0.3) sepia(0.15) contrast(1.05)',
    weaponIcon: '🧹',
    weaponName: '铁木扫帚',
    weaponColor: '#9ca3af',
    personality: 'heroic',
    dialogues: {
      attack: ['大凡武功修为，必须有慈悲之佛法相辅。', '施主，执念太深了，回头是岸。', '阿弥陀佛，贫僧这便度化施主。'],
      hit: ['施主力道虽足，但内伤已深。', '阿弥陀佛，贫僧受得住。'],
      dodge: ['三尺气墙，御气化劲。', '世间纷争，皆为虚无。'],
      heal: ['佛光普照，气血长青。', '枯木逢春，善哉善哉。'],
      debuff: ['凡所有相，皆是虚妄。', '心无挂碍，邪魔自消。'],
      dead: ['扫尽凡尘，终归黄土……', '阿弥陀佛……贫僧去也……']
    }
  },
  '东方不败': {
    quote: '日出东方，唯我不败！',
    comment: '葵花宝典，红烛针影，绝代妖娆。',
    color: '#ef4444',
    filter: 'hue-rotate(-20deg) saturate(1.8) contrast(1.2)',
    weaponIcon: '🪡',
    weaponName: '葵花绣针',
    weaponColor: '#f87171',
    personality: 'charming',
    dialogues: {
      attack: ['日出东方，唯我不败！', '看针！', '就凭你们这些庸才，也敢与本座动手？'],
      hit: ['哼，竟敢伤我？', '放肆！不可饶恕！'],
      dodge: ['葵花身法，鬼魅无踪！', '太慢了，太慢了！'],
      heal: ['葵花真气，瞬息流转。', '本座的金体，岂是你能破的？'],
      debuff: ['雕虫小技，也敢班门弄斧？', '给本座破！'],
      dead: ['莲弟……我要先走一步了……', '日出东方，唯我不败……我竟然……']
    }
  },
  '灭绝师太': {
    quote: '我峨嵋派倚天不出，谁与争锋！',
    comment: '性情刚烈，斩尽妖邪，正邪不两立。',
    color: '#6b7280',
    filter: 'grayscale(0.8) contrast(1.3)',
    weaponIcon: '🗡️',
    weaponName: '倚天剑',
    weaponColor: '#c9a227',
    personality: 'cold',
    dialogues: {
      attack: ['倚天既出，谁与争锋！', '魔教妖人，受死吧！', '今日便替天行道！'],
      hit: ['哼，贫尼接下了！', '妖邪狂徒，休要猖狂！'],
      dodge: ['峨嵋九阳，步履轻盈！', '躲过这招，取你性命！'],
      heal: ['玄门正宗，真气调和！', '阿弥陀佛，贫尼无碍。'],
      debuff: ['妖法邪术，岂能乱我心神！', '峨嵋弟子，宁死不屈！'],
      dead: ['倚天剑断……灭绝至此……', '正邪不两立……我死又何惧！']
    }
  },
  '邀月': {
    quote: '若我不配得到，那谁也别想得到！',
    comment: '明玉功成，移花宫主，冷若冰霜。',
    color: '#06b6d4',
    filter: 'hue-rotate(180deg) saturate(1.4) brightness(1.15)',
    weaponIcon: '❄️',
    weaponName: '明玉气劲',
    weaponColor: '#22d3ee',
    personality: 'charming',
    dialogues: {
      attack: ['明玉九重，天地失色！', '顺我者昌，逆我者亡！', '咯咯，听话，乖乖领死吧~'],
      hit: ['放肆！凭你也配伤本宫？', '弄疼了本宫，可是要用命来偿的！', '哼，不自量力！'],
      dodge: ['明玉飘渺，你碰得到我么？', '咯咯，连人家的衣角都碰不到呢。', '无谓挣扎。'],
      heal: ['明玉功成，伤口瞬息冰凝。', '气息流转，重回巅峰。'],
      debuff: ['下三滥的药，对本宫可没用。', '雕虫小技，也敢在移花宫前班门弄斧？'],
      dead: ['我邀月……得不到的……宁可毁掉……', '飞花飘落，空余此恨……']
    }
  },
  '张三丰': {
    quote: '太极圆转，阴阳既济，生生不息。',
    comment: '一代宗师，武当太极，泰山北斗。',
    color: '#fbbf24',
    filter: 'grayscale(0.9) contrast(1.15) sepia(0.05)',
    weaponIcon: '☯️',
    weaponName: '太极真意',
    weaponColor: '#fbbf24',
    personality: 'heroic',
    dialogues: {
      attack: ['太极圆转，柔能克刚。', '施主，接老道这一掌太极劲。', '动静相兼，阴阳既济。'],
      hit: ['呵呵，施主力道不小。', '无碍，太极借力卸力。'],
      dodge: ['借力打力，随风圆转。', '太极无极，避其锋芒。'],
      heal: ['纯阳无极，生生不息。', '真气长存，伤势消融。'],
      debuff: ['道法自然，外邪难侵。', '抱元守一。'],
      dead: ['老道去也……太极玄理，莫失莫忘……', '武当后辈……当自强不息……']
    }
  },
  '乔峰': {
    quote: '我萧峰大好男儿，何惧之有！',
    comment: '降龙神威，悲剧豪侠，豪气冲天。',
    color: '#b45309',
    filter: 'sepia(0.3) saturate(1.3) contrast(1.1)',
    weaponIcon: '🐉',
    weaponName: '降龙十八掌',
    weaponColor: '#f59e0b',
    personality: 'heroic',
    dialogues: {
      attack: ['降龙十八掌！', '我乔峰大好男儿，何惧之有！', '亢龙有悔！'],
      hit: ['痛快！再来！', '好身手！'],
      dodge: ['擒龙控鹤，侧身以待！', '身法游刃，化险为夷！'],
      heal: ['豪气贯胸，气血重聚！', '这点小伤，不碍事！'],
      debuff: ['契丹男儿，岂会屈服！', '大局当前，给我顶住！'],
      dead: ['我萧峰无愧于天地……', '阿朱，我来陪你了……']
    }
  },
  '萧峰': {
    quote: '我萧峰大好男儿，何惧之有！',
    comment: '降龙神威，悲剧豪侠，豪气冲天。',
    color: '#b45309',
    filter: 'sepia(0.3) saturate(1.3) contrast(1.1)',
    weaponIcon: '🐉',
    weaponName: '降龙十八掌',
    weaponColor: '#f59e0b',
    personality: 'heroic',
    dialogues: {
      attack: ['降龙十八掌！', '我萧峰大好男儿，何惧之有！', '亢龙有悔！'],
      hit: ['痛快！再来！', '好身手！'],
      dodge: ['擒龙控鹤，侧身以待！', '身法游刃，化险为夷！'],
      heal: ['豪气贯胸，气血重聚！', '这点小伤，不碍事！'],
      debuff: ['契丹男儿，岂会屈服！', '大局当前，给我顶住！'],
      dead: ['我萧峰无愧于天地……', '阿朱，我来陪你了……']
    }
  },
  '独孤求败': {
    quote: '纵横江湖三十余载，杀尽仇寇，败尽英雄。',
    comment: '独孤求败，无招胜有招，草木竹石皆可为剑。',
    color: '#3b82f6',
    filter: 'hue-rotate(220deg) saturate(1.3) contrast(1.2)',
    weaponIcon: '🗡️',
    weaponName: '无锋重剑',
    weaponColor: '#4b5563',
    personality: 'cold',
    dialogues: {
      attack: ['重剑无锋，大巧不工！', '草木竹石，皆可为剑！', '求一败而不可得，痛哉！'],
      hit: ['唔，终有能伤我之人！', '好剑法！再来！'],
      dodge: ['无招之境，身随意转。', '避其锋芒，有何难哉？'],
      heal: ['剑气回炉，神完气足。', '自愈伤势，重整旗鼓。'],
      debuff: ['剑意所至，诸邪退避。', '任凭百般变化，我自一剑破之。'],
      dead: ['终求一败……死而无憾……', '剑归尘土……我败了……']
    }
  },
  '金轮法王': {
    quote: '龙象般若，力大无穷，十重金轮，谁能与争锋！',
    comment: '龙象神功，十重法印，金轮横空，狂澜不倒。',
    color: '#fbbf24',
    filter: 'sepia(0.2) saturate(1.3) contrast(1.15) brightness(1.05)',
    weaponIcon: '🎡',
    weaponName: '五行金轮',
    weaponColor: '#fbbf24',
    personality: 'arrogant',
    dialogues: {
      attack: ['龙象般若，十重神力！', '金轮横空，镇压乾坤！', '接老夫一轮！'],
      hit: ['龙象护体，浑厚无比！', '唔，施主力道不俗。'],
      dodge: ['龙象金身，万法不侵！', '偏了。'],
      heal: ['十重龙象，气血回天！', '伤势已愈。'],
      debuff: ['老夫金刚不坏，安能受困？', '散！'],
      dead: ['龙象神功……终究不敌中原豪杰……', '金轮坠落……命数已尽……']
    }
  },
  '步惊云': {
    quote: '我步惊云行事，何须向人解释！排云掌，去！',
    comment: '孤高绝俗，不哭死神，麒麟烈火，排云御空。',
    color: '#3b82f6',
    filter: 'hue-rotate(220deg) saturate(1.3) contrast(1.2)',
    weaponIcon: '☁️',
    weaponName: '排云掌',
    weaponColor: '#60a5fa',
    personality: 'cold',
    dialogues: {
      attack: ['排云掌，重云深锁！', '我步惊云行事，何须向人解释！', '霍家剑法！'],
      hit: ['哼！', '痛快！'],
      dodge: ['排云御空，身形如云。', '无用。'],
      heal: ['麒麟烈火，气血自燃！', '伤口已封。'],
      debuff: ['这点小技，安能困我不哭死神！', '破！'],
      dead: ['孔慈……我来了……', '死神落泪……此生无憾……']
    }
  },
  '风清扬': {
    quote: '无招胜有招，重意不重形。独孤九剑，破尽天下兵刃！',
    comment: '独孤真传，华山隐贤，剑化虚无，返璞归真。',
    color: '#ffffff',
    filter: 'grayscale(0.9) contrast(1.15) sepia(0.05)',
    weaponIcon: '🗡️',
    weaponName: '独孤九剑',
    weaponColor: '#ffffff',
    personality: 'heroic',
    dialogues: {
      attack: ['独孤九剑，破兵式！', '无招胜有招，重意不重形。', '看剑！'],
      hit: ['呵呵，剑法尚可。', '老夫受教了。'],
      dodge: ['料敌先机，避其锋芒。', '好剑法！'],
      heal: ['华山真气，润物无声。', '伤口已平，真气自转。'],
      debuff: ['华山正宗，外邪退散。', '华山剑意，定神。'],
      dead: ['隐没华山，终归虚无……', '独孤传承……后继有人……']
    }
  },
  '任我行': {
    quote: '吸星大法吸尽天下内力，日月神教文成武德，唯我独尊！',
    comment: '吞噬星辰，日月枭雄，纵横霸道，睥睨乾坤。',
    color: '#ef4444',
    filter: 'hue-rotate(-10deg) saturate(1.6) contrast(1.25)',
    weaponIcon: '🌀',
    weaponName: '吸星真气',
    weaponColor: '#ef4444',
    personality: 'arrogant',
    dialogues: {
      attack: ['吸星大法，吸尽天下内力！', '日月乾坤，唯我独尊！', '接本座一掌！'],
      hit: ['狂妄！本座要吸干你！', '唔，力道不凡！'],
      dodge: ['乾坤御气，身如日月！', '躲得好！'],
      heal: ['吸星反哺，伤势瞬息痊愈！', '真气回流，气血充盈！'],
      debuff: ['敢对本座用这下三滥的招式？', '给我吸干它！'],
      dead: ['我日月神教……终归没能统一江湖……', '心脉震断……本座不甘……']
    }
  },
  '聂风': {
    quote: '风神腿法，如影随形！泥菩萨说我批言“风云汇聚”，命数由我！',
    comment: '风中之神，心地仁慈，风驰电掣，神风无影。',
    color: '#10b981',
    filter: 'hue-rotate(150deg) saturate(1.4) contrast(1.15)',
    weaponIcon: '🌪️',
    weaponName: '风神腿',
    weaponColor: '#34d399',
    personality: 'heroic',
    dialogues: {
      attack: ['风神腿，风卷楼残！', '傲寒六诀，雪亮八方！', '接招！'],
      hit: ['唔，风受得住！', '好凌厉的攻势！'],
      dodge: ['风中之神，捕风捉影！', '随风飘逝，你打偏了。'],
      heal: ['冰心诀，心若冰清，天塌不惊！', '风驰电掣，气血自复。'],
      debuff: ['风神真气，驱散外邪。', '固守本源，冰心澄明。'],
      dead: ['云师兄……保重……', '风随行远，心若冰清……']
    }
  },
  '李寻欢': {
    quote: '小李飞刀，例不虚发！这一刀，是为了江湖的恩义！',
    comment: '例无虚发，情深义重，病骨侠心，探花风流.，',
    color: '#fbbf24',
    filter: 'sepia(0.15) saturate(1.25) contrast(1.1)',
    weaponIcon: '🗡️',
    weaponName: '小李飞刀',
    weaponColor: '#ca8a04',
    personality: 'mocking',
    dialogues: {
      attack: ['小李飞刀，例不虚发！', '请见识一下这一刀！', '飞刀已在手中！'],
      hit: ['咳咳……下手可真狠。', '唔，见红了。'],
      dodge: ['飞刀客的身法，还算凑合。', '差了一点点。'],
      heal: ['咳咳……喝口烈酒压压惊，气血好多了。', '病骨侠心，真气微转。'],
      debuff: ['病入膏肓，毒药对我而言不算什么。', '咳……大意了。'],
      dead: ['诗音……终究是负了你……', '飞刀数载，例不虚发……']
    }
  },
  '王重阳': {
    quote: '全真太极，重阳真意。天下武学，皆归大道。',
    comment: '全真教祖，重阳真人，武功天下第一，道法圆融，德高望重。',
    color: '#8b5cf6',
    filter: 'hue-rotate(250deg) saturate(1.2) contrast(1.1)',
    weaponIcon: '☯️',
    weaponName: '先天功劲',
    weaponColor: '#a78bfa',
    personality: 'heroic',
    dialogues: {
      attack: ['先天功劲，破开混沌！', '全真真意，太极圆转！', '看招！'],
      hit: ['重阳金身，受得住！', '唔，力道纯正！'],
      dodge: ['先天乾坤步，履险如夷！', '太极无形。'],
      heal: ['先天之真气，枯木生花！', '金体长存，伤口已平。'],
      debuff: ['全真正宗，诸邪避退。', '抱元守一！'],
      dead: ['全真基业……就交由诸位了……', '朝阳坠落，道法归真……']
    }
  },
  '雄霸': {
    quote: '顺我者昌，逆我者亡！三分归元气，霸绝天下！',
    comment: '天下会长，枭雄一世，三分归元，命数在手，唯我独尊。',
    color: '#1e3a8a',
    filter: 'hue-rotate(220deg) saturate(1.4) contrast(1.2)',
    weaponIcon: '🌪️',
    weaponName: '三分归元气',
    weaponColor: '#3b82f6',
    personality: 'arrogant',
    dialogues: {
      attack: ['三分归元气！', '三分神指，去！', '逆我者亡，受死！'],
      hit: ['放肆！老夫要将你挫骨扬灰！', '三分元气盾，挡！'],
      dodge: ['老夫命数在天，岂是你能打中？', '徒劳挣扎！'],
      heal: ['三分归元，九九归一，伤势恢复！', '神功运转，气血翻倍！'],
      debuff: ['在老夫的三分归元气面前，玩这些把戏？', '破！'],
      dead: ['泥菩萨批言……成也风云，败也风云……', '老夫不信命……呃……']
    }
  },
  '鸠摩智': {
    quote: '能接下贫僧这一招火焰刀的，世上寥寥无几！',
    comment: '吐蕃国师，武学狂痴，火焰刀气，傲视中原。',
    color: '#b91c1c',
    filter: 'hue-rotate(350deg) saturate(1.5) contrast(1.2)',
    weaponIcon: '🔥',
    weaponName: '火焰刀',
    weaponColor: '#ef4444',
    personality: 'arrogant',
    dialogues: {
      attack: ['能接下贫僧火焰刀的，世上寥寥无几！', '少林绝技，贫僧无一不精！', '小无相功，千变万化！'],
      hit: ['阿弥陀佛，施主功力深厚！', '唔，好强的震荡！'],
      dodge: ['贫僧步法玄妙，施主莫要白费力气。', '避让三分，善哉善哉。'],
      heal: ['易筋经气血流转，神功重聚！', '功力更上一层楼！'],
      debuff: ['敢对国师用毒点穴？真是罪过罪过。', '雕虫小技，给本僧破！'],
      dead: ['一生痴迷武学……终是一场空……', '贪嗔痴慢……贫僧悔矣……']
    }
  },
  '西门吹雪': {
    quote: '我的剑不是用来给人看的，而是用来杀人的。',
    comment: '剑神一笑，冷冽无情，白衣胜雪，一剑封喉。',
    color: '#ffffff',
    filter: 'grayscale(0.9) brightness(1.25) contrast(1.1)',
    weaponIcon: '🗡️',
    weaponName: '乌鞘古剑',
    weaponColor: '#ffffff',
    personality: 'cold',
    dialogues: {
      attack: ['我的剑不是用来给人看的。', '出剑。', '一剑封喉。'],
      hit: ['见血了。', '哼。'],
      dodge: ['差了一寸。', '不够快。'],
      heal: ['剑意未断，伤口已结。', '气息归元。'],
      debuff: ['外物岂能扰我剑心。', '静。'],
      dead: ['剑断……人亡。', '朝闻道，夕死可矣……']
    }
  },
  '虚竹': {
    quote: '小僧本是佛门弟子，奈何尘缘未了。',
    comment: '逍遥掌门，灵鹫宫主，尽得天山绝招。',
    color: '#0d9488',
    filter: 'hue-rotate(160deg) saturate(1.3) contrast(1.1)',
    weaponIcon: '❄️',
    weaponName: '生死符',
    weaponColor: '#2dd4bf',
    personality: 'timid',
    dialogues: {
      attack: ['阿弥陀佛，小僧得罪了！', '吃我这一招天山折梅手！', '生死符去！'],
      hit: ['哎呀，罪过罪过，痛死小僧了！', '小僧武艺不精，打得真疼！'],
      dodge: ['小僧只是运气好，避过了这一招！', '菩萨保佑，没被打中！'],
      heal: ['多谢天山真气疗伤！', '小僧伤势已好了大半！'],
      debuff: ['哎呀，这是中了什么毒？手脚不听使唤了！', '阿弥陀佛，内息受阻！'],
      dead: ['佛祖接引，小僧这便去了……', '尘缘已了，终归虚无……']
    }
  },
  '段誉': {
    quote: '施主且慢，看我六脉神剑！',
    comment: '大理世子，北冥神功，六脉神剑，举世无双。',
    color: '#3b82f6',
    filter: 'hue-rotate(210deg) saturate(1.4) contrast(1.15)',
    weaponIcon: '⚡',
    weaponName: '六脉神剑',
    weaponColor: '#60a5fa',
    personality: 'mocking',
    dialogues: {
      attack: ['施主且慢，看我六脉神剑！', '少商剑，出！', '北冥神功，吸气！'],
      hit: ['哎哟，神仙姐姐救我！', '姑娘手下留情，痛死小生了！'],
      dodge: ['凌波微步，罗袜生尘！哈哈，打不着！', '凌波微步走起！'],
      heal: ['北冥真气吸来，气血回复！', '舒服舒服，我又满血了！'],
      debuff: ['哎呀，怎么使不出内力了？', '难道是悲酥清风？'],
      dead: ['语嫣……段誉先走一步了……', '大理基业……终化尘土……']
    }
  },
  '无崖子': {
    quote: '北冥神功，吸尽天下真气，为我逍遥.，',
    comment: '逍遥派老掌门，一生仙风道骨，琴棋书画无一不精。',
    color: '#10b981',
    filter: 'hue-rotate(140deg) saturate(1.2) contrast(1.1)',
    weaponIcon: '🌀',
    weaponName: '北冥真意',
    weaponColor: '#34d399',
    personality: 'heroic',
    dialogues: {
      attack: ['北冥神功，吸尽天下内力！', '逍遥折梅，大巧若拙！', '看招！'],
      hit: ['逍遥金体，受得住。', '力道平平。'],
      dodge: ['小无相功，千变万化。', '逍遥飘渺，避其锋芒。'],
      heal: ['北冥真气，反哺乾坤！', '气血长青。'],
      debuff: ['逍遥真意，诸邪辟易。', '散！'],
      dead: ['逍遥一世，终成虚无……', '沧海沧海，人生如梦……']
    }
  },
  '张无忌': {
    quote: '九阳真经，乾坤大挪移，只求天下太平。',
    comment: '明教教主，身兼九阳神功与乾坤大挪移，宅心仁厚。',
    color: '#ea580c',
    filter: 'hue-rotate(25deg) saturate(1.5) contrast(1.2) brightness(1.05)',
    weaponIcon: '☯️',
    weaponName: '乾坤气劲',
    weaponColor: '#f97316',
    personality: 'heroic',
    dialogues: {
      attack: ['乾坤大挪移！', '九阳真气，破！', '圣火令神功！'],
      hit: ['九阳神功，百毒不侵，刀枪不入！', '哎呀，好强的力道！'],
      dodge: ['乾坤流转，借力卸力！', '避让三分。'],
      heal: ['九阳真气游走，伤口自动愈合！', '多谢，我已经恢复了！'],
      debuff: ['九阳神功百毒不侵！这点毒奈何不得我！', '屏息，挪移开去！'],
      dead: ['太师父，无忌尽力了……', '只愿天下太平……']
    }
  },
  '周伯通': {
    quote: '我老顽童这辈子最怕的就是蛇，还有那劳什子的繁文缛节！',
    comment: '老顽童周伯通，率真烂漫，赤子之心，左右互搏，游戏人间。',
    color: '#f59e0b',
    filter: 'sepia(0.2) saturate(1.3) contrast(1.1)',
    weaponIcon: '👊',
    weaponName: '左右互搏',
    weaponColor: '#f59e0b',
    personality: 'mocking',
    dialogues: {
      attack: ['左右互搏，双管齐下！', '老顽童来也，看招！', '哈哈，接我一记空明拳！'],
      hit: ['哎哟！痛死老顽童了！', '好疼好疼！不跟你玩了！'],
      dodge: ['打不着打不着！你打的是空气！', '哈哈，老顽童身手矫健吧！'],
      heal: ['九阴真经，疗伤妙法！', '好玩好玩，伤势又好了！'],
      debuff: ['哎呀，头晕脑胀，是不是有毒蛇？', '别点我的穴，不好玩！'],
      dead: ['呜呜，老顽童要死啦……', '不好玩，这次不算……']
    }
  },
  '郭靖': {
    quote: '侠之大者，为国为民。郭靖守城，死而后已！',
    comment: '降龙神威，侠义无双，坚守襄阳，大义凛然。',
    color: '#b45309',
    filter: 'sepia(0.3) saturate(1.2) contrast(1.1)',
    weaponIcon: '🐉',
    weaponName: '降龙十八掌',
    weaponColor: '#f59e0b',
    personality: 'heroic',
    dialogues: {
      attack: ['降龙十八掌，亢龙有悔！', '侠之大者，为国为民！', '接我一招！'],
      hit: ['靖儿挺得住！', '唔，好霸道的掌力！'],
      dodge: ['左右互搏，侧身避过！', '承让了。'],
      heal: ['九阴总纲，真气自聚！', '郭靖无碍，伤势好了！'],
      debuff: ['坚守心神，邪不压正！', '守！'],
      dead: ['靖儿死守襄阳，无怨无悔！', '蓉儿，对不起了……']
    }
  },
  '令狐冲': {
    quote: '有酒有剑，此生何求！这天下是非纷争，与我令狐冲何干？',
    comment: '独孤九剑，放荡不羁，剑指浮生，傲笑江湖。',
    color: '#3b82f6',
    filter: 'hue-rotate(200deg) saturate(1.2) contrast(1.1)',
    weaponIcon: '🗡️',
    weaponName: '青钢长剑',
    weaponColor: '#60a5fa',
    personality: 'mocking',
    dialogues: {
      attack: ['独孤九剑，破剑式！', '哈哈，接招！', '看招，冲哥的剑法怎么样？'],
      hit: ['哎哟，好疼！盈盈看到要心疼了。', '好强的力道！'],
      dodge: ['独孤九剑，料敌先机！你打哪儿呢？', '哈哈，偏了偏了！'],
      heal: ['吸星大法，吸纳功力以疗伤！', '喝口美酒，神清气爽！'],
      debuff: ['哎呀，内力又冲突了，真麻烦。', '卑鄙，下毒吗？'],
      dead: ['盈盈……小师妹……', '有酒有剑……此生足矣……']
    }
  },
  '天山童姥': {
    quote: '顺我者昌，逆我者亡！生死符下，谁敢不从！',
    comment: '唯我独尊，返老还童，仙尘未了，雄霸一方。',
    color: '#ec4899',
    filter: 'hue-rotate(-45deg) saturate(1.5) contrast(1.15)',
    weaponIcon: '❄️',
    weaponName: '生死符',
    weaponColor: '#f472b6',
    personality: 'arrogant',
    dialogues: {
      attack: ['唯我独尊，八荒六合！', '生死符，去！', '不知死活的奴才，纳命来！'],
      hit: ['放肆！姥姥要抽你的筋扒你的皮！', '哼，姥姥几百年的功力，岂会怕你！'],
      dodge: ['姥姥的身法，你下辈子也追不上！', '咯咯，打偏了！'],
      heal: ['天山六阳，起死回生！', '气血重聚，返老还童！'],
      debuff: ['生死符下，万劫不复！你敢暗算老身？', '破！'],
      dead: ['无崖子……你心里终究没有我……', '姥姥这辈子，恨啊……']
    }
  },
  '欧阳锋': {
    quote: '蛤蟆功劲力霸道，逆练九阴又有何妨！天下第一终归是我！',
    comment: '逆修九阴，西毒锋芒，毒绝天下，狂傲枭雄。',
    color: '#10b981',
    filter: 'hue-rotate(120deg) saturate(1.4) contrast(1.15)',
    weaponIcon: '🐍',
    weaponName: '蛇毒掌力',
    weaponColor: '#34d399',
    personality: 'sinister',
    dialogues: {
      attack: ['蛤蟆功！', '逆练九阴，天下无敌！', '蛇毒掌力，去！'],
      hit: ['吼！气死老夫了！', '老夫要毒死你！'],
      dodge: ['蛤蟆缩身，避气卸力！', '老夫身形奇诡，岂是你能打中？'],
      heal: ['逆练经脉，疗伤奇效！', '经脉倒转，气血翻涌！'],
      debuff: ['老夫是毒中之祖！敢对我下毒？', '破！'],
      dead: ['我是谁……我是天下第一的欧阳锋！', '克儿……老夫来陪你了……']
    }
  },
  '叶孤城': {
    quote: '我这一剑，名为『天外飞仙』，你可接得住？',
    comment: '一剑西来，天外飞仙，紫禁之巅，白衣染血。',
    color: '#ffffff',
    filter: 'grayscale(0.85) brightness(1.2) contrast(1.15)',
    weaponIcon: '🗡️',
    weaponName: '飞仙古剑',
    weaponColor: '#ffffff',
    personality: 'cold',
    dialogues: {
      attack: ['天外飞仙！', '剑之极致，不过如此。', '你可接得住这一剑？'],
      hit: ['唔。', '血痕。'],
      dodge: ['天外流光，轻灵若水。', '差了一寸。'],
      heal: ['剑气凝神，气血自平。', '伤愈。'],
      debuff: ['剑意澄澈，外邪不干。', '静。'],
      dead: ['紫禁之巅，死于绝剑，足矣……', '天外飞仙……终是绝响……']
    }
  },
  '洪七公': {
    quote: '大口吃肉，大碗喝酒，降龙十八掌扫尽不平！',
    comment: '九指神丐，游走红尘，降龙啸天，忠义无双。',
    color: '#f59e0b',
    filter: 'sepia(0.25) saturate(1.4) contrast(1.1)',
    weaponIcon: '🪄',
    weaponName: '打狗棒',
    weaponColor: '#22c55e',
    personality: 'heroic',
    dialogues: {
      attack: ['打狗棒法，棒打双犬！', '亢龙有悔！降龙十八掌！', '接老叫花一掌！'],
      hit: ['好小子，力道够劲！', '哎哟，把我的叫花鸡都打翻了！'],
      dodge: ['逍遥游身法，滑溜得很！', '打不着，哈哈！'],
      heal: ['吃口肥鸡，喝口美酒，气血全满！', '美酒入喉，神清气爽！'],
      debuff: ['老叫花光明磊落，不怕你下毒！', '给我散！'],
      dead: ['老叫花先走一步，蓉儿的菜真香啊……', '降龙传承……不能断……']
    }
  },
  '黄药师': {
    quote: '桃花影落飞神剑，碧海潮生按玉箫。',
    comment: '东邪药师，狂傲不羁，琴心剑胆，影入桃花。',
    color: '#34d399',
    filter: 'hue-rotate(100deg) saturate(1.3) contrast(1.1)',
    weaponIcon: '🎵',
    weaponName: '玉箫',
    weaponColor: '#34d399',
    personality: 'cold',
    dialogues: {
      attack: ['弹指神通！', '碧海潮生按玉箫！', '桃花落影飞神剑！'],
      hit: ['哼，狂妄后生，力道还凑合。', '见血了。'],
      dodge: ['奇门五行步，幻影重重。', '你连我身侧三尺都进不得。'],
      heal: ['九花玉露丸，妙用无穷！', '桃花仙丹，生机复现.，'],
      debuff: ['奇门遁甲，五行变幻，岂会受困？', '雕虫小技。'],
      dead: ['阿衡……我这便去寻你了……', '碧海潮生……终是一场幻梦……']
    }
  },
  '神雕大侠': {
    quote: '重剑无锋，大巧不工。黯然销魂，唯别而已。',
    comment: '神雕大侠，身残志坚，黯然销魂掌，重剑绝世。',
    color: '#4b5563',
    filter: 'grayscale(0.4) contrast(1.25) sepia(0.05)',
    weaponIcon: '🗡️',
    weaponName: '玄铁重剑',
    weaponColor: '#374151',
    personality: 'cold',
    dialogues: {
      attack: ['黯然销魂掌！', '玄铁重剑，横扫千军！', '领领教一下我的断臂之剑！'],
      hit: ['哼，够劲！', '雕兄，我顶得住！'],
      dodge: ['神雕步法，御风滑行！', '差得远了。'],
      heal: ['蛇胆金丹，气血重聚！', '九阴疗伤，经脉调和。'],
      debuff: ['邪魔歪道，受我重剑一击！', '凝神！'],
      dead: ['龙儿……我们终究是……', '黯然消散……神雕远飞……']
    }
  },
  '楚留香': {
    quote: '闻君有白玉美人，妙手空空，盗帅留香。',
    comment: '香帅楚留香，折扇轻摇，踏月留香，风流倜傥。',
    color: '#60a5fa',
    filter: 'hue-rotate(190deg) saturate(1.2) contrast(1.1)',
    weaponIcon: '🪭',
    weaponName: '白玉折扇',
    weaponColor: '#93c5fd',
    personality: 'mocking',
    dialogues: {
      attack: ['踏月留香，身随影动！', '折扇轻拂，破开你的空门。', '公子请接招！'],
      hit: ['哎呀，下手太重，衣裳都弄脏了。', '姑娘下手，可真是不客气。'],
      dodge: ['盗帅轻功，冠绝天下！你碰得到我？', '哈哈，失手了吧？'],
      heal: ['郁金香气，内息自转。', '缓一口气，重获新生。'],
      debuff: ['下毒？我天生无鼻，百毒难侵！', '哎呀，被缠住了，真是头疼。'],
      dead: ['留香一世……终归黄土……', '此香已逝……诸位保重……']
    }
  },
  '陆小凤': {
    quote: '四条眉毛陆小凤，灵犀一指甲天下。',
    comment: '生性风流，聪明绝顶，灵犀一指，破尽天下兵刃。',
    color: '#f59e0b',
    filter: 'sepia(0.2) saturate(1.4) contrast(1.1)',
    weaponIcon: '✌️',
    weaponName: '灵犀一指',
    weaponColor: '#fbbf24',
    personality: 'mocking',
    dialogues: {
      attack: ['接我一招灵犀指劲！', '哈哈，领教一下老陆的功夫！', '看招！'],
      hit: ['哎哟！痛死我了，我的眉毛都要被打歪了！', '好凌厉的拳脚！'],
      dodge: ['灵犀步法，凤舞九天！打不着！', '嘿，又避开了！'],
      heal: ['喝口好酒，元气满满！', '真气圆转，舒服！'],
      debuff: ['我的两个手指头，什么毒物都能夹住！', '糟糕，动弹不得了！'],
      dead: ['这下玩砸了……死得不够帅气啊……', '凤舞九天……终有落地之时……']
    }
  },
  '谢逊': {
    quote: '屠龙宝刀，号令天下，莫敢不从！',
    comment: '金毛狮王，满头金发，性烈如火，屠龙出世，震碎心脉。',
    color: '#d97706',
    filter: 'hue-rotate(30deg) saturate(1.4) contrast(1.2)',
    weaponIcon: '⚔️',
    weaponName: '屠龙刀',
    weaponColor: '#b45309',
    personality: 'heroic',
    dialogues: {
      attack: ['屠龙刀出，号令天下！', '受我一记七伤拳！', '狂狮咆哮，地动山摇！'],
      hit: ['狂妄之徒！再来啊！', '老夫这金刚之躯，何惧一击！'],
      dodge: ['听风辨器，侧身以避！', '哼，打不中老夫！'],
      heal: ['混元真气，气血逆流！', '伤势已愈，受死！'],
      debuff: ['七伤真意，万法不侵！', '吼！给我破！'],
      dead: ['无忌吾儿……老夫这辈子，值了……', '屠龙坠落……万事皆空……']
    }
  },
  '岳不群': {
    quote: '君子剑岳不群，浩然正气，紫气东来。',
    comment: '华山掌门，外谦内诡，紫霞神功，辟邪凶威，为图霸业不折手段。',
    color: '#8b5cf6',
    filter: 'hue-rotate(240deg) saturate(1.3) contrast(1.2)',
    weaponIcon: '🗡️',
    weaponName: '君子剑',
    weaponColor: '#a78bfa',
    personality: 'sinister',
    dialogues: {
      attack: ['紫霞神功，紫气东来！', '辟邪剑法，鬼魅无迹！', '今日便为武林除害！'],
      hit: ['唔！你这逆徒……竟然……', '哼，浩然护体，何惧之有！'],
      dodge: ['辟邪身法，残影连连！', '避其锋芒。'],
      heal: ['紫霞养吾，伤势愈合。', '武林霸业未成，老夫怎能倒下！'],
      debuff: ['华山正宗，诸邪避易！', '哼，卑鄙伎俩！'],
      dead: ['五岳称霸……终是一场春梦……', '华山基业……断送我手……']
    }
  },
  '丁春秋': {
    quote: '星宿老仙，法力无边，神通广大，法驾中原！',
    comment: '星宿老怪，擅使剧毒与化功大法，阴狠歹毒，门徒众多。',
    color: '#10b981',
    filter: 'hue-rotate(130deg) saturate(1.5) contrast(1.2)',
    weaponIcon: '🪶',
    weaponName: '逍遥毒扇',
    weaponColor: '#34d399',
    personality: 'sinister',
    dialogues: {
      attack: ['尝尝我的化功大法！', '星宿毒雾，见血封喉！', '星宿老仙，法力无边！'],
      hit: ['可恶的小辈，敢伤老仙！', '老仙定要让你尝尽万毒噬骨！'],
      dodge: ['老仙法力无边，岂是你能打中！', '哈哈，无用之功！'],
      heal: ['化功大法，夺人真气以自疗！', '神功护体，伤势瞬息即愈！'],
      debuff: ['对老仙用毒？真是天大的笑话！', '不知死活，破！'],
      dead: ['老仙怎么会败……我不信……', '化功自噬……呃啊……']
    }
  },
  '慕容复': {
    quote: '以彼之道，还施彼身。姑苏慕容，名震天下。',
    comment: '南慕容，复国执念，斗转星移，借力打力，城府深沉。',
    color: '#3b82f6',
    filter: 'hue-rotate(210deg) saturate(1.3) contrast(1.15)',
    weaponIcon: '⚔️',
    weaponName: '斗转气劲',
    weaponColor: '#60a5fa',
    personality: 'arrogant',
    dialogues: {
      attack: ['参合指力！', '吃我这一剑！', '以彼之道，还施彼身！'],
      hit: ['放肆！尔等庸才也敢伤我？', '唔，力道尚可！'],
      dodge: ['斗转星移，挪移力道！', '哈哈，根本打不中！'],
      heal: ['慕容家传神功，伤势恢复！', '重回巅峰，光复大燕！'],
      debuff: ['大燕天命在身，外邪难侵！', '雕虫小技，破！'],
      dead: ['大燕……我的复国大业啊……', '南慕容……竟然落得这般下场……']
    }
  },
  '燕南天': {
    quote: '天下第一神剑，神剑惊天，豪气吞吐。',
    comment: '天下第一神剑，身怀嫁衣神功，重情重义，金刚不坏。',
    color: '#ef4444',
    filter: 'hue-rotate(-10deg) saturate(1.5) contrast(1.25)',
    weaponIcon: '🗡️',
    weaponName: '南天神剑',
    weaponColor: '#ef4444',
    personality: 'heroic',
    dialogues: {
      attack: ['神剑出鞘，惊天动地！', '接我一招南天剑气！', '嫁衣神功，无上刚猛！'],
      hit: ['痛快！再来！', '金刚不坏，何惧此击！'],
      dodge: ['身随意动，避其锋芒！', '剑气随风。'],
      heal: ['嫁衣真气，自毁灭自生！', '真气长存，伤口已平。'],
      debuff: ['浩然神功，妖邪退散！', '定神！'],
      dead: ['江枫兄弟……老哥尽力了……', '神剑落地……剑气已消……']
    }
  },
  '血刀老祖': {
    quote: '血刀门下，唯杀与劫。血刀狂飙，神佛难挡！',
    comment: '血刀门掌门，行事怪癖，极其残忍阴毒，刀法怪异奇诡。',
    color: '#dc2626',
    filter: 'hue-rotate(-30deg) saturate(1.8) contrast(1.3)',
    weaponIcon: '⚔️',
    weaponName: '血刀',
    weaponColor: '#ef4444',
    personality: 'sinister',
    dialogues: {
      attack: ['血刀狂飙，见红夺命！', '桀桀桀，尝尝老祖这血光之灾！', '送你去见阎王！'],
      hit: ['该死的，老祖要活剥了你！', '哎呀，好疼！老祖要吸干你的血！'],
      dodge: ['血海飘渺步，鬼影重重！', '滑溜，打不着！'],
      heal: ['饮血自哺，伤势全消！', '桀桀，老祖又精神了！'],
      debuff: ['跟血刀门玩阴的？找死！', '老祖百毒不侵，破！'],
      dead: ['血刀已断……老祖我不甘啊……', '血刀落地……命丧黄泉……']
    }
  },
  '小鱼儿': {
    quote: '我小鱼儿是天下第一聪明人，谁能骗得了我？',
    comment: '恶人谷传人，古灵精怪，嬉笑怒骂，游戏江湖，绝顶聪明。',
    color: '#3b82f6',
    filter: 'hue-rotate(185deg) saturate(1.3) contrast(1.1)',
    weaponIcon: '🗡️',
    weaponName: '小鱼飞刀',
    weaponColor: '#60a5fa',
    personality: 'mocking',
    dialogues: {
      attack: ['看我的小鱼飞刀！', '哈哈，接本聪明人一招！', '别跑啊，我们来玩个好玩的！'],
      hit: ['哎呀呀，痛死我了！你下手可真狠！', '哼，大意了，这招算你厉害！'],
      dodge: ['打不着，打不着！你这笨蛋！', '哈哈，想打中天下第一聪明人？再练五百年吧！'],
      heal: ['吃颗恶人谷的保命丹！', '呼，伤口全好了，我们继续玩！'],
      debuff: ['哎呀，动弹不得了，你耍赖！', '手脚麻了，这药真够劲！'],
      dead: ['这回玩砸了……苏樱……', '老子是天下第一聪明人……怎么会……']
    }
  },
  '花无缺': {
    quote: '移花宫门下，不可染红尘之俗。',
    comment: '无缺公子，白衣出尘，冷傲优雅，移花绝学，无可挑剔。',
    color: '#06b6d4',
    filter: 'hue-rotate(170deg) saturate(1.2) contrast(1.15) brightness(1.05)',
    weaponIcon: '🪭',
    weaponName: '移花折扇',
    weaponColor: '#22d3ee',
    personality: 'cold',
    dialogues: {
      attack: ['移花接木！', '阁下接招了。', '请赐教。'],
      hit: ['唔。', '力道不错。'],
      dodge: ['移花飘渺，承让了。', '躲开了。'],
      heal: ['移花真气，内伤渐平。', '伤势无碍。'],
      debuff: ['静心凝神，外邪难干。', '破。'],
      dead: ['移花飘落……无缺告退……', '这便是红尘的滋味吗……']
    }
  },
  '阿飞': {
    quote: '我的剑极快，比你想的还要快。',
    comment: '飞剑客，快剑无双，坚韧赤诚，孤傲冷峻。',
    color: '#ffffff',
    filter: 'grayscale(0.95) contrast(1.2) brightness(1.1)',
    weaponIcon: '🗡️',
    weaponName: '铁条快剑',
    weaponColor: '#9ca3af',
    personality: 'cold',
    dialogues: {
      attack: ['剑出，必中！', '快！比你想象的还要快！', '拔剑。'],
      hit: ['哼。', '血。'],
      dodge: ['太慢。', '偏了。'],
      heal: ['伤口已凝。', '无碍。'],
      debuff: ['剑心不乱，诸邪不扰。', '静。'],
      dead: ['剑慢了……人亡……', '寻欢大哥……阿飞先走了……']
    }
  },
  '左冷禅': {
    quote: '五岳剑派，唯我嵩山独尊！',
    comment: '嵩山掌门，野心勃勃，寒冰真气，阴狠强横。',
    color: '#2563eb',
    filter: 'hue-rotate(220deg) saturate(1.5) contrast(1.25)',
    weaponIcon: '❄️',
    weaponName: '寒冰真劲',
    weaponColor: '#34d399',
    personality: 'arrogant',
    dialogues: {
      attack: ['寒冰真气，冻结万物！', '嵩山剑法，唯我独尊！', '接老夫这一招！'],
      hit: ['狂妄！老夫要将你冻成冰雕！', '哼，不自量力！'],
      dodge: ['嵩山御气，固若金汤！', '徒劳挣扎！'],
      heal: ['寒冰封伤，气血凝结！', '伤势瞬息恢复！'],
      debuff: ['寒冰护体，百毒不侵！', '给我散！'],
      dead: ['五岳霸业……终成泡影……', '老夫眼瞎了……心也瞎了……']
    }
  },
  '林平之': {
    quote: '血海深仇，宁负天下人，也要斩尽仇寇！',
    comment: '辟邪遗恨，因仇堕落，辟邪凶煞，狠毒残忍。',
    color: '#ec4899',
    filter: 'hue-rotate(-50deg) saturate(1.6) contrast(1.3)',
    weaponIcon: '🗡️',
    weaponName: '辟邪剑',
    weaponColor: '#f472b6',
    personality: 'sinister',
    dialogues: {
      attack: ['辟邪剑法，斩尽仇寇！', '受死吧，你们这些虚伪之人！', '看剑！'],
      hit: ['啊！该死！老子要杀光你们！', '痛！此仇不报誓不为人！'],
      dodge: ['鬼魅辟邪，你打得中我？', '哈哈，太慢了！'],
      heal: ['邪功反哺，气血自复！', '为了复仇，我绝不能倒下！'],
      debuff: ['敢对我使绊子？死！', '给我开！'],
      dead: ['爹，娘……平儿报仇了……', '灵珊……对不起……']
    }
  }
};

export default EnhancedWarriorAvatar;
