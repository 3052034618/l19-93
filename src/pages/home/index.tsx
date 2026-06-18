import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { isHandled } from '@/store';
import { scenicSpots } from '@/data/mock';
import EntryCard from '@/components/EntryCard';
import StatCard from '@/components/StatCard';
import ClueCard from '@/components/ClueCard';
import { formatNumber, getTodayStr } from '@/utils';

const HomePage: React.FC = () => {
  const { clues, records, setCurrentScenicId } = useAppStore();

  useDidShow(() => {
    console.log('[HomePage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[HomePage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const stats = useMemo(() => {
    const today = getTodayStr();
    const todayClues = clues.filter(c => c.createdAt.startsWith(today));
    const handled = clues.filter(c => isHandled(c.status)).length;
    const unhandled = clues.length - handled;
    const attentionCount = clues.filter(c => c.status === 'attention').length;
    return {
      total: todayClues.length || clues.length,
      unhandled,
      attention: attentionCount,
      handled
    };
  }, [clues]);

  const hotClues = useMemo(() => {
    return [...clues]
      .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
      .slice(0, 3);
  }, [clues]);

  const totalVisitors = useMemo(() => {
    return scenicSpots.reduce((sum, s) => sum + s.todayVisitors, 0);
  }, []);

  const goScenic = () => {
    console.log('[HomePage] 跳转今日景区');
    Taro.navigateTo({ url: '/pages/scenic/index' });
  };

  const goFeedback = () => {
    console.log('[HomePage] 跳转游客反馈');
    Taro.navigateTo({ url: '/pages/feedback/index' });
  };

  const goRecords = () => {
    console.log('[HomePage] 跳转上报记录');
    Taro.navigateTo({ url: '/pages/records/index' });
  };

  const goClueDetail = (id: string) => {
    console.log('[HomePage] 跳转线索详情', id);
    Taro.navigateTo({ url: `/pages/clue-detail/index?id=${id}` });
  };

  const todayDate = useMemo(() => {
    const d = new Date();
    return `${d.getMonth() + 1}月${d.getDate()}日 周${['日','一','二','三','四','五','六'][d.getDay()]}`;
  }, []);

  return (
    <ScrollView scrollY className={styles.homePage}>
      <View className={styles.header}>
        <View className={styles.decoration} />
        <View className={styles.decoration2} />
        <View className={styles.titleRow}>
          <Text className={styles.title}>舆情巡检</Text>
          <Text className={styles.date}>{todayDate}</Text>
        </View>
        <Text className={styles.subtitle}>
          今日全市景区总客流约 {formatNumber(totalVisitors)} 人次
        </Text>

        {stats.attention > 0 && (
          <View className={styles.alertBox}>
            <Text className={styles.alertIcon}>🚨</Text>
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>
                有 {stats.attention} 条线索需要领导关注
              </Text>
              <Text className={styles.alertDesc}>
                涉及宰客、服务态度恶劣、安全隐患等高风险舆情，请优先处置
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.statsRow}>
        <StatCard
          value={stats.total}
          label="今日线索"
          variant="highlight"
        />
        <StatCard
          value={stats.unhandled}
          label="待处理"
          variant="warning"
        />
        <StatCard
          value={stats.handled}
          label="已处置"
          variant="success"
        />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>快捷入口</Text>
        </View>
        <View className={styles.entryGrid}>
          <EntryCard
            icon="🏞️"
            title="今日景区"
            desc="选择景区，查看排队、停车、宰客、服务态度、突发天气等短视频舆情线索"
            badge={`${scenicSpots.length}个景区`}
            onClick={goScenic}
          />
          <EntryCard
            icon="💬"
            title="游客反馈"
            desc="按解释说明、道歉安抚、引导投诉渠道分类，复制后发给新媒体同事"
            badge="9套回复模板"
            onClick={goFeedback}
          />
          <EntryCard
            icon="📋"
            title="上报记录"
            desc="查看历史巡检处置记录，含状态、处理人、备注等完整信息"
            badge={`${records.length}条记录`}
            onClick={goRecords}
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>🔥 热门舆情</Text>
          <Text
            className={styles.sectionMore}
            onClick={goScenic}
          >
            查看全部 →
          </Text>
        </View>
        <View className={styles.hotClues}>
          {hotClues.length > 0 ? (
            hotClues.map(clue => (
              <ClueCard
                key={clue.id}
                clue={clue}
                onClick={() => {
                  setCurrentScenicId(clue.scenicId);
                  goClueDetail(clue.id);
                }}
              />
            ))
          ) : (
            <Text className={styles.emptyTip}>暂无热门舆情</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
