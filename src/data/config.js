import { publicAsset } from "./assets.js";

export const LIKE_GOAL = 20;
export const GIFT_GOAL = 5;
// Milliseconds: 3000 = 3 seconds, including the smooth fade-out.
export const GIFT_REACTION_MS = 3000;
// 開場選項：label 是玩家留言，reply 是主播回應。
export const openingChat = {
  title: "ひとこと、話しかけてみる？",
  replyMs: 3400,
  choices: [
    { id: "hello", label: "初見です！", reply: "初見さん、いらっしゃい！ゆっくりしていってね〜", chat: "いらっしゃい〜！" },
    { id: "cute", label: "今日もかわいい！", reply: "そうでしょ？知ってるよ！あにがと〜♡", chat: "わかる、今日もかわいい" },
    { id: "today", label: "今日は何の日？👀", reply: "ん？何の日だろうね〜？みんな何か知ってる？", chat: "まだ内緒でしょｗ 👀" },
  ],
};
// TikTok 只顯示收件通知；下面的 message 到 Twitch 才會打開。
export const birthdayDeliveries = [
  { id: "miichan", username: "miichan", icon: "💐", gift: "花束", message: "お誕生日おめでとう！笑顔いっぱいの一年にしてね！", streamerReply: "みちゃん、お花きれい！カードもあにがと〜！飾るね♡", chatReply: "ひめにゃに似合う色にしたよ〜！" },
  { id: "ocha", username: "ocha", icon: "🎂", gift: "ケーキ", message: "今日はひめにゃが主役！いつもありがとう♡", streamerReply: "次はお茶さんのケーキ！わ、メッセージ付きだ！あとで食べよ〜♡", chatReply: "いちご多めにしておいた♡" },
  { id: "evol", username: "EvoL", icon: "🎁", gift: "ひみつのプレゼント", featured: true },
];
export const unboxingConfig = {
  deliveryStartMs: 3000,
  deliveryIntervalMs: 2400,
  handoffMs: 16400,
  audienceIntroMs: 2600,
  audienceItemMs: 4200,
  audienceReplyDelayMs: 1400,
  audienceClosing: "みんな、カードもプレゼントもあにがと〜！最後は…EvoL からだ。",
  invite: "プレゼントもカードもいっぱい！続きは Twitch で、一緒に開けよ？",
  intro: "ただいま〜！さっき届いたプレゼント、開けていくね。",
  cardReply: "EvoL からのお手紙だ。ゆっくり読ませてね。",
  giftReply: "まだもうひとつあるの？…何が入ってるんだろう？",
  finalTitle: "続きは、画面の外で。",
  finalMessage: "EvoL からの本当のプレゼントを、実際に確認してみてね。何が入っているかは、開けてからのお楽しみ♡",
};
export const tiktokConfig = { viewers: 1568 };
// EvoL 禮盒裡的兩份實體禮物，文字可在這裡修改。
export const realGiftConfig = {
  title: "ふたりに、ひとつずつ。",
  intro: "ひめにゃにも、フリンにも。何が届いたかは、実際に見てからのお楽しみ。",
  revealReply: "えっ、私とフリンにひとつずつ！？ヒントだけ見てみる？",
  continueLabel: "本物のプレゼントを見に行く →",
  gifts: [
    { id: "desk", recipient: "ひめにゃへ", title: "昇降デスク", hint: "配信中の姿勢を変えられるようになるもの。立ったり座ったり、好きな高さで過ごせるよ。", icon: "？", reply: "配信がもっと快適になるヒントだね！", message: "本物を見たら、好きな高さで使ってみてね。", chat: { username: "miichan", message: "これは実際に見てからのお楽しみだね！" } },
    { id: "mat", recipient: "フリンへ", title: "ペットへの贈りもの", hint: "寒い日に、フリンがいつでもぬくぬくできる場所。", icon: "？", reply: "フリンにもプレゼント！ヒントはぬくぬくだね〜♡", message: "本物を見つけたら、フリンの好きな場所に置いてあげてね。", chat: { username: "ocha", message: "フリンの分は実物を見てのお楽しみ♡" } },
  ],
};
// 生日慶祝後：兩段道別 → 淡出下播 → 前往 Twitch。
export const handoffConfig = {
  farewellLineMs: 4200,
  fadeMs: 1200,
  endedHoldMs: 1800,
  joiningMs: 1600,
  farewell: [
    "みんな、お祝いしてくれてあにがと〜！すっごくうれしかった♡",
    "このあと Twitch でプレゼントを開けるね。いったん配信を切るけど、またすぐ会おうね！",
  ],
  chat: [
    { username: "miichan", message: "おつひめ〜！このあとも見にいくね♡" },
    { username: "ocha", message: "Twitch で待ってる〜！" },
    { username: "EvoL", message: "プレゼントも一緒に持っていこう。向こうで待ってるね〜" },
  ],
  endedTitle: "配信が終了しました",
  endedMessage: "来てくれてありがとう。またすぐ、Twitch で。",
  joiningMessage: "みんなと Twitch に移動中…",
};
export const cardConfig = { charactersPerPage: 220, flipMs: 520 };
// Twitch 最後收尾：確認實體禮物 → 觀眾道別 → 主播道別 → 手動結束直播。
export const endingConfig = {
  giftLeadMs: 3400,
  chatGapMs: 1800,
  farewellLineMs: 4200,
  keepsakeMs: 1200,
  furinDelayMs: 1700,
  chat: [
    { username: "miichan", message: "お誕生日おめでとう〜！" },
    { username: "ocha", message: "また次の配信でね♡" },
    { username: "EvoL", message: "プレゼント、気に入ってくれるといいな〜" },
  ],
  farewell: [
    "今日は来てくれてありがとう。",
    "次に会うときは、プレゼントの感想聞かせてね。またね♡",
  ],
  closingHint: "またね♡",
  readyHint: "また会おうね。準備ができたら、配信を終了してね。",
  endButton: "配信を終了",
  title: "Thank you for watching",
  keepsakeCaption: "一緒に過ごした、特別な日。",
  realGiftReminder: "続きは、画面の外で。EvoL からのプレゼントをチェックしてみてね。",
  furinNote: "またね",
  furinSecondImage: publicAsset("flin/furin123.jpg"),
  furinHint: "フリンをなでてみて 🐾",
  furinPettedNote: "食べるために生きる",
};
// Twitch 模擬觀眾數及聊天室速度，毫秒為單位。
export const twitchConfig = {
  viewers: 1268,
  viewerMin: 1200,
  viewerMax: 1480,
  viewerUpdateMs: 5200,
  chatIntervalMin: 900,
  chatIntervalMax: 1500,
  visibleMessages: 7,
};
export const flinConfig = {
  name: "フリン",
  image: publicAsset("flin/flin.png"),
  imagePosition: "50% 50%",
  firstAppearanceLikeCount: 10,
  secondAppearanceGiftCount: 4,
  activation: { photoSize: "clamp(140px, 42vw, 180px)", buttonWidth: "220px" },
  position: {
    width: "72px",
    right: "10px",
    bottom: "320px",
  },
  mobilePosition: {
    width: "64px",
    right: "10px",
    bottom: "clamp(230px, 39svh, 320px)",
  },
  timing: {
    peekMs: 2600,
    watchMs: 4800,
    leaveMs: 450,
    tapMs: 1800,
    fakePauseMs: 1000,
    approachMs: 2800,
    lookMs: 1400,
    pressMs: 1800,
    clickHoldMs: 1800,
  },
  dialogue: {
    peek: "フリン？",
    watching: "フリンも見てるｗ",
    watchHint: "あと1つ！ワン！",
    confused: "あれ？",
    pressed: "フリンがボタンを押しました。",
    taps: ["ワン！", "ワンワン！", "フリンからハート！"],
  },
};
export const chatConfig = {
  visibleLimit: 8,
  intervalMin: 1000,
  intervalMax: 1800,
};
export const evolEvent = {
  username: "EvoL",
  joinDelayMs: 1800,
  greeting: "にゃほ〜！👋",
  joined: "配信に参加しました ✨",
  message: "ひめにゃ、お誕生日おめでとう！プレゼント、受け取ってね 💌",
  giftMessage: "ハートミーを送りました 💖",
  giftReaction: "EvoL、ハートミー、あにがと〜",
  highlightMs: 3200,
};
export const systemMessages = {
  liked: "いいねを押しました ❤️",
  sentGift: "ギフトを送りました",
  card: "新しいバースデーカードが届きました 💌",
};
export const milestones = {
  5: "いいねあにがと〜！❤️",
  10: "まだ押すの？👀",
  15: "あとちょっと！❤️",
};
export const dialogue = {
  hint: "ハートを押してみて？ ❤️",
  giftUnlock: "ん？なんか始まったみたい…？",
  gift: [
    "ギフトあにがと〜！",
    "わ、また！ありがとう！",
    "今日はなんかすごいね？👀",
    "あとひとつ…？",
    "えっ？そろった…！",
  ],
  complete: "えっ、なになに？",
  birthday: "えええ！？ありがとう〜！！",
  card: "まだ何か届いてるみたい…？",
};
export const gifts = [
  { icon: "🌹", name: "Rose" },
  { icon: "⭐", name: "Star" },
  { icon: "🎂", name: "Cake" },
  { icon: "💖", name: "Heart" },
  { icon: "🎁", name: "Gift" },
];
