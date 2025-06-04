import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MinMaxGUIHelper } from './MinMaxGUIHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Oshawott } from './Oshawott.js';
import { Lillipup } from './Lillipup.js';
import { Stadium } from './Stadium.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function main() {
  	const canvas = document.querySelector( '#webgl' );
  	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 100; // Setting up camera
	const aspect = 1; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.y = 5;
	camera.position.z = 8;

	const controls = new OrbitControls( camera, canvas );

	const gui = new GUI();
	gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
	const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
	gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
	gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);

	const myObject = {
		myBoolean: true
	}
	gui.add(myObject, 'myBoolean').onChange(value => {
		console.log(value);
	});

	{
		const skyBoxLoader = new THREE.CubeTextureLoader();
		const background = skyBoxLoader.load([
			'assets/grass.png',
			'assets/grass.png',
			'assets/grass.png',
			'assets/grass.png',
			'assets/grass.png',
			'assets/grass.png',
		])
		scene.background = background;
	}

	let rock;
	let windmill;
	let land = [];

	loadWaterStadium();


	makeInstance(new THREE.BoxGeometry(0.5, 0.5, 0.5), 0xffff00, 0, 5, 1); // Light

	addEventListener('keypress', event => {
		if (event.code == 'KeyR'){
			unloadWaterStadium();
		}
		if (event.code == 'KeyT') {
			loadWaterStadium();
		}
	});

	

	const p1 = new Oshawott(scene);
	const p2 = new Lillipup(scene);
	const stadium = new Stadium(scene);

	const color = 0xFFFFFF; // Lighting
	const intensity = 1;
	const ambient = new THREE.AmbientLight(color, intensity);
	const directional = new THREE.DirectionalLight(color, 3);
	const spotlight = new THREE.SpotLight(color, 15);
	directional.position.set(0, 1, 10);
	scene.add(ambient);
	scene.add(directional);
	scene.add(spotlight);

	renderer.render( scene, camera );

	function render(time) {
		time *= 0.001;

		p1.render(time);
		p2.render(time);
		renderer.render(scene, camera);
		requestAnimationFrame(render);
		/*for (var attack of p1.attacks) {
			let a = attack.projectile; // alias
			a.position.x += 0.1 * attack.direction.x;
			a.position.z += 0.1 * attack.direction.y;
			if (a.position.x > 15) {
				a.visible = false;
				a.geometry.dispose();
				a.material.dispose();
				scene.remove(a);
			}
			if (collides(a, p2.head)) {
				p2.knockback(p1.direction.x, p1.direction.y);
				a.visible = false;
				a.geometry.dispose();
				a.material.dispose();
				scene.remove(a);
			}
		}
		if ((collides(p1.head, p2.head)) && (p1.tackle)) {
			p2.knockback();
			p1.tackle = false;
		} else if (collides(p1.head, p2.head)){
			for (let body of p1.oshawott) {
				body.position.x -= 1;
			}
		}*/
	}

	function makeInstance(geometry, color, x, y, z) {
		const material = new THREE.MeshPhongMaterial({color});
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
		cube.position.x = x;
		cube.position.y = y;
		cube.position.z = z;
		return cube;
	}
	requestAnimationFrame(render);

	function updateCamera() {
		camera.updateProjectionMatrix();
	}

	function collides(a, b) {
		if (Math.abs(a.position.x - b.position.x) > (1/8 + 1/2)) return false;
        if (Math.abs(a.position.y - b.position.y) > (1/8 + 1/2)) return false;
		if (Math.abs(a.position.z - b.position.z) > (1/8 + 1/2)) return false;
        return true;
	}

	function p1Tackle() {
		console.log("p1Tackle");
	}

	function loadWaterStadium() {
		const gltfLoader = new GLTFLoader();
		gltfLoader.load(
			'assets/Rock.glb',
			function(gltf) {
				rock = gltf.scene;
				gltf.scene.scale.x = 8;
				gltf.scene.scale.y = 8;
				gltf.scene.scale.z = 8;
				gltf.scene.position.x += 4;
				gltf.scene.position.z -= 2;
				scene.add(gltf.scene);
				gltf.animations;
				gltf.scene;
				gltf.scenes;
				gltf.cameras;
				gltf.asset;
			}
		)

		gltfLoader.load(
			'assets/Windmill.glb',
			function(gltf) {
				windmill = gltf.scene;
				gltf.scene.scale.x = 3.5;
				gltf.scene.scale.y = 3.5;
				gltf.scene.scale.z = 3.5;
				gltf.scene.position.x += -5;
				gltf.scene.position.y += 3.5;
				gltf.scene.position.z -= 2;
				scene.add(gltf.scene);
				gltf.animations;
				gltf.scene;
				gltf.scenes;
				gltf.cameras;
				gltf.asset;
			}
		)
		// Land
        land.push(makeInstance(new THREE.BoxGeometry(6, 0.75, 5), 0x00ff00, 4.5, -0.5, -1));
        land.push(makeInstance(new THREE.BoxGeometry(7, 0.75, 3), 0x00ff00, -4, -0.5, -2));
        land.push(makeInstance(new THREE.BoxGeometry(4, 0.75, 3), 0x00ff00, -5.5, -0.5, 1));
        land.push(makeInstance(new THREE.BoxGeometry(5, 0.75, 4), 0xffff00, -1, -1, -1.5));
        // Water
        land.push(makeInstance(new THREE.BoxGeometry(16, 0.5, 8), 0x0000ff, 0, -1, 0));
	}

	function unloadWaterStadium() {
		scene.remove(windmill);
		scene.remove(rock);
		for (var obj of land) {
			obj.geometry.dispose();
			obj.material.dispose();
			scene.remove(obj);
		}
		land = [];
	}
}

main();