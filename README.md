# 便利屋HELP コーポレートサイト（ワイヤーフレーム）

モバイル版デザイン（`design-mobile-one-page.png`）を基準に、HTML/CSS/JavaScript で
実装したワイヤーフレーム（骨格）。テキスト・画像・アイコン・装飾を後から差し替えて
本番サイトに仕上げることを前提にしている。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 12セクション構成のワイヤーフレーム本体 |
| `style.css` | モバイルファースト。`@media (min-width: 768px)` でPC展開。セクション単位で整理 |
| `script.js` | ハンバーガーメニュー / 料金タブ切替 / FAQアコーディオン |
| `images/icons/*.svg` | セクション内アイコン（SVGマスク方式、`color` で色替え可） |
| `design-mobile-one-page.png` / `design-pc.png` | 元デザイン資料 |
| `design-preview.html` / `style-preview-backup.css` | 差し替え前の画像プレビュー版（参照用） |

## セクション構成（順番固定）

1. ファーストビュー (`#fv`)
2. 特徴アイコン + CTA (`#features`)
3. こんなお困りごとはありませんか？ (`#problems`)
4. 主力サービス (`#main-services`)
5. その他のサービス (`#other-services`)
6. HELPが選ばれる理由 (`#reasons`)
7. 作業実績 (`#works`)
8. 料金一覧 (`#prices`)
9. ご依頼の流れ (`#flow`)
10. 対応エリア・会社情報 (`#area-company`)
11. よくある質問 (`#faq`)
12. 最終CTA・フッター (`#cta`)

## 画像の差し替え方

グレーのプレースホルダーは `.ph` クラス。該当箇所を `<img>` / `<picture>` に
置き換えるだけで反映される（巨大な背景画像で再現する実装はしていない）。

アイコンは `<i class="icon" style="--icon:url(images/icons/xxx.svg)">`。
SVG を差し替えるだけで変更でき、色は親要素の `color` で決まる。

## 追従CTA

`#floatingCta` はファーストビューを過ぎると下部にフェード表示、
「よくある質問」末尾を画面下端が通過すると非表示（`script.js` で制御）。

## 確認方法

`index.html` をブラウザで開くだけ。ビルド不要。
