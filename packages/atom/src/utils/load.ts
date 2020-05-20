import { appMetaData } from '../core/app';

export enum EStatus {
  PENDING = 1,
  SUCCESS,
  FAILED,
};

interface PluginStatus {
  [key: string]: EStatus;
}

export const pluginStatus: PluginStatus = {};

export const loadScript = async (key: string) => {
  if (pluginStatus[key]) {
    return;
  }
  pluginStatus[key] = EStatus.PENDING;
  const url = appMetaData.config[key];
  if (!url) {
    return;
  }
  const script = document.createElement('script');
  script.onload = () => {
    pluginStatus[key] = EStatus.SUCCESS;
  };
  script.onerror = () => {
    pluginStatus[key] = EStatus.FAILED;
  };
  script.src = url;
  document.head.appendChild(script);
}
