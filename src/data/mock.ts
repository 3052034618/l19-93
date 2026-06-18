import { ScenicSpot, VideoClue, ReplyTemplate, PatrolRecord, DailyReport } from '@/types';

export const scenicSpots: ScenicSpot[] = [
  { id: 'sc1', name: '青龙山风景区', todayVisitors: 18600, todayClues: 12, unhandledCount: 3 },
  { id: 'sc2', name: '碧潭古镇', todayVisitors: 25400, todayClues: 18, unhandledCount: 5 },
  { id: 'sc3', name: '花海公园', todayVisitors: 12300, todayClues: 7, unhandledCount: 1 },
  { id: 'sc4', name: '古刹禅寺', todayVisitors: 8900, todayClues: 4, unhandledCount: 0 },
  { id: 'sc5', name: '雪山滑雪场', todayVisitors: 6700, todayClues: 5, unhandledCount: 2 }
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600000).toISOString();

export const videoClues: VideoClue[] = [
  {
    id: 'cl1',
    scenicId: 'sc1',
    scenicName: '青龙山风景区',
    title: '索道排队长达3小时，游客怨声载道',
    category: 'queue',
    publishTime: hoursAgo(1),
    publishLocation: '青龙山索道入口',
    likes: 2345,
    comments: 567,
    shares: 89,
    complains: ['排队长', '效率低', '管理混乱', '中暑'],
    status: 'verifying',
    photos: [],
    createdAt: hoursAgo(1),
    operator: '',
    description: '索道入口人山人海，队伍绕了三圈，现场无工作人员疏导。部分老人小孩出现中暑症状。'
  },
  {
    id: 'cl2',
    scenicId: 'sc1',
    scenicName: '青龙山风景区',
    title: '停车费50元一小时？景区回应：外包停车场',
    category: 'parking',
    publishTime: hoursAgo(3),
    publishLocation: '景区P3停车场',
    likes: 5678,
    comments: 1234,
    shares: 456,
    complains: ['停车贵', '乱收费', '无发票', '强制消费'],
    status: 'attention',
    photos: ['https://picsum.photos/id/1018/400/300'],
    createdAt: hoursAgo(3),
    operator: '张三',
    description: 'P3停车场收费牌显示小车50元/小时，与景区公示的10元/小时严重不符。投诉无门。'
  },
  {
    id: 'cl3',
    scenicId: 'sc2',
    scenicName: '碧潭古镇',
    title: '一碗面条88元！古镇宰客太猖狂',
    category: 'fraud',
    publishTime: hoursAgo(2),
    publishLocation: '古镇小吃街',
    likes: 12340,
    comments: 3456,
    shares: 2345,
    complains: ['天价', '宰客', '菜单标价不清', '强买强卖'],
    status: 'contacted',
    photos: ['https://picsum.photos/id/292/400/300'],
    createdAt: hoursAgo(2),
    operator: '李四',
    description: '小吃街某店，一碗普通牛肉面收费88元，菜单小字标注"特级"。消费者协会已介入。'
  },
  {
    id: 'cl4',
    scenicId: 'sc2',
    scenicName: '碧潭古镇',
    title: '导游态度恶劣，辱骂游客不购物',
    category: 'service',
    publishTime: hoursAgo(5),
    publishLocation: '古镇玉器店',
    likes: 8900,
    comments: 2100,
    shares: 1560,
    complains: ['态度差', '强制购物', '辱骂', '甩团'],
    status: 'unhandled',
    photos: [],
    createdAt: hoursAgo(5),
    operator: '',
    description: '团客在玉器店停留2小时，因购物金额不足，导游当众辱骂游客"穷鬼就别出来玩"。'
  },
  {
    id: 'cl5',
    scenicId: 'sc2',
    scenicName: '碧潭古镇',
    title: '突降暴雨，景区无避雨点老人被淋',
    category: 'weather',
    publishTime: hoursAgo(4),
    publishLocation: '古镇游船码头',
    likes: 4500,
    comments: 890,
    shares: 320,
    complains: ['天气预警', '避雨设施少', '老人小孩', '应急差'],
    status: 'verifying',
    photos: [],
    createdAt: hoursAgo(4),
    operator: '',
    description: '午后突降暴雨，码头数百游客无处躲雨，多名老人儿童淋湿感冒。景区未及时发布预警。'
  },
  {
    id: 'cl6',
    scenicId: 'sc3',
    scenicName: '花海公园',
    title: '拍照排队2小时，只为拍网红花墙',
    category: 'queue',
    publishTime: hoursAgo(6),
    publishLocation: '北门网红花墙',
    likes: 1200,
    comments: 234,
    shares: 56,
    complains: ['拍照排队', '人太多', '建议分流'],
    status: 'contacted',
    photos: ['https://picsum.photos/id/1044/400/300'],
    createdAt: hoursAgo(6),
    operator: '王五',
    description: '网红花墙成为打卡热点，游客排队拍照秩序混乱，建议景区设立排队引导。'
  },
  {
    id: 'cl7',
    scenicId: 'sc3',
    scenicName: '花海公园',
    title: '保安辱骂游客：你们素质太低了',
    category: 'service',
    publishTime: hoursAgo(8),
    publishLocation: '南园草坪',
    likes: 6700,
    comments: 1560,
    shares: 890,
    complains: ['保安态度', '辱骂', '处理不公', '投诉无门'],
    status: 'attention',
    photos: [],
    createdAt: hoursAgo(8),
    operator: '',
    description: '因制止游客踩踏草坪引发口角，保安当众辱骂多名游客，引发围观冲突。'
  },
  {
    id: 'cl8',
    scenicId: 'sc4',
    scenicName: '古刹禅寺',
    title: '停车场满了，路边被贴罚单',
    category: 'parking',
    publishTime: hoursAgo(2),
    publishLocation: '景区外市政道路',
    likes: 3400,
    comments: 567,
    shares: 123,
    complains: ['停车位不足', '引导缺失', '罚单', '配套差'],
    status: 'unhandled',
    photos: [],
    createdAt: hoursAgo(2),
    operator: '',
    description: '景区停车场上午10点就满了，引导牌缺失，大量车主停在路边被交警贴罚单。'
  },
  {
    id: 'cl9',
    scenicId: 'sc5',
    scenicName: '雪山滑雪场',
    title: '暴雪预警未关闭，游客被困山顶',
    category: 'weather',
    publishTime: hoursAgo(10),
    publishLocation: '滑雪场3号索道',
    likes: 15600,
    comments: 4500,
    shares: 3200,
    complains: ['暴雪', '安全隐患', '停运不及时', '救援慢'],
    status: 'attention',
    photos: ['https://picsum.photos/id/1015/400/300'],
    createdAt: hoursAgo(10),
    operator: '赵六',
    description: '气象部门已发布暴雪橙色预警，滑雪场仍正常售票。下午索道停运，游客徒步下山摔伤。'
  },
  {
    id: 'cl10',
    scenicId: 'sc5',
    scenicName: '雪山滑雪场',
    title: '租雪服漫天要价，押金不退',
    category: 'fraud',
    publishTime: hoursAgo(7),
    publishLocation: '服务大厅租赁处',
    likes: 2300,
    comments: 678,
    shares: 345,
    complains: ['租金高', '押金不退', '损坏讹诈', '霸王条款'],
    status: 'verifying',
    photos: [],
    createdAt: hoursAgo(7),
    operator: '',
    description: '租赁雪服一套300元/天，押金1000元。归还时以"有污渍"为由扣押金，且污渍是旧痕。'
  },
  {
    id: 'cl11',
    scenicId: 'sc1',
    scenicName: '青龙山风景区',
    title: '售票处工作人员不耐烦，推搡游客',
    category: 'service',
    publishTime: hoursAgo(12),
    publishLocation: '东门售票处',
    likes: 7800,
    comments: 1890,
    shares: 1100,
    complains: ['态度恶劣', '推搡', '投诉', '处理慢'],
    status: 'contacted',
    photos: [],
    createdAt: hoursAgo(12),
    operator: '张三',
    description: '游客因购票问题咨询，售票员不耐烦争执，后引发肢体推搡。视频已被大量转发。'
  },
  {
    id: 'cl12',
    scenicId: 'sc4',
    scenicName: '古刹禅寺',
    title: '上香排队2小时，香价199元起步',
    category: 'queue',
    publishTime: hoursAgo(9),
    publishLocation: '大雄宝殿',
    likes: 5600,
    comments: 1230,
    shares: 780,
    complains: ['排队', '天价香', '强制消费', '商业化'],
    status: 'unhandled',
    photos: [],
    createdAt: hoursAgo(9),
    operator: '',
    description: '大雄宝殿上香处排队如龙，且寺庙不允许自带香火，最低199元一把"平安香"。'
  }
];

export const replyTemplates: ReplyTemplate[] = [
  {
    id: 'r1',
    category: 'explain',
    title: '排队问题通用解释',
    content: '尊敬的游客您好！感谢您对XX景区的关注。因今日客流较大，部分热门项目出现排队情况，我们已增开临时通道、增加现场引导人员，全力保障游客体验。建议错峰出行或提前预约。'
  },
  {
    id: 'r2',
    category: 'explain',
    title: '停车收费说明',
    content: '关于您反映的停车场收费问题，经核实：XX停车场为第三方运营管理，收费标准已在入口处公示。景区自营停车场执行官方标准（小车10元/次），建议通过官方渠道了解停车信息。我们已约谈第三方，要求规范管理。'
  },
  {
    id: 'r3',
    category: 'explain',
    title: '天气情况说明',
    content: '感谢您的反馈！根据气象部门预报，今日午后有强对流天气。景区已启动应急预案，开放临时避雨点并通过广播、电子屏滚动播报。因天气突变给您带来的不便，我们深表歉意，也提醒您关注景区公众号获取实时预警信息。'
  },
  {
    id: 'r4',
    category: 'apologize',
    title: '服务态度致歉模板',
    content: '尊敬的游客您好！首先对您在景区遭遇的不愉快经历，我们深表歉意！景区高度重视服务质量问题，已对涉事工作人员进行停岗培训，开展全员服务规范专项教育。您的批评是我们改进的动力，欢迎您继续监督！'
  },
  {
    id: 'r5',
    category: 'apologize',
    title: '宰客/消费纠纷致歉',
    content: '您好！看到您反映的消费问题，我们深感痛心和歉意。景区对商户欺诈零容忍！目前已联合市场监管部门进驻调查，涉事商户已停业整顿。如您方便，请私信联系方式，我们将协助您办理退款并全程跟进处理。'
  },
  {
    id: 'r6',
    category: 'apologize',
    title: '突发事件通用致歉',
    content: '尊敬的网友您好！对您视频中反映的情况，景区管理方第一时间启动核查，向当事人及受影响游客深表歉意！我们将以最快速度查明事实、严肃处理，并向社会公布结果。感谢舆论监督！'
  },
  {
    id: 'r7',
    category: 'guide',
    title: '引导官方投诉渠道',
    content: '感谢您的反馈！为更好地维护您的合法权益并协助我们调查处理，建议通过以下官方渠道提交详细信息（附证据材料）：1. 景区投诉热线：400-XXX-XXXX；2. 文旅局投诉平台：www.XXXX.gov.cn；3. 12345政务服务热线。我们承诺24小时内响应，7日内答复处理结果。'
  },
  {
    id: 'r8',
    category: 'guide',
    title: '引导私信沟通',
    content: '您好！看到您的视频我们非常重视。为保护隐私并高效处理，建议您通过私信提供具体的时间、地点和联系方式，或拨打景区24小时投诉热线400-XXX-XXXX。我们已安排专人跟进，感谢配合！'
  },
  {
    id: 'r9',
    category: 'guide',
    title: '引导媒体联系',
    content: '尊敬的媒体朋友您好！感谢对XX景区的关注。如需官方回应或采访，请联系文旅局宣传科：邮箱xcb@XXXX.gov.cn，电话0XX-XXXXXXXX。我们将及时提供权威信息并接受舆论监督。'
  }
];

export const patrolRecords: PatrolRecord[] = [
  {
    id: 'pr1',
    clueId: 'cl2',
    clueTitle: '停车费50元一小时？景区回应：外包停车场',
    scenicName: '青龙山风景区',
    category: 'parking',
    status: 'attention',
    operator: '张三',
    createdAt: hoursAgo(2),
    note: '已联系景区管理处和市场监管局，建议今日联合执法检查。',
    lastUpdatedAt: hoursAgo(2),
    updateHistory: [
      { status: 'attention', operator: '张三', updatedAt: hoursAgo(2), note: '已联系景区管理处和市场监管局，建议今日联合执法检查。' }
    ]
  },
  {
    id: 'pr2',
    clueId: 'cl3',
    clueTitle: '一碗面条88元！古镇宰客太猖狂',
    scenicName: '碧潭古镇',
    category: 'fraud',
    status: 'contacted',
    operator: '李四',
    createdAt: hoursAgo(1),
    note: '已联系古镇管委会和市监局，涉事店铺已停业，正在退款。',
    lastUpdatedAt: hoursAgo(1),
    updateHistory: [
      { status: 'contacted', operator: '李四', updatedAt: hoursAgo(1), note: '已联系古镇管委会和市监局，涉事店铺已停业，正在退款。' }
    ]
  },
  {
    id: 'pr3',
    clueId: 'cl6',
    clueTitle: '拍照排队2小时，只为网红花墙',
    scenicName: '花海公园',
    category: 'queue',
    status: 'contacted',
    operator: '王五',
    createdAt: hoursAgo(4),
    note: '景区已安排保安维持秩序，增设临时排队通道和遮阳棚。',
    lastUpdatedAt: hoursAgo(4),
    updateHistory: [
      { status: 'contacted', operator: '王五', updatedAt: hoursAgo(4), note: '景区已安排保安维持秩序，增设临时排队通道和遮阳棚。' }
    ]
  }
];

export const dailyReport: DailyReport = {
  date: new Date().toISOString().split('T')[0],
  totalClues: 46,
  handledClues: 32,
  unhandledClues: 14,
  hotVideos: videoClues.slice(0, 5),
  repeatedProblems: [
    { category: 'queue', count: 12, keywords: ['排队', '等待', '效率', '中暑'] },
    { category: 'parking', count: 9, keywords: ['停车贵', '车位不足', '乱收费'] },
    { category: 'service', count: 8, keywords: ['态度', '辱骂', '投诉'] },
    { category: 'fraud', count: 6, keywords: ['宰客', '天价', '强制消费'] },
    { category: 'weather', count: 4, keywords: ['暴雨', '预警', '安全'] }
  ],
  scenicStats: [
    { scenicName: '碧潭古镇', clueCount: 18 },
    { scenicName: '青龙山风景区', clueCount: 12 },
    { scenicName: '花海公园', clueCount: 7 },
    { scenicName: '雪山滑雪场', clueCount: 5 },
    { scenicName: '古刹禅寺', clueCount: 4 }
  ]
};
