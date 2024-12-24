/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { Button, Input, Slider } from 'antd';
import * as React from 'react';
import * as THREE from 'three';
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { LoadSystem, Vector3, MathUtils } from '@turbox3d/turbox';

import { Z_INDEX_ACTION, MIRROR_ACTION } from '../../common/consts/scene';
import { useMaterialDragAndReplace } from '../../hooks/index';
import { ldeStore } from '../../models/index';
import './index.less';
import { SceneUtil } from '../scene/modelsWorld/index';

const images = {
  wardrobe: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/wardrobe.png',
  sofa: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png',
  light: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/light.png',
  desk: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/desk.png',
  chair: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/chair.png',
  art: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/art.png',
};

// eslint-disable-next-line max-lines-per-function
export function LeftPanel() {
  let isShow = false;
  let isPressed = false;
  let timer: number;
  const { dragControl } = useMaterialDragAndReplace();
  const lockCamera = () => {
    ldeStore.scene.$update({
      cameraControlsEnabled: !ldeStore.scene.cameraControlsEnabled,
    });
  };

  const undoHandler = () => {
    ldeStore.document.undo();
  };

  const redoHandler = () => {
    ldeStore.document.redo();
  };

  const addCube = () => {
    ldeStore.actions.addCube();
  };

  const deleteModel = () => {
    ldeStore.actions.deleteEntity();
  };

  const updateZ = (type: Z_INDEX_ACTION) => () => {
    ldeStore.actions.updateRenderOrder(type);
  };

  const mirror = (type: MIRROR_ACTION) => () => {
    ldeStore.actions.updateMirror(type);
  };

  const copy = () => {
    ldeStore.actions.copy();
  };

  const scaleScene = (value: number) => {
    ldeStore.actions.scaleScene(value);
  };

  const lock = () => {
    ldeStore.actions.lock();
  };

  const replace = () => {
    const sofaUrl = 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png';
    ldeStore.actions.replace(sofaUrl);
  };

  const group = () => {
    ldeStore.actions.group();
  };

  const screenShot = () => {
    ldeStore.actions.screenShot(true, 'image/jpeg', 1, 1);
  };

  const exportPDF = () => {
    ldeStore.actions.exportPDF();
  };

  const skew = () => {
    ldeStore.actions.skew();
  };

  const confirmSkew = () => {
    ldeStore.actions.confirmSkew(async ({ data: url }) => URL.createObjectURL(url));
  };

  const cancelSkew = () => {
    ldeStore.actions.cancelSkew();
  };

  const clip = () => {
    ldeStore.actions.clip();
  };

  const confirmClip = () => {
    ldeStore.actions.confirmClip(async ({ data: url }) => URL.createObjectURL(url));
  };

  const cancelClip = () => {
    ldeStore.actions.cancelClip();
  };

  const align = (type: 'top' | 'middle' | 'bottom') => () => {
    ldeStore.actions.align(type);
  };

  const setBackground = () => {
    ldeStore.actions.setBackground('https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/bg.jpeg');
  };

  const save = () => {
    const json = ldeStore.actions.save({
      id: '123',
      spaceId: '123',
    });
    console.log(json);
  };

  const loadUrl = React.useRef<string>('');

  const loadUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadUrl.current = e.target.value;
  };

  const load = async () => {
    const json = await LoadSystem.loadJSON(loadUrl.current);
    ldeStore.actions.load(json);
  };

  // const swipeScene = (type: string) => () => {
  //   const dis = type === 'bottom' ? -100 : 0;
  //   (document.querySelector('#app canvas')! as any).style.transition = 'all .3s';
  //   (document.querySelector('#app2 canvas')! as any).style.transition = 'all .3s';
  //   (document.querySelector('#app canvas')! as any).style.transform = `translateY(${dis}%)`;
  //   (document.querySelector('#app2 canvas')! as any).style.transform = `translateY(${dis}%)`;
  // }

  const pointerDownHandler = (url: string, itemId: number | string) => (e: React.PointerEvent) => {
    e.persist();
    isPressed = false;
    // timer = window.setTimeout(() => {
    //   isPressed = true;
    //   dragControl.current.onMouseDown(url, itemId)(e);
    // }, 300);
    dragControl.current.onMouseDown(url)(e.nativeEvent);
  };
  const pointerMoveHandler = () => {
    if (!isPressed) {
      // window.clearTimeout(timer);
    }
  };

  const renderFlag = () => {
    ldeStore.scene.setRenderFlag3d(!ldeStore.scene.renderFlag3d);
  };

  const renderFlag2d = () => {
    ldeStore.scene.setRenderFlag2d(!ldeStore.scene.renderFlag2d);
  };

  const showSkyBox = () => {
    isShow = !isShow;
    ldeStore.actions.showSkyBox(isShow);
  };

  const generateThumbnail = async () => {
    const json = await LoadSystem.loadJSON('//i/qdnj4na7n8c.json');
    const url = (await ldeStore.document.generateThumbnail(json, 600)) as Blob;
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(url);
    downloadLink.download = 'thumbnail';
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  };

  const addBufferGeometry = async () => {
    const quadPositions = [
      new Vector3(-100, 50, 50),
      new Vector3(100, 50, 10),
      new Vector3(100, -50, 50),
      new Vector3(-100, -50, 10),
    ];
    const widthSegments = 20;
    const heightSegments = 10;
    const { indices, vertices, normals, uvs } = MathUtils.generateMeshByQuad(
      quadPositions,
      widthSegments,
      heightSegments
    );
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    });
    material.depthTest = false;
    const map = await new THREE.TextureLoader().loadAsync(images.art);
    map.needsUpdate = true;
    material.map = map;
    material.map.minFilter = THREE.LinearFilter;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1000000;
    // const gui = new GUI();
    // gui.add(material, 'wireframe');
    const scene = SceneUtil.getScene();
    scene.add(mesh);
  };

  const loadGltf = async (
    url: string,
    position = { x: Math.random() * 200, y: 0, z: 0 },
    scale = { x: 50, y: 50, z: 50 }
  ) => {
    const scene = SceneUtil.getScene();
    const gltfLoader = new GLTFLoader();
    const mesh = await gltfLoader.loadAsync(url).catch(() => undefined);
    if (!mesh) {
      return;
    }
    mesh.scene.scale.set(scale.x, scale.y, scale.z);
    mesh.scene.position.set(position.x, position.y, position.z);
    scene.add(mesh.scene);
  };

  const add3DModel = async () => {
    // const mtlLoader = new MTLLoader();
    // const material = await mtlLoader.loadAsync(
    //   'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/trees9.mtl'
    // );
    // const loader = new OBJLoader();
    // loader.setMaterials(material);
    // const scene = SceneUtil.getScene();
    // const mesh = await loader.loadAsync('https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/trees9.obj');
    // scene.add(mesh);
    loadGltf(
      'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/ChannelledLand.gltf',
      {
        x: 0,
        y: 0,
        z: 0,
      },
      {
        x: 0.05,
        y: 0.05,
        z: 0.05,
      }
    );
    for (let index = 0; index < 5; index++) {
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/flowers0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/tree0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/stone0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/Weed0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/weedplant0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/bush0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/flowerKrokus0${index + 1}.gltf`);
      loadGltf(`https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/flowertulipan0${index + 1}.gltf`);
    }
  };

  return (
    <div className="left-panel">
      <div className="material">
        {Object.keys(images).map(key => (
          <div
            key={key}
            className="img-list"
            onPointerDown={pointerDownHandler(images[key], key)}
            onPointerMove={pointerMoveHandler}
          >
            <span>{key}</span>
            <img draggable={false} alt={key} title={key} src={images[key]} width={60} height={60} />
          </div>
        ))}
      </div>
      <div>
        {/* <Button type="primary" className="op" onClick={swipeScene('bottom')}>切换场景下</Button>
        <Button type="primary" className="op" onClick={swipeScene('top')}>切换场景上</Button> */}
        <Button type="primary" className="op" onClick={addBufferGeometry}>
          添加BufferGeometry
        </Button>
        <Button type="primary" className="op" onClick={setBackground}>
          设为背景
        </Button>
        <Button type="primary" className="op" onClick={showSkyBox}>
          展示天空盒
        </Button>
        <Button type="primary" className="op" onClick={addCube}>
          添加立方体
        </Button>
        <Button type="primary" className="op" onClick={add3DModel}>
          添加3D模型
        </Button>
        <Button type="primary" className="op" onClick={deleteModel}>
          删除选中模型
        </Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.TOP)}>
          置顶
        </Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.INCREASE)}>
          上移
        </Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.DECREASE)}>
          下移
        </Button>
        <Button type="primary" className="op" onClick={updateZ(Z_INDEX_ACTION.BOTTOM)}>
          置底
        </Button>
        <Button type="primary" className="op" onClick={mirror(MIRROR_ACTION.LEFT_RIGHT)}>
          左右镜像
        </Button>
        <Button type="primary" className="op" onClick={mirror(MIRROR_ACTION.TOP_BOTTOM)}>
          上下镜像
        </Button>
        <Button type="primary" className="op" onClick={skew}>
          形变
        </Button>
        <Button type="primary" className="op" onClick={confirmSkew}>
          确定形变
        </Button>
        <Button type="primary" className="op" onClick={cancelSkew}>
          取消形变
        </Button>
        <Button type="primary" className="op" onClick={clip}>
          裁剪
        </Button>
        <Button type="primary" className="op" onClick={confirmClip}>
          确定裁剪
        </Button>
        <Button type="primary" className="op" onClick={cancelClip}>
          取消裁剪
        </Button>
        <Button type="primary" className="op" onClick={copy}>
          复制
        </Button>
        <Button type="primary" className="op" onClick={lockCamera}>
          相机锁定/解锁
        </Button>
        <Button type="primary" className="op" onClick={lock}>
          锁定/解锁
        </Button>
        <Button type="primary" className="op" onClick={replace}>
          替换
        </Button>
        <Button type="primary" className="op" onClick={group}>
          组合/解组
        </Button>
        <Button type="primary" className="op" onClick={align('top')}>
          顶部对齐
        </Button>
        <Button type="primary" className="op" onClick={align('middle')}>
          中部对齐
        </Button>
        <Button type="primary" className="op" onClick={align('bottom')}>
          底部对齐
        </Button>
        <Slider defaultValue={1} min={0.1} max={2.8} step={0.1} onChange={scaleScene} />
        <Button type="primary" className="op" onClick={undoHandler}>
          Undo
        </Button>
        <Button type="primary" className="op" onClick={redoHandler}>
          Redo
        </Button>
        <Button type="primary" className="op" onClick={save}>
          保存
        </Button>
        <Button type="primary" className="op" onClick={load}>
          加载
        </Button>
        <Input onChange={loadUrlChange} />
        <Button type="primary" className="op" onClick={screenShot}>
          截图
        </Button>
        <Button type="primary" className="op" onClick={generateThumbnail}>
          生成缩略图
        </Button>
        <Button type="primary" className="op" onClick={exportPDF}>
          导出pdf
        </Button>
        <Button type="primary" className="op" onClick={renderFlag}>
          renderFlag3d
        </Button>
        <Button type="primary" className="op" onClick={renderFlag2d}>
          renderFlag2d
        </Button>
      </div>
    </div>
  );
}
