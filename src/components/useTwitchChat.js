import { useCallback, useEffect, useRef, useState } from "react";
import { twitchConfig as config } from "../data/config.js";
import { twitchChat } from "../data/twitchChat.js";

export default function useTwitchChat(stage) {
  const quiet = ["FINAL", "ENDED"].includes(stage);
  const serial = useRef(3);
  const recent = useRef([]);
  const [messages, setMessages] = useState(() => twitchChat.welcome.map((line, id) => ({ ...line, id })));
  const [viewers, setViewers] = useState(config.viewers);
  const addMessage = useCallback((username, message, farewell = false) => {
    const line = { username, message, farewell, id: ++serial.current };
    setMessages(old => [...old, line].slice(-config.visibleMessages));
  }, []);
  const clearMessages = useCallback(() => setMessages([]), []);
  useEffect(() => {
    if (quiet) return;
    let timer;
    const tick = () => {
      const pool = [...twitchChat.common, ...(twitchChat[stage] || [])];
      const fresh = pool.filter(line => !recent.current.includes(line.message));
      const choices = fresh.length ? fresh : pool;
      const line = choices[Math.floor(Math.random() * choices.length)];
      recent.current = [...recent.current, line.message].slice(-12);
      addMessage(line.username, line.message);
      timer = setTimeout(tick, delay());
    };
    const delay = () => config.chatIntervalMin + Math.random() * (config.chatIntervalMax - config.chatIntervalMin);
    timer = setTimeout(tick, delay());
    return () => clearTimeout(timer);
  }, [stage, quiet, addMessage]);
  useEffect(() => {
    if (quiet) return;
    const timer = setInterval(() => setViewers(old => Math.max(config.viewerMin,
      Math.min(config.viewerMax, old + (Math.random() < .35 ? -1 : 1) * (1 + Math.floor(Math.random() * 9))))), config.viewerUpdateMs);
    return () => clearInterval(timer);
  }, [quiet]);
  return { messages, viewers, addMessage, clearMessages };
}
