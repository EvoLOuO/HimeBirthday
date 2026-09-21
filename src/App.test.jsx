import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App.jsx";
import TwitchRoom from "./components/TwitchRoom.jsx";
import { birthdayConfig } from "./data/birthday.js";
import {
  milestones,
  evolEvent,
  chatConfig,
  flinConfig,
  GIFT_REACTION_MS,
  openingChat,
  birthdayDeliveries,
  unboxingConfig,
  twitchConfig,
  handoffConfig,
  tiktokConfig,
  endingConfig,
} from "./data/config.js";
let host, root;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  vi.useFakeTimers();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    ),
  );
});
afterEach(() => {
  act(() => root.unmount());
  vi.advanceTimersByTime(0);
  expect(vi.getTimerCount()).toBe(0);
  host.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const click = (label) =>
  act(() => host.querySelector(`[aria-label="${label}"]`).click());
const wait = (ms) => act(() => vi.advanceTimersByTime(ms));
const enter = () => {
  click("TikTokを開く");
  click("ひめにゃのライブに入る");
};
const likes = (n) => {
  for (let i = 0; i < n; i++) click("いいね");
};
const gift = () => {
  click("ギフト");
  click("Roseを送る");
};
const bubble = () => host.querySelector(".speech")?.textContent;
const next = () =>
  act(() => host.querySelector(".unboxing-panel .twitch-primary").click());
it.each(openingChat.choices)("replies to opening choice $id without the hint interrupting", (choice) => {
  enter();
  wait(3000);
  const button = [...host.querySelectorAll('.opening-choices button')].find(item => item.textContent === choice.label);
  act(() => button.click());
  expect(bubble()).toBe(choice.reply);
  expect(host.querySelector('.chat').textContent).toContain(choice.label);
  expect(host.querySelector('.opening-choices')).toBeNull();
  wait(600);
  expect(bubble()).toBe(choice.reply);
  wait(openingChat.replyMs);
  likes(1);
  expect(host.querySelector('[aria-label="いいね数"]').textContent).toContain('1 / 20');
});
it("keeps viewer comments separate from rapid like activity", () => {
  enter();
  likes(50);
  expect(host.querySelectorAll(".chat")).toHaveLength(1);
  expect(host.querySelectorAll(".chat .comment").length).toBeGreaterThanOrEqual(
    3,
  );
  expect(host.querySelector(".activity").textContent).toContain("いいね");
  expect(host.querySelector(".chat").textContent).not.toContain(
    "いいねを押しました",
  );
});
it("introduces EvoL early without revealing the later gifts or card", () => {
  enter();
  wait(evolEvent.joinDelayMs - 1);
  expect(host.querySelector(".evol-spotlight")).toBeNull();
  wait(1);
  expect(host.querySelector(".evol-spotlight").textContent).toContain(
    evolEvent.joined,
  );
  expect(
    host.querySelectorAll(".chat-line.join.featured-comment"),
  ).toHaveLength(1);
  expect(host.querySelector(".gift-effect")).toBeNull();
  expect(host.querySelector(".birthday-overlay")).toBeNull();
  wait(evolEvent.highlightMs);
  expect(host.querySelector(".evol-spotlight").textContent).toContain(
    evolEvent.greeting,
  );
  expect(host.textContent).not.toContain(evolEvent.message);
  expect(host.querySelector(".gift-effect")).toBeNull();
});
it("starts timers only after entering himenya room", () => {
  wait(20000);
  expect(vi.getTimerCount()).toBe(0);
  expect(host.querySelector(".chat")).toBeNull();
  click("TikTokを開く");
  wait(20000);
  expect(host.textContent).toContain("ひめにゃ");
  expect(vi.getTimerCount()).toBe(0);
  click("ひめにゃのライブに入る");
  expect(host.querySelector(".chat")).not.toBeNull();
  wait(3500);
  expect(bubble()).toContain("ハート");
});
it("refreshes a single bubble, animates avatar, and removes completed hearts", () => {
  enter();
  likes(1);
  expect(bubble()).toBe("いいねありがとう！❤️");
  expect(host.querySelector(".avatar.reacting")).not.toBeNull();
  expect(host.querySelectorAll(".hearts span")).toHaveLength(3);
  wait(800);
  likes(1);
  expect(host.querySelectorAll(".speech")).toHaveLength(1);
  wait(800);
  expect(bubble()).toBeTruthy();
  wait(600);
  expect(bubble()).toBeUndefined();
  act(() =>
    host
      .querySelectorAll(".hearts span")
      .forEach((el) =>
        el.dispatchEvent(new Event("animationend", { bubbles: true })),
      ),
  );
  expect(host.querySelectorAll(".hearts span")).toHaveLength(0);
});
it("protects each milestone, unlocks only at 20, and never resets gift progress", () => {
  enter();
  likes(5);
  expect(bubble()).toBe(milestones[5]);
  likes(1);
  expect(bubble()).toBe(milestones[5]);
  likes(4);
  expect(bubble()).toBe(flinConfig.dialogue.peek);
  likes(5);
  expect(bubble()).toBe("あとちょっと！❤️");
  likes(4);
  expect(host.querySelector(".gift-goal")).toBeNull();
  gift();
  likes(1);
  expect(host.querySelector(".gift-goal").textContent).toContain("0 / 5");
  expect(bubble()).toBe("ん？なんか始まったみたい…？");
  gift();
  likes(30);
  expect(host.querySelector(".gift-goal").textContent).toContain("1 / 5");
  expect(host.querySelectorAll(".hearts span").length).toBeLessThanOrEqual(90);
});
it("delivers gifts on TikTok then requires opening EvoL's card and gift on Twitch", () => {
  enter();
  likes(20);
  expect(host.textContent).not.toContain("EvoL");
  wait(10000);
  expect(host.querySelectorAll(".lit")).toHaveLength(0);
  for (let i = 1; i <= 4; i++) {
    gift();
    expect(host.querySelectorAll(".lit")).toHaveLength(i);
    expect(host.textContent).not.toContain("GOAL COMPLETED");
  }
  expect(host.querySelector(".flin-stage").dataset.state).toBe("WATCHING");
  wait(10000);
  expect(host.querySelectorAll(".lit")).toHaveLength(4);
  gift();
  expect(host.querySelectorAll(".lit")).toHaveLength(5);
  expect(host.textContent).toContain("GOAL COMPLETED");
  expect(host.textContent).not.toContain("EvoL");
  wait(2000);
  expect(bubble()).toBe("えっ？そろった…！");
  wait(1000);
  expect(bubble()).toBe(flinConfig.dialogue.confused);
  expect(host.querySelector(".event-overlay")).toBeNull();
  wait(flinConfig.timing.fakePauseMs);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("ENTERING");
  expect(host.textContent).toContain("START EVENT");
  wait(flinConfig.timing.approachMs);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("LOOKING");
  expect(host.querySelector(".event-overlay")).toBeNull();
  wait(flinConfig.timing.lookMs);
  expect(host.querySelector(".flin-stage").dataset.state).toBe(
    "PRESSING_BUTTON",
  );
  expect(host.querySelector(".event-overlay")).toBeNull();
  wait(flinConfig.timing.pressMs);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("PRESSED");
  expect(host.querySelector(".activity").textContent).toBe(
    flinConfig.dialogue.pressed,
  );
  expect(host.querySelector(".event-overlay")).toBeNull();
  wait(flinConfig.timing.clickHoldMs);
  expect(host.textContent).toContain("UNLOCKED");
  wait(1200);
  expect(host.querySelector(".event-overlay>span").textContent).toBe("3");
  wait(1000);
  expect(host.querySelector(".event-overlay>span").textContent).toBe("2");
  wait(1000);
  expect(host.querySelector(".event-overlay>span").textContent).toBe("1");
  wait(1000);
  expect(host.textContent).toContain("HAPPY BIRTHDAY");
  expect(host.querySelector(".flin-stage").dataset.state).toBe("BIRTHDAY");
  expect(host.querySelector(".flin-crown")).not.toBeNull();
  expect(host.querySelectorAll(".party-balloon")).toHaveLength(8);
  expect(host.querySelectorAll(".party-cake")).toHaveLength(2);
  expect(host.textContent).not.toContain("EvoL");
  wait(7600);
  expect(host.querySelector(".evol-spotlight").textContent).toContain(
    evolEvent.message,
  );
  expect(host.querySelector(".featured-comment")).not.toBeNull();
  wait(evolEvent.highlightMs);
  expect(bubble()).toBe(evolEvent.giftReaction);
  expect(host.querySelectorAll(".evol-spotlight")).toHaveLength(1);
  expect(host.querySelector(".gift-effect").textContent).toContain(
    "ハートミー",
  );
  expect(host.querySelectorAll('.birthday-inbox>div')).toHaveLength(birthdayDeliveries.length);
  expect(host.textContent).not.toContain(birthdayConfig.personalMessage);
  for (const item of birthdayDeliveries.filter(item => !item.featured)) {
    expect(host.textContent).not.toContain(item.message);
  }
  wait(unboxingConfig.handoffMs - 7600 - evolEvent.highlightMs);
  expect(bubble()).toBe(handoffConfig.farewell[0]);
  expect(host.querySelector('.platform-handoff')).toBeNull();
  expect(host.querySelector('.viewers').textContent).toContain(tiktokConfig.viewers.toLocaleString('en-US'));
  wait(handoffConfig.farewellLineMs);
  expect(bubble()).toBe(handoffConfig.farewell[1]);
  expect(host.querySelector('.chat').textContent).toContain('miichan');
  wait(handoffConfig.farewellLineMs);
  expect(host.querySelector('.stream-ended').textContent).toContain(handoffConfig.endedTitle);
  expect(host.querySelector('.platform-handoff')).toBeNull();
  wait(handoffConfig.fadeMs + handoffConfig.endedHoldMs);
  expect(host.querySelector('.platform-handoff')).not.toBeNull();
  expect(host.querySelector(".flin-stage")).toBeNull();
  expect(host.querySelector(".birthday-decorations")).toBeNull();
  expect(host.querySelector(".confetti")).toBeNull();
  likes(5);
  expect(host.querySelector('[aria-label="いいね数"]').textContent).toBe('20 / 20');
  act(() => host.querySelector('.platform-handoff button').click());
  expect(host.querySelector('.platform-handoff button').disabled).toBe(true);
  expect(host.querySelector('.twitch-page')).toBeNull();
  wait(handoffConfig.joiningMs);
  expect(host.querySelector('.twitch-page')).not.toBeNull();
  expect(host.querySelector('.side-controls')).toBeNull();
  expect(host.querySelector('.audience-conversation').textContent).toContain(unboxingConfig.intro);
  const audience = birthdayDeliveries.filter(item => !item.featured);
  wait(unboxingConfig.audienceIntroMs);
  for (const item of audience) {
    expect(host.querySelector('.streamer-dialogue').textContent).toContain(item.streamerReply);
    expect(bubble()).toBe(item.streamerReply);
    expect(host.querySelector('.viewer-dialogue')).toBeNull();
    wait(unboxingConfig.audienceReplyDelayMs);
    expect(host.querySelector('.viewer-dialogue').textContent).toContain(item.chatReply);
    expect(host.querySelector('.twitch-chat-messages').textContent).toContain(item.chatReply);
    wait(unboxingConfig.audienceItemMs - unboxingConfig.audienceReplyDelayMs);
  }
  expect(host.querySelector('.evol-envelope')).not.toBeNull();
  wait(60000);
  expect(host.querySelector('.evol-letter')).toBeNull();
  click('EvoL のカードを開く');
  expect(host.querySelector('.evol-letter').textContent).toContain(birthdayConfig.personalMessage);
  wait(60000);
  expect(host.querySelector('.evol-letter')).not.toBeNull();
  next();
  expect(host.querySelector('.evol-parcel')).not.toBeNull();
  expect(host.textContent).not.toContain(unboxingConfig.finalMessage);
  click('EvoL のプレゼントを開く');
  expect(host.textContent).toContain(unboxingConfig.finalMessage);
  act(() => host.querySelector('.twitch-secondary').click());
  expect(host.querySelector('.evol-letter')).not.toBeNull();
  next();
  expect(host.textContent).toContain(unboxingConfig.finalMessage);
});
it("cancels the audience recap when skipped and never auto-opens EvoL's envelope", () => {
  act(() => root.render(<TwitchRoom deliveries={birthdayDeliveries}/>));
  next();
  expect(host.querySelector('.evol-envelope')).not.toBeNull();
  wait(60000);
  expect(host.querySelector('.evol-envelope')).not.toBeNull();
  expect(host.querySelector('.audience-recap')).toBeNull();
  expect(host.textContent).not.toContain(birthdayConfig.personalMessage);
});
it("keeps Twitch chat moving with bounded history and viewers while a card stays open", () => {
  act(() => root.render(<TwitchRoom deliveries={birthdayDeliveries}/>));
  expect(host.querySelector('.twitch-viewers').textContent).toContain('1,268');
  const initial = host.querySelector('.twitch-chat-messages').textContent;
  wait(twitchConfig.chatIntervalMax);
  expect(host.querySelector('.twitch-chat-messages').textContent).not.toBe(initial);
  next();
  expect(host.querySelector('.twitch-evol').textContent).toContain('EvoL');
  click('EvoL のカードを開く');
  wait(30000);
  expect(host.querySelector('.evol-letter')).not.toBeNull();
  expect(host.querySelectorAll('.twitch-chat-messages p')).toHaveLength(twitchConfig.visibleMessages);
  const viewers = Number(host.querySelector('.twitch-viewers').textContent.replace(/\D/g, ''));
  expect(viewers).toBeGreaterThanOrEqual(twitchConfig.viewerMin);
  expect(viewers).toBeLessThanOrEqual(twitchConfig.viewerMax);
  const text = host.querySelector('.twitch-chat-messages').textContent;
  wait(twitchConfig.chatIntervalMax);
  expect(host.querySelector('.twitch-chat-messages').textContent).not.toBe(text);
});
const openFinalGift = () => {
  act(() => root.render(<TwitchRoom deliveries={birthdayDeliveries}/>));
  next();
  click('EvoL のカードを開く');
  next();
  click('EvoL のプレゼントを開く');
};
it("says goodbye in order, waits for manual stream ending, then shows FURIN's note", () => {
  openFinalGift();
  const viewers = host.querySelector('.twitch-viewers').textContent;
  expect(host.querySelector('.end-stream-button')).toBeNull();
  wait(endingConfig.giftLeadMs);
  expect(host.querySelectorAll('.twitch-chat-messages p')).toHaveLength(1);
  expect(host.querySelector('.twitch-chat-messages').textContent).toContain(endingConfig.chat[0].message);
  for (let i = 1; i < endingConfig.chat.length; i++) {
    wait(endingConfig.chatGapMs);
    expect(host.querySelectorAll('.farewell-line')).toHaveLength(i + 1);
    expect(host.querySelector('.twitch-chat-messages').textContent).toContain(endingConfig.chat[i].message);
  }
  wait(endingConfig.chatGapMs);
  expect(bubble()).toBe(endingConfig.farewell[0]);
  wait(endingConfig.farewellLineMs);
  expect(bubble()).toBe(endingConfig.farewell[1]);
  wait(endingConfig.farewellLineMs);
  const endButton = host.querySelector('.end-stream-button');
  expect(endButton).not.toBeNull();
  wait(60000);
  expect(host.querySelector('.twitch-viewers').textContent).toBe(viewers);
  expect(host.querySelectorAll('.twitch-chat-messages p')).toHaveLength(3);
  expect(host.querySelector('.ending-page')).toBeNull();
  act(() => { endButton.click(); endButton.click(); });
  expect(host.querySelector('.ending-page').textContent).toContain(endingConfig.title);
  expect(host.querySelector('.twitch-chat-messages')).toBeNull();
  expect(host.querySelector('.farewell-furin')).toBeNull();
  wait(endingConfig.furinDelayMs);
  const dog = host.querySelector('.farewell-furin img');
  expect(dog.getAttribute('src')).toBe(flinConfig.image);
  expect(host.querySelector('.furin-paper').textContent).toContain('またね');
  expect(vi.getTimerCount()).toBe(0);
  act(() => dog.dispatchEvent(new Event('error')));
  expect(host.querySelector('.farewell-dog-fallback')).not.toBeNull();
  expect(host.querySelector('.furin-paper').textContent).toContain('またね');
});
it("pauses the goodbye while rereading and resumes without interrupting the card", () => {
  openFinalGift();
  wait(endingConfig.giftLeadMs);
  act(() => host.querySelector('.twitch-secondary').click());
  wait(30000);
  expect(host.querySelector('.evol-letter')).not.toBeNull();
  expect(host.querySelector('.end-stream-button')).toBeNull();
  next();
  wait(endingConfig.giftLeadMs + endingConfig.chat.length * endingConfig.chatGapMs + endingConfig.farewell.length * endingConfig.farewellLineMs);
  expect(host.querySelector('.end-stream-button')).not.toBeNull();
  expect(host.querySelectorAll('.twitch-chat-messages p')).toHaveLength(3);
});
it("cancels pending donor replies if the audience dialogue is skipped", () => {
  act(() => root.render(<TwitchRoom deliveries={birthdayDeliveries}/>));
  wait(unboxingConfig.audienceIntroMs);
  expect(bubble()).toBe(birthdayDeliveries[0].streamerReply);
  next();
  wait(unboxingConfig.audienceReplyDelayMs);
  expect(host.querySelector('.audience-conversation')).toBeNull();
  expect(host.querySelector('.twitch-chat-messages').textContent).not.toContain(birthdayDeliveries[0].chatReply);
  expect(bubble()).toBe(unboxingConfig.audienceClosing);
});
it("shows Flin once at ten likes, falls back to a dog icon, and keeps taps cosmetic", () => {
  enter();
  likes(9);
  expect(host.querySelector(".flin-stage")).toBeNull();
  likes(1);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("PEEK");
  const photo = host.querySelector(".flin-photo img");
  expect(photo.getAttribute("src")).toBe("/flin/flin.png");
  act(() => photo.dispatchEvent(new Event("error")));
  expect(host.querySelector(".flin-placeholder")).not.toBeNull();
  for (const text of flinConfig.dialogue.taps) {
    click("フリンをなでる");
    expect(host.querySelector(".flin-response").textContent).toContain(text);
  }
  expect(host.querySelector(".flin-love")).not.toBeNull();
  expect(host.querySelector('[aria-label="いいね数"]').textContent).toContain(
    "10 / 20",
  );
  wait(flinConfig.timing.peekMs + flinConfig.timing.leaveMs);
  expect(host.querySelector(".flin-stage")).toBeNull();
  likes(1);
  expect(host.querySelector(".flin-stage")).toBeNull();
});
it("cancels old cameo timers when gifts are sent quickly", () => {
  enter();
  likes(20);
  for (let i = 0; i < 4; i++) gift();
  expect(host.querySelector(".flin-stage").dataset.state).toBe("WATCHING");
  gift();
  wait(GIFT_REACTION_MS + flinConfig.timing.fakePauseMs);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("ENTERING");
  wait(900);
  expect(host.querySelector(".flin-stage").dataset.state).toBe("ENTERING");
  likes(4);
  click("フリンをなでる");
  expect(host.querySelectorAll(".goal-lights .lit")).toHaveLength(5);
  expect(host.querySelector(".birthday-banner")).toBeNull();
});
it("keeps the placeholder working when no avatar is provided", () => {
  enter();
  const fail = () =>
    act(() =>
      host.querySelector(".avatar img").dispatchEvent(new Event("error")),
    );
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/avatar.png",
  );
  fail();
  expect(host.querySelector(".placeholder")).not.toBeNull();
  likes(1);
  expect(host.querySelector(".placeholder")).not.toBeNull();
  wait(1400);
  expect(host.querySelector(".placeholder")).not.toBeNull();
});
it("keeps avatar.png visible unless an optional expression loads successfully", () => {
  const probes = [];
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        probes.push(this);
      }
    },
  );
  enter();
  expect(host.querySelector(".brand")).toBeNull();
  likes(1);
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/avatar.png",
  );
  act(() => probes.at(-1).onerror());
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/avatar.png",
  );
  gift();
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/avatar.png",
  );
  act(() => probes.at(-1).onload());
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/character/character-gift.png",
  );
  wait(1400);
  expect(host.querySelector(".avatar img").getAttribute("src")).toBe(
    "/avatar.png",
  );
});
