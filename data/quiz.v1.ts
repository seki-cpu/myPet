import type { QuizQuestion } from '@/types/personality';

const traitKeys = [
  'sociability',
  'energy',
  'independence',
  'loyalty',
  'curiosity',
  'expression',
  'planning',
  'chaos',
] as const;

const baseVector = traitKeys.reduce<Record<string, number>>((acc, key) => {
  acc[key] = 0;
  return acc;
}, {});

const makeVector = (values: number[]) => {
  const vec = { ...baseVector } as Record<string, number>;
  traitKeys.forEach((key, index) => {
    vec[key] = values[index];
  });
  return vec as any;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: '终于到周末，你最想怎么过？',
    options: [
      { id: 'A', text: '窝在沙发看电影，谁也别叫我', vector: makeVector([0, 0, 3, 1, 0, 0, 1, 0]) },
      { id: 'B', text: '和熟悉的朋友吃饭聊天', vector: makeVector([2, 1, 1, 2, 1, 2, 1, 0]) },
      { id: 'C', text: '去公园散步、运动或爬山', vector: makeVector([1, 3, 1, 1, 2, 1, 1, 0]) },
      { id: 'D', text: '临时出发去陌生地方探险', vector: makeVector([1, 3, 2, 0, 3, 2, 0, 3]) },
    ],
  },
  {
    id: 'q2',
    text: '进入一个全是陌生人的聚会，你通常会？',
    options: [
      { id: 'A', text: '十分钟后已经和大家聊熟', vector: makeVector([3, 2, 0, 1, 2, 3, 0, 2]) },
      { id: 'B', text: '先找一个看起来友善的人说话', vector: makeVector([2, 1, 1, 2, 1, 1, 1, 0]) },
      { id: 'C', text: '安静观察，熟了才打开', vector: makeVector([0, 0, 2, 1, 1, 0, 2, 0]) },
      { id: 'D', text: '站在朋友旁边，顺便默默判断所有人', vector: makeVector([0, 0, 3, 2, 1, 0, 1, 1]) },
    ],
  },
  {
    id: 'q3',
    text: '面对一个新任务，你的第一反应是？',
    options: [
      { id: 'A', text: '直接上手，边做边学', vector: makeVector([1, 3, 2, 0, 3, 2, 0, 2]) },
      { id: 'B', text: '先研究清楚，再制定计划', vector: makeVector([0, 1, 2, 1, 2, 0, 3, 0]) },
      { id: 'C', text: '拉上别人一起做更有动力', vector: makeVector([3, 2, 0, 2, 1, 2, 1, 1]) },
      { id: 'D', text: '先看我有没有兴趣，没有就放着', vector: makeVector([0, 0, 3, 0, 1, 1, 0, 2]) },
    ],
  },
  {
    id: 'q4',
    text: '朋友临时取消约定，你会？',
    options: [
      { id: 'A', text: '马上找下一场活动', vector: makeVector([3, 3, 1, 0, 2, 2, 0, 2]) },
      { id: 'B', text: '有点失落，但很快安排自己的事', vector: makeVector([1, 1, 2, 1, 1, 1, 2, 0]) },
      { id: 'C', text: '表面没事，心里会默默记住', vector: makeVector([0, 0, 2, 3, 0, 0, 1, 0]) },
      { id: 'D', text: '太好了，我正想独处', vector: makeVector([0, 0, 3, 0, 1, 1, 0, 1]) },
    ],
  },
  {
    id: 'q5',
    text: '朋友最常用哪个词形容你？',
    options: [
      { id: 'A', text: '热情开心果', vector: makeVector([3, 2, 0, 1, 1, 3, 0, 2]) },
      { id: 'B', text: '靠谱又温柔', vector: makeVector([2, 1, 0, 3, 0, 2, 2, 0]) },
      { id: 'C', text: '聪明又较真', vector: makeVector([0, 1, 2, 1, 2, 0, 3, 0]) },
      { id: 'D', text: '独立有个性', vector: makeVector([0, 1, 3, 1, 1, 1, 1, 1]) },
    ],
  },
  {
    id: 'q6',
    text: '你迷路时通常怎么处理？',
    options: [
      { id: 'A', text: '自信地继续走，剧情更精彩', vector: makeVector([1, 2, 2, 0, 3, 2, 0, 3]) },
      { id: 'B', text: '打开地图，快速修正路线', vector: makeVector([0, 1, 2, 1, 1, 0, 3, 0]) },
      { id: 'C', text: '找人问路，顺便认识新朋友', vector: makeVector([3, 1, 0, 1, 2, 3, 1, 1]) },
      { id: 'D', text: '我没迷路，只是选择了另一条路线', vector: makeVector([0, 1, 3, 0, 2, 1, 0, 2]) },
    ],
  },
  {
    id: 'q7',
    text: '团队突然陷入混乱时，你更像？',
    options: [
      { id: 'A', text: '活跃气氛，让大家先别慌', vector: makeVector([3, 2, 0, 2, 0, 3, 0, 1]) },
      { id: 'B', text: '整理任务，把事情一步步推进', vector: makeVector([1, 2, 1, 3, 0, 0, 3, 0]) },
      { id: 'C', text: '先看看谁状态不好，并照顾他', vector: makeVector([2, 1, 0, 3, 0, 2, 1, 0]) },
      { id: 'D', text: '指出真正的问题，即使别人不爱听', vector: makeVector([0, 1, 3, 2, 1, 1, 2, 0]) },
    ],
  },
  {
    id: 'q8',
    text: '如果能选一种超能力，你想要？',
    options: [
      { id: 'A', text: '读心术：马上知道大家在想什么', vector: makeVector([2, 0, 0, 2, 2, 2, 1, 0]) },
      { id: 'B', text: '分身术：同时完成所有事情', vector: makeVector([1, 3, 1, 2, 1, 1, 3, 1]) },
      { id: 'C', text: '瞬间移动：随时去任何地方', vector: makeVector([1, 3, 2, 0, 3, 2, 0, 3]) },
      { id: 'D', text: '超级感官：发现别人忽略的细节', vector: makeVector([0, 1, 2, 1, 3, 0, 2, 0]) },
    ],
  },
  {
    id: 'q9',
    text: '面对规则，你更接近？',
    options: [
      { id: 'A', text: '合理就遵守，不合理就讨论', vector: makeVector([2, 1, 2, 1, 1, 2, 2, 0]) },
      { id: 'B', text: '规则让我安心，我会认真执行', vector: makeVector([0, 1, 0, 3, 0, 0, 3, 0]) },
      { id: 'C', text: '先试试能不能偷偷绕过去', vector: makeVector([1, 2, 2, 0, 2, 2, 0, 3]) },
      { id: 'D', text: '我有自己的规则，谢谢', vector: makeVector([0, 1, 3, 1, 1, 1, 0, 2]) },
    ],
  },
  {
    id: 'q10',
    text: '你通常怎样表达喜欢？',
    options: [
      { id: 'A', text: '热情说出来，并主动靠近', vector: makeVector([3, 2, 0, 2, 1, 3, 0, 1]) },
      { id: 'B', text: '默默记住并照顾对方的需要', vector: makeVector([1, 1, 0, 3, 1, 1, 2, 0]) },
      { id: 'C', text: '一起做有趣的事，制造回忆', vector: makeVector([2, 3, 1, 2, 3, 2, 0, 2]) },
      { id: 'D', text: '不总说出口，但会一直留在身边', vector: makeVector([0, 0, 3, 3, 0, 0, 1, 0]) },
    ],
  },
];
