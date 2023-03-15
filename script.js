import { OrbitControls } from 'https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

/**
  * Generate a scene object with a background color
  **/

function getScene() {
	var scene = new THREE.Scene();
	scene.background = new THREE.Color(0x111111);
	return scene;
}

/**
  * Generate the camera to be used in the scene. Camera args:
  *   [0] field of view: identifies the portion of the scene
  *     visible at any time (in degrees)
  *   [1] aspect ratio: identifies the aspect ratio of the
  *     scene in width/height
  *   [2] near clipping plane: objects closer than the near
  *     clipping plane are culled from the scene
  *   [3] far clipping plane: objects farther than the far
  *     clipping plane are culled from the scene
  **/

function getCamera() {
	var aspectRatio = window.innerWidth / window.innerHeight;
	var camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
	camera.position.set(0, 150, 400);
	camera.lookAt(scene.position);
	return camera;
}

/**
  * Generate the light to be used in the scene. Light args:
  *   [0]: Hexadecimal color of the light
  *   [1]: Numeric value of the light's strength/intensity
  *   [2]: The distance from the light where the intensity is 0
  * @param {obj} scene: the current scene object
  **/

function getLight(scene) {
	var lights = [];
	lights[0] = new THREE.PointLight(0xffffff, 0.6, 0);
	lights[0].position.set(100, 200, 100);
	scene.add(lights[0]);

	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);
	return light;
}

/**
  * Generate the renderer to be used in the scene
  **/

function getRenderer() {
	// Create the canvas with a renderer
	var renderer = new THREE.WebGLRenderer({ antialias: true });
	// Add support for retina displays
	renderer.setPixelRatio(window.devicePixelRatio);
	// Specify the size of the canvas
	renderer.setSize(window.innerWidth, window.innerHeight);
	// Add the canvas to the DOM
	document.body.appendChild(renderer.domElement);
	return renderer;
}

/**
  * Generate the controls to be used in the scene
  * @param {obj} camera: the three.js camera for the scene
  * @param {obj} renderer: the three.js renderer for the scene
  **/

function getControls(camera, renderer) {
	var controls = new OrbitControls(camera, renderer.domElement);
	controls.update()
	return controls;
}

/**
  * Get grass
  **/

function getPlane(scene, loader) {
	var texture = loader.load('grass.jpg');
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(10, 10);
	var material = new THREE.MeshBasicMaterial({
		map: texture, side: THREE.DoubleSide
	});
	var geometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var plane = new THREE.Mesh(geometry, material);
	plane.position.y = -0.5;
	plane.rotation.x = Math.PI / 2;
	scene.add(plane);
	return plane;
}

/**
  * Add background
  **/

function getBackground(scene, loader) {
	var imagePrefix = '';
	var directions = ['right', 'left', 'top', 'bottom', 'front', 'back'];
	var imageSuffix = '.bmp';
	var geometry = new THREE.BoxGeometry(1000, 1000, 1000);

	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push(new THREE.MeshBasicMaterial({
			map: loader.load(imagePrefix + directions[i] + imageSuffix),
			side: THREE.BackSide
		}));
	var sky = new THREE.Mesh(geometry, materialArray);
	scene.add(sky);
}

/**
  * Add a character
  **/

function getSphere(scene) {
	var geometry = new THREE.SphereGeometry(30, 12, 9);
	var material = new THREE.MeshPhongMaterial({
		color: 0xd0901d,
		emissive: 0xaf752a,
		side: THREE.DoubleSide,
		flatShading: true
	});
	var sphere = new THREE.Mesh(geometry, material);

	// create a group for translations and rotations
	var sphereGroup = new THREE.Group();
	sphereGroup.add(sphere)

	sphereGroup.position.set(0, 24, 100);
	scene.add(sphereGroup);
	return [sphere, sphereGroup];
}

/**
  * Store all currently pressed keys
  **/

function addListeners() {
	window.addEventListener('keydown', function (e) {
		pressed[e.key.toUpperCase()] = true;
	})
	window.addEventListener('keyup', function (e) {
		pressed[e.key.toUpperCase()] = false;
	})
}

/**
 * Update the sphere's position
 **/

function moveSphere() {
	var delta = clock.getDelta(); // seconds
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta; // pi/2 radians (90 deg) per sec

	// move forwards/backwards/left/right
	if (pressed['W']) {
		sphere.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle)
		sphereGroup.translateZ(-moveDistance);
	}
	if (pressed['S'])
		sphereGroup.translateZ(moveDistance);
	if (pressed['Q'])
		sphereGroup.translateX(-moveDistance);
	if (pressed['E'])
		sphereGroup.translateX(moveDistance);

	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
	if (pressed['A'])
		sphereGroup.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle);
	if (pressed['D'])
		sphereGroup.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
	if (pressed['R'])
		sphereGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle);
	if (pressed['F'])
		sphereGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle);
}

/**
  * Follow the sphere
  **/

function moveCamera() {
	var relativeCameraOffset = new THREE.Vector3(0, 50, 200);
	var cameraOffset = relativeCameraOffset.applyMatrix4(sphereGroup.matrixWorld);
	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;
	camera.lookAt(sphereGroup.position);
}

// Render loop
function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	moveSphere();
	moveCamera();
};

// state
var pressed = {};
var clock = new THREE.Clock();

// globals
var scene = getScene();
var camera = getCamera();
var light = getLight(scene);
var renderer = getRenderer();

// add meshes
var loader = new THREE.TextureLoader();
var floor = getPlane(scene, loader);
var background = getBackground(scene, loader);
var sphereData = getSphere(scene);
var sphere = sphereData[0];
var sphereGroup = sphereData[1];

addListeners();
render();