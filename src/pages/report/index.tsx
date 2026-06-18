import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { dailyReport } from '@/data/mock';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import ClueCard from '@/components/ClueCard';

const ReportPage: React.FC = () => {
  const { clues, setCurrentScenicId } = useAppStore();

  useDidShow(() => {
    console.log('[ReportPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[ReportPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const reportData = useMemo(() => {
    const total = dailyReport.totalClues;
    const handled = dailyReport.handledClues;
    const unhandled = dailyReport.unhandledClues;
    const attentionCount = clues.filter(c => c.status === 'attention').length;
    const rate = total > 0 ? Math.round((handled / total) * 100) : 0;

    return { ...dailyReport, attentionCount, rate };
  }, [clues]);

  const maxScenicCount = useMemo(() => {
    return Math.max(...reportData.scenicStats.map(s => s.clueCount), 1);
  }, [reportData.scenicStats]);

  const handleGenerate = () => {
    console.log('[ReportPage] 生成巡检日报');
    Taro.showModal({
      title: '日报已生成',
      content: '巡检日报已生成完毕，可发送给领导审阅。',
      showCancel: false,
      confirmText: '好的'
    });
  };

  const goClueDetail = (id: string, scenicId: string) => {
    setCurrentScenicId(scenicId);
    Taro.navigateTo({ url: `/pages/clue-detail/index?id=${id}` });
  };

  const todayDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }, []);

  return (
    <ScrollView scrollY className={styles.reportPage}>
      <View className={styles.dateHeader}>
        <View className={styles.decoration} />
        <Text className={styles.dateTitle}>{todayDate}</Text>
        <Text className={styles.dateSubtitle}>景区舆情巡检日报</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          <Text className={styles.sectionTitleText}>今日概览</Text>
        </View>
        <View className={styles.summaryCard}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{reportData.totalClues}</Text>
            <Text className={styles.summaryLabel}>总线索</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.success)}>
              {reportData.handledClues}
            </Text>
            <Text className={styles.summaryLabel}>已处置</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.warning)}>
              {reportData.unhandledClues}
            </Text>
            <Text className={styles.summaryLabel}>待处理</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.danger)}>
              {reportData.attentionCount}
            </Text>
            <Text className={styles.summaryLabel}>需关注</Text>
          </View>
          <View className={styles.rateBar}>
            <View
              className={styles.rateFill}
              style={{ width: `${reportData.rate}%` }}
            />
          </View>
          <Text className={styles.rateText}>处置率 {reportData.rate}%</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⚠️</Text>
          <Text className={styles.sectionTitleText}>重复出现的问题</Text>
        </View>
        {reportData.repeatedProblems.map((p, i) => (
          <View key={i} className={styles.problemCard}>
            <View className={styles.problemHeader}>
              <View className={styles.problemCategory}>
                <View
                  className={styles.categoryIcon}
                  style={{ background: CATEGORY_COLORS[p.category] }}
                >
                  {i + 1}
                </View>
                <Text className={styles.categoryName}>
                  {CATEGORY_LABELS[p.category]}类问题
                </Text>
              </View>
              <Text className={styles.problemCount}>{p.count}起</Text>
            </View>
            <View className={styles.keywords}>
              {p.keywords.map((k, ki) => (
                <Text key={ki} className={styles.keywordTag}>
                  #{k}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔥</Text>
          <Text className={styles.sectionTitleText}>明日继续观察的热门视频</Text>
        </View>
        <View className={styles.hotList}>
          {reportData.hotVideos.length > 0 ? (
            reportData.hotVideos.map(clue => (
              <ClueCard
                key={clue.id}
                clue={clue}
                onClick={() => goClueDetail(clue.id, clue.scenicId)}
              />
            ))
          ) : (
            <Text className={styles.emptyTip}>暂无需要持续观察的视频</Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏞️</Text>
          <Text className={styles.sectionTitleText}>景区舆情分布</Text>
        </View>
        <View className={styles.scenicList}>
          {reportData.scenicStats.map((s, i) => (
            <View key={s.scenicName} className={styles.scenicItem}>
              <View className={styles.scenicInfo}>
                <Text
                  className={classnames(
                    styles.scenicRank,
                    i === 0 && styles.top1,
                    i === 1 && styles.top2,
                    i === 2 && styles.top3
                  )}
                >
                  {i + 1}
                </Text>
                <Text className={styles.scenicName}>{s.scenicName}</Text>
              </View>
              <View className={styles.scenicCount}>
                <View className={styles.countBar}>
                  <View
                    className={styles.countFill}
                    style={{
                      width: `${(s.clueCount / maxScenicCount) * 100}%`
                    }}
                  />
                </View>
                <Text className={styles.countText}>{s.clueCount}条</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actions}>
        <Button className={styles.generateBtn} onClick={handleGenerate}>
          生成并发送巡检日报
        </Button>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
