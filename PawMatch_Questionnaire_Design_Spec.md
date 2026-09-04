# PawMatch 双问卷设计及实现规格书

## 0. 本文档用途

本文档是 PawMatch 双问卷功能的**最终设计规格**。

Copilot 的职责只有：

> 按照本文档和现有项目代码结构完成实现。

Copilot 不负责：

- 重新设计问卷
- 修改问题或选项
- 自行增加或删除题目
- 自行选择人格维度
- 自行设计评分算法
- 自行决定犬种特征
- 自行调整评分权重
- 自行改变结果页信息结构
- 自行重新设计 UI
- 自行进行产品决策

如果本文档与现有代码结构存在冲突：

1. 优先保留现有公共组件和 UI；
2. 仅调整实现方式；
3. 不改变本文档定义的产品逻辑。

---

# 1. 产品结构

语言选择完成后，进入 `/choose`。

显示两个入口：

## 入口 A

### 什么狗狗适合我？

副标题：

> 根据你的生活方式，找到更适合与你一起生活的狗狗。

English:

> Find the dog breeds that best fit your lifestyle.

日本語：

> あなたのライフスタイルに合う犬種を見つけよう。

## 入口 B

### 如果我是狗狗，我是哪种狗？

副标题：

> 用一些奇怪但诚实的问题，看看你的狗狗人格。

English:

> Answer some oddly revealing questions and discover your dog personality.

日本語：

> ちょっと変だけど意外と本音が出る質問から、あなたの犬タイプを診断。

---

# 2. 两套问卷设计原则

两套测试必须具有不同功能。

---

# 3. Questionnaire A：什么狗狗适合我？

该测试不是人格测试。

目标是判断：

> 用户现实生活条件 + 偏好，是否能够满足某个犬种的生活需求。

核心模型：

```text
Lifestyle capacity
+
Owner tolerance
+
Interaction preference
+
Dog requirements
=
Compatibility
```

最终必须输出：

```text
Top 1
Top 2
Top 3
```

三个推荐犬种。

---

# 4. Questionnaire A 用户维度

固定为以下 10 个维度，不得增删。

```ts
interface MatchProfile {
  activityCapacity: number;
  trainingCommitment: number;
  socialPreference: number;
  attachmentPreference: number;
  groomingTolerance: number;
  noiseTolerance: number;
  chaosTolerance: number;
  aloneHours: number;
  sensitivityTolerance: number;
  independencePreference: number;
}
```

除 `aloneHours` 外，最终范围均为 `0～10`。

`aloneHours` 使用实际小时估算。

## 4.1 activityCapacity

用户能够长期提供给狗狗的活动量。

- 0 = 非常低
- 10 = 高强度活动、训练及户外活动

## 4.2 trainingCommitment

用户对训练的投入意愿。

- 0 = 只要求基础生活
- 10 = 愿意持续学习训练方法

## 4.3 socialPreference

用户希望狗狗对陌生人的友好程度。

- 0 = 慢热、选择性社交
- 10 = 极度友好

## 4.4 attachmentPreference

用户喜欢狗狗多黏自己。

- 0 = 不需要高频互动
- 10 = 喜欢高度陪伴

## 4.5 groomingTolerance

用户能接受多少美容及毛发管理。

- 0 = 极低
- 10 = 高

## 4.6 noiseTolerance

用户对吠叫、哼叫等声音的接受程度。

- 0 = 非常怕吵
- 10 = 高容忍

## 4.7 chaosTolerance

用户对兴奋、顽皮、偶发拆家等行为的接受度。

- 0 = 希望生活高度稳定
- 10 = 对混乱容忍度很高

## 4.8 aloneHours

普通工作日狗狗最长连续独处时间。

映射：

```text
A = 1
B = 3
C = 5
D = 7
```

单位：hour。

## 4.9 sensitivityTolerance

用户对于敏感、慢热、容易紧张的犬只接受度。

- 0 = 偏好神经稳定
- 10 = 很愿意照顾敏感犬

## 4.10 independencePreference

用户对犬只自主性的偏好。

- 0 = 喜欢配合度高
- 10 = 喜欢有自己想法

---

# 5. Questionnaire A 完整题目

固定 14 题，不得修改题目含义。

## A1

### 理想周末突然什么安排都没有，你最可能？

A. 太好了，在家慢慢过  
B. 出去喝咖啡、散步，然后回家休息  
C. 安排运动、公园或者长一点的散步  
D. 临时去郊外、远足或者探索新地方

```ts
A: { activityCapacity: 0 }
B: { activityCapacity: 1 }
C: { activityCapacity: 2 }
D: { activityCapacity: 3 }
```

## A2

### 工作日晚上回到家，狗狗已经叼着牵引绳等你了。

A. 今天真的只能楼下走十几分钟  
B. 好，正常散步半小时左右  
C. 换鞋，我们出去走一小时  
D. 走，顺便训练或者探索新路线

```ts
A: { activityCapacity: 0 }
B: { activityCapacity: 1 }
C: { activityCapacity: 2 }
D: { activityCapacity: 3, trainingCommitment: 1 }
```

## A3

### 普通工作日里，狗狗最长可能连续独处多久？

A. 0～2 小时  
B. 2～4 小时  
C. 4～6 小时  
D. 经常超过 6 小时

```ts
A: { aloneHours: 1 }
B: { aloneHours: 3 }
C: { aloneHours: 5 }
D: { aloneHours: 7 }
```

本题不参与 normalize。

## A4

### 狗狗连续几天都学不会“等待”。

A. 算了，它开心健康就好  
B. 偶尔继续练，不想弄得太严肃  
C. 换一个方法继续慢慢教  
D. 我会开始研究训练方法甚至记录进度

```ts
A: { trainingCommitment: 0 }
B: { trainingCommitment: 1 }
C: { trainingCommitment: 2 }
D: { trainingCommitment: 3 }
```

## A5

### 如果狗狗可以给你发一条消息，你最希望收到：

A. “我今天自己玩得很好，不用担心。”  
B. “你回来以后陪我坐一会儿就好。”  
C. “你什么时候回来？我想你了。”  
D. “你什么时候回来？我们今天去哪里？”

```ts
A: { attachmentPreference: 0, independencePreference: 2 }
B: { attachmentPreference: 1, independencePreference: 1 }
C: { attachmentPreference: 2, independencePreference: 0 }
D: { attachmentPreference: 2, activityCapacity: 1 }
```

## A6

### 电梯里陌生人问：“可以摸摸它吗？”

你理想中的狗狗：

A. 礼貌后退：不熟，谢谢  
B. 先闻闻对方，确认以后可以  
C. 很开心地接受  
D. 已经准备和对方成为最好朋友

```ts
A: { socialPreference: 0 }
B: { socialPreference: 1 }
C: { socialPreference: 2 }
D: { socialPreference: 3 }
```

## A7

### 某天回家发现纸箱被拆得满地都是。

A. 我真的受不了这种事情  
B. 有点生气，收拾完再处理  
C. 会想是不是运动量或者刺激不够  
D. 先笑一下拍张照，再想办法

```ts
A: { chaosTolerance: 0 }
B: { chaosTolerance: 1 }
C: { chaosTolerance: 2, trainingCommitment: 1 }
D: { chaosTolerance: 3 }
```

## A8

### 关于掉毛、梳毛和美容：

A. 越少越好，我希望非常省事  
B. 普通日常清理可以接受  
C. 每周多次梳理没问题  
D. 定期美容、洗护和高频梳毛都可以

```ts
A: { groomingTolerance: 0 }
B: { groomingTolerance: 1 }
C: { groomingTolerance: 2 }
D: { groomingTolerance: 3 }
```

## A9

### 狗狗听到门外声音，经常会警觉或者叫。

A. 我会非常烦  
B. 偶尔可以，但不希望经常发生  
C. 可以接受，我会通过训练改善  
D. 我觉得有一点警觉性挺好

```ts
A: { noiseTolerance: 0 }
B: { noiseTolerance: 1 }
C: { noiseTolerance: 2, trainingCommitment: 1 }
D: { noiseTolerance: 3 }
```

## A10

### 如果狗狗因为雷声或者陌生环境变得很不安：

A. 我可能不知道应该怎么办  
B. 我会陪它慢慢冷静  
C. 我愿意研究脱敏或者训练方法  
D. 我其实很愿意照顾这种比较敏感的小动物

```ts
A: { sensitivityTolerance: 0 }
B: { sensitivityTolerance: 1, attachmentPreference: 1 }
C: { sensitivityTolerance: 2, trainingCommitment: 1 }
D: { sensitivityTolerance: 3, attachmentPreference: 1 }
```

## A11

### 如果狗狗是你的室友，你最喜欢哪一种？

A. 安静、礼貌、有边界感  
B. 温柔、稳定、陪伴感强  
C. 聪明、有主意，偶尔和你斗智斗勇  
D. 活泼、好奇，每天都有新剧情

```ts
A: { independencePreference: 2, chaosTolerance: 0 }
B: { attachmentPreference: 2, chaosTolerance: 0 }
C: { independencePreference: 2, trainingCommitment: 1 }
D: { activityCapacity: 1, chaosTolerance: 2 }
```

## A12

### 你希望狗狗掌握多少技能？

A. 坐下、等待、不要乱吃就够了  
B. 基础指令加几个可爱的小技巧  
C. 我会想教很多互动游戏  
D. 我甚至想尝试敏捷、飞盘或嗅闻训练

```ts
A: { trainingCommitment: 0 }
B: { trainingCommitment: 1 }
C: { trainingCommitment: 2 }
D: { trainingCommitment: 3, activityCapacity: 1 }
```

## A13

### 以下四种狗狗“小毛病”，必须选一个，你最能接受：

A. 有点懒  
B. 有点黏  
C. 有点固执  
D. 有点疯

```ts
A: { activityCapacity: -1 }
B: { attachmentPreference: 2 }
C: { independencePreference: 2 }
D: { chaosTolerance: 2, activityCapacity: 1 }
```

## A14

### 理想中的你和狗，更像：

A. 安静住在一起的室友  
B. 很稳定的家人  
C. 一起学习和成长的伙伴  
D. 什么都一起做的冒险搭档

```ts
A: { independencePreference: 2, attachmentPreference: 0 }
B: { attachmentPreference: 2 }
C: { attachmentPreference: 1, trainingCommitment: 2 }
D: { attachmentPreference: 2, activityCapacity: 2 }
```

---

# 6. Questionnaire A Normalize

除 `aloneHours` 外，每一个 trait 按该 trait 实际可能获得的 minimum / maximum 分数进行线性 normalize。

```ts
normalized =
  ((raw - theoreticalMin) /
  (theoreticalMax - theoreticalMin)) * 10;
```

限制：

```ts
Math.max(0, Math.min(10, normalized))
```

---

# 7. 犬种 Match Profile

所有现存犬种必须增加以下数据：

```ts
interface DogLifestyleProfile {
  activityNeed: number;
  trainingNeed: number;
  sociability: number;
  attachment: number;
  groomingNeed: number;
  vocality: number;
  chaosPotential: number;
  aloneToleranceHours: number;
  sensitivity: number;
  independence: number;
}
```

除 `aloneToleranceHours` 外数值范围均为 `0～10`。

---

# 8. Questionnaire A 匹配公式

```ts
finalScore =
  lifestyleScore * 0.50 +
  preferenceScore * 0.35 +
  trainingScore * 0.15 -
  penalties;
```

最终 clamp 到 `0～100`。

---

# 9. Lifestyle Score

包括：

- activity
- grooming
- alone time

## Activity

```ts
activityFit = Math.max(
  0,
  10 - Math.max(0, dog.activityNeed - user.activityCapacity) * 2
);
```

当用户能力高于需求时不扣分。

## Grooming

```ts
groomingFit = Math.max(
  0,
  10 - Math.max(0, dog.groomingNeed - user.groomingTolerance) * 2
);
```

## Alone Time

如果：

```text
user.aloneHours <= dog.aloneToleranceHours
```

则为 10，否则：

```ts
aloneFit = Math.max(
  0,
  10 - (user.aloneHours - dog.aloneToleranceHours) * 2
);
```

最终：

```ts
lifestyleScore = average(activityFit, groomingFit, aloneFit) * 10;
```

范围 `0～100`。

---

# 10. Preference Score

使用绝对距离：

```ts
fit(user, dog) = 10 - Math.abs(user - dog);
```

对应：

```text
socialPreference ↔ sociability
attachmentPreference ↔ attachment
noiseTolerance ↔ vocality
chaosTolerance ↔ chaosPotential
sensitivityTolerance ↔ sensitivity
independencePreference ↔ independence
```

```ts
preferenceScore = average(allPreferenceFits) * 10;
```

---

# 11. Training Score

```ts
trainingFit = Math.max(
  0,
  10 - Math.max(0, dog.trainingNeed - user.trainingCommitment) * 2
);
```

```ts
trainingScore = trainingFit * 10;
```

---

# 12. Hard Penalties

必须实现。

## 12.1 严重活动量不足

如果：

```text
dog.activityNeed - user.activityCapacity >= 4
```

扣 20。

## 12.2 严重独处不匹配

如果：

```text
user.aloneHours - dog.aloneToleranceHours >= 3
```

扣 25。

## 12.3 极端美容不匹配

如果：

```text
dog.groomingNeed - user.groomingTolerance >= 5
```

扣 15。

## 12.4 高训练需求严重不匹配

如果：

```text
dog.trainingNeed - user.trainingCommitment >= 5
```

扣 15。

---

# 13. Questionnaire A Result

按最终 score 排序，返回前三。

```ts
[
  {
    breed,
    score
  }
]
```

显示：

```text
Best Match
#1 breed
score%

#2 breed
score%

#3 breed
score%
```

---

# 14. Result A：Why It Fits

从以下 10 个 fit 中选择得分最高的 3 个：

```text
activity
grooming
alone
social
attachment
noise
chaos
sensitivity
independence
training
```

对应使用固定文案模板。

例如：

### activity

> 你的日常活动节奏和它需要的运动量很接近。

### social

> 你期待的社交方式和它对人的态度比较一致。

### independence

> 你能欣赏它相对独立、有自己想法的一面。

---

# 15. Result A：Things to Consider

选择 fit 最差的 2 个维度。

只显示实际存在明显差距：

```text
fit < 7
```

没有明显差距时：

> 没有特别突出的生活方式冲突，但实际个体性格仍可能有所不同。

---

# 16. Questionnaire B：如果我是狗狗，我是哪种狗？

本测试完全不用于真实养犬推荐。

目标：

```text
Personality
+
Identity
+
Entertainment
+
Shareability
```

---

# 17. Questionnaire B 人格维度

固定 10 个：

```ts
interface PersonalityProfile {
  extraversion: number;
  independence: number;
  warmth: number;
  conscientiousness: number;
  curiosity: number;
  sensitivity: number;
  stubbornness: number;
  spontaneity: number;
  confidence: number;
  loyalty: number;
}
```

最终 normalize 到 `0～10`。

---

# 18. Questionnaire B 完整题目及评分

固定 14 题。

## B1

### 周末突然空出来一整天。

A. 已经开始联系朋友  
B. 一个人慢慢过也很好  
C. 临时决定出去探索  
D. 太好了，我终于可以彻底消失一天

```ts
A: { extraversion: 3, warmth: 1 }
B: { independence: 1, conscientiousness: 1 }
C: { curiosity: 2, spontaneity: 2 }
D: { independence: 3, extraversion: -1 }
```

## B2

### 进入一个全是陌生人的聚会。

A. 十分钟后已经认识一圈  
B. 找一个看起来友善的人聊天  
C. 先观察，熟了以后再打开  
D. 站在朋友旁边默默判断所有人

```ts
A: { extraversion: 3, confidence: 2 }
B: { extraversion: 1, warmth: 2 }
C: { sensitivity: 1, independence: 1 }
D: { independence: 2, stubbornness: 1 }
```

## B3

### 群聊突然安静。

A. 发一个 meme 救场  
B. 想：终于安静了  
C. 开始想是不是自己刚才说错了什么  
D. 根本没发现，因为已经静音三个月

```ts
A: { extraversion: 2, warmth: 1 }
B: { independence: 1 }
C: { sensitivity: 3 }
D: { independence: 3 }
```

## B4

### 朋友说“五分钟到”，二十分钟后还没出现。

A. 没事，我已经和旁边的人聊起来了  
B. 发消息：“你还好吗？”  
C. 有点烦，但可能不会说  
D. 好，我记住了

```ts
A: { extraversion: 2, confidence: 1 }
B: { warmth: 3, loyalty: 1 }
C: { sensitivity: 2, conscientiousness: 1 }
D: { stubbornness: 2, conscientiousness: 2 }
```

## B5

### 面对一个完全陌生的新任务。

A. 直接开始，边做边学  
B. 先研究清楚再动手  
C. 找个人一起做比较有动力  
D. 先确认这件事值不值得我做

```ts
A: { spontaneity: 3, confidence: 1 }
B: { conscientiousness: 3, curiosity: 1 }
C: { extraversion: 2, warmth: 1 }
D: { independence: 2, conscientiousness: 1 }
```

## B6

### 旅行的时候你通常：

A. 行程？到了再说  
B. 只订酒店，其他随缘  
C. 已经做好地图收藏  
D. 我有 Excel

```ts
A: { spontaneity: 3 }
B: { spontaneity: 2, curiosity: 1 }
C: { curiosity: 2, conscientiousness: 2 }
D: { conscientiousness: 3 }
```

## B7

### 你喜欢的人只回了一个“哈哈”。

A. 哈哈什么哈哈，继续聊  
B. 他可能只是忙  
C. 开始分析前后语境  
D. 好，那我消失

```ts
A: { confidence: 3, extraversion: 1 }
B: { warmth: 1, confidence: 1 }
C: { sensitivity: 3 }
D: { independence: 3, stubbornness: 1 }
```

## B8

### 团队突然陷入混乱。

A. 先让大家别慌  
B. 开始整理任务和优先级  
C. 先看看谁状态不对  
D. 直接指出真正的问题

```ts
A: { warmth: 2, confidence: 1 }
B: { conscientiousness: 3 }
C: { sensitivity: 2, warmth: 2 }
D: { confidence: 2, stubbornness: 1 }
```

## B9

### 面对一个你觉得很奇怪的规则。

A. 先遵守，之后再讨论  
B. 规则就是规则  
C. 看看有没有办法偷偷绕过去  
D. 如果没道理，我不会配合

```ts
A: { conscientiousness: 2, confidence: 1 }
B: { conscientiousness: 3 }
C: { spontaneity: 2, curiosity: 1 }
D: { independence: 2, stubbornness: 3 }
```

## B10

### 冰箱里只剩最后一块蛋糕。

A. 吃掉，未来的我自己解决  
B. 问问别人要不要  
C. 切一半，给未来的自己留一半  
D. 我早就知道只剩一块

```ts
A: { spontaneity: 3 }
B: { warmth: 3 }
C: { conscientiousness: 2, warmth: 1 }
D: { conscientiousness: 3 }
```

## B11

### 你的人生问题通常来自：

A. 太冲动  
B. 太心软  
C. 想太多  
D. 不听劝

```ts
A: { spontaneity: 3 }
B: { warmth: 3 }
C: { sensitivity: 3 }
D: { stubbornness: 3, independence: 1 }
```

## B12

### 你通常怎样表达喜欢？

A. 喜欢就会让对方知道  
B. 默默记住对方需要什么  
C. 拉着对方一起做很多事情  
D. 我不一定会说，但会一直在

```ts
A: { extraversion: 2, warmth: 2 }
B: { warmth: 2, loyalty: 2 }
C: { extraversion: 1, spontaneity: 1, loyalty: 1 }
D: { independence: 1, loyalty: 3 }
```

## B13

### 有人说了一句你非常不同意的话。

A. 每个人想法不同，无所谓  
B. 我会认真讨论  
C. 我脑子里已经写完一篇论文  
D. 不值得解释，我走

```ts
A: { warmth: 1, confidence: 1 }
B: { conscientiousness: 2, confidence: 1 }
C: { sensitivity: 2, curiosity: 2 }
D: { independence: 2, stubbornness: 2 }
```

## B14

### 朋友最可能吐槽你：

A. “你能不能先想一下再行动？”  
B. “你怎么什么都操心？”  
C. “你是不是又想太多了？”  
D. “你真的谁的话都不听。”

```ts
A: { spontaneity: 3 }
B: { warmth: 2, conscientiousness: 1 }
C: { sensitivity: 3 }
D: { stubbornness: 3, independence: 1 }
```

---

# 19. Questionnaire B Normalize

所有人格 trait：

```ts
normalized =
  ((raw - theoreticalMin) /
  (theoreticalMax - theoreticalMin)) * 10;
```

最终限制为 `0～10`。

---

# 20. 犬种 Personality Profile

现有犬种必须拥有：

```ts
interface DogPersonalityProfile {
  extraversion: number;
  independence: number;
  warmth: number;
  conscientiousness: number;
  curiosity: number;
  sensitivity: number;
  stubbornness: number;
  spontaneity: number;
  confidence: number;
  loyalty: number;
}
```

全部范围 `0～10`。

---

# 21. Questionnaire B 匹配算法

固定使用 Weighted Manhattan Distance。

```ts
distance =
  Σ(
    weight[trait] *
    Math.abs(userTrait - breedTrait)
  );
```

本版本所有维度：

```text
weight = 1
```

最大理论距离：

```text
10 traits × 10 = 100
```

转换：

```ts
similarity = Math.max(0, 100 - distance);
```

---

# 22. Primary / Secondary Dog

选择：

```text
距离最近 = Primary
距离第二近 = Secondary
```

显示比例不是统计概率。

```ts
primaryWeight =
  primarySimilarity /
  (primarySimilarity + secondarySimilarity);

secondaryWeight = 1 - primaryWeight;
```

转换为百分比并四舍五入。

---

# 23. Questionnaire B Result 页面结构

固定：

```text
YOU ARE

XX% PRIMARY DOG
XX% SECONDARY DOG
```

然后显示：

```text
Personality Keywords
```

共 5 个关键词。

---

# 24. Personality Keywords 规则

取用户最高的 5 个 traits。

映射：

```text
extraversion → 社交达人
independence → 独立
warmth → 温柔
conscientiousness → 有条理
curiosity → 好奇
sensitivity → 敏锐
stubbornness → 有主见
spontaneity → 随性
confidence → 自信
loyalty → 忠诚
```

多语言必须进入 i18n。

---

# 25. Personality Bars

显示固定 5 项：

```text
社交力
独立度
好奇心
敏感度
固执度
```

映射：

```text
extraversion
independence
curiosity
sensitivity
stubbornness
```

不要引入新的 chart library。

优先使用现有 progress bar / CSS bar。

---

# 26. “别人以为你 / 实际上”

使用 Primary Breed 的基础文案 + 用户 trait combination。

不得由 AI 动态生成。

使用 deterministic templates。

## 高独立 + 高忠诚

如果：

```text
independence >= 7
AND
loyalty >= 7
```

结果：

```text
别人以为你：
有点高冷。

实际上：
你并不需要一直黏着别人，但一旦把谁认作自己人，就很难真正不在乎。
```

## 高外向 + 高温暖

如果：

```text
extraversion >= 7
AND
warmth >= 7
```

结果：

```text
别人以为你：
和谁都能很快熟起来。

实际上：
你确实喜欢连接别人，但真正被你放进核心圈的人没有看起来那么多。
```

## 高敏感 + 高条理

如果：

```text
sensitivity >= 7
AND
conscientiousness >= 7
```

结果：

```text
别人以为你：
什么事情都考虑得很周到。

实际上：
你不是单纯爱计划，你只是比很多人更早注意到事情可能出问题的地方。
```

## 高随性 + 高好奇

如果：

```text
spontaneity >= 7
AND
curiosity >= 7
```

结果：

```text
别人以为你：
想到什么就做什么。

实际上：
你只是很难对“也许会发生有趣的事情”说不。
```

如果没有命中组合，使用该 Primary Breed 的默认结果文案。

---

# 27. 犬种结果文案

每个犬种必须拥有：

```ts
resultCopy: {
  headline: string;
  othersThink: string;
  actually: string;
}
```

这些文案属于产品数据。

Copilot 不允许自行生成内容。

如果当前项目已有犬种 result copy，优先保留。

---

# 28. UI 实现边界

必须复用现有设计。

允许：

- 修改文字
- 修改 question data
- 修改评分逻辑
- 根据现有组件增加必要 result section

禁止：

- 全面重新设计页面
- 修改全局 typography
- 修改主题颜色
- 重写按钮
- 重写 Card
- 重写语言切换组件
- 安装大型 UI library
- 为问卷单独建立新的 design system

---

# 29. 数据结构

推荐：

```text
data/
  matchQuestions.ts
  personalityQuestions.ts
  breedProfiles.ts
```

如果当前已有对应文件，必须优先使用现有结构。

---

# 30. Logic

推荐：

```text
utils/
  calculateMatchProfile.ts
  calculatePersonalityProfile.ts
  calculateBreedCompatibility.ts
  calculatePersonalityMatch.ts
```

如果现有项目已经有评分逻辑，修改现有逻辑，不建立重复系统。

---

# 31. i18n

所有新增文字必须进入语言包。

支持：

```text
zh
en
ja
```

不得在 JSX 中写：

```ts
language === "ja" ? ...
```

不得 hard-code 三语言。

---

# 32. Question 页面行为

固定一题一屏。

显示：

```text
Question Number
Progress
Question
4 Answers
```

用户选完进入下一题。

不要显示评分变化，不要让用户看到 scoring。

---

# 33. Question Order

顺序按照本文档。

第一版不做随机题序，答案顺序同样固定。

原因：

```text
调试可重复
+
结果容易测试
```

---

# 34. Questionnaire A 测试案例

## Case A

```text
极低活动
极低训练
长时间独处
低美容容忍
```

预期：高运动、高陪伴、高训练需求犬种不得成为 Top 1。

## Case B

```text
高活动
高训练投入
高 chaos tolerance
```

预期：工作犬或高活动犬的评分应该明显提升。

## Case C

```text
低 noiseTolerance
```

预期：高 vocality 犬种应下降。

## Case D

```text
aloneHours = 7
```

预期：低 aloneTolerance 犬种应受到明显 penalty。

---

# 35. Questionnaire B 测试案例

## Personality 1

```text
independence = high
stubbornness = high
confidence = high
extraversion = medium/low
```

结果应倾向 Shiba Inu / Akita 类。

## Personality 2

```text
warmth = high
extraversion = high
loyalty = high
```

结果应倾向 Golden Retriever / Labrador 类。

## Personality 3

```text
curiosity = high
conscientiousness = high
sensitivity = medium/high
```

结果应倾向聪明、观察型犬种。

---

# 36. 开发 Debug

development 环境可：

```ts
console.table(profile);
console.table(matches);
```

production 不输出 debug 数据。

---

# 37. Copilot 最终任务

Copilot 接收到本文档后：

第一步：阅读现有代码。

第二步：确认：

```text
当前问卷入口
当前 question data
当前 scoring
当前 breed data
当前 result page
当前 i18n
```

第三步：在不破坏现有架构的前提下实现本文档。

Copilot 不需要：

```text
提出产品建议
重新设计问卷
设计新的 scoring 模型
调整题目
```

如果现有项目中某个字段无法直接支持本文档，只允许扩展数据结构，不允许改变产品设计。

---

# 38. 完成标准

功能完成必须满足：

- `/choose` 存在两个测试入口
- 两套测试均可完整答题
- Questionnaire A 正确输出 Top 3
- Questionnaire B 正确输出 Primary + Secondary
- 三语言正常
- 刷新及路由无明显错误
- 不破坏已有 UI
- 不重写 CSS
- 不出现 hard-coded translation
- scoring 与 UI 分离
- question data 与 UI 分离
- build 成功
- 无 TypeScript error

---

# 39. 最终原则

PawMatch 第一套测试回答：

> 什么样的狗更适合进入我的真实生活？

第二套测试回答：

> 如果我的人格变成一只狗，它大概是什么样？

第一套：

```text
Compatibility first
```

第二套：

```text
Recognition + Fun first
```

Copilot 只负责：

```text
Design → Code
```

不负责：

```text
Design → Redesign
```
