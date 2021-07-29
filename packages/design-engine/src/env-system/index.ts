import { Domain, reactor, mutation } from '@turbox3d/reactivity';

/** 应用环境变量 */
enum EAppEnv {
  /** 定制商品素材主插件 */
  CUSTOMIZE_PRODUCTS = 'customize-products',
  /** 定制铝合金门窗自由绘制插件 */
  CUSTOMIZE_DOOR_WINDOW = 'customize-door-window',
}

class AppEnvironmentManager extends Domain {
  /** 当前应用环境变量 */
  @reactor() appEnv = '';

  /** 切换应用环境 */
  @mutation('切换应用环境', true)
  switchAppEnv(appEnvId: string) {
    this.appEnv = appEnvId;
  }
}

/** 应用环境管理器 */
export default class EnvSystem {
  static EAppEnv = EAppEnv;
  static AppEnvMgr = new AppEnvironmentManager();
}
