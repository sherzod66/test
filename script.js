import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.145.0/examples/jsm/loaders/GLTFLoader.js'
const donut = new URL('../model/ponchik.glb', import.meta.url);
//const plane = new URL('../model/plane.glb', import.meta.url);


const renderer = new THREE.WebGLRenderer({ antialias: true, optimization: true });

renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
secondElem.append(renderer.domElement);
renderer.setClearColor(0xff00bf)
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	50, window.innerWidth / window.innerHeight, 0.1, 1000
);

const assetsLoader = new GLTFLoader();

let model = null;
assetsLoader.load(donut.href, function (gltf) {
	model = gltf.scene;
	model.scale.set(2, 2, 2)
	scene.add(model);

	model.traverse(function (node) {
		if (node.isMesh) {
			node.castShadow = true
		}
	});
}, undefined, function (error) {
	console.log(error);
}
);
/*assetsLoader.load(plane.href, function (gltf) {
	const plane = gltf.scene;
	scene.add(plane);
	plane.position.set(0, 0, 0);
	plane.receiveShadow = true
}, undefined, function (error) {
	console.log(error);
}
);*/

const planeG = new THREE.PlaneGeometry(10, 10);
const planeM = new THREE.MeshStandardMaterial({
	color: 0xff00bf,
	side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeG, planeM);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const abientLight = new THREE.AmbientLight(0x333333);
scene.add(abientLight)

const pointLight = new THREE.PointLight(0xffffff, 1, 300)
scene.add(pointLight);
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.set(-0.5, 1, 0.5);
pointLight.castShadow = true;

camera.position.set(0.15, 0.29, 0.42);
/*
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();*/
/*
const mousePosition = { x: 0, y: 0 }

window.addEventListener('mousemove', event => {
	mousePosition.x = event.clientX / secondElem.clientWidth - 0.5;
	mousePosition.y = event.clientY / secondElem.clientHeight;

})
*/

function animate(time) {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	if (model) {
		model.rotation.y = time / 4000;
	}
}
animate();

window.addEventListener('resize', event => {
	camera.aspect = secondElem.clientWidth / secondElem.clientHeight;
	camera.updateProjectionMatrix()
	renderer.setSize(secondElem.clientWidth, secondElem.clientHeight);
});
