import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { ReplyTemplate as ReplyTemplateType, REPLY_CATEGORY_LABELS } from '@/types';
import { copyText } from '@/utils';

interface ReplyTemplateProps {
  template: ReplyTemplateType;
}

const ReplyTemplateCard: React.FC<ReplyTemplateProps> = ({ template }) => {
  const handleCopy = async () => {
    try {
      await copyText(template.content);
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
      console.log('[ReplyTemplate] 复制成功', template.id);
    } catch (e) {
      console.error('[ReplyTemplate] 复制失败', e);
      Taro.showToast({ title: '复制失败', icon: 'none' });
    }
  };

  const handleSend = () => {
    console.log('[ReplyTemplate] 发送给新媒体同事', template.id);
    Taro.showToast({ title: '已发送给新媒体组', icon: 'success' });
  };

  return (
    <View className={styles.templateCard}>
      <View className={styles.header}>
        <Text className={styles.title}>{template.title}</Text>
        <Text className={styles.categoryBadge}>
          {REPLY_CATEGORY_LABELS[template.category]}
        </Text>
      </View>
      <Text className={styles.content} selectable>{template.content}</Text>
      <View className={styles.actions}>
        <Button className={styles.copyBtn} onClick={handleCopy}>
          复制内容
        </Button>
        <Button className={styles.sendBtn} onClick={handleSend}>
          发给新媒体
        </Button>
      </View>
    </View>
  );
};

export default ReplyTemplateCard;
