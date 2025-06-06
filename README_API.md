# オンラインランキング用APIのサンプル（Google Apps Script例）

以下は、弾幕ゲームのオンラインランキング用API（POSTとGET両対応）の**Google Apps Script**実装例です。  
無料ですぐ使えて、GoogleアカウントさえあればOKです。

---

## 1. スプレッドシートの準備

1. Googleドライブで新しいスプレッドシートを作成  
   適当に「弾幕ゲームランキング」などの名前をつけてください。
2. 任意のシート（例：`Sheet1`）のA列に「名前」、B列に「クリアタイム（秒）」と見出しを書いておくと良いです。

---

## 2. Google Apps Scriptの設定

1. スプレッドシートを開いた状態で上部メニュー「拡張機能」→「Apps Script」を選択
2. 新しいプロジェクトが開くので、以下のコードを貼り付けてください。

```javascript name=Code.gs
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  let mode = e.parameter.mode || "get";
  if (mode === "get") {
    // 全ランキング取得
    let data = sheet.getDataRange().getValues();
    data.shift(); // 見出し削除
    // タイム昇順で上位10件
    data = data.filter(r => r[0] && r[1]);
    data.sort(function(a, b) { return a[1] - b[1]; });
    data = data.slice(0, 10);
    let result = data.map(r => ({ name: r[0], time: r[1] }));
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  // 登録
  if (mode === "post") {
    let name = (e.parameter.name || "").substring(0, 10).replace(/[<>]/g, "");
    let time = parseFloat(e.parameter.time);
    if (!name || isNaN(time)) {
      return ContentService.createTextOutput(JSON.stringify({ result: "error", msg: "bad param" })).setMimeType(ContentService.MimeType.JSON);
    }
    sheet.appendRow([name, time]);
    return ContentService.createTextOutput(JSON.stringify({ result: "ok" })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ result: "error", msg: "bad mode" })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3. デプロイ・Web API化

1. スクリプトエディタの「デプロイ」→「新しいデプロイ」
2. 「種類を選択」で「ウェブアプリ」を選び、
   - **説明**：任意
   - **アクセスできるユーザー**：「全員」（匿名ユーザー含む）を選択
   - **デプロイ**ボタンで公開
3. 表示されたURLがAPIエンドポイントです。  
   例: `https://script.google.com/macros/s/AKfycbxxxxxxx/exec`

---

## 4. ゲーム側での使い方

- 登録  
  `GET https://.../exec?mode=post&name=あなたの名前&time=タイム（秒）`
- 取得  
  `GET https://.../exec?mode=get`

（`rank.js`の`RANK_API_URL`を書き換えてください）

---

## 5. 注意点

- 無料プランではアクセス数に制限があります（大規模運用には不向き）。
- スプレッドシートは編集権限のある人が中身を見られます。
- 不正投稿防止機能はありません。必要なら追加してください。

---

## 6. 参考：返却データ例

登録時  
```json
{ "result": "ok" }
```
取得時  
```json
[
  { "name": "kaminoeee", "time": 58.32 },
  { "name": "player2", "time": 62.47 }
]
```

---

## 7. カスタマイズ・他言語バックエンドについて

- PHP, Python, Node.js, Firebase Functionsなどでも簡単に実装できます。
- Google Apps Scriptなら無料・サーバーレスで運用可能です。

---

**ご質問・カスタム要件があればお知らせください！**