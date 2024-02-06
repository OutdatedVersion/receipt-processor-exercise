import pino from 'pino';

export const logger = pino({
  formatters: {
    level: (label, _) => ({ level: label }),
    // Do not include hostname or PID
    bindings: (_) => ({}),
  },
});
