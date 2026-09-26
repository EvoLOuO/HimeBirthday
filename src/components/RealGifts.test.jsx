import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import TwitchRoom from "./TwitchRoom.jsx";
import { birthdayDeliveries, realGiftConfig } from "../data/config.js";
vi.mock('./LetterCard.jsx', () => ({ default: ({ onContinue }) => <button onClick={onContinue}>Finish reading</button> }));
let host, root;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { vi.useFakeTimers(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); act(() => root.render(<TwitchRoom deliveries={birthdayDeliveries}/>)); });
afterEach(() => { act(() => root.unmount()); expect(vi.getTimerCount()).toBe(0); host.remove(); vi.useRealTimers(); });
const click = selector => act(() => host.querySelector(selector).click());
it.each([['desk','mat'], ['mat','desk']])('reveals both gifts in order %s, %s before allowing the farewell', (first, second) => {
  click('.unboxing-panel .twitch-primary'); click('.evol-envelope');
  act(() => [...host.querySelectorAll('button')].find(button => button.textContent === 'Finish reading').click());
  click('.evol-parcel');
  expect(host.querySelector('.real-gift-choices')).not.toBeNull();
  expect(host.querySelector('.farewell-panel')).toBeNull();
  const choose = id => act(() => host.querySelectorAll('.real-gift-choices button')[realGiftConfig.gifts.findIndex(gift => gift.id === id)].click());
  for (const id of [first, second]) {
    choose(id);
    const gift = realGiftConfig.gifts.find(item => item.id === id);
    expect(host.querySelector('.real-gift-detail').textContent).toContain(gift.hint);
    expect(host.querySelector('.real-gift-detail').textContent).not.toContain(gift.title);
    expect(host.querySelector('.speech').textContent).toBe(gift.reply);
    expect(host.querySelector('.mystery-gift-visual')).not.toBeNull();
    expect(host.querySelector('.gift-desk-raised')).toBeNull();
    expect(host.querySelector('.twitch-stage>.warm-furin')).toBeNull();
    if (id === first) {
      choose(id);
      expect(host.querySelector('.real-gift-progress').textContent).toBe('1 / 2 OPENED');
      expect(host.querySelector('.unboxing-panel .twitch-primary')).toBeNull();
    }
  }
  act(() => vi.advanceTimersByTime(60000));
  expect(host.querySelector('.farewell-panel')).toBeNull();
  expect(host.querySelector('.real-gift-progress').textContent).toBe('2 / 2 OPENED');
  click('.unboxing-panel .twitch-primary');
  expect(host.querySelector('.farewell-panel')).not.toBeNull();
  expect(host.querySelector('.gift-desk-raised')).toBeNull();
});
