import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppState, VideoClue, PatrolRecord, ClueStatus } from '@/types';
import { videoClues as initialClues, patrolRecords as initialRecords } from '@/data/mock';

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScenicId, setCurrentScenicId] = useState<string>('sc1');
  const [clues, setClues] = useState<VideoClue[]>(initialClues);
  const [records, setRecords] = useState<PatrolRecord[]>(initialRecords);

  const updateClueStatus = useCallback((id: string, status: ClueStatus) => {
    console.log('[Store] 更新线索状态', { id, status });
    setClues(prev => prev.map(c => 
      c.id === id ? { ...c, status, operator: '当前用户' } : c
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

  const value: AppState = {
    currentScenicId,
    clues,
    records,
    setCurrentScenicId,
    updateClueStatus,
    addPhotoToClue,
    addRecord
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
