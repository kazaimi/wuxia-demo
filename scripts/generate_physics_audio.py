import os
import numpy as np
import scipy.io.wavfile as wav
from scipy import signal

# 全局参数
SR = 44100  # 44.1kHz 高品质采样率

def pluck_additive(freq, duration, sr=SR, vol=0.5, decay_rate=2.2):
    """
    加法物理建模合成古筝/古琴拨弦音符。
    """
    t = np.arange(int(sr * duration)) / sr
    if len(t) == 0:
        return np.array([])
        
    # 引入揉弦效果 (Vibrato) - 5.2Hz 慢速按弦揉音，幅度 0.6%
    vibrato = 1.0 + 0.006 * np.sin(2 * np.pi * 5.2 * t)
    phase = 2 * np.pi * freq * np.cumsum(vibrato) / sr
    
    # 谐波比率与其特定的快速指数衰减
    env1 = np.exp(-decay_rate * t)          # 基频
    env2 = np.exp(-(decay_rate * 2.0) * t)  # 2倍频
    env3 = np.exp(-(decay_rate * 3.2) * t)  # 3倍频
    env4 = np.exp(-(decay_rate * 5.0) * t)  # 4倍频
    env5 = np.exp(-(decay_rate * 8.5) * t)  # 5倍频（极速衰减，提供清脆起音）
    
    # 合成波形
    wave = 0.5 * np.sin(phase) * env1
    wave += 0.25 * np.sin(2 * phase) * env2
    wave += 0.12 * np.sin(3 * phase) * env3
    wave += 0.08 * np.sin(4 * phase) * env4
    wave += 0.05 * np.sin(5 * phase) * env5
    
    # 拨片/指甲摩擦噪声起音 (0.015s 快速衰减)
    noise = np.random.uniform(-1.0, 1.0, len(t))
    noise_env = np.exp(-180.0 * t)
    
    # 2000Hz~3500Hz 带通滤波器过滤起音噪声
    nyq = sr / 2
    try:
        b, a = signal.butter(2, [1800 / nyq, 3500 / nyq], btype='bandpass')
        filtered_noise = signal.lfilter(b, a, noise)
    except:
        filtered_noise = noise # 兜底
        
    wave += 0.22 * filtered_noise * noise_env
    
    # 归一化并调幅
    max_val = np.max(np.abs(wave))
    if max_val > 1e-4:
        wave = wave / max_val * vol
        
    return wave

def save_wav(filename, data, sr=SR):
    """
    保存为16位无损整型WAV文件。
    """
    # 限幅防止爆音
    data = np.clip(data, -0.99, 0.99)
    int_data = (data * 32767).astype(np.int16)
    wav.write(filename, sr, int_data)

# ----------------- 背景音乐生成 -----------------

def generate_bgm_menu(output_path):
    """
    宫商角徵羽天机古琴曲背景乐 (约 45 秒)
    """
    duration = 45.0
    total_samples = int(SR * duration)
    mix = np.zeros(total_samples)
    
    # 五声调式音名映射 (G3 ~ A5)
    # G3=196.00, A3=220.00, C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00, C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880.00
    melody = [
        # (频率, 开始时间, 持续时间, 音量, 衰减速率)
        # 第一小节
        (392.00, 0.0, 4.0, 0.35, 1.8),  # G4
        (196.00, 0.5, 5.0, 0.28, 1.2),  # G3 (伴奏低音)
        (440.00, 2.0, 3.5, 0.32, 1.8),  # A4
        (523.25, 4.0, 5.0, 0.42, 1.6),  # C5
        (261.63, 4.5, 5.0, 0.28, 1.2),  # C4 (低音)
        
        # 第二小节
        (587.33, 6.0, 3.0, 0.28, 1.8),  # D5
        (659.25, 7.5, 4.0, 0.35, 1.8),  # E5
        (523.25, 9.5, 3.5, 0.38, 1.6),  # C5
        (220.00, 9.5, 5.0, 0.28, 1.2),  # A3 (低音)
        
        # 第三小节
        (659.25, 12.0, 3.0, 0.32, 1.8),  # E5
        (783.99, 13.5, 4.5, 0.38, 1.6),  # G5
        (293.66, 14.0, 5.0, 0.28, 1.2),  # D4 (低音)
        (880.00, 16.0, 5.0, 0.42, 1.4),  # A5 (极高龙吟泛音)
        (783.99, 18.5, 3.0, 0.28, 1.8),  # G5
        
        # 第四小节
        (659.25, 20.0, 3.5, 0.32, 1.8),  # E5
        (196.00, 20.5, 5.0, 0.28, 1.2),  # G3 (低音)
        (587.33, 22.0, 4.5, 0.38, 1.6),  # D5
        (523.25, 24.5, 3.5, 0.35, 1.8),  # C5
        
        # 第五小节（转）
        (523.25, 26.5, 3.0, 0.32, 1.8),  # C5
        (440.00, 28.0, 3.0, 0.28, 1.8),  # A4
        (220.00, 28.0, 5.0, 0.28, 1.2),  # A3 (低音)
        (392.00, 29.5, 4.0, 0.35, 1.8),  # G4
        (329.63, 31.5, 3.0, 0.28, 1.8),  # E4
        (293.66, 33.0, 4.0, 0.32, 1.8),  # D4
        (196.00, 33.5, 5.0, 0.28, 1.2),  # G3 (低音)
        
        # 第六小节（合）
        (392.00, 35.0, 3.0, 0.32, 1.8),  # G4
        (440.00, 36.5, 5.0, 0.38, 1.6),  # A4
        (523.25, 39.0, 4.0, 0.38, 1.8),  # C5
        (261.63, 39.5, 5.0, 0.28, 1.2),  # C4 (低音)
        (587.33, 41.0, 3.0, 0.30, 1.8),  # D5
        (659.25, 42.5, 4.0, 0.32, 1.8),  # E5
        (783.99, 44.0, 3.0, 0.32, 1.8)   # G5 (滑落引向循环)
    ]
    
    for freq, start, dur, vol, decay in melody:
        start_sample = int(SR * start)
        if start_sample >= total_samples:
            continue
        pluck = pluck_additive(freq, dur, SR, vol, decay)
        length = min(len(pluck), total_samples - start_sample)
        mix[start_sample:start_sample+length] += pluck[:length]
        
    # 添加古风空灵延时效果 (Delay 0.5s, 反弹衰减 0.32)
    delay_samples = int(SR * 0.5)
    reverb = np.copy(mix)
    if total_samples > delay_samples:
        reverb[delay_samples:] += mix[:-delay_samples] * 0.32
        
    save_wav(output_path, reverb * 0.85)

def generate_bgm_realm(output_path):
    """
    虚无空鸣秘境曲：长波 Drone 低音垫子 + 偶发高频空灵拨弦 (约 45 秒)
    """
    duration = 45.0
    total_samples = int(SR * duration)
    t = np.arange(total_samples) / SR
    
    # 1. 极其低沉的气息 Drone (65.4Hz C2 与 98.0Hz G2 谐和)
    # 慢速音量波动调制 (0.08Hz 和 0.12Hz)
    lfo1 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * t)
    lfo2 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t)
    
    drone = 0.05 * np.sin(2 * np.pi * 65.41 * t) * lfo1
    drone += 0.035 * np.sin(2 * np.pi * 98.0 * t) * lfo2
    
    # 2. 穿插空灵的长余音古琴高音泛音 (A5/E6/G6 等高频)
    mix = np.copy(drone)
    
    plucks = [
        # (频率, 开始时间, 持续时间, 音量, 衰减)
        (880.00, 3.0, 7.0, 0.18, 0.8),   # A5
        (1318.51, 8.5, 8.0, 0.14, 0.6),  # E6
        (783.99, 14.0, 6.5, 0.18, 0.8),  # G5
        (1174.66, 19.5, 8.0, 0.15, 0.6), # D6
        (1567.98, 25.0, 9.0, 0.12, 0.5), # G6 (极虚幻)
        (1046.50, 30.5, 7.5, 0.16, 0.7), # C6
        (880.00, 37.0, 8.0, 0.18, 0.8)    # A5
    ]
    
    for freq, start, dur, vol, decay in plucks:
        start_sample = int(SR * start)
        pluck = pluck_additive(freq, dur, SR, vol, decay)
        length = min(len(pluck), total_samples - start_sample)
        mix[start_sample:start_sample+length] += pluck[:length]
        
    # 空灵超长混响 (Delay 0.85s, 反馈 0.45)
    delay_samples = int(SR * 0.85)
    reverb = np.copy(mix)
    if total_samples > delay_samples:
        reverb[delay_samples:] += mix[:-delay_samples] * 0.45
        
    save_wav(output_path, reverb * 0.9)

def generate_bgm_battle(output_path):
    """
    对决铁马冰河战鼓 (约 30 秒)
    """
    duration = 30.0
    total_samples = int(SR * duration)
    mix = np.zeros(total_samples)
    
    # 战鼓发生器 (低频三角扫频 75Hz -> 25Hz)
    def make_drum(vol, dur):
        dt = np.arange(int(SR * dur)) / SR
        freqs = 75.0 - (50.0 * (dt / dur))
        phase = 2 * np.pi * np.cumsum(freqs) / SR
        env = np.exp(-8.5 * dt)
        return np.sin(phase) * env * vol
        
    # 金属镲片发生器
    def make_cymbal(vol, dur):
        ct = np.arange(int(SR * dur)) / SR
        noise = np.random.uniform(-1, 1, len(ct))
        env = np.exp(-25.0 * ct)
        nyq = SR / 2
        try:
            b, a = signal.butter(2, 6000 / nyq, btype='highpass')
            filtered = signal.lfilter(b, a, noise)
        except:
            filtered = noise
        return filtered * env * vol
        
    # 每 220ms (BPM 约 136) 编排一次节奏
    step = 0.220
    beat = 0
    t = 0.0
    while t + 0.3 < duration:
        start_sample = int(SR * t)
        mod = beat % 4
        
        # 战鼓敲击
        if mod == 0:  # 强拍
            drum = make_drum(0.55, 0.25)
            mix[start_sample:start_sample+len(drum)] += drum
            # 大镲
            cymb = make_cymbal(0.08, 0.15)
            mix[start_sample:start_sample+len(cymb)] += cymb
        elif mod == 1: # 弱拍
            drum = make_drum(0.28, 0.18)
            mix[start_sample:start_sample+len(drum)] += drum
        elif mod == 2: # 次强
            drum = make_drum(0.42, 0.22)
            mix[start_sample:start_sample+len(drum)] += drum
            # 轻微镲片
            cymb = make_cymbal(0.04, 0.10)
            mix[start_sample:start_sample+len(cymb)] += cymb
        else:          # 切分急促
            drum1 = make_drum(0.35, 0.15)
            mix[start_sample:start_sample+len(drum1)] += drum1
            # 110ms 后再击打一次
            sub_start = start_sample + int(SR * 0.110)
            drum2 = make_drum(0.25, 0.12)
            mix[sub_start:sub_start+len(drum2)] += drum2
            
        t += step
        beat += 1
        
    # 限制整体响度
    max_val = np.max(np.abs(mix))
    if max_val > 0.001:
        mix = mix / max_val * 0.85
        
    save_wav(output_path, mix)

def generate_bgm_market(output_path):
    """
    黑市市井小调 (约 35 秒)
    """
    duration = 35.0
    total_samples = int(SR * duration)
    mix = np.zeros(total_samples)
    
    # 较欢快的五声旋律音符走向
    melody_market = [
        # (频率, 开始时间, 持续时间, 音量)
        # 主题A
        (261.63, 0.0, 0.4, 0.3), (293.66, 0.4, 0.4, 0.3), (329.63, 0.8, 0.8, 0.35),
        (392.00, 1.6, 0.4, 0.3), (440.00, 2.0, 0.4, 0.3), (392.00, 2.4, 0.8, 0.35),
        (329.63, 3.2, 0.4, 0.3), (293.66, 3.6, 0.4, 0.3), (261.63, 4.0, 1.2, 0.4),
        # 伴奏低音
        (196.00, 0.0, 1.5, 0.2), (220.00, 2.4, 1.5, 0.2),
        
        # 主题B
        (392.00, 5.6, 0.4, 0.3), (440.00, 6.0, 0.4, 0.3), (523.25, 6.4, 0.8, 0.35),
        (587.33, 7.2, 0.4, 0.3), (659.25, 7.6, 0.4, 0.3), (587.33, 8.0, 0.8, 0.35),
        (523.25, 8.8, 0.4, 0.3), (440.00, 9.2, 0.4, 0.3), (392.00, 9.6, 1.2, 0.4),
        # 伴奏低音
        (261.63, 6.4, 1.5, 0.2), (196.00, 8.8, 1.5, 0.2)
    ]
    
    # 循环复制旋律直至填满 35 秒
    t_offset = 0.0
    while t_offset < duration - 12.0:
        for freq, start, dur, vol in melody_market:
            s_time = t_offset + start
            s_sample = int(SR * s_time)
            if s_sample >= total_samples:
                break
            pluck = pluck_additive(freq, dur, SR, vol, decay_rate=2.8) # 较快琴音
            length = min(len(pluck), total_samples - s_sample)
            mix[s_sample:s_sample+length] += pluck[:length]
        t_offset += 11.5
        
    # 延迟混响
    delay_samples = int(SR * 0.4)
    reverb = np.copy(mix)
    if total_samples > delay_samples:
        reverb[delay_samples:] += mix[:-delay_samples] * 0.25
        
    save_wav(output_path, reverb * 0.85)

# ----------------- 音效生成 -----------------

def generate_sfx_click(output_path):
    """
    sfx_click：温润硬木木鱼敲击声 (0.08s)
    """
    dur = 0.08
    t = np.arange(int(SR * dur)) / SR
    # 580Hz 主体 + 583Hz 微干涉，快速指数衰减
    wave = (0.6 * np.sin(2 * np.pi * 580 * t) + 0.4 * np.sin(2 * np.pi * 583 * t)) * np.exp(-55.0 * t)
    
    # 0.005s 高通噪声起音 (击打瞬间木质震荡)
    noise = np.random.uniform(-1, 1, len(t))
    noise_env = np.exp(-600.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, 3500 / nyq, btype='highpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave += 0.28 * filtered * noise_env
    
    save_wav(output_path, wave)

def generate_sfx_sword(output_path):
    """
    sfx_sword：古剑龙吟 (1.5s 金属震颤长鸣)
    """
    dur = 1.5
    t = np.arange(int(SR * dur)) / SR
    
    # 6.5Hz Vibrato 颤音模拟剑身抖动
    vibrato = 1.0 + 0.007 * np.sin(2 * np.pi * 6.5 * t)
    phase1 = 2 * np.pi * 1200 * np.cumsum(vibrato) / SR
    phase2 = 2 * np.pi * 1202 * np.cumsum(vibrato) / SR
    phase3 = 2 * np.pi * 1205 * np.cumsum(vibrato) / SR
    
    # 指数衰减 (长衰减)
    env = np.exp(-3.5 * t)
    
    # 加法合成高频剑鸣
    wave = 0.4 * np.sin(phase1) * env
    wave += 0.3 * np.sin(phase2) * env
    wave += 0.2 * np.sin(phase3) * env
    
    # 0.02s 的金属利刃切削划过空气的白噪
    noise = np.random.uniform(-1, 1, len(t))
    noise_env = np.exp(-120.0 * t)
    try:
        b, a = signal.butter(2, 4500 / nyq, btype='highpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave += 0.25 * filtered * noise_env
    
    save_wav(output_path, wave)

def generate_sfx_gavel(output_path):
    """
    sfx_gavel：落槌/惊堂木二次撞击反弹 (0.18s)
    """
    dur = 0.18
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 第一次击打
    env1 = np.exp(-65.0 * t)
    strike1 = np.sin(2 * np.pi * 180 * np.exp(-40.0 * t) * t) * env1
    
    # 第二次微弱回弹 (15ms 延迟)
    delay = 0.015
    dt2 = t[t >= delay] - delay
    env2 = np.exp(-75.0 * dt2)
    strike2_val = np.sin(2 * np.pi * 165 * np.exp(-40.0 * dt2) * dt2) * env2 * 0.6
    
    start_idx = int(SR * delay)
    wave += strike1
    wave[start_idx : start_idx + len(strike2_val)] += strike2_val
    
    # 木槌与案几的低频空气震荡
    noise = np.random.uniform(-1, 1, total_samples)
    noise_env = np.exp(-80.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, [180 / nyq, 380 / nyq], btype='bandpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave += 0.35 * filtered * noise_env
    
    save_wav(output_path, wave)

def generate_sfx_coin(output_path):
    """
    sfx_coin：碎银落袋哗啦声 (0.15s, 4枚时间差小钱币撞击)
    """
    dur = 0.15
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    delays = [0.0, 0.025, 0.060, 0.090]
    freqs = [3136.0, 2794.0, 3520.0, 4186.0]
    vols = [0.35, 0.28, 0.25, 0.20]
    
    for d, f, v in zip(delays, freqs, vols):
        idx = int(SR * d)
        dt = t[t >= d] - d
        env = np.exp(-120.0 * dt)
        
        # 微调频对
        coin_pluck = (0.6 * np.sin(2 * np.pi * f * dt) + 0.4 * np.sin(2 * np.pi * (f + 12) * dt)) * env
        
        # 极短的起音白噪
        noise = np.random.uniform(-1, 1, len(dt))
        noise_env = np.exp(-600.0 * dt)
        nyq = SR / 2
        try:
            b, a = signal.butter(2, 6000 / nyq, btype='highpass')
            filtered = signal.lfilter(b, a, noise)
        except:
            filtered = noise
        coin_pluck += 0.25 * filtered * noise_env
        
        wave[idx:idx+len(coin_pluck)] += coin_pluck * v
        
    save_wav(output_path, wave)

def generate_sfx_levelup(output_path):
    """
    sfx_levelup：境界突破宏大钟磬与古筝十声琶音 (1.8s)
    """
    dur = 1.8
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 1. 磬钟长鸣和音 (880Hz + 1320Hz + 2200Hz)
    env_bell = np.exp(-2.2 * t)
    bell = (0.5 * np.sin(2 * np.pi * 880 * t) + 0.35 * np.sin(2 * np.pi * 1320 * t) + 0.15 * np.sin(2 * np.pi * 2200 * t)) * env_bell
    bell *= 1.0 + 0.05 * np.sin(2 * np.pi * 5.0 * t) # 5Hz Tremolo
    wave += bell * 0.45
    
    # 2. 古筝十声快速琵琶琶音 (宫商角徵羽，50ms 间隔)
    scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 1046.50]
    for i, freq in enumerate(scale):
        d_time = i * 0.045
        idx = int(SR * d_time)
        dt = t[t >= d_time] - d_time
        pluck = pluck_additive(freq, 1.2, SR, vol=0.35, decay_rate=2.5)
        wave[idx:idx+len(pluck)] += pluck
        
    # 3. 底层内力升腾低音
    inner_env = np.exp(-4.0 * t)
    inner = np.sin(2 * np.pi * (70.0 + 130.0 * np.exp(-8.0 * t)) * t) * inner_env * 0.3
    wave += inner
    
    save_wav(output_path, wave * 0.85)

def generate_sfx_allocate(output_path):
    """
    sfx_allocate：清脆仙灵之气分配音 (0.15s)
    """
    dur = 0.15
    # 高音泛音 1046.5Hz (C6) + 1568Hz (G6) 纯五度，起音极快，衰减快
    t = np.arange(int(SR * dur)) / SR
    wave = (0.7 * np.sin(2 * np.pi * 1046.50 * t) + 0.3 * np.sin(2 * np.pi * 1567.98 * t)) * np.exp(-22.0 * t)
    save_wav(output_path, wave * 0.4)

def generate_sfx_task_accept(output_path):
    """
    sfx_task_accept：盖章印泥的闷击震荡 (0.2s)
    """
    dur = 0.2
    t = np.arange(int(SR * dur)) / SR
    # 85Hz -> 40Hz 三角扫频
    freqs = 85.0 - 45.0 * (t / dur)
    phase = 2 * np.pi * np.cumsum(freqs) / SR
    wave = np.sin(phase) * np.exp(-12.0 * t) * 0.6
    
    # 250Hz 带通滤噪 (模拟印泥按压)
    noise = np.random.uniform(-1, 1, len(t))
    noise_env = np.exp(-25.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, [180 / nyq, 320 / nyq], btype='bandpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave += 0.3 * filtered * noise_env
    
    save_wav(output_path, wave)

def generate_sfx_encounter_trigger(output_path):
    """
    sfx_encounter_trigger：铜锣锣面振动 + 重击战鼓 (1.0s)
    """
    dur = 1.0
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 1. 铜锣敲击：1200Hz 宽带通噪，配合快速的 1500Hz -> 800Hz 扫频
    noise = np.random.uniform(-1, 1, total_samples)
    noise_env = np.exp(-4.5 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(1, [1000 / nyq, 1800 / nyq], btype='bandpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    
    gong_freq = 1500.0 - 700.0 * (t / dur)
    gong_phase = 2 * np.pi * np.cumsum(gong_freq) / SR
    gong = np.sin(gong_phase) * np.exp(-3.5 * t) * 0.35
    
    wave += (0.45 * filtered * noise_env + gong)
    
    # 2. 双重战鼓 (t=0, t=0.15s)
    def drum_hit(dt, vol):
        d_freq = 75.0 - 40.0 * dt
        phase = 2 * np.pi * np.cumsum(d_freq) / SR
        return np.sin(phase) * np.exp(-12.0 * dt) * vol
        
    wave += drum_hit(t, 0.45)
    
    t2_idx = int(SR * 0.15)
    dt2 = t[t2_idx:] - 0.15
    wave[t2_idx:] += drum_hit(dt2, 0.35)
    
    save_wav(output_path, wave * 0.8)

def generate_sfx_success(output_path):
    """
    sfx_success：大捷欢快琶音与编磬 (0.8s)
    """
    dur = 0.8
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 古筝三连音琶音 C5 -> E5 -> G5 -> C6 (间隔 65ms)
    scale = [523.25, 659.25, 783.99, 1046.50]
    for i, freq in enumerate(scale):
        d_time = i * 0.065
        idx = int(SR * d_time)
        dt = t[idx:] - d_time
        pluck = pluck_additive(freq, 0.6, SR, vol=0.32, decay_rate=3.5)
        wave[idx:idx+len(pluck)] += pluck
        
    # 清亮磬钟背景
    bell = (0.5 * np.sin(2 * np.pi * 1046.50 * t) + 0.35 * np.sin(2 * np.pi * 1567.98 * t)) * np.exp(-4.0 * t)
    wave += bell * 0.35
    
    save_wav(output_path, wave)

def generate_sfx_fail(output_path):
    """
    sfx_fail：古琴断弦 + 悲凉下垂滑音 (0.6s)
    """
    dur = 0.6
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 1. 崩断音：极强白噪短时崩裂
    noise = np.random.uniform(-1, 1, total_samples)
    noise_env = np.exp(-120.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, [800 / nyq, 2500 / nyq], btype='bandpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave += filtered * noise_env * 0.55
    
    # 2. 220Hz -> 110Hz 悲切下垂滑音
    freqs = 220.0 - 110.0 * (t / dur)
    phase = 2 * np.pi * np.cumsum(freqs) / SR
    wave += np.sin(phase) * np.exp(-5.0 * t) * 0.32
    
    save_wav(output_path, wave)

def generate_sfx_blade(output_path):
    """
    sfx_blade：利刃划过空气与中肉敲击 (0.22s)
    """
    dur = 0.22
    t = np.arange(int(SR * dur)) / SR
    
    # 破空：高通白噪声 2500Hz 极速衰减
    noise = np.random.uniform(-1, 1, len(t))
    noise_env = np.exp(-32.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, 2800 / nyq, btype='highpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave = filtered * noise_env * 0.45
    
    # 实体钝击：110Hz -> 40Hz 三角下扫
    strike_freqs = 110.0 - 70.0 * (t / dur)
    strike_phase = 2 * np.pi * np.cumsum(strike_freqs) / SR
    wave += np.sin(strike_phase) * np.exp(-45.0 * t) * 0.35
    
    save_wav(output_path, wave)

def generate_sfx_fist(output_path):
    """
    sfx_fist：掌风与闷击 (0.15s)
    """
    dur = 0.15
    t = np.arange(int(SR * dur)) / SR
    # 400Hz 低通噪 模拟掌风
    noise = np.random.uniform(-1, 1, len(t))
    noise_env = np.exp(-28.0 * t)
    nyq = SR / 2
    try:
        b, a = signal.butter(2, 400 / nyq, btype='lowpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
    wave = filtered * noise_env * 0.45
    
    # 80Hz -> 30Hz 快速下扫正弦波 (闷击声)
    freqs = 80.0 - 50.0 * (t / dur)
    phase = 2 * np.pi * np.cumsum(freqs) / SR
    wave += np.sin(phase) * np.exp(-35.0 * t) * 0.48
    
    save_wav(output_path, wave)

def generate_sfx_magic(output_path):
    """
    sfx_magic：内力外放/扫频绝招 (0.4s)
    """
    dur = 0.4
    t = np.arange(int(SR * dur)) / SR
    
    # 锯齿波扫频 (200Hz -> 600Hz)
    saw_freqs = 200.0 + 400.0 * t / dur
    phase = 2 * np.pi * np.cumsum(saw_freqs) / SR
    # 用谐波代替简单锯齿波，以获得圆润内功声
    wave = np.sin(phase) * 0.4 + np.sin(2 * phase) * 0.2 + np.sin(3 * phase) * 0.1
    wave *= np.exp(-6.0 * t)
    
    # 带通滤波器截止频率从 400Hz 扫到 2500Hz
    # 在 Python 中，我们直接用动态正弦扫频来模拟这种流动感，并添加微弱混响
    wave += 0.18 * np.sin(2 * np.pi * (400.0 + 2100.0 * t) * t) * np.exp(-8.0 * t)
    
    save_wav(output_path, wave * 0.75)

def generate_sfx_dodge(output_path):
    """
    sfx_dodge：身法闪避划过嗖声 (0.15s)
    """
    dur = 0.15
    t = np.arange(int(SR * dur)) / SR
    # 1500Hz -> 300Hz 动态带通滤波器过滤白噪声
    noise = np.random.uniform(-1, 1, len(t))
    # 简单的频率扫降带通效果可以通过动态调制带通滤波器来实现，或者用简化的数学叠加
    # 这里我们采用多段滤波相加或者用动态波形替代
    noise_env = np.sin(np.pi * t / dur)  # 缓入缓出包络
    
    nyq = SR / 2
    # 我们用一个中频带通
    try:
        b, a = signal.butter(1, [600 / nyq, 1500 / nyq], btype='bandpass')
        filtered = signal.lfilter(b, a, noise)
    except:
        filtered = noise
        
    wave = filtered * noise_env * 0.65
    save_wav(output_path, wave)

def generate_sfx_heal(output_path):
    """
    sfx_heal：运功疗伤行云流水 (0.8s)
    """
    dur = 0.8
    total_samples = int(SR * dur)
    t = np.arange(total_samples) / SR
    
    # 1. 3Hz 调制带通噪模拟流水真气
    noise = np.random.uniform(-1, 1, total_samples)
    lfo = np.sin(2 * np.pi * 3.0 * t)
    # 用带通滤波
    nyq = SR / 2
    wave = np.zeros(total_samples)
    # 分小段进行动态滤波
    chunk_size = int(SR * 0.05)
    for i in range(0, total_samples, chunk_size):
        chunk_t = t[i:i+chunk_size]
        if len(chunk_t) == 0:
            break
        # 计算该段的中心频率 800Hz 到 1600Hz
        cf = 1200.0 + 400.0 * np.sin(2 * np.pi * 3.0 * (i / SR))
        try:
            b, a = signal.butter(1, [max(50, cf - 150) / nyq, min(nyq - 50, cf + 150) / nyq], btype='bandpass')
            wave[i:i+chunk_size] = signal.lfilter(b, a, noise[i:i+chunk_size])
        except:
            wave[i:i+chunk_size] = noise[i:i+chunk_size]
            
    wave = wave * 0.22 * np.exp(-1.5 * t)
    
    # 2. 升华正弦琶音 (E5 -> A5 -> B5 -> E6，间隔 60ms)
    scale = [659.25, 880.00, 987.77, 1318.51]
    for i, freq in enumerate(scale):
        d_time = i * 0.060
        idx = int(SR * d_time)
        dt = t[idx:] - d_time
        pluck = np.sin(2 * np.pi * freq * dt) * np.exp(-4.5 * dt) * 0.18
        wave[idx:idx+len(pluck)] += pluck
        
    save_wav(output_path, wave)

def generate_sfx_poison(output_path):
    """
    sfx_poison：滋滋作响剧毒侵蚀 (0.45s, 8Hz 触发高频噪声片)
    """
    dur = 0.45
    total_samples = int(SR * dur)
    wave = np.zeros(total_samples)
    t = np.arange(total_samples) / SR
    
    # 8Hz 触发：大约 125ms 一次，一共 4 次
    nyq = SR / 2
    for i in range(4):
        d_time = i * 0.115
        idx = int(SR * d_time)
        dt = t[idx:] - d_time
        # 25ms 短声片
        p_env = np.exp(-120.0 * dt)
        noise = np.random.uniform(-1, 1, len(dt))
        try:
            b, a = signal.butter(2, 3800 / nyq, btype='highpass')
            filtered = signal.lfilter(b, a, noise)
        except:
            filtered = noise
        wave[idx:idx+len(filtered)] += filtered * p_env * 0.28
        
    save_wav(output_path, wave)

def generate_sfx_stun(output_path):
    """
    sfx_stun：高频耳鸣与低音嗡鸣 (0.6s)
    """
    dur = 0.6
    t = np.arange(int(SR * dur)) / SR
    
    # 1000Hz 调幅耳鸣 (15Hz LFO)
    lfo = 1.0 + 0.3 * np.sin(2 * np.pi * 15.0 * t)
    ear_ring = np.sin(2 * np.pi * 1000 * t) * lfo * np.exp(-3.0 * t) * 0.12
    
    # 50Hz 嗡鸣 (气血受阻)
    hum = np.sin(2 * np.pi * 50.0 * t) * np.exp(-2.0 * t) * 0.22
    
    save_wav(output_path, ear_ring + hum)

def generate_sfx_silence(output_path):
    """
    sfx_silence：封印气穴点指声 (0.35s)
    """
    dur = 0.35
    total_samples = int(SR * dur)
    t = np.arange(total_samples) / SR
    
    # 400Hz 点穴短音 (极快衰减)
    point = np.sin(2 * np.pi * 400 * t) * np.exp(-60.0 * t) * 0.42
    
    # 截止频率收拢的噪声 (模拟高频被瞬间截断)
    noise = np.random.uniform(-1, 1, total_samples)
    noise_env = np.exp(-12.0 * t)
    nyq = SR / 2
    # 动态滤波器简化版：前段中高通，后段全部截断
    wave = np.zeros(total_samples)
    chunk_size = int(SR * 0.03)
    for i in range(0, total_samples, chunk_size):
        chunk_t = t[i:i+chunk_size]
        if len(chunk_t) == 0:
            break
        # fc 截止频率从 1600Hz 降到 60Hz
        fc = 60.0 + 1540.0 * np.exp(-15.0 * (i / SR))
        try:
            b, a = signal.butter(1, fc / nyq, btype='lowpass')
            wave[i:i+chunk_size] = signal.lfilter(b, a, noise[i:i+chunk_size])
        except:
            wave[i:i+chunk_size] = noise[i:i+chunk_size]
            
    wave = wave * noise_env * 0.25 + point
    save_wav(output_path, wave)

def generate_sfx_internal(output_path):
    """
    sfx_internal：经脉内伤深层震动 (0.35s)
    """
    dur = 0.35
    t = np.arange(int(SR * dur)) / SR
    # 55Hz (A1) 三角重低音，带有 80Hz 低通滤波
    wave = np.sin(2 * np.pi * 55.0 * t) * np.exp(-4.5 * t)
    # 用简单的滑动平均来平滑波形 (模拟低通)
    wave = np.convolve(wave, np.ones(5)/5, mode='same')
    save_wav(output_path, wave * 0.7)

def generate_sfx_shield(output_path):
    """
    sfx_shield：罩子撑开真气护盾 (1.5s)
    """
    dur = 1.5
    total_samples = int(SR * dur)
    t = np.arange(total_samples) / SR
    
    # 1. 撑开：0.15s 噪声由低通滤波器向上扫频 (200Hz -> 1000Hz)
    noise = np.random.uniform(-1, 1, total_samples)
    noise_env = np.exp(-15.0 * t)
    nyq = SR / 2
    # 简单高通噪声垫子
    try:
        b, a = signal.butter(1, [150 / nyq, 800 / nyq], btype='bandpass')
        open_up = signal.lfilter(b, a, noise) * noise_env * 0.3
    except:
        open_up = noise * noise_env * 0.1
        
    # 2. 真气共振：146Hz (D3) 和 220Hz (A3)，带 4Hz LFO 震颤
    lfo = 1.0 + 0.08 * np.sin(2 * np.pi * 4.0 * t)
    bell = (0.5 * np.sin(2 * np.pi * 146.83 * t) + 0.5 * np.sin(2 * np.pi * 220.0 * t)) * lfo * np.exp(-2.2 * t)
    
    save_wav(output_path, (open_up + bell * 0.5) * 0.85)

def generate_sfx_revive(output_path):
    """
    sfx_revive：还阳经脉重塑 (1.6s)
    """
    dur = 1.6
    total_samples = int(SR * dur)
    t = np.arange(total_samples) / SR
    
    # 1. 温暖的低频 Triangle 垫音
    hum = np.sin(2 * np.pi * 110.0 * t) * np.exp(-1.8 * t) * 0.28
    
    # 2. 柔和上扬的正弦琶音 (A3 -> C#4 -> E4 -> A4 -> C#5 -> E5 -> A5，间隔 50ms)
    scale = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 880.00]
    wave = np.copy(hum)
    for i, freq in enumerate(scale):
        d_time = i * 0.050
        idx = int(SR * d_time)
        dt = t[idx:] - d_time
        pluck = np.sin(2 * np.pi * freq * dt) * np.exp(-2.5 * dt) * 0.16
        wave[idx:idx+len(pluck)] += pluck
        
    save_wav(output_path, wave * 0.85)


# ----------------- 批量执行与部署 -----------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.normpath(os.path.join(script_dir, "..", "public", "audio"))
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"创建本地音频目录成功: {output_dir}")
    else:
        print(f"本地音频目录已存在: {output_dir}")
        
    # 定义待生成列表
    assets = [
        # (生成函数, 文件名)
        (generate_bgm_menu, 'bgm_menu.wav'),
        (generate_bgm_battle, 'bgm_battle.wav'),
        (generate_bgm_realm, 'bgm_realm.wav'),
        (generate_bgm_market, 'bgm_market.wav'),
        (generate_sfx_click, 'sfx_click.wav'),
        (generate_sfx_allocate, 'sfx_allocate.wav'),
        (generate_sfx_levelup, 'sfx_levelup.wav'),
        (generate_sfx_task_accept, 'sfx_task_accept.wav'),
        (generate_sfx_encounter_trigger, 'sfx_encounter_trigger.wav'),
        (generate_sfx_success, 'sfx_success.wav'),
        (generate_sfx_fail, 'sfx_fail.wav'),
        (generate_sfx_coin, 'sfx_coin.wav'),
        (generate_sfx_gavel, 'sfx_gavel.wav'),
        (generate_sfx_sword, 'sfx_sword.wav'),
        (generate_sfx_blade, 'sfx_blade.wav'),
        (generate_sfx_fist, 'sfx_fist.wav'),
        (generate_sfx_magic, 'sfx_magic.wav'),
        (generate_sfx_dodge, 'sfx_dodge.wav'),
        (generate_sfx_heal, 'sfx_heal.wav'),
        (generate_sfx_poison, 'sfx_poison.wav'),
        (generate_sfx_stun, 'sfx_stun.wav'),
        (generate_sfx_silence, 'sfx_silence.wav'),
        (generate_sfx_internal, 'sfx_internal.wav'),
        (generate_sfx_shield, 'sfx_shield.wav'),
        (generate_sfx_revive, 'sfx_revive.wav')
    ]
    
    print("\n[物理建模 2.0] 开始生成江湖本地音频包...")
    for idx, (func, name) in enumerate(assets):
        target_path = os.path.join(output_dir, name)
        print(f"[{idx+1}/{len(assets)}] 正在合成 {name} ...")
        try:
            func(target_path)
        except Exception as e:
            print(f"!!! 合成 {name} 失败: {e}")
            
    print("\n[物理建模 2.0] 江湖本地音频包生成完毕！已成功存至 public/audio/ 目录！\n")

if __name__ == '__main__':
    main()
