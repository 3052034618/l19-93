import React from 'react';
import { Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { ClueStatus, STATUS_LABELS } from '@/types';

interface StatusTagProps {
  status: ClueStatus;
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  return (
    <Text className={classnames(styles.statusTag, styles[status])}>
      {STATUS_LABELS[status]}
    </Text>
  );
};

export default StatusTag;
