# PawMatch 日语・英语语言包增量实现设计书

**版本：v0.3**  
**执行对象：GitHub Copilot（VS Code Agent / Edit 模式）**  
**任务性质：在现有已完成功能上，仅增加日语和英语语言包及必要的最小接线**

> 本设计书不是重写项目的方案。现有页面、组件、样式、问卷、评分、结果、截图和分享功能均视为已经实现且可正常运行。

---

# 1. Copilot 执行指令

请先扫描当前仓库，确认现有中文文案、语言包或 i18n 结构，再直接修改项目文件完成任务。

## 1.1 本次必须完成

1. 保留现有简体中文，新增日语 `ja` 和英语 `en`。
2. 把现有用户可见文案放入或接入语言包；若项目已经有语言包，必须沿用现有结构。
3. 日英语言包覆盖：
   - 首页、答题页、结果页和说明页；
   - 10 道题及每题 4 个选项；
   - 12 种犬种结果的名称、标签、说明、可爱缺点和分享短句；
   - 保存图片、系统分享、邮件、复制、重测及错误提示；
   - 图片替代文本、按钮可访问性文案和页面 metadata。
4. 增加或补齐语言切换入口：`中文 / 日本語 / English`。
5. 切换语言后保留当前页面、题号、答案和结果。
6. 运行现有 lint、typecheck、test、build；只修复由本次多语言改动引入的问题。

## 1.2 严禁修改

- 不改变 10 道题的 `questionId`、`optionId`、顺序或数量。
- 不改变任何答案对应的八维评分增量。
- 不改变 12 种犬种的 `breedId`、原型向量、权重、固定排序或并列规则。
- 不改变主结果、第二匹配或结果 URL 的计算逻辑。
- 不重写现有组件，不更换 UI 库，不调整页面视觉设计。
- 不改变 PNG 尺寸、截图生成方式、Web Share 或邮件降级逻辑。
- 不添加数据库、登录、后端翻译 API 或运行时机器翻译。
- 不因“顺手优化”修改与多语言无关的代码。
- 不安装新的 i18n 依赖，除非当前项目完全没有语言切换能力且用现有代码无法以小改动完成；这种情况先停止并说明理由。

## 1.3 修改原则

- 先识别现有实现，再适配；不要假设仓库一定采用本文示例目录。
- 保持改动面最小。优先新增语言数据文件和少量 locale 选择代码。
- 语言包只保存显示文案；评分数据仍保留在原数据文件中。
- 所有语言使用相同稳定 ID 关联内容，禁止按数组位置或翻译后的犬种名称关联。
- TypeScript 项目必须让语言包共享同一个类型，缺 key 时编译失败。
- 若现有中文仍硬编码在组件中，只抽取完成本次需求所必需的文案，不重构无关组件。

---

# 2. 实施前仓库检查

Copilot 在编辑前应完成以下只读检查，并根据实际结果选择最小方案：

1. 从 `package.json` 确认框架版本、脚本及是否已有 i18n 依赖。
2. 搜索 locale、dictionary、messages、translations、`lang=`、语言切换器和中文 UI 文案。
3. 找到问题数据、犬种结果数据、评分函数、答题状态、结果状态、结果卡和分享模块。
4. 记录实际稳定 ID；若与本文示例名称不同，保留代码中的现有 ID，只做一对一映射。
5. 确认答题状态保存在 React state、Context、URL、`sessionStorage` 或其他位置，语言切换不得清空它。
6. 确认项目实际使用路由 locale、query locale 或客户端状态；沿用当前方式，不为符合本文示例而重构。

若发现现有代码中的问题数、选项数或犬种结果不是 10 × 4 和 12 种，不得擅自增删；先向用户报告与设计书的差异。

---

# 3. Locale 契约

## 3.1 支持语言

| 内部 locale | HTML `lang` | 显示名称 | 默认 |
|---|---|---|---|
| `zh` | `zh-CN` | 中文 | 是 |
| `ja` | `ja` | 日本語 | 否 |
| `en` | `en` | English | 否 |

语言切换器不得使用国旗。

## 3.2 Locale 识别优先级

若现有项目已经有明确规则，沿用现有规则；否则使用：

```text
URL 中的合法 locale
  > localStorage.pawmatch-locale
  > navigator.languages 中首个可映射语言
  > zh
```

映射：

- `zh`、`zh-*` → `zh`
- `ja`、`ja-*` → `ja`
- `en`、`en-*` → `en`
- 其他或空值 → `zh`

当前没有繁体中文语言包，`zh-TW` 和 `zh-HK` 仅回退到现有简体中文，不得标记成繁体翻译。

用户手动切换后，将选择写入 `localStorage.pawmatch-locale`。浏览器偏好只用于首次访问，不能覆盖用户的显式选择。

## 3.3 切换时必须保留

- 当前页面；
- 当前题号；
- 已选答案；
- 问卷版本；
- 已算出的主犬种和第二匹配；
- 结果 URL 中已有的 `breed`、`second`、`v` 等业务参数。

切换后同步更新 `<html lang>`、metadata、按钮 `aria-label`、图片 `alt`、结果卡和分享文本。

---

# 4. 语言包结构

## 4.1 首选：沿用现有结构

若项目已有 `messages/zh.ts`、JSON 字典、`next-intl`、自定义 Context 或其他实现，直接复制中文的 key 结构创建 `ja`、`en`，不要另建第二套 i18n 系统。

若项目目前没有语言包，可采用下列最小结构；目录名可按现有项目习惯调整：

```text
locales/
  types.ts
  zh.ts
  ja.ts
  en.ts
  index.ts
```

推荐单一语言包形状：

```ts
export interface PawMatchMessages {
  meta: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    zh: string;
    ja: string;
    en: string;
  };
  home: {
    title: string;
    description: string;
    start: string;
    meta: string;
  };
  quiz: {
    previous: string;
    next: string;
    reveal: string;
    progress: string; // 例：{current} / {total}
  };
  result: {
    revealTitle: string;
    secondaryPrefix: string;
    cuteFlawLabel: string;
    saveImage: string;
    share: string;
    email: string;
    copy: string;
    copied: string;
    retry: string;
  };
  notices: {
    entertainment: string;
    privacy: string;
    imageFallback: string;
    attachmentHint: string;
  };
  questions: Record<QuestionId, {
    text: string;
    options: Record<OptionId, string>;
  }>;
  breeds: Record<BreedId, {
    name: string;
    tags: [string, string, string];
    summary: string;
    flaw: string;
    share: string;
  }>;
}
```

每个语言包应使用 `satisfies PawMatchMessages`。如果代码中已有更细的类型和文件拆分，继续使用现有类型。

## 4.2 插值规则

- 不在翻译中拼接半句话；需要动态内容时使用命名占位符。
- 最低需要支持 `{current}`、`{total}`、`{breed}`、`{url}`。
- 插值函数必须替换明确白名单占位符，不使用 `eval` 或 `dangerouslySetInnerHTML`。
- 犬种 ID 和 URL 参数保持英文稳定值，不翻译。

---

# 5. 核心 UI 语言包

以下文本为最终文案。若现有 key 名不同，按语义映射，不要为了匹配表格而改全项目 key。

| 语义 key | 日本語 `ja` | English `en` |
|---|---|---|
| `meta.title` | PawMatch｜もしあなたが犬だったら、何犬？ | PawMatch — What dog breed are you? |
| `meta.description` | 10問であなたの犬タイプが分かる、気軽なお遊び診断。 | A lighthearted 10-question quiz to discover your dog personality. |
| `language.label` | 言語を選択 | Choose language |
| `language.zh` | 中文 | 中文 |
| `language.ja` | 日本語 | 日本語 |
| `language.en` | English | English |
| `home.title` | もしあなたが犬だったら、何犬？ | If you were a dog, what breed would you be? |
| `home.description` | 10問で診断。あなたは優しいゴールデン？ツンデレな柴犬？それとも毎日が事件なハスキー？ | Take 10 questions to find out: warm Golden Retriever, proudly independent Shiba, or chaos-powered Husky? |
| `home.start` | 診断を始める | Start the quiz |
| `home.meta` | 全10問・約1分・お遊び診断 | 10 questions · about 1 minute · just for fun |
| `quiz.previous` | 前の質問 | Previous |
| `quiz.next` | 次の質問 | Next |
| `quiz.reveal` | 結果を見る | Reveal my breed |
| `quiz.progress` | {current} / {total} | {current} / {total} |
| `result.revealTitle` | あなたの犬タイプは—— | Your dog personality is— |
| `result.secondaryPrefix` | 実はちょっとだけ {breed} タイプでもある | You also have a little {breed} in you |
| `result.cuteFlawLabel` | ちょっと可愛い弱点 | Your adorably tiny flaw |
| `result.saveImage` | 画像を保存 | Save image |
| `result.share` | 結果をシェア | Share result |
| `result.email` | メールで送る | Send by email |
| `result.copy` | テキストをコピー | Copy result text |
| `result.copied` | コピーしました | Copied |
| `result.retry` | もう一度診断 | Take it again |
| `notices.entertainment` | この診断はエンタメ目的です。 | This quiz is just for fun. |
| `notices.imageFallback` | 画像を作成できませんでした。スクリーンショットを撮るか、結果テキストをコピーしてください。 | We couldn't create the image. Take a screenshot or copy the result text instead. |
| `notices.attachmentHint` | 画像を保存しました。メールに手動で添付してください。 | Image saved. Please attach it to your email manually. |

完整隐私说明：

- `ja`：PawMatchの回答と結果計算は、すべてお使いのブラウザ内で行われます。現在のバージョンではログインは不要で、氏名、メールアドレス、回答内容一式を収集しません。システム共有またはメール機能を利用した場合のデータ処理は、選択したアプリの方針に従います。
- `en`：Your PawMatch answers and result are processed entirely in your browser. This version requires no login and does not collect your name, email address, or complete answer set. If you use system sharing or email, data is handled by the app you choose.

完整娱乐声明：

- `ja`：この診断はエンターテインメント目的です。犬種タイプは人格をイメージした創作であり、実際の犬種や個体、利用者の心理特性に関する専門的な判断ではありません。
- `en`：This quiz is for entertainment. Breed personalities are creative characterizations, not professional assessments of real breeds, individual dogs, or the user's psychological traits.

---

# 6. 日语问卷语言包

问题和选项必须绑定现有稳定 ID。以下用 `Q1`～`Q10`、`A`～`D` 表示映射关系；不得把这些显示字母作为评分数据的新来源。

## Q1

**やっと週末。いちばんしたいことは？**

- A：ソファで映画。今日は誰にも外へ連れ出されたくない
- B：仲のいい友達とごはんを食べながらおしゃべり
- C：公園を散歩したり、運動したり、山に登ったりする
- D：行ったことのない場所へノープランで冒険に出る

## Q2

**知らない人ばかりの集まりでは？**

- A：10分後にはだいたい全員と話している
- B：まずは話しやすそうな一人に声をかける
- C：最初は静かに観察して、慣れたら本領発揮
- D：友達のそばに立って、こっそり全員を分析する

## Q3

**新しい課題を前にした最初の反応は？**

- A：とりあえず始めて、やりながら覚える
- B：まず調べて、きちんと計画を立てる
- C：誰かと一緒ならやる気が出る
- D：興味があるか確認。なければひとまず保留

## Q4

**友達に直前で予定をキャンセルされたら？**

- A：すぐに別の予定を探す
- B：少し残念だけど、自分の予定に切り替える
- C：表面では平気。でも心のメモには残る
- D：むしろ最高。ちょうど一人になりたかった

## Q5

**友達からいちばんよく言われるのは？**

- A：明るいムードメーカー
- B：頼れて優しい
- C：頭がよくてこだわりが強い
- D：自立していて個性的

## Q6

**道に迷ったときは？**

- A：自信満々で進み続ける。物語はそのほうが面白い
- B：地図を開いてすぐルートを修正
- C：誰かに道を聞く。ついでに仲良くなる
- D：迷っていない。別ルートを選んだだけ

## Q7

**チームが急に混乱したら？**

- A：場を明るくして、まずみんなを落ち着かせる
- B：タスクを整理し、一つずつ前へ進める
- C：調子の悪そうな人を見つけて気にかける
- D：嫌がられても本当の問題を指摘する

## Q8

**超能力を一つ選べるなら？**

- A：読心術：みんなの本音がすぐ分かる
- B：分身：全部を同時に終わらせる
- C：瞬間移動：いつでも好きな場所へ行ける
- D：超感覚：誰も気づかない細部を見つける

## Q9

**ルールに対する考え方は？**

- A：納得できれば守る。できなければ話し合う
- B：ルールがあると安心。きちんと守る
- C：こっそり抜け道がないか試してみる
- D：自分のルールがありますので

## Q10

**好きな気持ちをどう表す？**

- A：言葉で伝えて、自分から距離を縮める
- B：相手の好みや必要なことを覚えて、そっと支える
- C：一緒に楽しいことをして思い出を作る
- D：あまり口にはしないけれど、ずっとそばにいる

---

# 7. 英语问卷语言包

## Q1

**The weekend is finally here. What's your ideal plan?**

- A: Movies on the couch. Nobody ask me to leave
- B: Food and a long chat with close friends
- C: A walk, workout, or hike outdoors
- D: A spontaneous adventure somewhere I've never been

## Q2

**You walk into a party full of strangers. What happens?**

- A: Ten minutes later, I'm talking to everyone
- B: I start with one person who seems friendly
- C: I observe quietly and open up once I'm comfortable
- D: I stay near my friend and silently assess the entire room

## Q3

**What's your first reaction to a new challenge?**

- A: Jump in and learn as I go
- B: Research it, then make a solid plan
- C: Get someone to join me—the company keeps me motivated
- D: First, decide whether it interests me. If not, it can wait

## Q4

**A friend cancels at the last minute. You…**

- A: Immediately find another plan
- B: Feel a little disappointed, then enjoy my own plans
- C: Act fine, but quietly remember it
- D: Perfect—I secretly wanted alone time

## Q5

**Which description do your friends use most?**

- A: Enthusiastic mood-maker
- B: Dependable and kind
- C: Smart and particular
- D: Independent and unmistakably myself

## Q6

**What do you do when you're lost?**

- A: Keep walking confidently—the plot is better this way
- B: Open the map and correct course
- C: Ask someone and possibly make a new friend
- D: I'm not lost. I chose an alternative route

## Q7

**Your team suddenly descends into chaos. You…**

- A: Lighten the mood and help everyone calm down
- B: Organize the tasks and move things forward step by step
- C: Notice who's struggling and check on them
- D: Point out the real problem, even if nobody wants to hear it

## Q8

**Pick one superpower.**

- A: Mind reading—know what everyone is thinking
- B: Cloning—do everything at the same time
- C: Teleportation—go anywhere, anytime
- D: Super senses—spot the details everyone else misses

## Q9

**Which best describes your relationship with rules?**

- A: I follow sensible ones and question the rest
- B: Rules make me feel secure, so I follow them carefully
- C: I quietly test whether there's a loophole
- D: I have my own rules, thanks

## Q10

**How do you usually show affection?**

- A: Say it warmly and move closer
- B: Remember what they need and quietly take care of it
- C: Do fun things together and make memories
- D: I may not say much, but I stay

---

# 8. 日语犬种结果语言包

犬种标题下的括号为推荐稳定 `breedId`。若现有代码 ID 不同，使用现有 ID；禁止改评分数据中的 ID。

## ゴールデン・レトリーバー (`golden-retriever`)

- 标签：`あたたかい`、`親しみやすい`、`安心感`
- 说明：あなたには、人の緊張を自然にほどく力がある。友達の話を聞き、輪から外れた人がいればさりげなく迎え入れるタイプ。自分の感情がないわけではなく、まず場の空気や相手の気持ちを大切にしている。あなたにとって「好き」とは、「私がいるから大丈夫」と伝えること。
- 可爱缺点：みんなを笑顔にしようとして、自分の休憩を忘れがち。
- 分享：私はゴールデンタイプ。友達グループの安心充電スポット。

## ラブラドール・レトリーバー (`labrador-retriever`)

- 标签：`ポジティブ`、`行動派`、`チーム思考`
- 说明：まず動き、進みながら軌道修正するタイプ。新しいことに向かうエネルギーが周りにも伝わる。協力を大切にし、必要なときは自然にもう一歩引き受ける。チームの「やってみよう」を「できた」に変える人。
- 可爱缺点：勢いで予定を引き受けすぎて、あとからカレンダーの満員ぶりに気づく。
- 分享：私はラブラドールタイプ。ポジティブな行動派。

## プードル (`poodle`)

- 标签：`賢い`、`敏感`、`センスがいい`
- 说明：観察も学習も速く、他の人が見落とす細部によく気づく。環境や表現、仕事の進め方に自分なりの基準があり、雑に済ませるのは苦手。にぎやかさより、面白くて美しく、研究する価値のあるものに惹かれる。
- 可爱缺点：基準が高くなると、小さな細部に誰よりも長く悩む。
- 分享：私はプードルタイプ。賢くて敏感、ちょっとこだわり派。

## ボーダー・コリー (`border-collie`)

- 标签：`効率的`、`集中力`、`戦略家`
- 说明：みんなが始め方を話している間に、もう手順を整理しているタイプ。仕組みを理解し、規則性を見つけ、混乱を実行可能な計画へ変えるのが得意。大切な人への愛情も、問題を解決し物事を前へ進めることで示す。
- 可爱缺点：非効率を見ると、頭の中で全員の作業手順を組み直さずにはいられない。
- 分享：私はボーダー・コリータイプ。混乱を見ると自動でリスト化します。

## 柴犬 (`shiba-inu`)

- 标签：`自立`、`冷静`、`筋が通っている`
- 说明：自分のペースと境界線を大切にし、周りに合わせるためだけに意見を変えない。初対面では慎重でも、いったん信頼した相手には長く安定した行動で応える。心地よい関係とは、互いを尊重しながらそばにいること。
- 可爱缺点：「何でもいい」と言いながら、心の中には唯一の正解がある。
- 分享：私は柴犬タイプ。媚びない。でも認めた相手にはずっと一途。

## シベリアン・ハスキー (`siberian-husky`)

- 标签：`自由`、`冒険`、`事件体質`
- 说明：あなたの世界はなかなか退屈しない。普通の予定からでも、新しい寄り道ルートを生み出せる。好奇心が強く、試すことを恐れず、細かすぎるルールは苦手。次の一手は予測不能でも、一緒にいる人を退屈させない。
- 可爱缺点：行動が計画を追い越し、振り返るとルートが少し違っている。
- 分享：私はハスキータイプ。自由な魂、日常に勝手に事件が起きる。

## サモエド (`samoyed`)

- 标签：`明るい`、`情熱的`、`人を集める`
- 说明：その場に楽しさを持ち込み、自分から人に近づける。穏やかで話しやすそうに見えて、実は好みも意思もはっきりしている。お祝いし、分かち合い、思い出を作ることが好きで、友達をもう一度集める存在。
- 可爱缺点：笑顔に見えても、心の中では「今日もよく頑張ったね」の一言を待っている。
- 分享：私はサモエドタイプ。みんなをもう一度笑顔にする係。

## ジャーマン・シェパード (`german-shepherd`)

- 标签：`頼れる`、`守る`、`実行力`
- 说明：約束を重く受け止め、問題が起きれば自然と前へ出る。いちばんにぎやかではなくても、いちばん安心して任せられる人になりやすい。感情は、現場に現れ、責任を引き受け、物事を支えることで示す。
- 可爱缺点：責任感が入ると、本来自分のものではない仕事まで抱えてしまう。
- 分享：私はジャーマン・シェパードタイプ。多くは語らず、でもちゃんと受け止める。

## グレーハウンド (`greyhound`)

- 标签：`静か`、`繊細`、`自然体`
- 说明：行動力がないのではなく、意味のない騒がしさにエネルギーを使いたくないだけ。快適で安全な空間を愛し、場の微妙な変化にもよく気づく。走るべきときと、堂々と休むべきときを知っている。
- 可爱缺点：ソファが快適なら、最高の予定でも「あと5分」が何度か続く。
- 分享：私はグレーハウンドタイプ。走るときは走る、休むときは全力で休む。

## コーギー (`corgi`)

- 标签：`にぎやか`、`意見がある`、`小さな隊長`
- 说明：存在感があり、すぐ会話に入り、自然と場を仕切り始める。人といるのが好きでも、意見がないわけではない。むしろ次に何をすべきか、だいたい分かっている。サイズではなくオーラで勝負する小さな隊長。
- 可爱缺点：一つ提案しただけのはずが、気づけばイベント全体の総監督。
- 分享：私はコーギータイプ。小さくても主導権は譲りません。

## ビーグル (`beagle`)

- 标签：`好奇心`、`探索`、`興味で進む`
- 说明：新しい手がかりにほとんど抵抗できない。面白い疑問、初めてのお店、道端の音からでも新しい方向へ進める。人の説明だけでは満足せず、自分で体験したい。熱意は本物だが、注意力は最新の興味を追って先に走ることがある。
- 可爱缺点：一つ調べるだけだったのに、気づけばタブが18個開いている。
- 分享：私はビーグルタイプ。人生は好奇心でナビします。

## フレンチ・ブルドッグ (`french-bulldog`)

- 标签：`自然体`、`ユーモア`、`寄り添い上手`
- 说明：忙しさを崇拝せず、大きな計画で自分を証明する必要も感じない。快適で誠実で面白いものにこそ力を使う。気まずさを軽やかにほどき、無理に話題を探さなくても一緒にいられる人。安定したつながりと「今日は頑張りすぎない」知恵を持つ。
- 可爱缺点：面倒の気配を察知するセンサーが優秀すぎて、とりあえず座りたくなる。
- 分享：私はフレンチ・ブルドッグタイプ。力を抜くのは怠けではなく生活の知恵。

---

# 9. 英语犬种结果语言包

## Golden Retriever (`golden-retriever`)

- Tags: `Warm`, `Friendly`, `Reassuring`
- Summary: You make it easy for people to relax. You listen, draw quieter people into the circle, and often care for the mood before your own feelings. To you, affection means letting someone know, “I'm here; things won't be quite so bad.”
- Flaw: You can get so busy keeping everyone happy that you forget you're allowed to rest too.
- Share: I'm a Golden Retriever personality: the comfort charger of the group.

## Labrador Retriever (`labrador-retriever`)

- Tags: `Optimistic`, `Action-oriented`, `Team player`
- Summary: You prefer to move first and adjust along the way. Your energy catches on, and you don't mind doing a little extra when the team needs it. You're the person who turns “Should we try?” into “Already done.”
- Flaw: Excitement makes you say yes to everything—then you notice your calendar has no empty space.
- Share: I'm a Labrador personality: an optimistic doer.

## Poodle (`poodle`)

- Tags: `Clever`, `Perceptive`, `Refined`
- Summary: You notice and learn quickly, often catching details others miss. You have standards for your surroundings, your words, and the way things get done. Noise alone doesn't impress you; you want something interesting, beautiful, or worth understanding.
- Flaw: Once your standards kick in, one tiny detail can occupy you longer than everyone else combined.
- Share: I'm a Poodle personality: clever, perceptive, and a little particular.

## Border Collie (`border-collie`)

- Tags: `Efficient`, `Focused`, `Strategic`
- Summary: While everyone else is discussing where to begin, you've quietly organized the steps. You enjoy understanding systems and turning chaos into a workable plan. Caring often looks like solving the problem and moving things forward.
- Flaw: When you see inefficiency, your brain immediately redesigns everyone else's workflow.
- Share: I'm a Border Collie personality: I automatically turn chaos into a checklist.

## Shiba Inu (`shiba-inu`)

- Tags: `Independent`, `Composed`, `Principled`
- Summary: You keep your own pace and boundaries, and you won't change your position just to fit in. You may warm up slowly, but your loyalty appears in steady, long-term actions. The best relationships give each other space while still staying close.
- Flaw: You say “anything is fine” while already holding one correct answer in your head.
- Share: I'm a Shiba personality: I don't perform for approval, but I stay loyal once you're mine.

## Siberian Husky (`siberian-husky`)

- Tags: `Free-spirited`, `Adventurous`, `Plot generator`
- Summary: Your world rarely stays boring. Even an ordinary plan can become a brand-new side quest. You're curious, eager to try, and allergic to too many rules. Nobody can predict your next move, but nobody gets bored around you either.
- Flaw: Your action speed sometimes outruns your planning speed, and the route looks different when you check again.
- Share: I'm a Husky personality: free spirit, built-in plot twists.

## Samoyed (`samoyed`)

- Tags: `Bright`, `Expressive`, `People magnet`
- Summary: You bring lightness into a room and aren't afraid to approach people first. You may look endlessly easygoing, but you know what you like and want your care to be noticed. You celebrate, share, and bring the group back together.
- Flaw: Even while smiling, part of you may be waiting to hear, “You did great today.”
- Share: I'm a Samoyed personality: officially responsible for making everyone smile again.

## German Shepherd (`german-shepherd`)

- Tags: `Reliable`, `Protective`, `Capable`
- Summary: You take promises seriously and step forward when problems appear. You may not be the loudest person in the room, but you're often the one people trust most. You show love by showing up, taking responsibility, and holding things steady.
- Flaw: Once responsibility mode activates, you start carrying tasks that weren't yours.
- Share: I'm a German Shepherd personality: few words, solid support.

## Greyhound (`greyhound`)

- Tags: `Quiet`, `Sensitive`, `Unhurried`
- Summary: You don't lack drive; you simply refuse to waste energy on meaningless noise. You value comfort and safety, and you notice subtle shifts in the room. You know exactly when to sprint and when lying down is the wisest choice.
- Flaw: If the couch is comfortable enough, even a great plan may wait five minutes—and then five more.
- Share: I'm a Greyhound personality: sprint when it matters, lounge without apology.

## Corgi (`corgi`)

- Tags: `Lively`, `Opinionated`, `Tiny captain`
- Summary: You have presence, join conversations quickly, and often begin organizing without meaning to. Enjoying company doesn't mean lacking opinions—usually you already know what everyone should do next. Height is optional; leadership energy is not.
- Flaw: You offer one suggestion and somehow become director of the entire event.
- Share: I'm a Corgi personality: compact size, full command of the room.

## Beagle (`beagle`)

- Tags: `Curious`, `Exploratory`, `Interest-led`
- Summary: Fresh clues are nearly impossible for you to resist. A strange question, a new shop, or a sound down the street can pull you into a new direction. You want firsthand experience, although your attention may run ahead after the newest fascinating thing.
- Flaw: You meant to look up one thing and now have eighteen tabs open.
- Share: I'm a Beagle personality: curiosity handles the navigation.

## French Bulldog (`french-bulldog`)

- Tags: `Relaxed`, `Funny`, `Comforting`
- Summary: You don't worship busyness or need a grand plan to prove yourself. Comfortable, sincere, interesting people and things deserve your energy. You defuse awkwardness with humor and offer the kind of company that never feels like work.
- Flaw: Your hassle detector is so sensitive that the first response to complexity is sitting down.
- Share: I'm a French Bulldog personality: relaxing is wisdom, not laziness.

---

# 10. 结果卡和分享的本地化要求

## 10.1 结果卡

- 结果卡读取当前 locale 的标题、犬种名、标签、说明、缺点标签、分享短句和娱乐声明。
- 图片文件名可使用稳定格式 `pawmatch-{breedId}-{locale}.png`。
- 不把中文文本绘制后再覆盖日英文本；生成前必须完成当前语言字体加载。
- 测试日文假名、长音符 `ー`、中文标点及英文长单词换行。
- 英文正文较长时允许减少字号到预设下限或增加自然行数，但不得截断核心说明。

## 10.2 系统分享

分享标题、正文和文件名均使用当前 locale。现有 Web Share 能力检测和降级流程不变。

推荐格式：

```text
{breedShareText}
{url}
```

## 10.3 邮件

- 邮件主题应本地化，可用：
  - `ja`：`私のPawMatch結果：{breed}`
  - `en`：`My PawMatch result: {breed}`
- 邮件正文使用当前犬种的 `share` 文案并附站点 URL。
- 保留现有行为：若浏览器无法自动添加 PNG 附件，先下载图片，再提示用户手动添加。

---

# 11. 最小接入要求

1. 页面组件从当前 locale 取得语言包，不直接根据 locale 写多组三元表达式。
2. 问卷的评分对象仍只包含 ID 和数值；渲染时以 `questionId + optionId` 查询文案。
3. 结果对象仍只包含稳定 `breedId` 和评分结果；渲染时以 `breedId` 查询语言包。
4. 未知或非法 locale 回退到 `zh`，不得导致白屏。
5. 某个翻译 key 缺失时，开发环境应明确报错；生产环境可回退中文并记录一次警告，不能显示 `undefined`。
6. 语言切换不能重新执行随机逻辑。相同答案在三种语言下必须得到相同主犬种和第二匹配。
7. 若使用 Next.js App Router：服务端组件不要直接读取 `window` 或 `localStorage`；客户端语言记忆逻辑放在 Client Component 或现有 provider 中。
8. metadata 使用当前 locale；若项目已有语言路由，补齐 `alternates.languages`，但不得大改路由。

---

# 12. 自动测试要求

Copilot 应优先扩展现有测试；没有对应测试框架时，不要仅为本任务引入大型测试依赖。

## 12.1 语言包完整性

- `zh`、`ja`、`en` 的 key 集合完全一致。
- 三种语言都有 10 道题，每题都有同一组 4 个 `optionId`。
- 三种语言都有同一组 12 个 `breedId`。
- 每个结果都有 3 个非空标签、非空说明、非空缺点和非空分享文案。
- 禁止任何值为 `undefined`、`null` 或空字符串。

## 12.2 业务稳定性

对同一固定答案集分别使用 `zh`、`ja`、`en`：

- 主犬种 ID 相同；
- 第二匹配 ID 相同；
- 原始评分向量相同；
- 结果 URL 业务参数相同，仅 locale 表示允许不同。

## 12.3 语言切换

至少覆盖：

1. 首页中文切日语，再刷新，仍为日语。
2. 第 5 题从日语切英语，仍停留第 5 题且前 4 题答案存在。
3. 结果页切换三种语言，主/次犬种 ID 不变，显示文本随语言变化。
4. 非法 locale 回退中文。
5. 分享、复制和邮件正文使用当前语言。
6. PNG 文件名包含正确的 locale，图片内没有混入其他语言。

---

# 13. 人工验收清单

- [ ] 中文现有功能和视觉没有回归。
- [ ] 首页可切换 `中文 / 日本語 / English`。
- [ ] 三种语言均可完成全部 10 题。
- [ ] 三种语言的答案映射得到相同结果。
- [ ] 12 种结果在日语和英语下均无缺文案。
- [ ] 刷新或切换语言不会清空进度。
- [ ] 页面 `<html lang>` 与当前语言一致。
- [ ] 按钮、图片 alt、错误提示无硬编码中文残留。
- [ ] 日语没有乱码或不自然断行。
- [ ] 英文按钮和结果说明没有被裁切。
- [ ] PNG 结果卡文字完整、字体已加载。
- [ ] 系统分享、复制和邮件内容使用当前语言。
- [ ] `lint`、`typecheck`、`test`、`build` 中项目已有的命令全部通过。
- [ ] Git diff 只包含语言包与必要的最小接入、测试变更。

---

# 14. Copilot 完成后的报告格式

完成修改后，不要只回复“已完成”。请按以下格式汇报：

```md
## 修改文件
- 路径：修改内容

## 实现结果
- 新增语言：ja / en
- 语言切换：实现方式
- 状态保留：实现方式
- 结果卡与分享：本地化范围

## 验证
- lint：通过 / 未运行 / 失败原因
- typecheck：通过 / 未运行 / 失败原因
- test：通过 / 未运行 / 失败原因
- build：通过 / 未运行 / 失败原因

## 未完成或需人工确认
- 无 / 具体事项
```

---

# 15. 可直接粘贴给 Copilot 的任务提示

```text
请阅读仓库根目录中的《PawMatch_Copilot语言包增量实现设计书_v0.3.md》，并使用 Agent/Edit 模式直接完成实现。

这是一个增量多语言任务：现有功能代码已经完成，只新增日语 ja 和英语 en 语言包及其必要的最小接线。先扫描仓库，复用现有 i18n、组件、状态和路由方式。不得重写页面、修改样式、评分向量、questionId、optionId、breedId、犬种原型、主次结果逻辑、PNG 或分享业务逻辑，也不要安装不必要的新依赖。

请按设计书中的最终日英文案实现，确保语言切换保留当前页面、答题进度、答案和结果。补齐语言包完整性与业务稳定性测试，运行仓库已有的 lint、typecheck、test、build。完成后按设计书第 14 章格式报告修改文件和验证结果。
```

---

# 16. 完成定义

只有同时满足以下条件，任务才算完成：

1. `ja`、`en` 文案完整接入，而不是仅建立空语言文件。
2. 三语言共用同一套业务 ID 和评分逻辑。
3. 切换语言不丢失答题状态或改变结果。
4. 结果卡、分享、邮件、metadata 和可访问性文案已本地化。
5. 中文功能无回归，现有构建和测试通过。
6. 改动范围严格限定在语言包、最小接入与相关测试。

