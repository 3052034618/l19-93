import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { VideoClue, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatTime, formatNumber } from '@/utils';

interface ClueCardProps {
  clue: VideoClue;
  onClick?: () => void;
}

const ClueCard: React.FC<ClueCardProps> = ({ clue, onClick }) => {
  const totalEngagement = clue.likes + clue.comments + clue.shares;
  const isHot = totalEngagement > 5000;

  return (
    <View className={styles.clueCard} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.titleWrap}>
          <Text
            className={styles.categoryTag}
            style={{ background: CATEGORY_COLORS[clue.category] }}
          >
            {CATEGORY_LABELS[clue.category]}
          </Text>
          <Text className={styles.title}>{clue.title}</Text>
        </View>
        <StatusTag status={clue.status} />
      </View>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.metaIcon}>⏰</Text>
          <Text>{formatTime(clue.publishTime)}</Text>
        </View>
        <View className={styles.engagement}>
          <View className={styles.engagementItem}>
            <Text>👍</Text>
            <Text className={isHot ? styles.engagementHot : ''}>
              {formatNumber(clue.likes)}
            </Text>
          </View>
          <View className={styles.engagementItem}>
            <Text>💬</Text>
            <Text>{formatNumber(clue.comments)}</Text>
          </View>
          <View className={styles.engagementItem}>
            <Text>🔄</Text>
            <Text>{formatNumber(clue.shares)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.complainSection}>
        <Text className={styles.complainLabel}>热门抱怨点：</Text>
        <View className={styles.complainTags}>
          {clue.complains.map((c, i) => (
            <Text key={i} className={styles.complainTag}>
              {c}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.location}>
          <Text>📍</Text>
          <Text>{clue.publishLocation}</Text>
        </View>
        {clue.photos.length > 0 && (
          <View className={styles.photoIndicator}>
            <Text>📷</Text>
            <Text>{clue.photos.length}张现场图</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ClueCard;
