const bus = new EventTarget();
const chan = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("habits-db") : null;

export type DBEventName = "habit:created" | "habit:updated" | "tick:changed";

export function onDBEvent(name: DBEventName, handler: (detail: string) => void) {
  const h = (e: Event) => handler((e as CustomEvent<string>).detail);
  bus.addEventListener(name, h);
  chan?.addEventListener("message", (ev) => {
    if (ev.data?.name === name) handler(ev.data.detail as string);
  });
  return () => {
    bus.removeEventListener(name, h);
  };
}

export function emitDBEvent(name: DBEventName, detail: string) {
  const evt = new CustomEvent(name, { detail });
  bus.dispatchEvent(evt);
  chan?.postMessage({ name, detail });
}
