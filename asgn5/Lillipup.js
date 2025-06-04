import * as THREE from "three";

class Lillipup {
    constructor(game) {
        this.scene = game;

        this.body = this.makeInstance(new THREE.BoxGeometry(1.5, 0.8, 0.9), 0xDA9B70  , 4, 2, 1);
        this.head = this.makeInstance(new THREE.BoxGeometry(0.75, 0.88, 0.99), 0xF6DD9D , 3.4, 2.5, 1);
        this.thingy = this.makeInstance(new THREE.BoxGeometry(0.5, 0.4, 0.95), 0x383C5A , 4.0, 2.3, 1);
        this.tail = this.makeInstance(new THREE.BoxGeometry(0.5, 0.3, 0.3), 0xAB7455 , 4.9, 2.05, 1);
        this.lHorn = this.makeInstance(new THREE.BoxGeometry(0.3, 0.6, 0.3), 0xAB7455 , 3.4, 3, 1.5);
        this.rHorn = this.makeInstance(new THREE.BoxGeometry(0.3, 0.6, 0.3), 0xAB7455 , 3.4, 3, 0.5);
        this.lLeg = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0xAB7455, 3.5, 1.5, 1.25);
        this.lLeg_ = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0xAB7455, 3.5, 1.5, 0.75);
        this.rLeg = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0xAB7455, 4.5, 1.5, 1.25);
        this.rLeg_ = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0xAB7455, 4.5, 1.5, 0.75);

        this.lillipup = [this.body, this.head, this.thingy, this.lHorn, this.rHorn, this.tail, this.lLeg, this.lLeg_, this.rLeg, this.rLeg_];

        this.direction = new THREE.Vector2(1, 0);

        this.tackle = false;

        addEventListener('keydown', event => {
        if (event.code == 'ArrowUp') {
            this.direction.set(0, -1);
            this.movementHandler();
        }
        if (event.code == 'ArrowDown') {
            this.direction.set(0, 1);
            this.movementHandler();
        }
        if (event.code == 'ArrowLeft') {
            this.direction.set(-1, 0);
            this.movementHandler();
        }
        if (event.code == 'ArrowRight') {
            this.direction.set(1, 0);
            this.movementHandler();
        }
        if (event.code == 'ShiftRight') {
            for (let body of this.lillipup) {
                body.position.y += 2.5;
            }
        }
        if (event.code == 'Period') {
            if (this.moveRaycaster.intersectObjects(this.scene.children).length == 0) {
                for (let body of this.lillipup) {
                    body.position.x -= 1;
                    this.tackle = true;
                }
            }
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
        this.tail.rotation.y = 10 * Math.sin(10 * time) * (Math.PI / 180);
        if (this.raycaster.intersectObjects(this.scene.children).length == 0) {
            for (let body of this.lillipup) {
                body.position.y -= 0.05;
            }
        }
        /*if (this.head.position.y >= -0.5) {
            this.head.position.y -= 0.1;
        }*/
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
            for (let body of this.lillipup) {
                body.position.x += this.direction.x;
                body.position.z += this.direction.y;
            }
        }
        this.raycaster.ray.origin = this.lLeg.position;
        this.moveRaycaster.ray.origin = new THREE.Vector3(this.body.position.x, this.lLeg.position.y, this.body.position.z);
    }

    knockback(x, y) {
        for (let body of this.lillipup) {
            body.position.x += x;
            body.position.y += 2;
            body.position.z += y;
        }
    }
}

export {Lillipup}
