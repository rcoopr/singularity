const logPrefix = 'EXT Singularity:';

export const log = {
  debug: (message: string, ...args: any[]) => console.debug(logPrefix, message, ...args),
  error: (message: string, ...args: any[]) => console.error(logPrefix, message, ...args),
  info: (message: string, ...args: any[]) => console.info(logPrefix, message, ...args),
  log: (message: string, ...args: any[]) => console.log(logPrefix, message, ...args),
  warn: (message: string, ...args: any[]) => console.warn(logPrefix, message, ...args),
};
