import Taro from '@tarojs/taro';

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hour}:${min}`;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayStr = (): string => {
  return formatDate(new Date());
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const copyText = async (text: string): Promise<void> => {
  try {
    const Taro = await import('@tarojs/taro');
    await Taro.default.setClipboardData({ data: text });
  } catch (e) {
    console.error('[Utils] 复制失败', e);
    throw e;
  }
};

export const imageToBase64 = (tempFilePath: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const fs = Taro.getFileSystemManager();
      const ext = tempFilePath.split('.').pop()?.toLowerCase() || 'jpg';
      const encoding = 'base64';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
      fs.readFile({
        filePath: tempFilePath,
        encoding,
        success: (res) => {
          resolve(`data:${mimeType};base64,${res.data as string}`);
        },
        fail: () => {
          resolve(tempFilePath);
        }
      });
    } catch {
      resolve(tempFilePath);
    }
  });
};
