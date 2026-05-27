import { create } from 'zustand';

export const useAudioStore = create((set) => ({
  // 音频设置状态，优先从本地缓存读取，默认为 0.5
  musicVolume: parseFloat(localStorage.getItem('wuxia_music_volume') ?? '0.5'),
  sfxVolume: parseFloat(localStorage.getItem('wuxia_sfx_volume') ?? '0.5'),
  isMuted: localStorage.getItem('wuxia_is_muted') === 'true',

  // 设置背景音乐音量
  setMusicVolume: (volume) => set(() => {
    localStorage.setItem('wuxia_music_volume', volume.toString());
    return { musicVolume: volume };
  }),

  // 设置音效音量
  setSfxVolume: (volume) => set(() => {
    localStorage.setItem('wuxia_sfx_volume', volume.toString());
    return { sfxVolume: volume };
  }),

  // 设置静音状态
  setMuted: (muted) => set(() => {
    localStorage.setItem('wuxia_is_muted', muted.toString());
    return { isMuted: muted };
  }),

  // 切换静音状态
  toggleMute: () => set((state) => {
    const nextMuted = !state.isMuted;
    localStorage.setItem('wuxia_is_muted', nextMuted.toString());
    return { isMuted: nextMuted };
  })
}));
