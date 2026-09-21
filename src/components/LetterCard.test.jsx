import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import LetterCard, { paginateLetter } from "./LetterCard.jsx";
import { birthdayConfig } from "../data/birthday.js";
import { cardConfig } from "../data/config.js";
let host, root;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { vi.useFakeTimers(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); expect(vi.getTimerCount()).toBe(0); host.remove(); vi.useRealTimers(); });
const button = label => [...host.querySelectorAll('button')].find(node => node.textContent === label);
const click = label => act(() => button(label).click());
it('paginates a long letter without losing paragraphs, emoji, or text', () => {
  const text = ('大切なひめにゃへ。\nいつもありがとう！👩‍👩‍👧‍👧💜\n\n').repeat(40);
  const pages = paginateLetter(text);
  expect(pages.length).toBeGreaterThan(1);
  expect(pages.join('')).toBe(text);
  for (const page of pages) expect(page.length).toBeLessThan(500);
});
it('keeps long pages readable, locks rapid turns, supports back, and waits for the last page', () => {
  const onContinue = vi.fn();
  const content = { ...birthdayConfig, cardPages: ['最初のページ\n'.repeat(90), '二枚目のメッセージ', '最後のページ♡'] };
  act(() => root.render(<LetterCard birthday={content} onContinue={onContinue} continueLabel="ギフトへ"/>));
  expect(button('ギフトへ')).toBeUndefined();
  expect(button('← 前のページ').disabled).toBe(true);
  expect(host.querySelector('.personal-letter').textContent).toBe(content.cardPages[0]);
  click('次のページ →');
  click('次のページ →');
  expect(host.querySelector('.letter-turning')).not.toBeNull();
  act(() => vi.advanceTimersByTime(cardConfig.flipMs));
  expect(host.querySelector('.personal-letter').textContent).toBe(content.cardPages[1]);
  expect(button('ギフトへ')).toBeUndefined();
  click('← 前のページ');
  act(() => vi.advanceTimersByTime(cardConfig.flipMs));
  expect(host.querySelector('.personal-letter').textContent).toBe(content.cardPages[0]);
  for (let i = 0; i < 2; i++) { click('次のページ →'); act(() => vi.advanceTimersByTime(cardConfig.flipMs)); }
  expect(button('次のページ →').disabled).toBe(true);
  click('ギフトへ');
  expect(onContinue).toHaveBeenCalledTimes(1);
});
it('automatically splits personalMessage when manual pages are empty', () => {
  const text = 'ありがとう。'.repeat(120);
  act(() => root.render(<LetterCard birthday={{...birthdayConfig, personalMessage: text, cardPages: []}} onContinue={() => {}} continueLabel="ギフトへ"/>));
  const pages = paginateLetter(text);
  expect(host.querySelector('.personal-letter').textContent).toBe(pages[0]);
  expect(host.querySelector('.letter-page-number').textContent).toBe(`1 / ${pages.length}`);
});
