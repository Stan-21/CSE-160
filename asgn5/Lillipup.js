import * as THREE from "three";

class Lillipup {
    constructor(game) {
        this.scene = game;
        this.body = this.makeInstance(new THREE.BoxGeometry(1.5, 0.8, 0.9), 0xff0000, 4, 2, 0);
        this.head = this.makeInstance(new THREE.BoxGeometry(0.75, 0.88, 0.99), 0xd3d3d3, 3.4, 2.5, 0);
        this.thingy = this.makeInstance(new THREE.BoxGeometry(0.5, 0.4, 0.95), 0x00ff00, 4.0, 2.3, 0);
        this.tail = this.makeInstance(new THREE.BoxGeometry(0.5, 0.3, 0.3), 0x00ff00, 5, 2.05, 0);
        this.lLeg = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0x0000ff, 3.5, 1.5, 0.25);
        this.lLeg_ = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0x0000ff, 3.5, 1.5, -0.25);
        this.rLeg = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0x0000ff, 4.5, 1.5, 0.25);
        this.rLeg_ = this.makeInstance(new THREE.BoxGeometry(0.25, 0.5, 0.25), 0x0000ff, 4.5, 1.5, -0.25);

        this.lillipup = [this.body, this.head, this.thingy, this.tail, this.lLeg, this.lLeg_, this.rLeg, this.rLeg_];

        this.direction = new THREE.Vector2(1, 0);

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
                body.position.y += 5;
            }
        }
        });

        const origin = this.lLeg.position;
        const direction = new THREE.Vector3(0, -1, 0);
        this.raycaster = new THREE.Raycaster(origin, direction, 0, 0.2);
    }

    render(time) {
        if (this.raycaster.intersectObjects(this.scene.children).length == 0) {
            for (let body of this.lillipup) {
                body.position.y -= 0.1;
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
        for (let body of this.lillipup) {
            body.position.x += this.direction.x;
            body.position.z += this.direction.y;
        }
        this.raycaster.origin = this.lLeg.position;
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
