import { useAudioStore } from '../store/useAudioStore';

// 音频资源定义，支持在线与本地双轨加载
export const AUDIO_RESOURCES = {
  bgm_menu: {
    online: 'https://assets.mixkit.co/music/preview/mixkit-valley-sunset-122.mp3',
    local: '/audio/bgm_menu.wav'
  },
  bgm_battle: {
    online: 'https://assets.mixkit.co/music/preview/mixkit-epic-drums-of-war-281.mp3',
    local: '/audio/bgm_battle.wav'
  },
  bgm_realm: {
    online: 'https://assets.mixkit.co/music/preview/mixkit-mysterious-anticipation-1111.mp3',
    local: '/audio/bgm_realm.wav'
  },
  bgm_market: {
    online: 'https://assets.mixkit.co/music/preview/mixkit-asian-prologue-164.mp3',
    local: '/audio/bgm_market.wav'
  },
  sfx_click: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-wooden-gong-single-hit-2200.mp3',
    local: '/audio/sfx_click.wav'
  },
  sfx_allocate: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-game-quick-drop-2843.mp3',
    local: '/audio/sfx_allocate.wav'
  },
  sfx_levelup: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-level-up-achievement-completion-1898.mp3',
    local: '/audio/sfx_levelup.wav'
  },
  sfx_task_accept: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-stamp-ink-press-impact-2374.mp3',
    local: '/audio/sfx_task_accept.wav'
  },
  sfx_encounter_trigger: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-wood-striking-single-hit-2204.mp3',
    local: '/audio/sfx_encounter_trigger.wav'
  },
  sfx_success: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-win-game-chime-1996.mp3',
    local: '/audio/sfx_success.wav'
  },
  sfx_fail: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3',
    local: '/audio/sfx_fail.wav'
  },
  sfx_coin: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-coin-win-notification-1999.mp3',
    local: '/audio/sfx_coin.wav'
  },
  sfx_gavel: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-wooden-mallet-gavel-tap-2206.mp3',
    local: '/audio/sfx_gavel.wav'
  },
  sfx_sword: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-sword-strikes-heavy-2195.mp3',
    local: '/audio/sfx_sword.wav'
  },
  sfx_blade: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-kitchen-knife-cut-on-board-2475.mp3',
    local: '/audio/sfx_blade.wav'
  },
  sfx_fist: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-boxer-punch-2050.mp3',
    local: '/audio/sfx_fist.wav'
  },
  sfx_magic: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-fire-spell-2848.mp3',
    local: '/audio/sfx_magic.wav'
  },
  sfx_dodge: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-arrow-foley-whip-rush-2376.mp3',
    local: '/audio/sfx_dodge.wav'
  },
  sfx_heal: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-fairy-bell-sweep-2384.mp3',
    local: '/audio/sfx_heal.wav'
  },
  sfx_poison: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-acid-burn-leak-sizzles-2377.mp3',
    local: '/audio/sfx_poison.wav'
  },
  sfx_stun: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-electric-hum-2840.mp3',
    local: '/audio/sfx_stun.wav'
  },
  sfx_silence: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-soft-breeze-wind-in-trees-brush-2434.mp3',
    local: '/audio/sfx_silence.wav'
  },
  sfx_internal: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-falling-on-wooden-roof-2191.mp3',
    local: '/audio/sfx_internal.wav'
  },
  sfx_shield: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-large-gong-strike-2202.mp3',
    local: '/audio/sfx_shield.wav'
  },
  sfx_revive: {
    online: 'https://assets.mixkit.co/sfx/preview/mixkit-bell-magical-shine-clean-1997.mp3',
    local: '/audio/sfx_revive.wav'
  }
};

// Web Audio API 实时声音合成引擎
class WebAudioSynthesizerClass {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.currentBgmId = null;
    this.currentBgmTrack = null;

    this.musicVolume = 0.5;
    this.sfxVolume = 0.5;
    this.isMuted = false;
  }

  // 初始化 AudioContext 与全局 Gain 节点
  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.syncVolume(this.musicVolume, this.sfxVolume, this.isMuted);
    } catch (e) {
      console.warn('初始化 Web Audio API 合成器失败：', e);
    }
  }

  // 恢复 AudioContext，用于解锁自动播放限制
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        console.warn('恢复 AudioContext 状态失败：', err);
      });
    }
  }

  // 同步全局的音量设置与静音状态
  syncVolume(musicVolume, sfxVolume, isMuted) {
    this.musicVolume = musicVolume;
    this.sfxVolume = sfxVolume;
    this.isMuted = isMuted;

    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    try {
      if (isMuted) {
        this.masterGain.gain.setValueAtTime(0, t);
      } else {
        this.masterGain.gain.setValueAtTime(1, t);
        this.musicGain.gain.setValueAtTime(musicVolume, t);
        this.sfxGain.gain.setValueAtTime(sfxVolume, t);
      }
    } catch (e) {
      console.warn('同步合成器音量失败：', e);
    }
  }

  // 播放合成背景音乐：支持音轨交叉淡入淡出（Crossfade）
  playBgm(musicId) {
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. 同名背景乐且音轨正在运行，则忽略
    if (this.currentBgmId === musicId && this.currentBgmTrack) {
      return;
    }

    // 2. 淡出旧背景音乐合成音轨
    if (this.currentBgmTrack) {
      const oldTrack = this.currentBgmTrack;
      if (oldTrack.timer) {
        clearInterval(oldTrack.timer);
      }
      if (oldTrack.drones) {
        oldTrack.drones.forEach((d) => {
          try {
            d.stop();
          } catch (e) {}
        });
      }
      try {
        oldTrack.gainNode.gain.setValueAtTime(oldTrack.gainNode.gain.value, now);
        oldTrack.gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
        setTimeout(() => {
          try {
            oldTrack.gainNode.disconnect();
          } catch (e) {}
        }, 1600);
      } catch (e) {
        console.warn('淡出旧合成BGM出错：', e);
      }
    }

    // 3. 创建新背景音乐音轨
    const newGainNode = this.ctx.createGain();
    newGainNode.gain.setValueAtTime(0, now);
    newGainNode.connect(this.musicGain);

    const newTrack = {
      gainNode: newGainNode,
      timer: null,
      drones: null,
      musicId: musicId
    };

    this.currentBgmId = musicId;
    this.currentBgmTrack = newTrack;

    // 开始淡入新音轨
    newGainNode.gain.linearRampToValueAtTime(1.0, now + 1.5);

    // 启动对应音乐的自动演奏循环
    this.startBgmLoop(newTrack);
  }

  // 停止合成背景音乐
  stopBgm() {
    if (this.currentBgmTrack) {
      if (this.currentBgmTrack.timer) {
        clearInterval(this.currentBgmTrack.timer);
      }
      if (this.currentBgmTrack.drones) {
        this.currentBgmTrack.drones.forEach((d) => {
          try {
            d.stop();
          } catch (e) {}
        });
      }
      try {
        this.currentBgmTrack.gainNode.disconnect();
      } catch (e) {}
      this.currentBgmTrack = null;
      this.currentBgmId = null;
    }
  }

  // 各种背景乐的自动演奏引擎
  startBgmLoop(track) {
    const musicId = track.musicId;
    const ctx = this.ctx;
    const outNode = track.gainNode;

    // 延时与反馈节点（为古琴曲 bgm_menu 和 秘境 bgm_realm 提供空灵的混响延时）
    let delayNode = null;
    let feedbackGain = null;
    if (musicId === 'bgm_menu' || musicId === 'bgm_realm') {
      delayNode = ctx.createDelay();
      delayNode.delayTime.value = musicId === 'bgm_menu' ? 0.45 : 0.8;
      feedbackGain = ctx.createGain();
      feedbackGain.gain.value = musicId === 'bgm_menu' ? 0.35 : 0.5;

      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      delayNode.connect(outNode);
    }

    // 辅助函数：播放单个物理建模合成琴音（多重谐音 + 极短高频白噪指甲起音）
    const playPluck = (freq, duration, volume) => {
      const t = ctx.currentTime;
      
      // 1. 基波 (Triangle)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);
      
      // 2. 第一谐波 (Sine - 2倍频，明亮感)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);
      
      // 3. 第二谐波 (Sine - 3倍频，温润感)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, t);

      // 4. 指甲拨弦瞬态擦音 (极短白噪声起音)
      const clickNode = this.createNoiseBufferNode(0.015);
      let clickGain = null;
      if (clickNode) {
        const clickFilter = ctx.createBiquadFilter();
        clickFilter.type = 'highpass';
        clickFilter.frequency.value = 3200;
        clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(volume * 0.35, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
        
        clickNode.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(outNode);
      }

      // 包络设置
      gain1.gain.setValueAtTime(0, t);
      gain1.gain.linearRampToValueAtTime(volume, t + 0.018);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + duration);

      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(volume * 0.3, t + 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.65);

      gain3.gain.setValueAtTime(0, t);
      gain3.gain.linearRampToValueAtTime(volume * 0.12, t + 0.01);
      gain3.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.4);

      // 连接输出
      osc1.connect(gain1); gain1.connect(outNode);
      osc2.connect(gain2); gain2.connect(outNode);
      osc3.connect(gain3); gain3.connect(outNode);
      
      if (delayNode) {
        gain1.connect(delayNode);
      }

      // 启动与销毁
      osc1.start(t); osc1.stop(t + duration + 0.1);
      osc2.start(t); osc2.stop(t + duration + 0.1);
      osc3.start(t); osc3.stop(t + duration + 0.1);
      if (clickNode) {
        clickNode.start(t);
        clickNode.stop(t + 0.02);
      }
    };

    if (musicId === 'bgm_menu') {
      // 古琴独奏（C4 五声音阶）：宫 C4, 商 D4, 角 E4, 徵 G4, 羽 A4 + 八度和低八度
      const pentatonic = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      const triggerNote = () => {
        const idx = Math.floor(Math.random() * pentatonic.length);
        const freq = pentatonic[idx];
        const vol = 0.22 + Math.random() * 0.12;
        const duration = 2.0 + Math.random() * 1.0;
        playPluck(freq, duration, vol);

        // 30% 概率播放一个双音（和弦）
        if (Math.random() < 0.3) {
          setTimeout(() => {
            if (track !== this.currentBgmTrack) return;
            const harmonyDist = Math.random() < 0.5 ? 2 : 4;
            const harmonyFreq = pentatonic[(idx + harmonyDist) % pentatonic.length];
            playPluck(harmonyFreq, duration * 0.8, vol * 0.7);
          }, 120);
        }
      };

      triggerNote();
      track.timer = setInterval(() => {
        const delay = Math.random() * 300 - 150;
        setTimeout(() => {
          if (track === this.currentBgmTrack) {
            triggerNote();
          }
        }, Math.max(0, delay));
      }, 1400);
    } else if (musicId === 'bgm_battle') {
      // 铁马冰河战鼓 (每 220ms 一拍)
      let beatCount = 0;
      const playDrum = (freq, vol, duration) => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(30, t + duration);

        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(outNode);
        osc.start(t);
        osc.stop(t + duration + 0.05);
      };

      const playCymbal = (vol) => {
        const t = ctx.currentTime;
        const noise = this.createNoiseBufferNode(0.08);
        if (!noise) return;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(outNode);
        noise.start(t);
        noise.stop(t + 0.1);
      };

      track.timer = setInterval(() => {
        beatCount++;
        const mod = beatCount % 4;
        if (mod === 0) {
          playDrum(75, 0.45, 0.2);
          if (Math.random() < 0.5) playCymbal(0.06);
        } else if (mod === 1) {
          playDrum(65, 0.2, 0.12);
        } else if (mod === 2) {
          if (Math.random() < 0.7) {
            playDrum(60, 0.15, 0.1);
          }
        } else {
          playDrum(70, 0.3, 0.15);
          playCymbal(0.04);
        }
      }, 220);
    } else if (musicId === 'bgm_realm') {
      // 虚无空鸣：Drone 低音 + 偶尔高频水滴
      const t = ctx.currentTime;
      const drone1 = ctx.createOscillator();
      const drone2 = ctx.createOscillator();
      const droneGain1 = ctx.createGain();
      const droneGain2 = ctx.createGain();

      drone1.type = 'sine';
      drone1.frequency.value = 65.41;
      drone2.type = 'sine';
      drone2.frequency.value = 98.0;

      droneGain1.gain.setValueAtTime(0.06, t);
      droneGain2.gain.setValueAtTime(0.04, t);

      drone1.connect(droneGain1);
      droneGain1.connect(outNode);
      drone2.connect(droneGain2);
      droneGain2.connect(outNode);

      drone1.start(t);
      drone2.start(t);

      track.drones = [drone1, drone2];

      const pentatonicHigh = [880.0, 987.77, 1046.5, 1174.66, 1318.51, 1567.98];
      const triggerHighEcho = () => {
        const idx = Math.floor(Math.random() * pentatonicHigh.length);
        const freq = pentatonicHigh[idx];
        const vol = 0.1 + Math.random() * 0.06;
        playPluck(freq, 3.5, vol);
      };

      track.timer = setInterval(() => {
        if (Math.random() < 0.6) {
          triggerHighEcho();
        }
      }, 4500);
    } else if (musicId === 'bgm_market') {
      // 黑市市井小调
      const melody = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66];
      let noteIdx = 0;

      const playSoftNote = (freq, duration, vol) => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(outNode);
        osc.start(t);
        osc.stop(t + duration + 0.05);
      };

      track.timer = setInterval(() => {
        if (Math.random() < 0.25) {
          noteIdx = (noteIdx + 1) % melody.length;
          return;
        }

        const baseFreq = melody[noteIdx];
        let freq = baseFreq;
        if (Math.random() < 0.15) freq *= 2;

        playSoftNote(freq, 0.45, 0.14);
        noteIdx = (noteIdx + 1) % melody.length;
      }, 450);
    }
  }

  // 辅助函数：创建白噪声 Buffer 节点
  createNoiseBufferNode(duration) {
    if (!this.ctx) return null;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      return source;
    } catch (e) {
      return null;
    }
  }

  // 播放音效实时合成
  playSfx(sfxId) {
    this.resume();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const sfxGain = this.sfxGain;

    switch (sfxId) {
      case 'sfx_click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
      case 'sfx_allocate': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }
      case 'sfx_levelup': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(t);
          osc.stop(t + 0.7);
        });
        break;
      }
      case 'sfx_task_accept': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);

        const noise = this.createNoiseBufferNode(0.15);
        if (noise) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 250;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.15, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(sfxGain);
          noise.start(now);
          noise.stop(now + 0.2);
        }
        break;
      }
      case 'sfx_encounter_trigger': {
        [0, 0.08].forEach((delay) => {
          const t = now + delay;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(120, t + 0.06);
          gain.gain.setValueAtTime(0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(t);
          osc.stop(t + 0.07);
        });
        break;
      }
      case 'sfx_success': {
        const freqs = [261.63, 329.63, 392.0, 523.25];
        freqs.forEach((freq, idx) => {
          const t = now + idx * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(t);
          osc.stop(t + 0.6);
        });
        break;
      }
      case 'sfx_fail': {
        const freqs = [440.0, 349.23, 293.66];
        freqs.forEach((freq, idx) => {
          const t = now + idx * 0.1;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.linearRampToValueAtTime(freq - 50, t + 0.4);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(t);
          osc.stop(t + 0.5);
        });
        break;
      }
      case 'sfx_coin': {
        [0, 0.06].forEach((delay) => {
          const t = now + delay;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(987.77, t);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1318.51, t);

          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(sfxGain);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.1);
          osc2.stop(t + 0.1);
        });
        break;
      }
      case 'sfx_gavel': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
      case 'sfx_sword': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.21);
        break;
      }
      case 'sfx_blade': {
        const noise = this.createNoiseBufferNode(0.18);
        if (noise) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);
          filter.Q.value = 3;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(sfxGain);

          noise.start(now);
          noise.stop(now + 0.19);
        }
        break;
      }
      case 'sfx_fist': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.08);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
      case 'sfx_magic': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.35);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(1500, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }
      case 'sfx_dodge': {
        const noise = this.createNoiseBufferNode(0.12);
        if (noise) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 600;
          filter.Q.value = 1.5;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(sfxGain);

          noise.start(now);
          noise.stop(now + 0.13);
        }
        break;
      }
      case 'sfx_heal': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.4);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }
      case 'sfx_poison': {
        const noise = this.createNoiseBufferNode(0.4);
        if (noise) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2200;
          filter.Q.value = 10;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(sfxGain);

          noise.start(now);
          noise.stop(now + 0.41);
        }
        break;
      }
      case 'sfx_stun': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1600;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 18;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.5;

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        osc.connect(gain);
        gain.connect(sfxGain);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.5);
        osc.stop(now + 0.5);
        break;
      }
      case 'sfx_silence': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }
      case 'sfx_internal': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.25);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'sfx_shield': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(155, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(465, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);
        break;
      }
      case 'sfx_revive': {
        const notes = [220.0, 277.18, 329.63, 415.3, 554.37, 659.25, 830.61];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

          osc.connect(gain);
          gain.connect(sfxGain);
          osc.start(t);
          osc.stop(t + 1.0);
        });
        break;
      }
      default:
        console.warn(`未注册的合成音效 ID: ${sfxId}`);
        break;
    }
  }
}

export const WebAudioSynthesizer = new WebAudioSynthesizerClass();

class SoundManagerClass {
  constructor() {
    this.musicVolume = 0.5;
    this.sfxVolume = 0.5;
    this.isMuted = false;
    this.unlocked = false;

    this.audioPool = {};
    this.bgmChannels = [null, null];
    this.activeChannelIndex = 0;
    this.currentMusicId = null;
    this.pendingMusicId = null;

    this.crossfadeTimer = null;
    this.maxPoolSizePerSfx = 5;

    this.fallbackToSynth = {};

    const initialState = useAudioStore.getState();
    this.musicVolume = initialState.musicVolume;
    this.sfxVolume = initialState.sfxVolume;
    this.isMuted = initialState.isMuted;

    WebAudioSynthesizer.syncVolume(this.musicVolume, this.sfxVolume, this.isMuted);

    useAudioStore.subscribe((state) => {
      this.musicVolume = state.musicVolume;
      this.sfxVolume = state.sfxVolume;
      this.isMuted = state.isMuted;
      this.syncVolumes();
    });
  }

  syncVolumes() {
    this.bgmChannels.forEach((audio, idx) => {
      if (audio) {
        audio.muted = this.isMuted;
        if (!this.isMuted) {
          if (idx === this.activeChannelIndex) {
            audio.volume = this.musicVolume;
          }
        }
      }
    });

    Object.values(this.audioPool).forEach((pool) => {
      pool.forEach((audio) => {
        if (audio && !audio.paused) {
          audio.muted = this.isMuted;
          if (!this.isMuted) {
            audio.volume = this.sfxVolume;
          }
        }
      });
    });

    WebAudioSynthesizer.syncVolume(this.musicVolume, this.sfxVolume, this.isMuted);
  }

  unlock() {
    if (this.unlocked) return;

    WebAudioSynthesizer.resume();

    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    testAudio.play()
      .then(() => {
        this.unlocked = true;
        console.log('全局音频自动播放已解锁。');

        if (this.pendingMusicId) {
          const musicIdToPlay = this.pendingMusicId;
          this.pendingMusicId = null;
          this.playMusic(musicIdToPlay);
        }
      })
      .catch((err) => {
        console.warn('自动播放解锁动作被阻止，需等待真实用户在页面上产生交互：', err);
        WebAudioSynthesizer.resume();
      });
  }

  _createAudioWithFallback(audioId, type = 'sfx') {
    const config = AUDIO_RESOURCES[audioId];
    if (!config) {
      console.warn(`未注册的音频 ID: ${audioId}`);
      return null;
    }

    const audio = new Audio();
    audio.volume = type === 'sfx' ? this.sfxVolume : this.musicVolume;
    audio.muted = this.isMuted;

    let isFallbackTriggered = false;

    const timeoutId = setTimeout(() => {
      if (audio.readyState < 2 && !isFallbackTriggered) {
        triggerOnlineFallback();
      }
    }, 2000);

    const triggerOnlineFallback = () => {
      isFallbackTriggered = true;
      clearTimeout(timeoutId);
      audio.onerror = null;
      audio.oncanplaythrough = null;

      console.warn(`本地音频 [${audioId}] 加载超时，尝试回退加载在线备用音轨: ${config.online}`);
      audio.src = config.online;
      audio.load();
    };

    audio.onerror = () => {
      if (!isFallbackTriggered) {
        triggerOnlineFallback();
      } else {
        console.warn(`音频资源 [${audioId}] 本地与在线均加载失败，已激活 Web Audio 实时合成器进行降级播放。`);
        this.fallbackToSynth[audioId] = true;

        if (type === 'music' && this.currentMusicId === audioId) {
          WebAudioSynthesizer.playBgm(audioId);
        }
      }
    };

    audio.oncanplaythrough = () => {
      clearTimeout(timeoutId);
    };

    // 本地优先：默认首选加载本地覆盖的 WAV 静态资源
    audio.src = config.local;
    return audio;
  }

  playMusic(musicId) {
    if (!AUDIO_RESOURCES[musicId]) {
      console.warn(`未注册的背景音乐 ID: ${musicId}`);
      return;
    }

    if (this.currentMusicId === musicId) {
      if (this.fallbackToSynth[musicId]) {
        if (WebAudioSynthesizer.currentBgmId === musicId) return;
      } else {
        const activeAudio = this.bgmChannels[this.activeChannelIndex];
        if (activeAudio && !activeAudio.paused) return;
      }
    }

    if (!this.unlocked) {
      this.pendingMusicId = musicId;
    }

    this.currentMusicId = musicId;

    if (this.fallbackToSynth[musicId]) {
      this.bgmChannels.forEach((audio) => {
        if (audio) {
          try { audio.pause(); } catch(e) {}
        }
      });
      WebAudioSynthesizer.playBgm(musicId);
      return;
    }

    WebAudioSynthesizer.stopBgm();

    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
      this.crossfadeTimer = null;
    }

    const prevChannelIndex = this.activeChannelIndex;
    const nextChannelIndex = 1 - this.activeChannelIndex;
    this.activeChannelIndex = nextChannelIndex;

    const prevAudio = this.bgmChannels[prevChannelIndex];

    let nextAudio = this.bgmChannels[nextChannelIndex];
    if (nextAudio) {
      nextAudio.pause();
      nextAudio.onerror = null;
      nextAudio.oncanplaythrough = null;
    }

    nextAudio = this._createAudioWithFallback(musicId, 'music');
    if (!nextAudio) return;

    nextAudio.loop = true;
    nextAudio.volume = 0;
    this.bgmChannels[nextChannelIndex] = nextAudio;

    const playPromise = nextAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`播放背景音乐 [${musicId}] 失败，紧急激活 Web Audio 合成琴音：`, err);
        this.fallbackToSynth[musicId] = true;
        try { nextAudio.pause(); } catch(e) {}
        WebAudioSynthesizer.playBgm(musicId);
      });
    }

    const duration = 1500;
    const steps = 15;
    const interval = duration / steps;
    let stepCount = 0;

    const targetMaxVolume = this.musicVolume;
    const prevStartVolume = prevAudio ? prevAudio.volume : 0;

    this.crossfadeTimer = setInterval(() => {
      stepCount++;
      const ratio = stepCount / steps;

      if (prevAudio && !prevAudio.paused) {
        prevAudio.volume = Math.max(0, prevStartVolume * (1 - ratio));
        if (stepCount >= steps) {
          prevAudio.pause();
        }
      }

      if (nextAudio && !this.fallbackToSynth[musicId]) {
        nextAudio.volume = Math.min(targetMaxVolume, targetMaxVolume * ratio);
      }

      if (stepCount >= steps) {
        clearInterval(this.crossfadeTimer);
        this.crossfadeTimer = null;
        if (prevAudio) {
          prevAudio.volume = 0;
        }
        if (nextAudio && !this.fallbackToSynth[musicId]) {
          nextAudio.volume = targetMaxVolume;
        }
      }
    }, interval);
  }

  // 播放 SFX 音效：支持并发重叠播放和缓存实例池化复用
  play(sfxId) {
    if (!AUDIO_RESOURCES[sfxId]) {
      console.warn(`未注册的音效 ID: ${sfxId}`);
      return;
    }

    // 如果已经降级为合成器模式，直接调用合成器播放
    if (this.fallbackToSynth[sfxId]) {
      WebAudioSynthesizer.playSfx(sfxId);
      return;
    }

    // 对频繁触发的潜能点分配音效加入 150ms 冷却节流限制，防多音重叠破音
    if (sfxId === 'sfx_allocate') {
      const now = Date.now();
      if (this.lastAllocateTime && now - this.lastAllocateTime < 150) {
        return;
      }
      this.lastAllocateTime = now;
    }

    if (!this.audioPool[sfxId]) {
      this.audioPool[sfxId] = [];
    }

    const pool = this.audioPool[sfxId];

    // 1. 寻找闲置的音频播放实例
    let audio = pool.find((inst) => inst.paused || inst.ended);

    if (audio) {
      audio.currentTime = 0;
      audio.muted = this.isMuted;
      audio.volume = this.sfxVolume;
    } else {
      // 2. 无空闲实例可用，检查是否超出该音效的池上限
      if (pool.length < this.maxPoolSizePerSfx) {
        audio = this._createAudioWithFallback(sfxId, 'sfx');
        if (audio) {
          pool.push(audio);
        }
      } else {
        // 超出并发上限，复用最旧的正在播放的实例，强行掐断并重头播放
        audio = pool.shift();
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = this.isMuted;
          audio.volume = this.sfxVolume;
          pool.push(audio); // 放回队尾
        }
      }
    }

    if (audio) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`播放音效 [${sfxId}] 遇到异常，紧急转入 Web Audio 实时合成发声：`, err);
          this.fallbackToSynth[sfxId] = true;
          WebAudioSynthesizer.playSfx(sfxId);
        });
      }
    } else {
      // 降级使用合成器发声
      WebAudioSynthesizer.playSfx(sfxId);
    }
  }
}

// 导出全局单例对象
export const SoundManager = new SoundManagerClass();

