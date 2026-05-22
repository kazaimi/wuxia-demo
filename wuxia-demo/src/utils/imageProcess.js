import { useState, useEffect } from 'react';

// 内存缓存以防止相同的图片重复进行 canvas 计算
const cleanImageCache = {};

/**
 * 自定义 Hook：去除图片的黑色/暗色背景，返回物理抠图处理后的 Base64 DataURL
 * @param {string} src 原始图片路径
 * @param {number} threshold 亮度阈值 (0-255)，低于该值将被设为透明。默认 35
 * @param {number} transition 羽化渐变宽度，防边缘锯齿。默认 25
 */
export function useCleanImage(src, threshold = 35, transition = 25) {
  const [cleanSrc, setCleanSrc] = useState(src);

  useEffect(() => {
    if (!src) {
      setCleanSrc('');
      return;
    }

    const cacheKey = `${src}_${threshold}_${transition}`;
    if (cleanImageCache[cacheKey]) {
      setCleanSrc(cleanImageCache[cacheKey]);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (isMounted) setCleanSrc(src);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 遍历所有像素 (r, g, b, a)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // 使用标准灰度/亮度公式计算该像素的亮度
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          if (luminance < threshold) {
            // 低于阈值，完全透明
            data[i + 3] = 0;
          } else if (luminance < threshold + transition) {
            // 在阈值与羽化边界之间，线性淡出 Alpha
            const factor = (luminance - threshold) / transition;
            data[i + 3] = Math.floor(a * factor);
          }
          // 高于阈值和羽化边界的像素保持原样
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');

        cleanImageCache[cacheKey] = dataUrl;
        if (isMounted) {
          setCleanSrc(dataUrl);
        }
      } catch (error) {
        console.error('物理抠图处理失败:', error);
        if (isMounted) setCleanSrc(src);
      }
    };

    img.onerror = () => {
      console.warn(`无法加载图片进行抠图: ${src}`);
      if (isMounted) setCleanSrc(src);
    };

    img.src = src;

    return () => {
      isMounted = false;
    };
  }, [src, threshold, transition]);

  return cleanSrc;
}
