import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { PatrolRecord, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatTime } from '@/utils';

interface RecordItemProps {
  record: PatrolRecord;
}

const RecordItem: React.FC<RecordItemProps> = ({ record }) => {
  return (
    <View className={styles.recordItem}>
      <View className={styles.header}>
        <Text className={styles.title}>{record.clueTitle}</Text>
        <StatusTag status={record.status} />
      </View>

      <View className={styles.meta}>
        <Text
          className={styles.categoryTag}
          style={{ background: CATEGORY_COLORS[record.category] }}
        >
          {CATEGORY_LABELS[record.category]}
        </Text>
        <View className={styles.metaItem}>
          <Text>🏞️</Text>
          <Text>{record.scenicName}</Text>
        </View>
      </View>

      {record.note && (
        <Text className={styles.note}>{record.note}</Text>
      )}

      <View className={styles.footer}>
        <View className={styles.operator}>
          <Text>👤</Text>
          <Text>巡检员：{record.operator}</Text>
        </View>
        <Text className={styles.time}>{formatTime(record.createdAt)}</Text>
      </View>
    </View>
  );
};

export default RecordItem;
