import { useEffect, useRef, useState } from "react";
import { reactions } from "./data/birthday.js";
import {
  LIKE_GOAL,
  GIFT_GOAL,
  GIFT_REACTION_MS,
  dialogue,
  milestones,
  systemMessages,
  chatConfig,
  evolEvent,
  flinConfig,
  openingChat,
  birthdayDeliveries,
  unboxingConfig,
  handoffConfig,
} from "./data/config.js";
import {
  normalMessages,
  likeMessages,
  giftMessages,
  birthdayMessages,
  flinMessages,
} from "./data/chatMessages.js";
const pick = (items) => items[Math.floor(Math.random() * items.length)];
export default function useLive() {
  const [phase, setPhase] = useState("NORMAL"),
    active = useRef("NORMAL");
  const [likes, setLikes] = useState(0),
    count = useRef(0),
    [giftCount, setGiftCount] = useState(0),
    sent = useRef(0);
  const [bubble, setBubble] = useState(null),
    [reaction, setReaction] = useState(0),
    [expression, setExpression] = useState("default");
  const [hearts, setHearts] = useState([]),
    [giftEffect, setGiftEffect] = useState(null),
    [countdown, setCountdown] = useState(null);
  const [chat, setChat] = useState(
    normalMessages.slice(0, 3).map((m, id) => ({ ...m, id })),
  );
  const [activity, setActivity] = useState(null);
  const [openingChoice, setOpeningChoice] = useState(null);
  const openingChosen = useRef(false);
  const [deliveries, setDeliveries] = useState([]);
  const [flinState, setFlinState] = useState("HIDDEN");
  const [flinResponse, setFlinResponse] = useState(null);
  const flinCurrent = useRef("HIDDEN"),
    flinTimer = useRef(),
    flinResponseTimer = useRef(),
    flinTaps = useRef(0);
  const [spotlight, setSpotlight] = useState(null);
  const spotlightTimer = useRef();
  const recentMessages = useRef(
    normalMessages.slice(0, 3).map((m) => m.message),
  );
  const nextMessage = (pool) => {
    const available = pool.filter(
      (m) => !recentMessages.current.includes(m.message),
    );
    const selected = pick(available.length ? available : pool);
    recentMessages.current = [
      ...recentMessages.current,
      selected.message,
    ].slice(-Math.min(16, pool.length - 1));
    return selected;
  };
  const activityTimer = useRef();
  const serial = useRef(10),
    timers = useRef(new Set()),
    bubbleTimer = useRef(),
    faceTimer = useRef(),
    lock = useRef(0),
    lastChat = useRef(0);
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  };
  const cancel = (id) => {
    clearTimeout(id);
    timers.current.delete(id);
  };
  const transition = (next) => {
    active.current = next;
    setPhase(next);
  };
  const showFlin = (state, duration) => {
    cancel(flinTimer.current);
    cancel(flinResponseTimer.current);
    setFlinResponse(null);
    flinCurrent.current = state;
    setFlinState(state);
    if (duration) flinTimer.current = later(() => leaveFlin(), duration);
  };
  const leaveFlin = () => {
    if (flinCurrent.current === "HIDDEN") return;
    showFlin("LEAVING");
    flinTimer.current = later(
      () => showFlin("HIDDEN"),
      flinConfig.timing.leaveMs,
    );
  };
  const tapFlin = () => {
    if (["HIDDEN", "LEAVING"].includes(flinCurrent.current)) return;
    const index = flinTaps.current++ % flinConfig.dialogue.taps.length;
    cancel(flinResponseTimer.current);
    setFlinResponse({
      id: ++serial.current,
      text: flinConfig.dialogue.taps[index],
      heart: index === 2,
    });
    flinResponseTimer.current = later(
      () => setFlinResponse(null),
      flinConfig.timing.tapMs,
    );
  };
  const addChat = (items) => {
    const messages = items
      .filter((m) => m.type !== "system")
      .map((m) => ({ ...m, id: ++serial.current }));
    if (messages.length)
      setChat((old) => [...old, ...messages].slice(-chatConfig.visibleLimit));
    const featured = messages.findLast(
      (m) => m.username?.toLowerCase() === evolEvent.username.toLowerCase(),
    );
    if (featured) {
      cancel(spotlightTimer.current);
      setSpotlight(featured);
      spotlightTimer.current = later(
        () => setSpotlight(null),
        evolEvent.highlightMs,
      );
    }
    const latest = items.filter((m) => m.type === "system").at(-1);
    if (latest) {
      cancel(activityTimer.current);
      setActivity(latest);
      activityTimer.current = later(() => setActivity(null), 2000);
    }
  };
  const say = (text, duration = 1400, priority = false) => {
    if (!priority && Date.now() < lock.current) return;
    cancel(bubbleTimer.current);
    if (priority) lock.current = Date.now() + duration;
    setBubble({ text, duration, id: ++serial.current });
    bubbleTimer.current = later(() => setBubble(null), duration);
  };
  const react = (state) => {
    setReaction((n) => n + 1);
    cancel(faceTimer.current);
    if (
      ["GIFT_COMPLETE", "FLIN_ACTIVATING", "BIRTHDAY_COUNTDOWN"].includes(
        active.current,
      )
    )
      setExpression("surprised");
    else if (active.current === "BIRTHDAY") setExpression("birthday");
    else {
      setExpression(state);
      faceTimer.current = later(() => setExpression("default"), 1400);
    }
  };
  const chooseOpening = (id) => {
    if (openingChosen.current || !["NORMAL", "LIKE_HINT", "LIKING"].includes(active.current)) return;
    const choice = openingChat.choices.find(item => item.id === id);
    if (!choice) return;
    openingChosen.current = true;
    setOpeningChoice(id);
    addChat([{ username: "you", message: choice.label, type: "chat" },
      { username: "hana", message: choice.chat, type: "chat" }]);
    react("like");
    say(choice.reply, openingChat.replyMs, true);
  };
  const openTwitch = () => {
    if (active.current !== "HANDOFF") return;
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    transition("JOINING_TWITCH");
    later(() => transition("TWITCH"), handoffConfig.joiningMs);
  };
  const floatHearts = (amount = 3) => {
    const particles = Array.from({ length: amount }, () => ({
      id: ++serial.current,
      symbol: pick(["♥", "💗", "💖", "💕"]),
      x: Math.random() * 20 - 10,
      size: 18 + Math.random() * 17,
      drift: Math.random() * 30 - 25,
      curve: Math.random() * 24 - 12,
      rotation: Math.random() * 50 - 25,
      opacity: 0.65 + Math.random() * 0.35,
      duration: 1700 + Math.random() * 1200,
      delay: Math.random() * 160,
    }));
    setHearts((old) => [...old, ...particles].slice(-90));
    // Also clean up if animationend is suppressed in a background tab.
    const ids = new Set(particles.map((particle) => particle.id));
    later(
      () => setHearts((old) => old.filter((heart) => !ids.has(heart.id))),
      3200,
    );
  };
  const removeHeart = (id) =>
    setHearts((old) => old.filter((h) => h.id !== id));
  useEffect(() => {
    later(
      () =>
        addChat([
          {
            username: evolEvent.username,
            message: evolEvent.joined,
            type: "join",
          },
        ]),
      evolEvent.joinDelayMs,
    );
    later(() => {
      if (
        ["NORMAL", "LIKE_HINT", "LIKING", "GIFT_EVENT"].includes(active.current)
      ) {
        addChat([
          {
            username: evolEvent.username,
            message: evolEvent.greeting,
            type: "chat",
          },
        ]);
      }
    }, evolEvent.joinDelayMs + evolEvent.highlightMs);
    later(() => {
      if (count.current === 0 && !openingChosen.current) {
        transition("LIKE_HINT");
        say(dialogue.hint, 4000);
      }
    }, 3500);
    const tick = () => {
      if (
        [
          "NORMAL",
          "LIKE_HINT",
          "LIKING",
          "GIFT_EVENT",
        ].includes(active.current)
      )
        addChat([
          Math.random() < 0.2
            ? {
                username: pick(normalMessages).username,
                message: "joined the LIVE",
                type: "join",
              }
            : nextMessage(
                active.current === "GIFT_EVENT" ? giftMessages : normalMessages,
              ),
        ]);
      later(
        tick,
        chatConfig.intervalMin +
          Math.random() * (chatConfig.intervalMax - chatConfig.intervalMin),
      );
    };
    later(tick, 2000);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, []);
  const like = () => {
    if (!["NORMAL", "LIKE_HINT", "LIKING", "GIFT_EVENT"].includes(active.current)) return;
    const next = ++count.current;
    setLikes(next);
    floatHearts();
    react("like");
    addChat([{ message: systemMessages.liked, type: "system" }]);
    if (next === LIKE_GOAL) {
      transition("GIFT_EVENT");
      say(dialogue.giftUnlock, 2400, true);
      addChat([nextMessage(giftMessages), nextMessage(giftMessages)]);
    } else if (next < LIKE_GOAL && milestones[next]) {
      transition("LIKING");
      if (next !== flinConfig.firstAppearanceLikeCount) {
        say(milestones[next], 1500, true);
        addChat([nextMessage(likeMessages)]);
      }
    } else {
      if (next < LIKE_GOAL) transition("LIKING");
      say(next === 1 ? reactions[0] : pick(reactions));
      if (Date.now() - lastChat.current > 900) {
        addChat([nextMessage(likeMessages)]);
        lastChat.current = Date.now();
      }
    }
    if (next === flinConfig.firstAppearanceLikeCount && next < LIKE_GOAL) {
      showFlin("PEEK", flinConfig.timing.peekMs);
      say(flinConfig.dialogue.peek, 1800, true);
      addChat(flinMessages.peek);
    }
  };
  const beginBirthday = () => {
    if (active.current !== "BIRTHDAY_COUNTDOWN") return;
    transition("BIRTHDAY");
    showFlin("BIRTHDAY");
    addChat(flinMessages.birthday);
    setExpression("birthday");
    say(dialogue.birthday, 2600, true);
    for (let i = 0; i < 20; i++)
      later(() => {
        floatHearts(6);
        addChat([nextMessage(birthdayMessages)]);
        if (i % 5 === 0)
          setGiftEffect({
            id: ++serial.current,
            icon: "🎂",
            name: "Birthday Cake",
          });
      }, i * 350);
    later(() => {
      leaveFlin();
      setGiftEffect(null);
      addChat([
        {
          username: evolEvent.username,
          message: evolEvent.message,
          type: "chat",
        },
      ]);
    }, 7600);
    const heartGiftAt = 7600 + evolEvent.highlightMs;
    later(() => {
      addChat([
        {
          username: evolEvent.username,
          message: evolEvent.giftMessage,
          type: "gift",
        },
      ]);
      setGiftEffect({
        id: ++serial.current,
        icon: "💖",
        name: "EvoL · ハートミー",
      });
      floatHearts(9);
      react("gift");
      say(evolEvent.giftReaction, GIFT_REACTION_MS, true);
    }, heartGiftAt);
    birthdayDeliveries.forEach((delivery, index) => later(() => {
      setDeliveries(old => [...old, delivery]);
      addChat([{ type: "system", message: `${delivery.username} から ${delivery.gift} とカードが届きました 💌` }]);
    }, unboxingConfig.deliveryStartMs + index * unboxingConfig.deliveryIntervalMs));
    later(() => {
      transition("CLOSING");
      setGiftEffect(null);
      setExpression("default");
      handoffConfig.farewell.forEach((line, index) => {
        const speak = () => {
          say(line, handoffConfig.farewellLineMs, true);
          setReaction(value => value + 1);
        };
        if (index === 0) speak();
        else later(speak, index * handoffConfig.farewellLineMs);
      });
      handoffConfig.chat.forEach((line, index) => later(() => addChat([{ ...line, type: "chat" }]),
        1600 + index * 1900));
      later(() => {
        transition("ENDING");
        setBubble(null);
        setSpotlight(null);
        later(() => transition("HANDOFF"), handoffConfig.fadeMs + handoffConfig.endedHoldMs);
      }, handoffConfig.farewell.length * handoffConfig.farewellLineMs);
    }, Math.max(unboxingConfig.handoffMs,
      unboxingConfig.deliveryStartMs + birthdayDeliveries.length * unboxingConfig.deliveryIntervalMs,
      heartGiftAt + GIFT_REACTION_MS));
  };
  const sendGift = (gift) => {
    if (!["NORMAL", "LIKE_HINT", "LIKING", "GIFT_EVENT"].includes(active.current)) return;
    const effect = { ...gift, id: ++serial.current };
    setGiftEffect(effect);
    later(
      () => setGiftEffect((old) => (old?.id === effect.id ? null : old)),
      1600,
    );
    addChat([
      {
        type: "system",
        message: `${systemMessages.sentGift} ${gift.icon} ${gift.name}`,
      },
    ]);
    if (active.current !== "GIFT_EVENT") {
      react("gift");
      say(dialogue.gift[0], GIFT_REACTION_MS, true);
      return;
    }
    const next = ++sent.current;
    setGiftCount(next);
    react("gift");
    say(
      dialogue.gift[Math.min(next - 1, dialogue.gift.length - 1)],
      GIFT_REACTION_MS,
      true,
    );
    if (next === flinConfig.secondAppearanceGiftCount && next < GIFT_GOAL) {
      showFlin("WATCHING", flinConfig.timing.watchMs);
      say(flinConfig.dialogue.watching, GIFT_REACTION_MS, true);
      addChat(flinMessages.watching);
    }
    if (next === GIFT_GOAL) {
      transition("GIFT_COMPLETE");
      showFlin("HIDDEN");
      cancel(faceTimer.current);
      setExpression("surprised");
      addChat([
        { username: "hana", message: "そろった！！✨", type: "chat" },
        { username: "ken", message: "何が始まるの！？ｗ", type: "chat" },
      ]);
      later(() => {
        say(
          flinConfig.dialogue.confused,
          flinConfig.timing.fakePauseMs + flinConfig.timing.approachMs,
          true,
        );
        addChat(flinMessages.waiting);
      }, GIFT_REACTION_MS);
      later(() => {
        if (active.current !== "GIFT_COMPLETE") return;
        transition("FLIN_ACTIVATING");
        showFlin("ENTERING");
        later(() => {
          if (active.current !== "FLIN_ACTIVATING") return;
          showFlin("LOOKING");
          later(() => {
            if (active.current !== "FLIN_ACTIVATING") return;
            showFlin("PRESSING_BUTTON");
            later(() => {
              if (
                active.current !== "FLIN_ACTIVATING" ||
                flinCurrent.current !== "PRESSING_BUTTON"
              )
                return;
              showFlin("PRESSED");
              addChat([
                { type: "system", message: flinConfig.dialogue.pressed },
                ...flinMessages.pressed,
              ]);
              later(() => {
                transition("BIRTHDAY_COUNTDOWN");
                showFlin("HIDDEN");
                setCountdown(null);
                [3, 2, 1].forEach((n, i) =>
                  later(() => setCountdown(n), 1200 + i * 1000),
                );
                later(beginBirthday, 4200);
              }, flinConfig.timing.clickHoldMs);
            }, flinConfig.timing.pressMs);
          }, flinConfig.timing.lookMs);
        }, flinConfig.timing.approachMs);
      }, GIFT_REACTION_MS + flinConfig.timing.fakePauseMs);
    }
  };
  return {
    phase,
    openingChoice,
    chooseOpening,
    deliveries,
    openTwitch,
    likes,
    giftCount,
    bubble,
    reaction,
    expression,
    hearts,
    giftEffect,
    countdown,
    chat,
    activity,
    spotlight,
    flinState,
    flinResponse,
    tapFlin,
    like,
    sendGift,
    removeHeart,
    addChat,
  };
}
