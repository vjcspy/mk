/**
 * Hien tai se lay first process lam main process
 * https://pm2.keymetrics.io/docs/usage/environment/
 */
export const isMainProcess = () => {
  return (
    process.env.NODE_APP_INSTANCE === '0' ||
    typeof process.env.INSTANCE_ID === 'undefined'
  );
};

export const isDevelopment = () =>
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
