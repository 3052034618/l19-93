import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore, isHandled } from '@/store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  ClueCategory,
  VideoClue,
  DailyReport
} from '@/types';
import ClueCard from '@/components/ClueCard';

const computeReport = (
  clues: VideoClue[],
  records: { clueId: string; updateHistory: { status: string; note: string }[] }[]
): DailyReport => {
  const totalClues = clues.length;
  const handledClues = clues.filter(c => isHandled(c.status)).length;
  const unhandledClues = totalClues - handledClues;

  const categoryMap: Record<ClueCategory, { count: number; keywords: Set<string> }> = {
    queue: { count: 0, keywords: new Set() },
    parking: { count: 0, keywords: new Set() },
    fraud: { count: 0, keywords: new Set() },
    service: { count: 0, keywords: new Set() },
    weather: { count: 0, keywords: new Set() }
  };

  const scenicMap: Record<string, number> = {};

  clues.forEach(c => {
    categoryMap[c.category].count += 1;
    c.complains.forEach(k => categoryMap[c.category].keywords.add(k));
    scenicMap[c.scenicName] = (scenicMap[c.scenicName] || 0) + 1;
  });

  const repeatedProblems = (Object.keys(categoryMap) as ClueCategory[])
    .map(k => ({
      category: k,
      count: categoryMap[k].count,
      keywords: Array.from(categoryMap[k].keywords)
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count);

  const scenicStats = Object.entries(scenicMap)
    .map(([scenicName, clueCount]) => ({ scenicName, clueCount }))
    .sort((a, b) => b.clueCount - a.clueCount);

  const hotCategorySet = new Set(
    repeatedProblems.filter(p => p.count >= 3).map(p => p.category)
  );

  const recordMap = new Map(records.map(r => [r.clueId, r]));
  const scoredClues = clues
    .map(c => {
      const engagement = c.likes + c.comments + c.shares;
      const record = recordMap.get(c.id);
      const historyCount = record?.updateHistory?.length || 0;

      let needAttention = false;
      let score = 0;

      if (engagement > 5000) { needAttention = true; score += 1000 + engagement; }
      if (!isHandled(c.status) && c.status !== 'unhandled') { needAttention = true; score += 300; }
      if (c.status === 'unhandled') { needAttention = true; score += 500; }
      if (c.status === 'attention') { needAttention = true; score += 800; }
      if (hotCategorySet.has(c.category)) { needAttention = true; score += 200 * (categoryMap[c.category].count || 0); }
      if (historyCount > 1) { needAttention = true; score += historyCount * 50; }
      score += engagement;

      return { clue: c, needAttention, score };
    })
    .filter(s => s.needAttention)
    .sort((a, b) => b.score - a.score)
    .map(s => s.clue);

  return {
    date: new Date().toISOString().slice(0, 10),
    totalClues,
    handledClues,
    unhandledClues,
    hotVideos: scoredClues,
    repeatedProblems,
    scenicStats
  };
};

const ReportPage: React.FC = () => {
  const { clues, records, setCurrentScenicId } = useAppStore();
  const [generated, setGenerated] = useState(false);

  useDidShow(() => {
    console.log('[ReportPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[ReportPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const reportData = useMemo(() => computeReport(clues, records), [clues, records]);

  const rate = reportData.totalClues > 0
    ? Math.round((reportData.handledClues / reportData.totalClues) * 100)
    : 0;
  const attentionCount = clues.filter(c => c.status === 'attention').length;

  const maxScenicCount = useMemo(() => {
    return Math.max(...reportData.scenicStats.map(s => s.clueCount), 1);
  }, [reportData.scenicStats]);

  const handleGenerate = () => {
    console.log('[ReportPage] 生成巡检日报', reportData);
    setGenerated(true);
    Taro.showModal({
      title: '日报已生成',
      content: `今日共 ${reportData.totalClues} 条线索，已处置 ${reportData.handledClues} 条，处置率 ${rate}%，需明日观察 ${reportData.hotVideos.length} 条视频。可复制后发送给领导审阅。`,
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制日报',
      success: (res) => {
        if (res.confirm) {
          const lines: string[] = [];
          lines.push(`【${todayDate} 景区舆情巡检日报】`);
          lines.push('');
          lines.push(`📊 今日概览`);
          lines.push(`  · 总线索：${reportData.totalClues} 条`);
          lines.push(`  · 已处置：${reportData.handledClues} 条`);
          lines.push(`  · 待处理：${reportData.unhandledClues} 条`);
          lines.push(`  · 需领导关注：${attentionCount} 条`);
          lines.push(`  · 处置率：${rate}%`);
          lines.push('');
          if (reportData.repeatedProblems.length > 0) {
            lines.push('⚠️ 重复出现的问题（TOP）');
            reportData.repeatedProblems.slice(0, 3).forEach((p, i) => {
              lines.push(`  ${i + 1}. ${CATEGORY_LABELS[p.category]}：${p.count}起（${p.keywords.join('、')}）`);
            });
            lines.push('');
          }
          if (reportData.hotVideos.length > 0) {
            lines.push('🔥 明日继续观察的热门视频');
            reportData.hotVideos.slice(0, 5).forEach((v, i) => {
              const eng = v.likes + v.comments + v.shares;
              lines.push(`  ${i + 1}. [${CATEGORY_LABELS[v.category]}]${v.title}（互动${eng}，${v.scenicName}）`);
            });
            lines.push('');
          }
          if (reportData.scenicStats.length > 0) {
            lines.push('🏞️ 景区舆情分布');
            reportData.scenicStats.slice(0, 5).forEach((s, i) => {
              lines.push(`  ${i + 1}. ${s.scenicName}：${s.clueCount}条`);
            });
          }
          Taro.setClipboardData({
            data: lines.join('\n'),
            success: () => Taro.showToast({ title: '日报已复制', icon: 'success' })
          });
        }
      }
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
        <View className={styles.dateTitleRow}>
          <Text className={styles.dateTitle}>{todayDate}</Text>
          {generated && <Text className={styles.generatedTag}>✓ 已生成</Text>}
        </View>
        <Text className={styles.dateSubtitle}>景区舆情巡检日报</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          <Text className={styles.sectionTitleText}>今日概览</Text>
          <Text className={styles.refreshTip}>（实时）</Text>
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
              {attentionCount}
            </Text>
            <Text className={styles.summaryLabel}>需关注</Text>
          </View>
          <View className={styles.rateBar}>
            <View
              className={styles.rateFill}
              style={{ width: `${rate}%` }}
            />
          </View>
          <Text className={styles.rateText}>处置率 {rate}%</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⚠️</Text>
          <Text className={styles.sectionTitleText}>重复出现的问题</Text>
        </View>
        {reportData.repeatedProblems.length > 0 ? (
          reportData.repeatedProblems.map((p, i) => (
            <View key={p.category} className={styles.problemCard}>
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
              {p.keywords.length > 0 && (
                <View className={styles.keywords}>
                  {p.keywords.map((k, ki) => (
                    <Text key={ki} className={styles.keywordTag}>
                      #{k}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyBlock}>
            <Text className={styles.emptyText}>暂无重复问题，表现良好 ✨</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔥</Text>
          <Text className={styles.sectionTitleText}>明日继续观察的热门视频</Text>
        </View>
        <View className={styles.hotExplain}>
          <Text>仅展示：互动量高 / 未联系景区闭环 / 该类问题重复 ≥3 次 的线索</Text>
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
            <Text className={styles.emptyTip}>🎉 暂无需要明日持续观察的视频</Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏞️</Text>
          <Text className={styles.sectionTitleText}>景区舆情分布</Text>
        </View>
        {reportData.scenicStats.length > 0 ? (
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
        ) : (
          <View className={styles.emptyBlock}>
            <Text className={styles.emptyText}>暂无景区数据</Text>
          </View>
        )}
      </View>

      <View className={styles.actions}>
        <Button className={styles.generateBtn} onClick={handleGenerate}>
          生成并复制巡检日报
        </Button>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
