import { CommandManager } from './CommandManager';

export function isCommandManager(mgr: any): mgr is CommandManager {
  return mgr instanceof CommandManager;
}
