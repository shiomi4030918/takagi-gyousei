<?php
/**
 * 高木行政書士事務所 お問い合わせフォーム送信処理
 *
 * contact.html のフォームから POST を受け取り、
 *  1. mari@takagi-gyosei.jp へ通知メール
 *  2. 送信者本人へ自動返信メール（お問い合わせありがとうございます）
 * を送信し、JSON で結果を返します（成功時にHP側で完了モーダル表示）。
 *
 * 設置場所: contact.html と同じ階層（サイトのルート）に置くだけで動きます。
 */

date_default_timezone_set('Asia/Tokyo');
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$TO_ADDRESS  = 'mari@takagi-gyosei.jp';   // 通知の宛先
$FROM_ADDRESS = 'mari@takagi-gyosei.jp';  // 差出人アドレス
$OFFICE_NAME = '高木行政書士事務所';        // 差出人名・署名

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method not allowed']);
  exit;
}

/* ボット対策（画面に見えない欄に入力があれば無視して成功を返す） */
if (!empty($_POST['company'])) {
  echo json_encode(['ok' => true]);
  exit;
}

/* 入力の取得（ヘッダーに入る値は改行を除去してインジェクション対策） */
$strip = function ($v) { return str_replace(["\r", "\n"], '', trim((string)$v)); };
$name     = $strip($_POST['name'] ?? '');
$kana     = $strip($_POST['kana'] ?? '');
$email    = $strip($_POST['email'] ?? '');
$tel      = $strip($_POST['tel'] ?? '');
$category = $strip($_POST['category'] ?? '');
$message  = trim((string)($_POST['message'] ?? ''));
if ($category === '') $category = '（未選択）';

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok' => false, 'error' => '入力内容をご確認ください。']);
  exit;
}
if (mb_strlen($message) > 10000) {
  echo json_encode(['ok' => false, 'error' => '本文が長すぎます。']);
  exit;
}

$now = date('Y/m/d H:i');
$fromHeader = mb_encode_mimeheader($OFFICE_NAME, 'UTF-8', 'B') . " <{$FROM_ADDRESS}>";

/* ---------- 1. 事務所への通知メール ---------- */
$notifySubject = "【HPお問い合わせ】{$name} 様（{$category}）";
$notifyBody =
  "HPのお問い合わせフォームから、新しいお問い合わせが届きました。\n\n" .
  "■ お名前　　　：{$name}" . ($kana !== '' ? "（{$kana}）" : '') . "\n" .
  "■ メール　　　：{$email}\n" .
  "■ 電話番号　　：" . ($tel !== '' ? $tel : '（未入力）') . "\n" .
  "■ ご相談の種類：{$category}\n" .
  "■ 受信日時　　：{$now}\n\n" .
  "――――― お問い合わせ内容 ―――――\n" .
  "{$message}\n" .
  "――――――――――――――――――\n\n" .
  "※このメールにそのまま返信すると、お客様（{$email}）宛に届きます。";
$notifyHeaders = "From: {$fromHeader}\r\nReply-To: {$email}";

/* ---------- 2. 送信者への自動返信メール ---------- */
$thanksSubject = "【{$OFFICE_NAME}】お問い合わせありがとうございます";
$thanksBody =
  "{$name} 様\n\n" .
  "このたびは、{$OFFICE_NAME}へお問い合わせいただき、\n" .
  "誠にありがとうございます。\n\n" .
  "以下の内容でお問い合わせを受け付けいたしました。\n" .
  "営業時間内（平日 9:00〜18:00）に、担当者よりご連絡いたしますので、\n" .
  "今しばらくお待ちくださいませ。\n\n" .
  "――――― お問い合わせ内容 ―――――\n" .
  "ご相談の種類：{$category}\n\n" .
  "{$message}\n" .
  "――――――――――――――――――\n\n" .
  "※本メールはシステムによる自動返信です。\n" .
  "※心当たりのない場合は、お手数ですが本メールを破棄してください。\n\n" .
  "──────────────────\n" .
  "{$OFFICE_NAME}\n" .
  "代表 行政書士　高木 麻里\n" .
  "〒507-0814 岐阜県多治見市市之倉町6丁目23番地\n" .
  "TEL：070-9511-3322\n" .
  "Email：{$TO_ADDRESS}\n" .
  "営業時間：平日 9:00〜18:00（土日は予約制）\n" .
  "──────────────────";
$thanksHeaders = "From: {$fromHeader}\r\nReply-To: {$TO_ADDRESS}";

/* 送信（-f で envelope from を指定し、迷惑メール判定されにくくする） */
$ok1 = mb_send_mail($TO_ADDRESS, $notifySubject, $notifyBody, $notifyHeaders, "-f{$FROM_ADDRESS}");
$ok2 = mb_send_mail($email, $thanksSubject, $thanksBody, $thanksHeaders, "-f{$FROM_ADDRESS}");

if (!$ok1) {
  echo json_encode(['ok' => false, 'error' => '送信に失敗しました。']);
  exit;
}
echo json_encode(['ok' => true, 'autoreply' => (bool)$ok2]);
