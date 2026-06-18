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
import { generateId, imageToBase64 } from '@/utils';

const STORAGE_KEY_CLUES = 'patrol_clues_v2';
const STORAGE_KEY_RECORDS = 'patrol_records_v2';
const STORAGE_KEY_SCENIC = 'patrol_current_scenic_v2';

const AppContext = createContext<AppState | undefined>(undefined);

const ensureRecordFields = (r: any): PatrolRecord => {
  const now = new Date().toISOString();
  const createdAt = r.createdAt || now;
  return {
    id: r.id || generateId(),
    clueId: r.clueId || '',
    clueTitle: r.clueTitle || '',
    scenicName: r.scenicName || '',
    category: r.category || 'queue',
    status: r.status || 'unhandled',
    operator: r.operator || '',
    createdAt,
    note: r.note || '',
    lastUpdatedAt: r.lastUpdatedAt || createdAt,
    updateHistory: Array.isArray(r.updateHistory) && r.updateHistory.length > 0
      ? r.updateHistory
      : [{
          status: r.status || 'unhandled',
          operator: r.operator || '',
          updatedAt: createdAt,
          note: r.note || '初始巡检记录'
        }]
  };
};

const ensureClueFields = (c: any): VideoClue => ({
  id: c.id || '',
  scenicId: c.scenicId || '',
  scenicName: c.scenicName || '',
  title: c.title || '',
  category: c.category || 'queue',
  publishTime: c.publishTime || '',
  publishLocation: c.publishLocation || '',
  likes: c.likes || 0,
  comments: c.comments || 0,
  shares: c.shares || 0,
  complains: Array.isArray(c.complains) ? c.complains : [],
  status: c.status || 'unhandled',
  photos: Array.isArray(c.photos) ? c.photos : [],
  createdAt: c.createdAt || '',
  operator: c.operator || '',
  description: c.description || ''
});

const enrichInitialRecords = (): PatrolRecord[] => {
  return initialRecords.map(r => ensureRecordFields(r));
};

const loadFromStorage = <T,>(key: string, fallback: T, validator?: (item: any) => any): T => {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && validator) {
        const validated = parsed.map(validator);
        console.log(`[Store] 从本地存储加载 ${key}，共 ${validated.length} 条`);
        return validated as T;
      }
      console.log(`[Store] 从本地存储加载 ${key}`);
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
  } catch (e) {
    console.error(`[Store] 保存本地存储 ${key} 失败`, e);
  }
};

export const isHandled = (status: ClueStatus): boolean => status === 'contacted';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const enrichedInitialRecords = enrichInitialRecords();

  const [currentScenicId, setCurrentScenicIdState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEY_SCENIC, 'sc1')
  );
  const [clues, setClues] = useState<VideoClue[]>(() =>
    loadFromStorage(STORAGE_KEY_CLUES, initialClues, ensureClueFields)
  );
  const [records, setRecords] = useState<PatrolRecord[]>(() =>
    loadFromStorage(STORAGE_KEY_RECORDS, enrichedInitialRecords, ensureRecordFields)
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
    setCurrentScenicIdState(id);
  }, []);

  const updateClueStatus = useCallback((id: string, status: ClueStatus, operator: string = '当前用户') => {
    setClues(prev => prev.map(c =>
      c.id === id ? { ...c, status, operator } : c
    ));
  }, []);

  const addPhotoToClue = useCallback((id: string, photoUrl: string) => {
    setClues(prev => prev.map(c =>
      c.id === id ? { ...c, photos: [...c.photos, photoUrl] } : c
    ));
  }, []);

  const addRecord = useCallback((record: PatrolRecord) => {
    setRecords(prev => [ensureRecordFields(record), ...prev]);
  }, []);

  const upsertRecord = useCallback((params: UpsertRecordParams) => {
    const { clueId, clueTitle, scenicName, category, status, operator, note } = params;
    const now = new Date().toISOString();

    setRecords(prev => {
      const existingIdx = prev.findIndex(r => r.clueId === clueId);
      const newLog: StatusUpdateLog = { status, operator, updatedAt: now, note };

      if (existingIdx >= 0) {
        const existing = ensureRecordFields(prev[existingIdx]);
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
