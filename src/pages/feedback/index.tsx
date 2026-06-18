import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { replyTemplates } from '@/data/mock';
import { REPLY_CATEGORY_LABELS, ClueCategory, CATEGORY_LABELS } from '@/types';
import ReplyTemplateCard from '@/components/ReplyTemplate';

type TabKey = 'explain' | 'apologize' | 'guide';

const categoryTips: Record<TabKey, { icon: string; title: string; tips: string[] }> = {
  explain: {
    icon: '💡',
    title: '解释说明类回应要点',
    tips: [
      '事实清楚：基于调查结果，不回避不夸大',
      '原因明确：说明客观原因和已采取措施',
      '给出预期：告知后续改进方向和时间节点',
      '语气专业：使用官方标准话术，避免情绪化'
    ]
  },
  apologize: {
    icon: '🙇',
    title: '道歉安抚类回应要点',
    tips: [
      '第一时间道歉：态度诚恳，不推诿责任',
      '共情表达：站在游客角度感受不愉快体验',
      '行动承诺：明确说明正在或即将采取的措施',
      '适度承诺：不随意答应无法兑现的补偿'
    ]
  },
  guide: {
    icon: '📞',
    title: '引导投诉类回应要点',
    tips: [
      '提供多渠道：热线、平台、邮箱、私信等',
      '响应时效：明确告知24小时内专人跟进',
      '隐私保护：建议通过非公开渠道提供细节',
      '闭环承诺：说明投诉处理流程和反馈机制'
    ]
  }
};

const FeedbackPage: React.FC = () => {
  const router = useRouter();
  const clueCategory = router.params?.category as ClueCategory | undefined;
  const [activeTab, setActiveTab] = useState<TabKey>('explain');

  useDidShow(() => {
    console.log('[FeedbackPage] 页面显示', { clueCategory });
  });

  const filteredTemplates = useMemo(() => {
    return replyTemplates.filter(t => t.category === activeTab);
  }, [activeTab]);

  const tips = categoryTips[activeTab];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'explain', label: '解释说明' },
    { key: 'apologize', label: '道歉安抚' },
    { key: 'guide', label: '引导投诉' }
  ];

  return (
    <ScrollView scrollY className={styles.feedbackPage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <Text className={styles.title}>回应建议库</Text>
        <Text className={styles.desc}>
          按场景分类的官方回应话术，复制后可直接发给新媒体同事编辑发布
          {clueCategory && ` · 当前线索：${CATEGORY_LABELS[clueCategory]}`}
        </Text>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <Button
            key={tab.key}
            className={classnames(
              styles.tab,
              activeTab === tab.key && styles.tabActive
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>{tips.icon}</Text>
            <Text>{tips.title}</Text>
          </View>
        </View>
        <View className={styles.tipsBox}>
          <Text className={styles.tipsTitle}>
            <Text style={{ color: '#F59E0B' }}>⚠️</Text>
            <Text>话术使用规范</Text>
          </Text>
          <View className={styles.tipsContent}>
            {tips.tips.map((tip, i) => (
              <Text key={i} className={styles.tipsItem}>{tip}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>📄</Text>
            <Text>{REPLY_CATEGORY_LABELS[activeTab]}模板</Text>
          </Text>
          <Text className={styles.sectionCount}>共 {filteredTemplates.length} 套</Text>
        </View>
        <View className={styles.templateList}>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(t => (
              <ReplyTemplateCard key={t.id} template={t} />
            ))
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无此类模板</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default FeedbackPage;
