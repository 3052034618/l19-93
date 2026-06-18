import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { ClueStatus, STATUS_LABELS, CATEGORY_LABELS, ClueCategory } from '@/types';
import StatCard from '@/components/StatCard';
import RecordItem from '@/components/RecordItem';

type StatusFilter = ClueStatus | 'all';

const RecordsPage: React.FC = () => {
  const { records } = useAppStore();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  useDidShow(() => {
    console.log('[RecordsPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[RecordsPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const statusStats = useMemo(() => {
    return {
      total: records.length,
      verifying: records.filter(r => r.status === 'verifying').length,
      contacted: records.filter(r => r.status === 'contacted').length,
      attention: records.filter(r => r.status === 'attention').length
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    let list = records;
    if (activeStatus !== 'all') {
      list = list.filter(r => r.status === activeStatus);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, activeStatus]);

  const filterOptions: { key: StatusFilter; label: string; extra?: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'verifying', label: STATUS_LABELS.verifying },
    { key: 'contacted', label: STATUS_LABELS.contacted },
    { key: 'attention', label: STATUS_LABELS.attention }
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [records]);

  return (
    <ScrollView scrollY className={styles.recordsPage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <Text className={styles.title}>上报记录</Text>
        <Text className={styles.desc}>
          历史巡检处置记录，可按状态筛选查看详细信息
        </Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard value={statusStats.total} label="总记录" variant="highlight" />
        <StatCard value={statusStats.verifying} label="核实中" variant="warning" />
        <StatCard value={statusStats.attention} label="需关注" variant="danger" />
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>按状态筛选</Text>
        <View className={styles.filterChips}>
          {filterOptions.map(opt => (
            <Text
              key={opt.key}
              className={classnames(
                styles.filterChip,
                activeStatus === opt.key && styles.active
              )}
              onClick={() => setActiveStatus(opt.key)}
            >
              {opt.label}
            </Text>
          ))}
        </View>
      </View>

      {Object.keys(categoryCounts).length > 0 && (
        <View className={styles.filterSection}>
          <Text className={styles.filterLabel}>问题类型分布</Text>
          <View className={styles.filterChips}>
            {(Object.keys(categoryCounts) as ClueCategory[]).map(k => (
              <Text
                key={k}
                className={styles.filterChip}
              >
                {CATEGORY_LABELS[k]} {categoryCounts[k]}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View className={styles.listArea}>
        <View className={styles.listTitle}>
          <Text className={styles.listTitleText}>记录列表</Text>
          <Text className={styles.listTitleCount}>共 {filteredRecords.length} 条</Text>
        </View>
        <View className={styles.recordList}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map(r => (
              <RecordItem key={r.id} record={r} />
            ))
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无处置记录</Text>
              <Text className={styles.emptySubtext}>处理线索后将自动生成记录</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
