/**
 * 高木行政書士事務所 お問い合わせフォーム受信スクリプト（Google Apps Script）
 *
 * 機能:
 *  1. HPのフォームから送信された内容を mari@takagi-gyosei.jp へメール通知
 *  2. 送信者本人へ「お問い合わせありがとうございます」の自動返信メール
 *  3. HP側へ JSON で結果を返す（成功時に完了モーダルを表示）
 *
 * 設定手順は同フォルダの「GAS設定手順.md」を参照してください。
 */

var TO_ADDRESS  = 'mari@takagi-gyosei.jp';      // 通知の宛先
var OFFICE_NAME = '高木行政書士事務所';           // メールの差出人名・署名に使用

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // ボット対策（画面に見えない欄に入力があれば無視して成功を返す）
    if (p.company) return json_({ ok: true });

    var name     = String(p.name || '').trim();
    var kana     = String(p.kana || '').trim();
    var email    = String(p.email || '').trim();
    var tel      = String(p.tel || '').trim();
    var category = String(p.category || '').trim() || '（未選択）';
    var message  = String(p.message || '').trim();

    if (!name || !email || !message) {
      return json_({ ok: false, error: '必須項目が入力されていません。' });
    }

    var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

    /* ---------- 1. 事務所への通知メール ---------- */
    var notifyBody =
      'HPのお問い合わせフォームから、新しいお問い合わせが届きました。\n\n' +
      '■ お名前　　　：' + name + (kana ? '（' + kana + '）' : '') + '\n' +
      '■ メール　　　：' + email + '\n' +
      '■ 電話番号　　：' + (tel || '（未入力）') + '\n' +
      '■ ご相談の種類：' + category + '\n' +
      '■ 受信日時　　：' + now + '\n\n' +
      '――――― お問い合わせ内容 ―――――\n' +
      message + '\n' +
      '――――――――――――――――――\n\n' +
      '※このメールにそのまま返信すると、お客様（' + email + '）宛に届きます。';

    MailApp.sendEmail({
      to: TO_ADDRESS,
      replyTo: email,
      name: OFFICE_NAME + ' HPフォーム',
      subject: '【HPお問い合わせ】' + name + ' 様（' + category + '）',
      body: notifyBody
    });

    /* ---------- 2. 送信者への自動返信メール ---------- */
    var thanksBody =
      name + ' 様\n\n' +
      'このたびは、' + OFFICE_NAME + 'へお問い合わせいただき、\n' +
      '誠にありがとうございます。\n\n' +
      '以下の内容でお問い合わせを受け付けいたしました。\n' +
      '営業時間内（平日 9:00〜18:00）に、担当者よりご連絡いたしますので、\n' +
      '今しばらくお待ちくださいませ。\n\n' +
      '――――― お問い合わせ内容 ―――――\n' +
      'ご相談の種類：' + category + '\n\n' +
      message + '\n' +
      '――――――――――――――――――\n\n' +
      '※本メールはシステムによる自動返信です。\n' +
      '※心当たりのない場合は、お手数ですが本メールを破棄してください。\n\n' +
      '──────────────────\n' +
      OFFICE_NAME + '\n' +
      '代表 行政書士　高木 麻里\n' +
      '〒507-0814 岐阜県多治見市市之倉町6丁目23番地\n' +
      'TEL：070-9511-3322\n' +
      'Email：' + TO_ADDRESS + '\n' +
      '営業時間：平日 9:00〜18:00（土日は予約制）\n' +
      '──────────────────';

    MailApp.sendEmail({
      to: email,
      replyTo: TO_ADDRESS,
      name: OFFICE_NAME,
      subject: '【' + OFFICE_NAME + '】お問い合わせありがとうございます',
      body: thanksBody
    });

    return json_({ ok: true });

  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
