// // import 'reflect-metadata';
// import { CommandUnitManager, unitManager } from '../structure/Manager';

// interface Constructor {
//     new(...args: any[]): any;
// }

// interface ProviderMap {
//     [key: string]: Constructor;
// }

// interface InstanceMap {
//     [key: string]: Object;
// }

// class Injector {
//     private static providerMap: ProviderMap = {};

//     private static instanceMap: InstanceMap = {};

//     static setProvider(key: string, ctor: Constructor) {
//         if (!this.providerMap[key]) {
//             this.providerMap[key] = ctor;
//         }
//     }

//     static getInstance(key: string, param?: any) {
//         let instance = this.instanceMap[key];

//         if (!instance) {
//             const ctor = this.providerMap[key];

//             if (!ctor) {
//                 return undefined;
//             }

//             instance = new ctor(param);
//             this.instanceMap[key] = instance;
//         }

//         return instance;
//     }
// }

// /**
//  * 标记当前类可被注入
//  */
// function Injectable() {
//     return function(ctor: Constructor) {
//         Injector.setProvider(ctor.name, ctor);
//         return ctor;
//     }
// }

// /**
//  * 注入 CommandUnit
//  * @param manager 要注入的 CommandUnitManager
//  */
// function InjectCommandUnit(manager?: CommandUnitManager) {
//     return function(target: Object, key: string) {
//         const type = Reflect.getMetadata('design:type', target, key);
//         const instance = Injector.getInstance(type.name, manager || unitManager);

//         if (!instance) {
//             console.log(`向 ${target.constructor.name} 上的属性 ${key} 注入类型 ${type} 时失败`);
//         }

//         target[key] = instance;
//     }
// }

// /**
//  * 注入某个类
//  */
// function Inject() {
//     return function(target: Object, key: string) {
//         const type = Reflect.getMetadata('design:type', target, key);
//         const instance = Injector.getInstance(type.name);

//         if (!instance) {
//             console.log(`向 ${target.constructor.name} 上的属性 ${key} 注入类型 ${type} 时失败`);
//         }

//         target[key] = instance;
//     }
// }

// export { Inject, Injectable, InjectCommandUnit };