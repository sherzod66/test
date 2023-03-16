//import { OrbitControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
let renderer;
let sceneElements = [];

function main() {
	const canvas = document.createElement('canvas');
	renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setScissorTest(true);
	addSceneToDivs();
	requestAnimationFrame(animate);
}

function addSceneToDivs() {
	// add all white scenes
	const whiteSceneDivs = document.querySelectorAll('.white-drawing');
	const whiteSceneEnteries = whiteSceneDivs.entries();
	for (const [index, drawingElement] of whiteSceneEnteries) {
		drawingElement.setAttribute('number', index);
		createSceneFor(drawingElement, index, true);

	}

	// add all black scenes
	const blackSceneDivs = document.querySelectorAll('.black-drawing');
	const blackSceneEnteries = blackSceneDivs.entries();
	for (const [index, drawingElement] of blackSceneEnteries) {
		drawingElement.setAttribute('number', index + 5);
		createSceneFor(drawingElement, index, false);

	}

}

function createSceneFor(htmlElement, index, isWhiteScene) {

	const animateFunc = createSceneAndGetAnimateFunction(htmlElement, index);
	addScene(htmlElement, animateFunc);

	function createSceneAndGetAnimateFunction(elem, index) {
		const { scene, camera } = getSceneCamera(elem);

		const pos_factor = 100 * index + 1000;

		const cameraZ = pos_factor + 6.5;
		camera.position.set(pos_factor, 0, cameraZ);
		camera.oldX = pos_factor;
		camera.oldZ = pos_factor + 10;

		const geometry = new THREE.BoxGeometry(2, 2, 2);
		const material = new THREE.MeshNormalMaterial();

		const cube = new THREE.Mesh(geometry, material);
		cube.position.set(pos_factor, 0, pos_factor);
		scene.add(cube);

		return (time, rect, number) => {
			console.log('rendering : ', number);
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			camera.aspect = rect.width / rect.height;
			camera.updateProjectionMatrix();
			renderer.render(scene, camera);
		};

	}

	function getSceneCamera(elem) {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(60,
			2,
			0.1,
			50);
		scene.add(camera);

		return { scene, camera };
	}

}

function addScene(elem, fn) {
	const canvasForScene = document.createElement('canvas');
	const ctx = canvasForScene.getContext('2d');
	elem.appendChild(ctx.canvas);
	sceneElements.push({ elem, ctx, fn });
}

function animate(time) {
	time *= 0.001;
	for (const { elem, ctx, fn } of sceneElements) {
		const rect = elem.getBoundingClientRect();
		rect.width = Math.round(rect.width);
		const { left, right, top, bottom, width, height } = rect;
		const rendererCanvas = renderer.domElement;

		const isOffscreen =
			(bottom <= 0 ||
				top >= window.innerHeight ||
				right <= 0 ||
				left >= window.innerWidth);

		if (!isOffscreen) {
			if (rendererCanvas.width < width || rendererCanvas.height < height) {
				renderer.setSize(width, height, false);
			}
			if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
				ctx.canvas.width = width;
				ctx.canvas.height = height;
			}
			renderer.setScissor(0, 0, width, height);
			renderer.setViewport(0, 0, width, height);

			const number = elem.getAttribute('number');
			ctx.globalCompositeOperation = 'copy';
			fn(time, rect, number);
			ctx.drawImage(
				rendererCanvas,
				0, rendererCanvas.height - height, width, height,  // src rect
				0, 0, width, height);

		}

	}
	requestAnimationFrame(animate);

}

main();