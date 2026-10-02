/**
 * matchMedia מדומה ל-jsdom: מעריך max-width / min-width מול window.innerWidth,
 * ומאפשר לבדיקות להחליף רוחב חלון עם setViewportWidth().
 */
type MqlListener = (e: { matches: boolean; media: string }) => void;

const listeners = new Set<{ query: string; cb: MqlListener }>();

function evaluate(query: string, width: number): boolean {
  const max = /max-width:\s*(\d+)px/.exec(query);
  const min = /min-width:\s*(\d+)px/.exec(query);
  let ok = true;
  if (max) ok = ok && width <= Number(max[1]);
  if (min) ok = ok && width >= Number(min[1]);
  return ok;
}

export function installMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return evaluate(query, window.innerWidth);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: 'change', cb: MqlListener) => {
        listeners.add({ query, cb });
      },
      removeEventListener: (_type: 'change', cb: MqlListener) => {
        for (const l of listeners) if (l.cb === cb) listeners.delete(l);
      },
      addListener: (cb: MqlListener) => {
        listeners.add({ query, cb });
      },
      removeListener: (cb: MqlListener) => {
        for (const l of listeners) if (l.cb === cb) listeners.delete(l);
      },
      dispatchEvent: () => true,
    }),
  });
}

export function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event('resize'));
  for (const l of listeners) l.cb({ matches: evaluate(l.query, width), media: l.query });
}
