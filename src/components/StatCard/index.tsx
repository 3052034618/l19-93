import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'highlight' | 'warning' | 'danger' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, variant = 'default' }) => {
  return (
    <View className={styles.statCard}>
      <Text className={classnames(styles.value, styles[variant])}>
        {value}
      </Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
