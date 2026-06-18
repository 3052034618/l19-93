import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { PatrolRecord, CATEGORY_LABELS, CATEGORY_COLORS, VideoClue } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatTime, validatePhotos } from '@/utils';

interface RecordItemProps {
  record: PatrolRecord;
  clue?: VideoClue;
}

const RecordItem: React.FC<RecordItemProps> = ({ record, clue }) => {
  const updateCount = record.updateHistory?.length || 0;
  const cluePhotos = clue ? validatePhotos(clue.photos) : [];
  const photoCount = cluePhotos.length;

  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/clue-detail/index?id=${record.clueId}` });
  };

  return (
    <View className={styles.recordItem} onClick={handleClick}>
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
        {updateCount > 1 && (
          <View className={styles.updateCount}>
            <Text>🔄 已跟进 {updateCount} 次</Text>
          </View>
        )}
        {photoCount > 0 && (
          <View className={styles.photoCount}>
            <Text>📷 {photoCount}张照片</Text>
          </View>
        )}
      </View>

      {photoCount > 0 && (
        <View className={styles.photoRow}>
          {cluePhotos.slice(0, 3).map((p, i) => (
            <Image key={i} className={styles.photoThumb} src={p} mode="aspectFill" />
          ))}
        </View>
      )}

      {record.note && (
        <View className={styles.noteBox}>
          <Text className={styles.noteLabel}>最新处理说明</Text>
          <Text className={styles.note}>{record.note}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.operator}>
          <Text>👤</Text>
          <Text>巡检员：{record.operator}</Text>
        </View>
        <View className={styles.timeWrap}>
          {record.lastUpdatedAt && record.lastUpdatedAt !== record.createdAt && (
            <Text className={styles.lastUpdate}>最后更新 {formatTime(record.lastUpdatedAt)}</Text>
          )}
          <Text className={styles.time}>创建 {formatTime(record.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
};

export default RecordItem;
