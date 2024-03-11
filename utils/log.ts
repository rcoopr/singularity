const logPrefix = 'EXT Singularity:';

export const log = {
  debug,
  info: (...args: any[]) => console.info(logPrefix, ...args),
  log: (...args: any[]) => console.log(logPrefix, ...args),
  warn: (...args: any[]) => console.warn(logPrefix, ...args),
  error: (...args: any[]) => console.error(logPrefix, ...args),
};

function debug(...args: any[]) {
  if (process.env.NODE_ENV === 'development') console.info('DEBUG:', logPrefix, ...args);
}
