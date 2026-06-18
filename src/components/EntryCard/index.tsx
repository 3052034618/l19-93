import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EntryCardProps {
  icon: string;
  title: string;
  desc: string;
  badge?: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({
  icon,
  title,
  desc,
  badge,
  onClick
}) => {
  return (
    <View className={styles.entryCard} onClick={onClick}>
      <View className={styles.decoration} />
      <View className={styles.decoration2} />
      <View className={styles.header}>
        <View className={styles.iconBox}>
          <Text>{icon}</Text>
        </View>
        <Text className={styles.arrow}>→</Text>
      </View>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.desc}>{desc}</Text>
      {badge && (
        <Text className={styles.badge}>{badge}</Text>
      )}
    </View>
  );
};

export default EntryCard;
