import * as THREE from 'three';
import { config, Tolerance, EnvSystem, depCollector } from '@turbox3d/turbox';
import { ldeStore } from './models/index';
import { appCommandBox } from './commands/index';
import { SceneUtil } from './views/scene/modelsWorld/index';

config({
  middleware: {
    logger: false,
    perf: false,
  },
  // devTool: process.env.NODE_ENV === 'development',
});

window.THREE = THREE;
window.$$LDE_DEBUG = {
  appCommandBox,
  ldeStore,
  SceneUtil,
  depCollector
};

const TOLERANCE = 1e-3;
Tolerance.setGlobal(TOLERANCE, TOLERANCE, TOLERANCE);

ldeStore.document.createHistory(20);
ldeStore.document.applyHistory();

EnvSystem.AppEnvMgr.switchAppEnv('lite-design');
