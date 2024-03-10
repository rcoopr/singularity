const logPrefix = 'EXT Singularity:';

export const log = {
  debug,
  info: (message: string, ...args: any[]) => console.info(logPrefix, message, ...args),
  log: (message: string, ...args: any[]) => console.log(logPrefix, message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(logPrefix, message, ...args),
  error: (message: string, ...args: any[]) => console.error(logPrefix, message, ...args),
};

function debug(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === 'development') console.info('DEBUG:', logPrefix, message, ...args);
}
