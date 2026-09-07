## AI 开发说明 / AI開発について / Built with AI

本项目由创作者负责产品构思、问卷设计、视觉方向、功能取舍与实际测试，并在 AI 协作支持下完成界面、前端代码、文案与部署。

このプロジェクトは、企画・質問設計・ビジュアル方針・機能判断・実機テストを制作者が担当し、UI、フロントエンドコード、文言、デプロイをAIとの協働で制作しています。

This project was created with AI collaboration. The creator led the product concept, quiz design, visual direction, feature decisions, and hands-on testing, while AI assisted with the interface, frontend code, copy, and deployment.

# PawMatch 🐾

[中文](#中文) · [日本語](#日本語) · [English](#english)

PawMatch 是一款轻松有趣的犬种匹配测试，支持中文、日文和英文。

在线体验：https://pawmatch-tan.vercel.app

> 当前为测试版本。测试结果仅供娱乐，不构成专业的宠物饲养或购买建议。

---

# 中文

## 项目介绍

PawMatch 通过趣味问卷，将用户的性格、生活方式和养犬偏好与不同犬种进行匹配。

目前包含两种测试：

* **什么狗狗适合你？**
  根据居住环境、运动量、独处时间、护理意愿和训练投入等条件，推荐更适合你的犬种。

* **你是哪种狗狗？**
  根据性格、社交方式、行动习惯和情绪特征，判断你最接近哪一种狗狗人格。

每次测试会生成：

* 主要匹配犬种
* 次要匹配犬种
* 性格或适配关键词
* 匹配原因与注意事项
* 可保存和分享的结果卡片

## 主要功能

* 中文、日文、英文切换
* 两套独立问卷
* 12种犬种匹配结果
* 经随机抽样校准的结果分布
* 响应式手机与电脑页面
* 粉红色动态肉球背景
* 结果图片保存
* 手机系统图片分享
* 微信、Instagram等内置浏览器兼容处理
* 无需注册或登录

## 支持的犬种

* 金毛寻回犬
* 拉布拉多
* 贵宾犬
* 边境牧羊犬
* 柴犬
* 哈士奇
* 萨摩耶
* 德国牧羊犬
* 灵缇
* 柯基
* 比格犬
* 法国斗牛犬

## 技术栈

* Next.js 14
* React
* TypeScript
* CSS Modules
* `html-to-image`
* Vercel

## 本地运行

克隆仓库：

```bash
git clone https://github.com/seki-cpu/myPet.git
cd myPet
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

如果 Windows PowerShell 无法直接运行 `npm`，可以改用：

```powershell
npm.cmd install
npm.cmd run dev
```

## 测试与构建

测试“适合养什么狗”问卷的结果分布：

```bash
npm run test:suitable-distribution
```

测试“你是哪种狗”问卷的结果分布：

```bash
npm run test:distribution
```

执行生产构建：

```bash
npm run build
```

Windows PowerShell：

```powershell
npm.cmd run test:suitable-distribution
npm.cmd run test:distribution
npm.cmd run build
```

## 主要目录

```text
app/
├── choose/              # 测试入口选择
├── quiz/                # 问卷页面
├── result/              # 结果与分享页面
└── about/               # 项目及隐私说明

components/
├── LocaleSwitcher.tsx   # 语言切换
└── PawBackground.tsx    # 动态肉球背景

data/                    # 问题、犬种资料与匹配参数
domain/                  # 评分和匹配算法
locales/                 # 中文、日文和英文文案
public/breeds/           # 犬种图片
scripts/                 # 分布测试脚本
```

## 手机分享说明

在支持 Web Share API 的 Chrome、Edge或Safari等浏览器中，PawMatch可以生成 PNG结果图片并调用手机系统分享面板。

微信、Instagram、Facebook和LINE等应用内置浏览器对文件分享的支持不稳定。因此在这些环境中，PawMatch会自动关闭文件型系统分享，并提供以下安全方案：

1. 保存结果图片；
2. 从手机相册发送图片；
3. 复制结果链接；
4. 使用外部浏览器打开链接。

这是内置浏览器的能力限制，并非PawMatch功能异常。

## 隐私

PawMatch当前不需要用户注册，也不会收集姓名、邮箱或完整答题记录。

问卷答案和结果计算均在用户浏览器中完成。部分临时数据会保存在浏览器的 `sessionStorage` 或 `localStorage` 中，用于完成测试及保存语言设置。

## 部署

项目可以直接部署到 Vercel：

1. 将仓库导入 Vercel；
2. Framework Preset选择 `Next.js`；
3. Production Branch选择 `master`；
4. 保持默认构建配置；
5. 点击 **Deploy**。

与GitHub连接后，推送到生产分支会自动触发新的正式部署。

---

# 日本語

## プロジェクト概要

PawMatchは、性格・ライフスタイル・犬との暮らし方に関する回答から、自分に合う犬種や自分に近い犬タイプを診断するカジュアルなWebアプリです。

現在、2種類の診断に対応しています。

* **あなたに合う犬種は？**
  住環境、運動時間、留守番時間、ケア、トレーニングへの意欲などから、暮らしに合う犬種を提案します。

* **あなたはどの犬タイプ？**
  性格、社交性、行動パターン、感情の傾向から、自分に近い犬タイプを診断します。

診断結果には、以下の内容が表示されます。

* メイン犬種
* サブ犬種
* 性格または適性キーワード
* マッチした理由と注意点
* 保存・共有可能な結果カード

## 主な機能

* 中国語・日本語・英語対応
* 2種類の独立した診断
* 12犬種の診断結果
* ランダムサンプリングによる結果分布の調整
* PC・スマートフォン対応
* ピンク色の肉球アニメーション
* 結果画像の保存
* スマートフォンのシステム共有
* WeChatやInstagramなどのアプリ内ブラウザへの対応
* 登録・ログイン不要

## 対応犬種

* ゴールデンレトリーバー
* ラブラドール
* プードル
* ボーダーコリー
* 柴犬
* ハスキー
* サモエド
* ジャーマンシェパード
* グレイハウンド
* コーギー
* ビーグル
* フレンチブルドッグ

## 技術構成

* Next.js 14
* React
* TypeScript
* CSS Modules
* `html-to-image`
* Vercel

## ローカル環境での起動

リポジトリをクローンします。

```bash
git clone https://github.com/seki-cpu/myPet.git
cd myPet
```

依存パッケージをインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

Windows PowerShellで `npm` を実行できない場合は、`npm.cmd` を使用できます。

```powershell
npm.cmd install
npm.cmd run dev
```

## テストとビルド

犬種適性診断の結果分布をテストします。

```bash
npm run test:suitable-distribution
```

犬タイプ診断の結果分布をテストします。

```bash
npm run test:distribution
```

本番用ビルドを実行します。

```bash
npm run build
```

Windows PowerShell：

```powershell
npm.cmd run test:suitable-distribution
npm.cmd run test:distribution
npm.cmd run build
```

## ディレクトリ構成

```text
app/
├── choose/              # 診断メニュー
├── quiz/                # 質問ページ
├── result/              # 結果・共有ページ
└── about/               # プロジェクト・プライバシー情報

components/
├── LocaleSwitcher.tsx   # 言語切り替え
└── PawBackground.tsx    # 肉球アニメーション

data/                    # 質問・犬種データ・マッチング設定
domain/                  # スコア計算とマッチングロジック
locales/                 # 中国語・日本語・英語のテキスト
public/breeds/           # 犬種画像
scripts/                 # 分布テスト
```

## スマートフォンでの共有

Web Share APIに対応しているChrome、Edge、Safariなどでは、PNG結果画像を生成し、スマートフォンのシステム共有画面を開きます。

WeChat、Instagram、Facebook、LINEなどのアプリ内ブラウザでは、ファイル共有が安定して動作しない場合があります。そのため、PawMatchはアプリ内ブラウザを検出すると、ファイルのシステム共有を無効にして以下の方法を案内します。

1. 結果画像を保存する；
2. アルバムから画像を送信する；
3. 結果リンクをコピーする；
4. 外部ブラウザでリンクを開く。

これはアプリ内ブラウザ側の制限であり、PawMatchの不具合ではありません。

## プライバシー

現在のPawMatchは登録やログインを必要とせず、氏名、メールアドレス、回答内容一式を収集しません。

回答と診断結果の計算はブラウザ内で行われます。一部の一時データは、診断の進行や言語設定の保存を目的として、ブラウザの `sessionStorage` または `localStorage` に保存されます。

## デプロイ

Vercelへ直接デプロイできます。

1. GitHubリポジトリをVercelにインポートする；
2. Framework Presetで `Next.js` を選択する；
3. Production Branchに `master` を指定する；
4. ビルド設定はデフォルトのままにする；
5. **Deploy** をクリックする。

GitHubと連携すると、Production Branchへの更新によって新しい本番デプロイが自動的に開始されます。

---

# English

## About

PawMatch is a lighthearted dog-breed matching quiz based on personality, lifestyle, and preferences for living with a dog.

It currently includes two quizzes:

* **Which dog breed suits you?**
  Recommends breeds based on factors such as living environment, exercise time, time spent alone, grooming preferences, and willingness to train.

* **Which dog type are you?**
  Matches your personality with a dog breed based on social style, habits, emotional tendencies, and everyday behavior.

Each result includes:

* A primary match
* A secondary match
* Personality or suitability keywords
* Matching reasons and considerations
* A result card that can be saved and shared

## Features

* Chinese, Japanese, and English
* Two independent quizzes
* 12 possible dog-breed results
* Calibrated result distributions
* Responsive desktop and mobile layouts
* Animated pink paw background
* PNG result-image downloads
* Native mobile image sharing
* Compatibility handling for in-app browsers
* No registration or login required

## Supported Breeds

* Golden Retriever
* Labrador
* Poodle
* Border Collie
* Shiba Inu
* Siberian Husky
* Samoyed
* German Shepherd
* Greyhound
* Corgi
* Beagle
* French Bulldog

## Tech Stack

* Next.js 14
* React
* TypeScript
* CSS Modules
* `html-to-image`
* Vercel

## Local Development

Clone the repository:

```bash
git clone https://github.com/seki-cpu/myPet.git
cd myPet
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If Windows PowerShell blocks the `npm` command, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Testing and Building

Test the suitability-quiz result distribution:

```bash
npm run test:suitable-distribution
```

Test the personality-quiz result distribution:

```bash
npm run test:distribution
```

Create a production build:

```bash
npm run build
```

Windows PowerShell:

```powershell
npm.cmd run test:suitable-distribution
npm.cmd run test:distribution
npm.cmd run build
```

## Project Structure

```text
app/
├── choose/              # Quiz selection
├── quiz/                # Questionnaire pages
├── result/              # Results and sharing
└── about/               # Project and privacy information

components/
├── LocaleSwitcher.tsx   # Language selector
└── PawBackground.tsx    # Animated paw background

data/                    # Questions, breed data, and matching profiles
domain/                  # Scoring and matching logic
locales/                 # Chinese, Japanese, and English content
public/breeds/           # Breed images
scripts/                 # Distribution-analysis scripts
```

## Mobile Sharing

In browsers that support the Web Share API, such as compatible versions of Chrome, Edge, and Safari, PawMatch can generate a PNG result image and open the device’s native sharing panel.

In-app browsers used by WeChat, Instagram, Facebook, and LINE do not reliably support generated-file sharing. When PawMatch detects one of these environments, it disables file-based system sharing and offers safer alternatives:

1. Save the result image;
2. Send it from the device gallery;
3. Copy the result link;
4. Open the link in an external browser.

This is a limitation of the in-app browser rather than a PawMatch error.

## Privacy

PawMatch currently requires no registration or login and does not collect names, email addresses, or complete answer sets.

Answers and result calculations remain inside the user’s browser. Some temporary information is stored in `sessionStorage` or `localStorage` to complete the quiz and remember language preferences.

## Deployment

The project can be deployed directly to Vercel:

1. Import the GitHub repository into Vercel;
2. Select `Next.js` as the Framework Preset;
3. Set `master` as the Production Branch;
4. Keep the default build settings;
5. Click **Deploy**.

After the GitHub integration is enabled, updates to the production branch automatically trigger a new production deployment.

---

## License

This project is currently intended for personal learning, demonstration, and non-commercial testing.

Dog-breed descriptions and quiz results are designed for entertainment purposes only.
