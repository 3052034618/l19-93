import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import {
  AppState,
  VideoClue,
  PatrolRecord,
  ClueStatus,
  UpsertRecordParams,
  StatusUpdateLog
} from '@/types';
import { videoClues as initialClues, patrolRecords as initialRecords } from '@/data/mock';
import { generateId } from '@/utils';

const STORAGE_KEY_CLUES = 'patrol_clues_v1';
const STORAGE_KEY_RECORDS = 'patrol_records_v1';
const STORAGE_KEY_SCENIC = 'patrol_current_scenic_v1';

const AppContext = createContext<AppState | undefined>(undefined);

const enrichInitialRecords = (): PatrolRecord[] => {
  const now = new Date().toISOString();
  return initialRecords.map(r => ({
    ...r,
    lastUpdatedAt: r.createdAt || now,
    updateHistory: [{
      status: r.status,
      operator: r.operator,
      updatedAt: r.createdAt || now,
      note: r.note || '初始巡检记录'
    }]
  }));
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      console.log(`[Store] 从本地存储加载 ${key}，共 ${Array.isArray(parsed) ? parsed.length : '1'} 条`);
      return parsed as T;
    }
  } catch (e) {
    console.error(`[Store] 读取本地存储 ${key} 失败`, e);
  }
  return fallback;
};

const saveToStorage = (key: string, value: unknown): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(value));
    console.log(`[Store] 已保存到本地存储 ${key}`);
  } catch (e) {
    console.error(`[Store] 保存本地存储 ${key} 失败`, e);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const enrichedInitialRecords = enrichInitialRecords();

  const [currentScenicId, setCurrentScenicIdState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEY_SCENIC, 'sc1')
  );
  const [clues, setClues] = useState<VideoClue[]>(() =>
    loadFromStorage(STORAGE_KEY_CLUES, initialClues)
  );
  const [records, setRecords] = useState<PatrolRecord[]>(() =>
    loadFromStorage(STORAGE_KEY_RECORDS, enrichedInitialRecords)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY_SCENIC, currentScenicId);
  }, [currentScenicId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_CLUES, clues);
  }, [clues]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_RECORDS, records);
  }, [records]);

  const setCurrentScenicId = useCallback((id: string) => {
    console.log('[Store] 切换当前景区', id);
    setCurrentScenicIdState(id);
  }, []);

  const updateClueStatus = useCallback((id: string, status: ClueStatus, operator: string = '当前用户') => {
    console.log('[Store] 更新线索状态', { id, status, operator });
    setClues(prev => prev.map(c =>
      c.id === id ? { ...c, status, operator } : c
    ));
  }, []);

  const addPhotoToClue = useCallback((id: string, photoUrl: string) => {
    console.log('[Store] 添加现场照片', { id, photoUrl });
    setClues(prev => prev.map(c =>
      c.id === id ? { ...c, photos: [...c.photos, photoUrl] } : c
    ));
  }, []);

  const addRecord = useCallback((record: PatrolRecord) => {
    console.log('[Store] 新增巡检记录', { recordId: record.id });
    setRecords(prev => [record, ...prev]);
  }, []);

  const upsertRecord = useCallback((params: UpsertRecordParams) => {
    const { clueId, clueTitle, scenicName, category, status, operator, note } = params;
    const now = new Date().toISOString();
    console.log('[Store] upsert 巡检记录', { clueId, status, note });

    setRecords(prev => {
      const existingIdx = prev.findIndex(r => r.clueId === clueId);
      const newLog: StatusUpdateLog = { status, operator, updatedAt: now, note };

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const updated: PatrolRecord = {
          ...existing,
          status,
          operator,
          note,
          lastUpdatedAt: now,
          updateHistory: [...existing.updateHistory, newLog]
        };
        const next = [...prev];
        next.splice(existingIdx, 1);
        return [updated, ...next];
      }

      const newRecord: PatrolRecord = {
        id: generateId(),
        clueId,
        clueTitle,
        scenicName,
        category,
        status,
        operator,
        createdAt: now,
        note,
        lastUpdatedAt: now,
        updateHistory: [newLog]
      };
      return [newRecord, ...prev];
    });
  }, []);

  const resetAllData = useCallback(() => {
    console.log('[Store] 重置所有数据为初始演示数据');
    const enriched = enrichInitialRecords();
    setCurrentScenicIdState('sc1');
    setClues(initialClues);
    setRecords(enriched);
  }, []);

  const value: AppState = {
    currentScenicId,
    clues,
    records,
    setCurrentScenicId,
    updateClueStatus,
    addPhotoToClue,
    addRecord,
    upsertRecord,
    resetAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
};
