import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Button, Image, Textarea } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  ClueStatus
} from '@/types';
import { formatNumber, formatTime, persistImage, validatePhotos } from '@/utils';

const statusOptions: { key: ClueStatus }[] = [
  { key: 'verifying' },
  { key: 'contacted' },
  { key: 'attention' }
];

const ClueDetailPage: React.FC = () => {
  const router = useRouter();
  const clueId = router.params?.id || '';
  const { clues, updateClueStatus, addPhotoToClue, upsertRecord, records } = useAppStore();

  const clue = useMemo(() => clues.find(c => c.id === clueId), [clues, clueId]);
  const record = useMemo(() => records.find(r => r.clueId === clueId), [records, clueId]);

  const [selectedStatus, setSelectedStatus] = useState<ClueStatus>();
  const [note, setNote] = useState('');

  useDidShow(() => {
    console.log('[ClueDetail] 页面显示', { clueId });
    if (clue) {
      setSelectedStatus(clue.status);
    }
    if (record?.note) {
      setNote(record.note);
    }
  });

  const totalEngagement = clue ? clue.likes + clue.comments + clue.shares : 0;
  const isHot = totalEngagement > 5000;

  const handleStatusChange = (status: ClueStatus) => {
    setSelectedStatus(status);
  };

  const handleConfirm = () => {
    if (!selectedStatus || !clue) return;
    console.log('[ClueDetail] 确认状态', { clueId, status: selectedStatus, note });
    updateClueStatus(clueId, selectedStatus, '当前用户');
    upsertRecord({
      clueId: clue.id,
      clueTitle: clue.title,
      scenicName: clue.scenicName,
      category: clue.category,
      status: selectedStatus,
      operator: '当前用户',
      note: note || `状态更新为：${STATUS_LABELS[selectedStatus]}`
    });
    Taro.showToast({ title: '状态已同步', icon: 'success' });
  };

  const handleAddPhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 3 - (clue?.photos.length || 0),
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      for (const tempPath of res.tempFilePaths) {
        const persistentUrl = await persistImage(tempPath);
        if (persistentUrl) {
          addPhotoToClue(clueId, persistentUrl);
        } else {
          Taro.showToast({ title: '照片保存失败，请重试', icon: 'none' });
        }
      }
      if (res.tempFilePaths.length > 0) {
        Taro.showToast({ title: '照片已保存', icon: 'success' });
      }
    } catch (e) {
      console.error('[ClueDetail] 拍照失败', e);
    }
  };

  const goFeedback = () => {
    console.log('[ClueDetail] 跳转回应建议');
    Taro.navigateTo({ url: `/pages/feedback/index?category=${clue?.category}` });
  };

  const handlePreviewPhoto = (urls: string[], current: string) => {
    Taro.previewImage({ urls, current });
  };

  const validPhotos = useMemo(() => validatePhotos(clue?.photos || []), [clue?.photos]);

  if (!clue) {
    return (
      <View className={styles.clueDetailPage}>
        <View style={{ padding: 80, textAlign: 'center' }}>
          <Text style={{ color: '#999' }}>线索不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.clueDetailPage}>
      <View className={styles.headerSection}>
        <View className={styles.decoration} />
        <View className={styles.categoryRow}>
          <Text
            className={styles.categoryBadge}
            style={{ background: CATEGORY_COLORS[clue.category] }}
          >
            {CATEGORY_LABELS[clue.category]}
          </Text>
          {selectedStatus && selectedStatus !== 'unhandled' && (
            <Text
              className={styles.statusBadge}
              style={{ background: STATUS_COLORS[selectedStatus] }}
            >
              {STATUS_LABELS[selectedStatus]}
            </Text>
          )}
        </View>
        <Text className={styles.title}>{clue.title}</Text>
        <View className={styles.metaRow}>
          <View className={styles.metaItem}>
            <Text>⏰</Text>
            <Text>{formatTime(clue.publishTime)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>📍</Text>
            <Text>{clue.publishLocation}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>🏞️</Text>
            <Text>{clue.scenicName}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitleText}>事件描述</Text>
          </View>
          <Text className={styles.description}>{clue.description}</Text>
          <View className={styles.engagementList}>
            <View className={styles.engagementItem}>
              <Text className={classnames(styles.engagementValue, isHot && styles.hot)}>
                {formatNumber(clue.likes)}
              </Text>
              <Text className={styles.engagementLabel}>点赞</Text>
            </View>
            <View className={styles.engagementItem}>
              <Text className={classnames(styles.engagementValue, isHot && styles.hot)}>
                {formatNumber(clue.comments)}
              </Text>
              <Text className={styles.engagementLabel}>评论</Text>
            </View>
            <View className={styles.engagementItem}>
              <Text className={classnames(styles.engagementValue, isHot && styles.hot)}>
                {formatNumber(clue.shares)}
              </Text>
              <Text className={styles.engagementLabel}>转发</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💢</Text>
            <Text className={styles.sectionTitleText}>热门抱怨点</Text>
          </View>
          <View className={styles.complainTags}>
            {clue.complains.map((c, i) => (
              <Text key={i} className={styles.complainTag}>
                #{c}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.statusCard}>
          <Text className={styles.statusTitle}>巡检处置状态</Text>
          <View className={styles.statusOptions}>
            {statusOptions.map(opt => (
              <Button
                key={opt.key}
                className={classnames(
                  styles.statusOption,
                  selectedStatus === opt.key && styles.statusOptionActive
                )}
                onClick={() => handleStatusChange(opt.key)}
              >
                <View className={styles.statusOptionLeft}>
                  <View
                    className={styles.statusDot}
                    style={{ background: STATUS_COLORS[opt.key] }}
                  />
                  <Text className={styles.statusOptionText}>
                    {STATUS_LABELS[opt.key]}
                  </Text>
                </View>
                {selectedStatus === opt.key && (
                  <Text className={styles.statusCheck}>✓</Text>
                )}
              </Button>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📋</Text>
            <Text className={styles.sectionTitleText}>处理说明</Text>
          </View>
          <Textarea
            className={styles.noteTextarea}
            placeholder="请输入处理情况说明，如：已与景区负责人电话沟通，对方承诺立即整改……"
            value={note}
            onInput={e => setNote(e.detail.value)}
            maxlength={300}
            autoHeight
          />
          {record && (
            <View className={styles.lastUpdateTip}>
              <Text>🕒 最后更新：</Text>
              <Text>{formatTime(record.lastUpdatedAt || record.createdAt)}</Text>
              <Text>  ·  </Text>
              <Text>{record.operator || '系统'}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.photoCard}>
          <View className={styles.photoTitle}>
            <Text className={styles.photoTitleText}>
              现场照片 ({validPhotos.length}/3)
            </Text>
          </View>
          <View className={styles.photoList}>
            {validPhotos.map((p, i) => (
              <View
                key={i}
                className={styles.photoItem}
                onClick={() => handlePreviewPhoto(validPhotos, p)}
              >
                <Image className={styles.photoImg} src={p} mode="aspectFill" />
              </View>
            ))}
            {validPhotos.length < 3 && (
              <View className={styles.addPhoto} onClick={handleAddPhoto}>
                <Text className={styles.addPhotoIcon}>📷</Text>
                <Text className={styles.addPhotoText}>拍照补充</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {record && Array.isArray(record.updateHistory) && record.updateHistory.length > 1 && (
        <View className={styles.section}>
          <View className={styles.card}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📜</Text>
              <Text className={styles.sectionTitleText}>处置时间线</Text>
            </View>
            <View className={styles.timeline}>
              {record.updateHistory.slice().reverse().map((log, i, arr) => (
                <View key={i} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{ background: STATUS_COLORS[log.status] || '#9CA3AF' }} />
                  {i < arr.length - 1 && <View className={styles.timelineLine} />}
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <Text
                        className={styles.timelineStatusTag}
                        style={{ background: STATUS_COLORS[log.status] || '#9CA3AF' }}
                      >
                        {STATUS_LABELS[log.status] || log.status}
                      </Text>
                      <Text className={styles.timelineTime}>{formatTime(log.updatedAt)}</Text>
                    </View>
                    {log.note && <Text className={styles.timelineNote}>{log.note}</Text>}
                    <Text className={styles.timelineOperator}>—— {log.operator || '系统'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <View className={styles.footerBar}>
        <Button className={styles.secondaryBtn} onClick={goFeedback}>
          回应建议
        </Button>
        <Button className={styles.primaryBtn} onClick={handleConfirm}>
          确认提交
        </Button>
      </View>
    </ScrollView>
  );
};

export default ClueDetailPage;
