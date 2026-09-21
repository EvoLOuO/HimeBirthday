# himenya LIVE

沿用 React / Vite 的純前端生日網站，TikTok 與 Twitch 都是網站內的模擬直播介面，不需登入，沒有後端、金流或平台 API。

## 啟動

本機 PowerShell 執行 ` .\dev.cmd `，或雙擊 `dev.cmd`，再開啟終端機顯示的網址。保留終端機，按 Ctrl+C 停止。

已安裝 Node 的其他電腦：`npm install` → `npm run dev`。

檢查：`npm test`、`npm run build`。

## 流程

TikTok 圖示 → himenya 直播間卡片 → 點入才開始計時與聊天 → 開場聊天選項（也可直接按愛心）→ 10 次愛心時フリン探頭 → 20 次愛心解鎖 SPECIAL GIFT EVENT → 手動送禮，4/5 時フリン再次出現 → 5/5 顯示 GOAL COMPLETED → 回應結束後假停頓 → フリン走近 START EVENT、伸爪按下 → SPECIAL EVENT UNLOCKED → 3、2、1 → 生日慶祝，同時顯示觀眾送禮與卡片通知 → TikTok 主播說兩段道別、聊天室告別 → 顯示配信終了 → 點擊前往 Twitch → 其他觀眾用幾句對話快速回顧 → 點開 EvoL 信封 → 閱讀卡片（不會自動跳過）→ 點開禮盒 → 提示確認實體禮物 → 主播與觀眾道別 → 點擊配信を終了 → 直播畫面縮成生日紀念卡 → FURIN 從角落探頭，叼著「またね」。

重新整理從入口重新開始。20 次以前送的普通禮物不計入活動；愛心超過 20 次不會重啟活動。所有禮物均為本機模擬，不涉及金錢。

EvoL 會在進直播約 1.8 秒後加入，再打招呼；生日慶祝時送祝福、愛心禮物與卡片。卡片正文只在 Twitch 點開後出現。加入時間和招呼可在 `src/data/config.js` 的 `evolEvent.joinDelayMs`、`evolEvent.greeting` 修改。

新增流程的文字集中在 `src/data/config.js`：`openingChat.choices` 修改開場選項與主播回應；`birthdayDeliveries` 修改觀眾姓名、禮物及短卡片，`streamerReply` 是開箱時主播台詞，`chatReply` 是送禮觀眾的接話；`unboxingConfig` 修改通知間隔、對話速度、轉場邀請和最後的實體禮物提示。`audienceIntroMs = 2600` 為開場時間；`audienceItemMs = 4200` 表示每位觀眾約 4.2 秒，主播先說話、1.4 秒後觀眾接話，三份禮物加開場約 15 秒，亦可手動略過。EvoL 的正式卡片仍在 `src/data/birthday.js` 的 `personalMessage` 修改，保留換行，長文可捲動閱讀。切換 Twitch 時會清除 TikTok 的活動計時器。

Twitch 聊天室在桌面和手機都會持續新增留言，隨開箱／信封／讀卡片／禮盒／結尾切換台詞；最近 12 句避免重複，最多保留 7 則。`src/data/twitchChat.js` 修改聊天室台詞；`src/data/config.js` 的 `twitchConfig` 調整觀眾數與聊天速度（預設 1,268 人，每 5.2 秒小幅變動，限制在 1,200～1,480 人）。聊天室更新不會推進或關閉 EvoL 卡片。Twitch 結尾會先確認實體禮物，再依序顯示 miichan、ocha、EvoL 的告別留言，主播說完兩段台詞後才解鎖結束按鈕；點擊後才顯示縮小的紀念卡。

結尾設定在 `endingConfig`：`giftLeadMs` 是實體禮物提示停留時間，`chatGapMs` 是道別留言間隔，`farewellLineMs` 是主播每段台詞的顯示時間。`ENDING` 只在按下「配信を終了」後出現；紀念卡會使用前一個直播畫面作為縮放起點，FURIN 會在 `furinDelayMs` 後從右下角探頭並叼著 `またね` 紙條。`public/flin/flin.png` 是目前採用的 `output/imagegen/furin-.png`，若圖片失效仍顯示狗狗備援圖示。

愛心在一般模式向上飄約 420px；開啟系統「減少動態效果」時，改成不旋轉、不擺動的輕柔上飄，約 110px。

## 自訂內容

| 檔案 | 可修改項目 |
| --- | --- |
| `src/data/birthday.js` | himenya 名字、帳號、Evol 署名、卡片標題、生日祝福、實體禮物預告、日文愛心回應 |
| `src/data/config.js` | `LIKE_GOAL = 20`、`GIFT_GOAL = 5`、5/10/15 愛心里程碑、系統訊息、角色活動台詞、禮物選項 |
| `src/data/chatMessages.js` | 平常聊天、愛心、送禮活動和生日聊天 |
| `src/data/characterImages.js` | 所有角色圖片路徑，以及 `characterStyle` 的寬、高、top、left、marginLeft |
| `src/data/config.js` | `endingConfig` 修改結尾道別、紀念卡文字、FURIN 紙條；`cardConfig` 修改自動分頁與翻頁速度 |

角色目前最大寬度為 380px，並隨直播視窗縮放；`translate: -50% 0` 搭配 `left: 50%` 自動置中，不必跟著寬度修改 marginLeft。`bottom: 27%` 讓角色下緣維持在桌面附近。

## 角色圖片

只需要一張角色圖：`public/avatar.png`（建議透明背景 PNG）。同一張圖會搭配輕微跳動、縮放、傾斜、光暈、對話框和粒子完成所有互動。FURIN 的照片放在 `public/flin/flin.png`；目前已接入你提供的 `output/imagegen/furin-.png`，一般出場與結尾彩蛋都會使用它，檔案失效時仍會回退到狗狗圖示。

目前已將你提供的透明圖片 `1234.png` 複製為 `public/avatar.png`，保留最大 380px 的放大比例。`src/data/characterImages.js` 的 `characterMotion` 控制呼吸、慢速擺動及滑鼠跟隨：`enabled` 開關、`followPointer` 滑鼠跟隨、`pointerTravelPx` 位移、`pointerTiltDeg` 傾斜、`breathScale` 呼吸幅度、`breathMs`／`swayMs` 速度。這是單張圖片的微動，沒有獨立眨眼或嘴型，也不是分層 Live2D 模型。手機保留自動微動，不攔截觸控；開啟減少動態效果時保留輕柔呼吸，停用旋轉與滑鼠跟隨。動作程式在 `src/components/useAvatarMotion.js`，樣式在 `src/avatar-motion.css`。

如果日後有更多表情，可選擇放在 `public/character/`：

- `character-like.png`：按愛心時
- `character-gift.png`：收到禮物時
- `character-surprised.png`：五份禮物完成及倒數
- `character-birthday.png`：生日慶祝

表情圖在背景載入，成功後才切換；缺檔或載入中一直顯示 `avatar.png`，不會閃出破圖。如果连 `avatar.png` 也沒有，會顯示現有 CSS 角色。新增圖片後重新整理即可。短暫表情結束後回到同一張 `avatar.png`。

## フリン的圓形照片

把一張照片放在 `public/flin/flin.png`。一般照片即可，不必去背，會自動裁成圓形；沒有圖片或讀取失敗時顯示 🐶，所有流程照常運作。

在 `src/data/config.js` 的 `flinConfig` 修改：

- `image`：照片路徑；`imagePosition`：圓形裁切中心，例如 `50% 35%`。
- `position`／`mobilePosition`：平常探頭時，桌面與手機的寬度、右邊距及底部距離。
- `activation.photoSize`／`activation.buttonWidth`：按鈕橋段的中央特寫照片及按鈕尺寸。
- `firstAppearanceLikeCount: 10`：第一次探頭。
- `secondAppearanceGiftCount: 4`：第二次旁觀。
- `timing`：停留、離場、假停頓、走近與按下的時間（毫秒）。中央特寫預設進場 `approachMs: 2800`、看按鈕 `lookMs: 1400`、伸爪 `pressMs: 1800`、按下後停留 `clickHoldMs: 1800`，共 7.8 秒，再進入原本的倒數。
- `dialogue`：フリン的叫聲、角色回應和按下按鈕的提示。

フリン可见時可點擊：ワン！→ ワンワン！→ 🐾❤️；點擊次數不影響愛心和禮物進度。5/5 的最後回應仍保留完整顯示時間，之後假停頓約一秒。START EVENT 是劇情中的按鈕，由フリン自動伸爪觸發，不需要訪客再操作。按下後才排入生日倒數。慶祝時用同一張照片加皇冠，結束後淡出，個人卡片中不顯示フリン。

## 程式結構

- `src/App.jsx`：入口切換、直播介面、活動燈、卡片與實體禮物畫面。
- `src/components/Entry.jsx`：TikTok 圖示與直播間選擇。
- `src/components/StreamPreview.jsx`：保留原本房間背景、獨立角色圖片層、單一對話框。
- `src/components/Flin.jsx`、`src/flin.css`：圓形照片、備援狗狗圖示、爪子按鈕、皇冠和點擊彩蛋；`src/main.jsx` 載入這份新增樣式。
- `src/components/BirthdayDecorations.jsx`、`src/birthday-effects.css`：生日 EVENT 的 8 顆氣球、蛋糕、杯子蛋糕與閃光；離開慶祝階段時移除。減少動態模式保留靜態裝飾。
- `src/useLive.js`：中央活動階段、計時器、按讚/送禮處理、角色狀態、聊天和粒子。
- `src/styles.css`：原有樣式，保持原檔不變。
- `src/updates.css`：入口、新活動效果與曲線愛心動畫。
- `src/App.test.jsx`：入口計時、泡泡更新、里程碑、20 愛心/5 禮物、卡片、圖片備援、粒子移除和卸載清理測試。

聊天限制八則、愛心粒子最多 90 顆且動畫結束移除；卸載時清理活動計時器。支援減少動態效果偏好。フリン聊天在 `src/data/chatMessages.js` 的 `flinMessages` 修改。
