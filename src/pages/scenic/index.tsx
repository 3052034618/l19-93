import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { scenicSpots } from '@/data/mock';
import { ClueCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import ClueCard from '@/components/ClueCard';
import StatCard from '@/components/StatCard';
import { formatNumber } from '@/utils';

type FilterKey = ClueCategory | 'all';

const ScenicPage: React.FC = () => {
  const router = useRouter();
  const { currentScenicId, clues, setCurrentScenicId } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  useDidShow(() => {
    console.log('[ScenicPage] 页面显示', { currentScenicId });
    if (router.params?.scenicId) {
      setCurrentScenicId(router.params.scenicId);
    }
  });

  usePullDownRefresh(() => {
    console.log('[ScenicPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const currentScenic = useMemo(() => {
    return scenicSpots.find(s => s.id === currentScenicId) || scenicSpots[0];
  }, [currentScenicId]);

  const scenicClues = useMemo(() => {
    let filtered = clues.filter(c => c.scenicId === currentScenicId);
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.category === activeFilter);
    }
    return filtered.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
  }, [clues, currentScenicId, activeFilter]);

  const categoryStats = useMemo(() => {
    const base: { key: FilterKey; label: string; color: string; count: number }[] = [
      { key: 'all', label: '全部', color: '#6B7280', count: 0 }
    ];
    const scopedClues = clues.filter(c => c.scenicId === currentScenicId);
    base[0].count = scopedClues.length;
    (Object.keys(CATEGORY_LABELS) as ClueCategory[]).forEach(key => {
      base.push({
        key,
        label: CATEGORY_LABELS[key],
        color: CATEGORY_COLORS[key],
        count: scopedClues.filter(c => c.category === key).length
      });
    });
    return base;
  }, [clues, currentScenicId]);

  const handleSelectScenic = (id: string) => {
    setCurrentScenicId(id);
    setShowModal(false);
    console.log('[ScenicPage] 切换景区', id);
  };

  const goClueDetail = (id: string) => {
    console.log('[ScenicPage] 跳转线索详情', id);
    Taro.navigateTo({ url: `/pages/clue-detail/index?id=${id}` });
  };

  return (
    <ScrollView scrollY className={styles.scenicPage}>
      <View className={styles.selectorWrap}>
        <Text className={styles.selectorLabel}>当前巡检景区</Text>
        <View className={styles.selector} onClick={() => setShowModal(true)}>
          <View className={styles.selectorLeft}>
            <Text className={styles.selectorName}>{currentScenic.name}</Text>
            <Text className={styles.selectorStats}>
              客流约 {formatNumber(currentScenic.todayVisitors)} 人次 ·
              {currentScenic.unhandledCount > 0 ? ` ${currentScenic.unhandledCount}条待处理` : ' 运行平稳'}
            </Text>
          </View>
          <Text className={styles.selectorArrow}>▼</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.categoryFilter} showScrollbar={false}>
        {categoryStats.map(cat => (
          <View
            key={cat.key}
            className={classnames(styles.filterItem, activeFilter === cat.key && styles.active)}
            onClick={() => setActiveFilter(cat.key)}
          >
            <View
              className={styles.filterDot}
              style={{ background: activeFilter === cat.key ? '#fff' : cat.color }}
            />
            <Text className={styles.filterText}>{cat.label}</Text>
            <Text className={styles.filterCount}>{cat.count}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.statsBar}>
        <StatCard value={currentScenic.todayClues} label="今日线索" variant="highlight" />
        <StatCard value={currentScenic.unhandledCount} label="待处理" variant="warning" />
      </View>

      <View className={styles.listArea}>
        <View className={styles.listTitle}>
          <Text className={styles.listTitleText}>舆情线索列表</Text>
          <Text className={styles.listTitleCount}>共 {scenicClues.length} 条</Text>
        </View>
        <View className={styles.clueList}>
          {scenicClues.length > 0 ? (
            scenicClues.map(clue => (
              <ClueCard
                key={clue.id}
                clue={clue}
                onClick={() => goClueDetail(clue.id)}
              />
            ))
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>🎉</Text>
              <Text className={styles.emptyText}>暂无此类舆情线索</Text>
              <Text className={styles.emptySubtext}>该景区当前运行情况良好</Text>
            </View>
          )}
        </View>
      </View>

      {showModal && (
        <View className={styles.scenicModal}>
          <View className={styles.modalMask} onClick={() => setShowModal(false)} />
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>选择巡检景区</Text>
            <View className={styles.scenicOptions}>
              {scenicSpots.map(s => (
                <View
                  key={s.id}
                  className={classnames(
                    styles.scenicOption,
                    s.id === currentScenicId && styles.active
                  )}
                  onClick={() => handleSelectScenic(s.id)}
                >
                  <View className={styles.optionLeft}>
                    <Text className={styles.optionName}>{s.name}</Text>
                    <View className={styles.optionStats}>
                      <View className={styles.optionStat}>
                        <Text>👥 {formatNumber(s.todayVisitors)}</Text>
                      </View>
                      <View className={styles.optionStat}>
                        <Text>📝 {s.todayClues}条线索</Text>
                      </View>
                      <Text
                        className={classnames(
                          styles.optionBadge,
                          s.unhandledCount === 0 ? styles.badgeNormal : styles.badgeWarning
                        )}
                      >
                        {s.unhandledCount === 0 ? '运行平稳' : `${s.unhandledCount}待处理`}
                      </Text>
                    </View>
                  </View>
                  {s.id === currentScenicId && (
                    <Text className={styles.optionCheck}>✓</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ScenicPage;
