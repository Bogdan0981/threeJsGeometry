import * as THREE from "three";

import TWEEN from "three/examples/jsm/libs/tween.module";

import init from "./init";

import "./style.css";

const { sizes, camera, scene, canvas, controls, renderer } = init();

camera.position.z = 30;

/* const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
	color: 'gray',
	wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh); */

const group = new THREE.Group();

const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.ConeGeometry(1, 2, 32, 1),
  new THREE.RingGeometry(0.5, 1, 16),
  new THREE.TorusGeometry(1, 0.5, 16, 100),
  new THREE.DodecahedronGeometry(1, 0),
  new THREE.SphereGeometry(1, 32, 16),
  new THREE.TorusKnotGeometry(1, 0.25, 100, 16, 1, 5),
  new THREE.OctahedronGeometry(1, 0),
  new THREE.CylinderGeometry(0.5, 1, 2, 16, 4),
];

let index = 0;
let activeIndex = -1;

for (let i = -5; i <= 5; i += 5) {
  for (let g = -5; g <= 5; g += 5) {
    const material = new THREE.MeshBasicMaterial({
      color: "gray",
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometries[index], material);
    mesh.position.set(i, g, 10);
    mesh.index = index;
    mesh.basPosition = new THREE.Vector3(i, g, 10);
    group.add(mesh);
    index++;
  }
}
scene.add(group);

const resecActive = () => {
  group.children[activeIndex].material.color.set("grey");
  new TWEEN.Tween(group.children[activeIndex].position)
    .to(
      {
        x: group.children[activeIndex].basPosition.x,
        y: group.children[activeIndex].basPosition.y,
        z: group.children[activeIndex].basPosition.z,
      },
      Math.random() * 1000 + 1000
    )
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();
  activeIndex = -1;
};

const clock = new THREE.Clock();

const tick = () => {
  const delta = clock.getDelta();

  if (activeIndex !== -1) {
    group.children[activeIndex].rotation.y += delta * 0.5;
  }
  controls.update();
  TWEEN.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();

const raycaster = new THREE.Raycaster();

const hendleClick = (event) => {
  const pointer = new THREE.Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const interSections = raycaster.intersectObjects(group.children);

  if (activeIndex !== -1) {
    resecActive();
  }

  for (let i = 0; i < interSections.length; i += 1) {
    interSections[i].object.material.color.set("purple");
    activeIndex = interSections[i].object.index;

    new TWEEN.Tween(interSections[i].object.position)
      .to(
        {
          x: 0,
          y: 0,
          z: 25,
        },
        Math.random() * 1000 + 1000
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }
};

window.addEventListener("click", hendleClick);

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener("resize", () => {
  // Обновляем размеры
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Обновляем соотношение сторон камеры
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Обновляем renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
