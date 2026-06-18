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

const USER_DATA_PATH = (() => {
  try {
    const env = Taro.getEnv();
    if (env === Taro.ENV_TYPE.WEB) return '';
    return Taro.env.USER_DATA_PATH || '';
  } catch {
    return '';
  }
})();

const isPersistedPath = (path: string): boolean => {
  if (!path) return false;
  if (path.startsWith('data:')) return true;
  if (path.startsWith('http://') || path.startsWith('https://')) return true;
  if (USER_DATA_PATH && path.startsWith(USER_DATA_PATH)) return true;
  return false;
};

const isFileExist = (filePath: string): boolean => {
  try {
    const fs = Taro.getFileSystemManager();
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
};

export const persistImage = async (tempFilePath: string): Promise<string> => {
  if (!tempFilePath) return '';

  if (isPersistedPath(tempFilePath)) {
    return tempFilePath;
  }

  try {
    const fs = Taro.getFileSystemManager();
    const ext = tempFilePath.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

    if (USER_DATA_PATH) {
      const destPath = `${USER_DATA_PATH}/${fileName}`;
      try {
        fs.saveFileSync(tempFilePath, destPath);
        if (isFileExist(destPath)) {
          return destPath;
        }
      } catch (e) {
        console.warn('[Utils] saveFile 失败，尝试 base64', e);
      }
    }

    return await new Promise<string>((resolve) => {
      const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
      fs.readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (res) => {
          if (res.data) {
            resolve(`data:${mimeType};base64,${res.data as string}`);
          } else {
            resolve('');
          }
        },
        fail: () => {
          resolve('');
        }
      });
    });
  } catch (e) {
    console.error('[Utils] 图片持久化全部失败', e);
    return '';
  }
};

export const validatePhotos = (photos: string[]): string[] => {
  if (!Array.isArray(photos)) return [];
  return photos.filter(p => {
    if (!p) return false;
    if (p.startsWith('data:')) return true;
    if (p.startsWith('http://') || p.startsWith('https://')) return true;
    if (USER_DATA_PATH && p.startsWith(USER_DATA_PATH)) {
      return isFileExist(p);
    }
    return false;
  });
};
