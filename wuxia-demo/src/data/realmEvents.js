// 秘境事件数据池
// 每个基础机制包含多套外围文案（马甲），系统会在运行时打乱抽取。

export const EVENT_TEMPLATES = [
  // 机制1：残局博弈 (智力+幸运校验，成功则高收益，失败心魔劫)
  {
    type: 'puzzle',
    minDepth: 0,
    contents: [
      {
        desc: "你行至一处石亭，见石桌上刻着一局未完的棋阵，黑白交错，杀机四伏。微风拂过，落叶恰好停在一个关键的死位。",
        btnA: "【收敛心神，拂袖而去】",
        btnB: "【指尖凝劲，补全残局】"
      },
      {
         desc: "石墙上刻画着错综复杂的上古八卦阵图，几个阵眼处隐隐流淌着赤红的真气，仿佛在引诱人去补齐全貌。",
         btnA: "【不作贪恋，闭目经过】",
         btnB: "【推演八卦，强行破阵】"
      },
      {
         desc: "你在地上发现了几册残破的武功简卷。虽然凌乱，但其中似乎包藏着某种互相牵制的奇妙内力运行轨迹。",
         btnA: "【敬畏前人，不随心意妄动】",
         btnB: "【打乱顺序，尝试重组心法】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => ({ depthDelta: 1, karmaDelta: 1, log: "你持守本心，安然前行。" })
        },
        {
          text: content.btnB,
          action: (p) => {
             const req = level * 1.0 + 8;
             if (p.attributes.int + p.attributes.luk >= req) {
                return { depthDelta: 3, karmaDelta: -1, log: "你灵光咋现，精妙破除了迷局！" };
             } else {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: '心魔劫', log: "你被真气倒噬，眼前一黑走火入魔！" };
             }
          }
        },
        {
          text: "【（天人感应）勘破生死阵】",
          isHidden: (p) => p.attributes.int < level * 1.5 + 8,
          action: (p) => ({ depthDelta: 3, karmaDelta: 1, log: "你凭借无上大智慧瞬间看破死结，犹如天助！" })
        }
      ]
    })
  },

  // 机制2：献祭流 (需要扣除当前50%生命，换取高因果)
  {
    type: 'sacrifice',
    minDepth: 0,
    contents: [
      {
         desc: "前方毒瘴弥漫间，一只浑身雪白的猿猴腹部流血，正指着山林深处发出微弱的哀鸣。",
         btnA: "【盘膝坐地，以自身真气为其疗伤】",
         btnB: "【无视异兽，向深处强闯】"
      },
      {
         desc: "一名少林高僧面色紫黑地倒在路边，显然中了奇毒。他口中喃喃念佛，似乎认命。",
         btnA: "【耗费自身精血，替他压制毒性】",
         btnB: "【天下不平事太多，直接绕道】"
      },
      {
         desc: "路边倒着一具衣衫破烂的女尸，周身萦绕着阴寒之气，似乎即将尸变。",
         btnA: "【刺破指尖，耗半身气血为其镇魂】",
         btnB: "【一掌将其震开，趁机突进】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => {
             const cost = Math.floor(p.hp * 0.5);
             if (cost < 1) return { depthDelta: 0, fail: true, failType: '血枯劫', log: "你气血枯竭，支撑不住晕死过去。" };
             return { depthDelta: 2, karmaDelta: 3, hpCost: cost, log: "你强忍虚弱，付出代价换来了冥冥中的一分善果。" };
          }
        },
        {
          text: content.btnB,
          action: (p) => {
             if (Math.random() < 0.4) {
               return { depthDelta: 0, karmaDelta: 0, fail: true, failType: '散功劫', log: "强闯时你吸入了周遭的剧毒阴气，顿觉功力涣散！" };
             }
             return { depthDelta: 3, karmaDelta: -2, log: "你冷酷前行，不管他人死活。" };
          }
        }
      ]
    })
  },

  // 机制3：蛮力破除 (力量+体质校验)
  {
    type: 'brute_force',
    minDepth: 2,
    contents: [
      {
         desc: "夜过破败古寺，残存的佛像金漆剥落。佛身背后传来微弱的念经声，却伴随着令人头皮发麻的骨骼摩擦声。",
         btnA: "【阿弥陀佛，放下几枚铜钱果断退避】",
         btnB: "【运转真气，掀翻佛像一探究竟】"
      },
      {
         desc: "一扇千斤重的断龙石挡住了去路。岩壁两旁有细小的侧缝，只能勉强让人侧身钻过，但充满未知的气息。",
         btnA: "【忍辱负重，从拥挤的侧缝钻过去】",
         btnB: "【运起十成功力，强行轰开断龙石】"
      },
      {
         desc: "密道中突然涌出无数铁甲地衣蟹，它们坚硬的外壳堵死了一层通道，发出刺耳的爬行声。",
         btnA: "【不愿缠斗，使用轻功顺檐壁爬过】",
         btnB: "【聚气于掌，将蟹群强行震碎开路】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => ({ depthDelta: 2, karmaDelta: 1, log: "你选择稳妥之法，并未节外生枝。" })
        },
        {
          text: content.btnB,
          action: (p) => {
             const req = level * 1.5 + 10;
             if (p.attributes.str + p.attributes.con >= req) {
                return { depthDelta: 3, karmaDelta: -2, log: "你以内功硬生生轰开一条血路，威震四方！" };
             } else {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: '血枯劫', log: "你用力过猛反而被震伤内腑，大口咯血出局！" };
             }
          }
        }
      ]
    })
  },

  // 机制4：古迹遗留 (要求高体质才有所感悟)
  {
    type: 'relic',
    minDepth: 4,
    contents: [
      {
         desc: "墓道尽头出现一具枯骨，斜靠在玄铁重剑旁，墙上刻着：“纵横江湖三十余载，杀尽仇寇，败尽英雄……” 字迹入木三分。",
         btnA: "【躬身长揖，祭奠前辈】",
         btnB: "【探手取剑，不问来处】"
      },
      {
         desc: "洞窟中央有一口干涸的寒泉，泉底雕刻着一副栩栩如生的仙女舞剑图，壁上剑痕透着森寒之意。",
         btnA: "【静坐观摩，心生敬意不触碰】",
         btnB: "【跳入泉底，抚摸剑痕试图抢夺真意】"
      },
      {
         desc: "前人留下的蒲团早已腐朽，但旁侧有一尊古铜香炉，其中那柱香至今未灭，异香扑鼻。",
         btnA: "【恭敬叩拜，谢过先人余荫】",
         btnB: "【一脚踢开香炉，寻找夹层底座】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => {
             const req = level * 1.0 + 8;
             if (p.attributes.con >= req) {
                return { depthDelta: 3, karmaDelta: 3, log: "你体质强悍，竟然接引到了其中的不灭真气，大有感悟！" };
             }
             return { depthDelta: 2, karmaDelta: 1, log: "你心怀敬意地拜别了此处。" };
          }
        },
        {
          text: content.btnB,
          action: (p) => {
             if (Math.random() < 0.4) {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: '心魔劫', log: "前人设下的禁制猛然发动，一缕魔音入脑，你疯癫着逃出了洞穴。" };
             }
             return { depthDelta: 4, karmaDelta: -3, log: "你蛮横地劫夺了此处的造化，戾气大增。" };
          }
        }
      ]
    })
  },

  // 机制5：幻境审视 (业力强校验)
  {
    type: 'illusion',
    minDepth: 6,
    contents: [
      {
         desc: "你来到一处冰窟，四壁光滑如镜。镜中的你面容扭曲，突然开口引诱道：“何必苦修？将身交我，立地成佛。”",
         btnA: "【闭目绝听，持守本心盘坐】",
         btnB: "【抽出兵刃，挥剑向镜中人斩去】"
      },
      {
         desc: "周围忽然生出一片桃花林，花瓣蹁跹间，你仿佛看到了自己最想得到的神兵、财富与权力，唾手可得。",
         btnA: "【口诵清心咒，视一切如浮云】",
         btnB: "【仰天狂笑，直直冲向那些幻影】"
      },
      {
         desc: "你踏入一片血海幻境，你的过往仇家纷纷持刀狞笑逼近，怨气冲天，周围的空间逐渐胶着沉重。",
         btnA: "【放下屠刀，盘坐任由刀剑加身】",
         btnB: "【煞气爆发，誓要杀穿这修罗地狱】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => {
             if (p.karma >= 0) {
                return { depthDelta: 3, karmaDelta: 1, log: "你平日积善累德，道心通明，幻境应势碎裂！" };
             } else {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: null, log: "你戾气太重引发了心魔暴走，大叫一声被弹出秘境！" };
             }
          }
        },
        {
          text: content.btnB,
          action: (p) => {
             const req = level * 1.5 + 15;
             if (p.attributes.str >= req) {
                return { depthDelta: 3, karmaDelta: -2, log: "你以极端暴烈之法强行斩断虚妄，但也深陷杀戮之心。" };
             } else {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: null, log: "力量不足以破界，反受巨大的精神冲击，黯然退回现世。" };
             }
          }
        }
      ]
    })
  },

  // 机制6：身法机关 (大敏捷校验)
  {
    type: 'trap',
    minDepth: 3,
    contents: [
      {
         desc: "狭窄的甬道中，地砖有些轻微的凸起。墙壁两侧排列着密密麻麻的小孔，显然是极为恶毒的连弩陷阱。",
         btnA: "【匍匐前进，虽然狼狈但极其缓慢安全】",
         btnB: "【提气于丹田，化为一道残影冲刺而过】"
      },
      {
         desc: "前方是一段只有独木桥的深渊断崖，且狂风大作，桥面上还结着厚厚的湿滑青苔。",
         btnA: "【贴紧桥面一寸一步艰难挪过去】",
         btnB: "【借力岩壁，燕子抄水般凌空踏跃】"
      },
      {
         desc: "你误入了一间流沙密室，四面漏沙极快，很快漫过膝盖，头顶只有一根摇摇欲坠的铁索直通高台。",
         btnA: "【不慌不忙，抓住墙边缝隙稳固自身寻找出路】",
         btnB: "【瞬间爆步跃起，抢抓铁索千钧一发逃窜】"
      }
    ],
    generate: (content, level) => ({
      desc: content.desc,
      choices: [
        {
          text: content.btnA,
          action: (p) => ({ depthDelta: 1, karmaDelta: 0, log: "尽管多花了些时间，但你安然无恙地度过了难关。" })
        },
        {
          text: content.btnB,
          action: (p) => {
             const req = level * 2.0 + 8;
             if (p.attributes.agi >= req) {
                return { depthDelta: 3, karmaDelta: 0, log: "你身法绝伦如鬼魅，转瞬间越过了绝境！" };
             } else {
                return { depthDelta: 0, karmaDelta: 0, fail: true, failType: '血枯劫', log: "你的身手没跟上想法，失误受伤，重重摔出了遗迹重伤！" };
             }
          }
        }
      ]
    })
  }

];

// 辅助方法：生成一组全随机化的探险事件序列队列
export function generateEventDeck() {
  let deck = [];
  // 每个类型抽1个，组成一次跑团
  EVENT_TEMPLATES.forEach(tmpl => {
    const rContent = tmpl.contents[Math.floor(Math.random() * tmpl.contents.length)];
    deck.push({ type: tmpl.type, minDepth: tmpl.minDepth, generator: (level) => tmpl.generate(rContent, level) });
  });
  // 打乱
  deck.sort(() => Math.random() - 0.5);
  return deck;
}
