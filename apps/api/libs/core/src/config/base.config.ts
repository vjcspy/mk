export interface BaseConfig {
  appName: string;

  port: number;
}
export function getInstanceId() {
  return `${process.env.INSTANCE_ID ?? 0}`;
}
export function getAppName() {
  return `${process.env.APP_NAME}[${getInstanceId()}]`;
}

export function getAppNameWithoutId() {
  return `${process.env.APP_NAME}`;
}

export default (): BaseConfig => ({
  appName: getAppName(),
  port: parseInt(process.env.PORT, 10) || 3005,
});
