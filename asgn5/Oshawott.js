import * as THREE from "three";
import { Bubble } from './Bubble.js';

class Oshawott {
    constructor(game) {
        this.scene = game;
        this.asdf = new Bubble(game);

        // < X- X+> (x, z)
        // ^ Z- Z+ v
        this.direction = new THREE.Vector2(1, 0);

        // Swap x and z
        this.body = this.makeInstance(new THREE.BoxGeometry(0.5, 0.8, 0.7), 0xd3d3d3, -4, 2, 0);
        this.neck = this.makeInstance(new THREE.BoxGeometry(0.85, 0.24, 0.98), 0xffffff, -4, 2.3, 0);
        this.head = this.makeInstance(new THREE.BoxGeometry(0.75, 0.7, 0.91), 0x0000ff, -4, 2.56, 0);
        this.tail = this.makeInstance(new THREE.BoxGeometry(0.6, 0.08, 0.35), 0xff0000, -4.5, 1.8, 0);
        this.lLeg = this.makeInstance(new THREE.BoxGeometry(0.4, 0.16, 0.2), 0x00ffff, -3.8, 1.52, 0.3);
        //this.lLeg.rotation.y = -0.3;
        this.rLeg = this.makeInstance(new THREE.BoxGeometry(0.4, 0.16, 0.2), 0x00ffff, -3.8, 1.52, -0.3);
        //this.rLeg.rotation.y = 0.3;

        this.oshawott = [this.body, this.neck, this.head, this.tail, this.lLeg, this.rLeg];
        
        this.attacks = [];

        this.tackle = false;

        addEventListener('keypress', event => {
            if (event.code == 'KeyW') {
                this.direction.set(0, -1);
                this.movementHandler();
            }
            if (event.code == 'KeyS') {
                this.direction.set(0, 1);
                this.movementHandler();
            }
            if (event.code == 'KeyA') {
                this.direction.set(-1, 0);
                this.movementHandler();
            }
            if (event.code == 'KeyD') {
                this.direction.set(1, 0);
                this.movementHandler();
            }
            if (event.code == 'Space') {
                for (let body of this.oshawott) {
                    body.position.y += 5;
                }
            }
            if (event.code == 'Digit1') {
                for (let body of this.oshawott) {
                    body.position.x += 1;
                    this.tackle = true;
                }
            }
            if (event.code == 'Digit2') {
                this.attacks.push(new Bubble(this.makeInstance(new THREE.BoxGeometry(0.25, 0.25, 0.25), 0xff00ff, 
                this.head.position.x + this.direction.x, this.head.position.y, this.head.position.z + this.direction.y), new THREE.Vector2(this.direction.x, this.direction.y)));
            }
        });

        const origin = this.lLeg.position;
        const direction = new THREE.Vector3(0, -1, 0);
        this.raycaster = new THREE.Raycaster(origin, direction, 0, 0.2);
    }

    render(time) {
        if (this.raycaster.intersectObjects(this.scene.children).length == 0) {
            for (let body of this.oshawott) {
                body.position.y -= 0.1;
            }
        }
        //this.attacks = this.attacks.filter((attack) => attack.visible);
    }

    makeInstance(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        return cube;
    }
    movementHandler() {
        for (let body of this.oshawott) {
            body.position.x += this.direction.x;
            body.position.z += this.direction.y;
        }
        this.raycaster.origin = this.lLeg.position;
    }
}

export {Oshawott}
