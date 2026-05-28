import { useAudioStore } from '../store/useAudioStore';

// 音频资源定义，只使用本地自定义的 WAV 音频
export const AUDIO_RESOURCES = {
  bgm_menu: { local: '/audio/bgm_menu.wav' },
  bgm_battle: { local: '/audio/bgm_battle.wav' },
  bgm_realm: { local: '/audio/bgm_realm.wav' },
  bgm_market: { local: '/audio/bgm_market.wav' },
  sfx_click: { local: '/audio/sfx_click.wav' },
  sfx_allocate: { local: '/audio/sfx_allocate.wav' },
  sfx_levelup: { local: '/audio/sfx_levelup.wav' },
  sfx_task_accept: { local: '/audio/sfx_task_accept.wav' },
  sfx_encounter_trigger: { local: '/audio/sfx_encounter_trigger.wav' },
  sfx_success: { local: '/audio/sfx_success.wav' },
  sfx_fail: { local: '/audio/sfx_fail.wav' },
  sfx_coin: { local: '/audio/sfx_coin.wav' },
  sfx_gavel: { local: '/audio/sfx_gavel.wav' },
  sfx_sword: { local: '/audio/sfx_sword.wav' },
  sfx_blade: { local: '/audio/sfx_blade.wav' },
  sfx_fist: { local: '/audio/sfx_fist.wav' },
  sfx_magic: { local: '/audio/sfx_magic.wav' },
  sfx_dodge: { local: '/audio/sfx_dodge.wav' },
  sfx_heal: { local: '/audio/sfx_heal.wav' },
  sfx_poison: { local: '/audio/sfx_poison.wav' },
  sfx_stun: { local: '/audio/sfx_stun.wav' },
  sfx_silence: { local: '/audio/sfx_silence.wav' },
  sfx_internal: { local: '/audio/sfx_internal.wav' },
  sfx_shield: { local: '/audio/sfx_shield.wav' },
  sfx_revive: { local: '/audio/sfx_revive.wav' }
};

// 特定音效的音量补偿系数（放大系数）
const SFX_VOLUME_MULTIPLIERS = {
  sfx_click: 40,                  // 按键点击声放大 4.0 倍
  sfx_sword: 20,                  // 剑击音效
  sfx_blade: 20,                  // 刀击音效
  sfx_fist: 8,                   // 拳击音效
  sfx_magic: 60,                  // 绝招/法术音效
  sfx_dodge: 3.0,                  // 闪避音效
  sfx_heal: 3.0,                   // 治疗音效
  sfx_poison: 1,                 // 中毒音效
  sfx_stun: 3.0,                   // 晕眩音效
  sfx_silence: 8,                // 封穴音效
  sfx_internal: 1,               // 内伤音效
  sfx_shield: 1,                 // 护盾音效
  sfx_revive: 3.0,                 // 复活音效
  sfx_encounter_trigger: 3.0,      // 遭遇战音效
  sfx_levelup: 3.0,                // 升级/突破音效
  sfx_task_accept: 5,            // 揭榜音效
  sfx_coin: 4,                   // 金币音效
  sfx_gavel: 8                   // 惊堂木音效
};

// Web Audio API 实时声音合成引擎 (已按用户要求禁用，只允许播放本地定制 WAV 音乐)
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

  init() { }
  resume() { }

  syncVolume(musicVolume, sfxVolume, isMuted) {
    this.musicVolume = musicVolume;
    this.sfxVolume = sfxVolume;
    this.isMuted = isMuted;
  }

  playBgm(musicId) {
    console.log(`[合成器已禁用] 拒绝合成背景音乐: ${musicId}`);
  }

  stopBgm() { }

  playSfx(sfxId) {
    console.log(`[合成器已禁用] 拒绝合成音效: ${sfxId}`);
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
    this.bgmAudio = null; // 用单个 Audio 对象作为背景音乐通道，物理上杜绝重叠！
    this.currentMusicId = null;
    this.pendingMusicId = null;
    this.fadeTimer = null;
    this.maxPoolSizePerSfx = 5;

    // BGM 避让（Ducking）状态管理
    this.isDucked = false;
    this.duckTimer = null;
    this.duckRestoreInterval = null;

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
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.isMuted;
      if (!this.isMuted) {
        if (this.isDucked) {
          this.bgmAudio.volume = this.musicVolume * 0.20;
        } else if (!this.fadeTimer && !this.duckRestoreInterval) {
          this.bgmAudio.volume = this.musicVolume;
        }
      }
    }

    Object.values(this.audioPool).forEach((pool) => {
      pool.forEach((audio) => {
        if (audio && !audio.paused) {
          audio.muted = this.isMuted;
          if (!this.isMuted) {
            const sfxId = audio.sfxId || '';
            const multiplier = SFX_VOLUME_MULTIPLIERS[sfxId] || 1.0;
            audio.volume = Math.min(1.0, this.sfxVolume * multiplier);
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
    audio.sfxId = audioId; // 标记音效ID，方便同步音量时应用倍数系数
    const volumeMultiplier = type === 'sfx' ? (SFX_VOLUME_MULTIPLIERS[audioId] || 1.0) : 1.0;
    audio.volume = Math.min(1.0, (type === 'sfx' ? this.sfxVolume : this.musicVolume) * volumeMultiplier);
    audio.muted = this.isMuted;

    // 纯本地播放：直接指定 local 的 WAV 静态资源
    audio.src = config.local;
    return audio;
  }

  playMusic(musicId) {
    if (!AUDIO_RESOURCES[musicId]) {
      console.warn(`未注册的背景音乐 ID: ${musicId}`);
      return;
    }

    if (this.currentMusicId === musicId && this.bgmAudio && !this.bgmAudio.paused) {
      return;
    }

    if (!this.unlocked) {
      this.pendingMusicId = musicId;
    }

    this.currentMusicId = musicId;

    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }
    if (this.duckRestoreInterval) {
      clearInterval(this.duckRestoreInterval);
      this.duckRestoreInterval = null;
    }
    this.isDucked = false;

    const config = AUDIO_RESOURCES[musicId];
    if (!config) return;

    // 如果当前正在播放，先进行快速淡出，然后再切换音轨
    if (this.bgmAudio && !this.bgmAudio.paused) {
      let currentVol = this.bgmAudio.volume;
      const fadeOutSteps = 8;
      const fadeOutInterval = 40; // 共 320ms 淡出，快捷干净
      let step = 0;

      this.fadeTimer = setInterval(() => {
        step++;
        if (this.bgmAudio) {
          this.bgmAudio.volume = Math.max(0, currentVol * (1 - step / fadeOutSteps));
        }
        if (step >= fadeOutSteps) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
          this.changeAndPlayBgm(musicId, config.local);
        }
      }, fadeOutInterval);
    } else {
      this.changeAndPlayBgm(musicId, config.local);
    }
  }

  changeAndPlayBgm(musicId, src) {
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
    }

    this.bgmAudio.pause();
    this.bgmAudio.src = src;
    this.bgmAudio.muted = this.isMuted;
    this.bgmAudio.volume = 0;

    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`播放背景音乐 [${musicId}] 失败：`, err);
      });
    }

    // 渐入新音乐
    const fadeInSteps = 10;
    const fadeInInterval = 50; // 共 500ms 渐入
    let step = 0;
    const targetMaxVolume = this.musicVolume;

    this.fadeTimer = setInterval(() => {
      step++;
      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.min(targetMaxVolume, targetMaxVolume * (step / fadeInSteps));
      }
      if (step >= fadeInSteps) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        if (this.bgmAudio) {
          this.bgmAudio.volume = targetMaxVolume;
        }
      }
    }, fadeInInterval);
  }

  // 战斗胜利或失败音效的 BGM 压低避让机制 (Ducking)
  duckBgm(durationMs) {
    if (!this.bgmAudio || this.isMuted) return;

    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
    }
    if (this.duckRestoreInterval) {
      clearInterval(this.duckRestoreInterval);
      this.duckRestoreInterval = null;
    }

    this.isDucked = true;
    const duckedVol = this.musicVolume * 0.20; // 压低至正常音量的 20%
    this.bgmAudio.volume = duckedVol;

    this.duckTimer = setTimeout(() => {
      // 渐进式平滑恢复音量
      let step = 0;
      const steps = 10;
      this.duckRestoreInterval = setInterval(() => {
        step++;
        if (this.bgmAudio && !this.isMuted && this.isDucked) {
          this.bgmAudio.volume = duckedVol + (this.musicVolume - duckedVol) * (step / steps);
        }
        if (step >= steps) {
          clearInterval(this.duckRestoreInterval);
          this.duckRestoreInterval = null;
          this.isDucked = false;
          if (this.bgmAudio && !this.isMuted) {
            this.bgmAudio.volume = this.musicVolume;
          }
        }
      }, 50); // 500ms 恢复
    }, durationMs);
  }

  // 播放 SFX 音效：支持并发重叠播放和缓存实例池化复用
  play(sfxId) {
    if (!AUDIO_RESOURCES[sfxId]) {
      console.warn(`未注册的音效 ID: ${sfxId}`);
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

    // 战斗胜利/失败音效触发时压低背景音乐
    if (sfxId === 'sfx_success' || sfxId === 'sfx_fail') {
      this.duckBgm(2500); // 避让压低 2.5 秒
    }

    if (!this.audioPool[sfxId]) {
      this.audioPool[sfxId] = [];
    }

    const pool = this.audioPool[sfxId];

    // 1. 寻找闲置的音频播放实例
    let audio = pool.find((inst) => inst.paused || inst.ended);

    const volumeMultiplier = SFX_VOLUME_MULTIPLIERS[sfxId] || 1.0;
    const targetVolume = Math.min(1.0, this.sfxVolume * volumeMultiplier);

    if (audio) {
      audio.currentTime = 0;
      audio.muted = this.isMuted;
      audio.volume = targetVolume;
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
          audio.volume = targetVolume;
          pool.push(audio); // 放回队尾
        }
      }
    }

    if (audio) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`播放音效 [${sfxId}] 遇到异常：`, err);
        });
      }
    }
  }
}

// 导出全局单例对象
export const SoundManager = new SoundManagerClass();
