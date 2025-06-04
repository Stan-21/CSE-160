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
        this.body = this.makeInstance(new THREE.BoxGeometry(0.5, 0.8, 0.7), 0x80CEC9, -4, 2, 1);
        this.neck = this.makeInstance(new THREE.BoxGeometry(0.85, 0.24, 0.98), 0x549EAB, -4, 2.3, 1);
        this.head = this.makeInstance(new THREE.BoxGeometry(0.75, 0.8, 0.91), 0xF6F4F1, -4, 2.56, 1);
        this.lHorn = this.makeInstance(new THREE.BoxGeometry(0.6, 0.2, 0.3), 0x3B4D6A, -4, 2.9, 1.45);
        this.rHorn = this.makeInstance(new THREE.BoxGeometry(0.6, 0.2, 0.3), 0x3B4D6A, -4, 2.9, 0.55);
        this.lHorn.rotation.x = 0.6;
        this.rHorn.rotation.x = -0.6;
        this.tail = this.makeInstance(new THREE.BoxGeometry(0.6, 0.08, 0.35), 0x3B4D6A, -4.45, 1.8, 1);
        this.lLeg = this.makeInstance(new THREE.BoxGeometry(0.4, 0.16, 0.2), 0x3B4D6A, -3.8, 1.52, 1.3);
        //this.lLeg.rotation.y = -0.3;
        this.rLeg = this.makeInstance(new THREE.BoxGeometry(0.4, 0.16, 0.2), 0x3B4D6A, -3.8, 1.52, 0.7);
        //this.rLeg.rotation.y = 0.3;

        this.oshawott = [this.body, this.neck, this.head, this.lHorn, this.rHorn, this.tail, this.lLeg, this.rLeg];
        
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
                    body.position.y += 2.5;
                }
            }
            if (event.code == 'Digit1') {
                if (this.moveRaycaster.intersectObjects(this.scene.children).length == 0) {
                    for (let body of this.oshawott) {
                        body.position.x += 1;
                        this.tackle = true;
                    }
                }
            }
            if (event.code == 'Digit2') {
                this.attacks.push(new Bubble(this.makeInstance(new THREE.SphereGeometry(0.1, 32, 16), 0x00ffff,
            this.head.position.x + 1, this.head.position.y, this.head.position.z)));
                //this.attacks.push(new Bubble(this.makeInstance(new THREE.BoxGeometry(0.25, 0.25, 0.25), 0xff00ff, 
                //this.head.position.x + this.direction.x, this.head.position.y, this.head.position.z + this.direction.y), new THREE.Vector2(this.direction.x, this.direction.y)));
            }
        });
        const mOrigin = this.lLeg.position;
        const mDirection = new THREE.Vector3(1, 0, 0);
        this.moveRaycaster = new THREE.Raycaster(mOrigin, mDirection, 0.5, 1.1);

        const origin = this.lLeg.position;
        const direction = new THREE.Vector3(0, -1, 0);
        this.raycaster = new THREE.Raycaster(origin, direction, 0, 0.2);
    }

    render(time) {
        this.tail.rotation.z = 20 * Math.sin(2 * time) * (Math.PI / 180);
        if (this.raycaster.intersectObjects(this.scene.children).length == 0) {
            for (let body of this.oshawott) {
                body.position.y -= 0.05;
            }
        }
        this.attacks = this.attacks.filter((attack) => attack.projectile.visible);
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
        this.moveRaycaster.ray.direction = new THREE.Vector3(this.direction.x, 0, this.direction.y);
        if (this.moveRaycaster.intersectObjects(this.scene.children).length == 0) {
            for (let body of this.oshawott) {
                body.position.x += this.direction.x;
                body.position.z += this.direction.y;
            }
        }
        this.raycaster.ray.origin = this.lLeg.position;
        this.moveRaycaster.ray.origin = new THREE.Vector3(this.body.position.x, this.lLeg.position.y, this.body.position.z);
    }

    knockback(x, y) {
        for (let body of this.oshawott) {
            body.position.x += x;
            body.position.y += 2;
            body.position.z += y;
        }
    }
}

export {Oshawott}
