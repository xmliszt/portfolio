type Waiter = (token: string | undefined) => void;

/** Return a holder for one captcha token at a time: `put` hands a new token to the oldest waiting `take` or keeps it, `take` resolves with the kept token (or the next one put, or `undefined` after `timeoutMs`) and calls the `onTaken` listeners so a fresh token can be fetched, and `clear` drops an expired token. */
export function createCaptchaTokens(options: {
  timeoutMs: number;
  schedule: (options: { run: () => void; delayMs: number }) => () => void;
}) {
  const state: {
    token?: string;
    waiters: Waiter[];
    listeners: (() => void)[];
  } = { waiters: [], listeners: [] };

  function notifyTaken() {
    state.listeners.forEach((listener) => listener());
  }

  return {
    put(token: string) {
      const waiter = state.waiters.at(0);
      if (waiter === undefined) {
        state.token = token;
        return;
      }
      state.waiters = state.waiters.slice(1);
      waiter(token);
      notifyTaken();
    },
    take() {
      const token = state.token;
      if (token !== undefined) {
        state.token = undefined;
        notifyTaken();
        return Promise.resolve(token);
      }
      return new Promise<string | undefined>((resolve) => {
        const cancelTimeout = options.schedule({
          delayMs: options.timeoutMs,
          run: () => {
            state.waiters = state.waiters.filter(
              (candidate) => candidate !== waiter
            );
            resolve(undefined);
          },
        });
        const waiter: Waiter = (next) => {
          cancelTimeout();
          resolve(next);
        };
        state.waiters = [...state.waiters, waiter];
      });
    },
    clear() {
      state.token = undefined;
    },
    onTaken(listener: () => void) {
      state.listeners = [...state.listeners, listener];
      return () => {
        state.listeners = state.listeners.filter(
          (candidate) => candidate !== listener
        );
      };
    },
  };
}
