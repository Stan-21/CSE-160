import * as THREE from "three";

class Stadium {
    constructor(game) {
        // need to clean this up LOL
        this.scene = game;
        this.makeInstance(new THREE.BoxGeometry( 1, 3, 8 ), 0xd3d3d3, 8, -2, 0);
        this.makeInstance(new THREE.BoxGeometry( 1, 3, 8 ), 0xd3d3d3, -8, -2, 0);
        this.makeInstance(new THREE.BoxGeometry( 16, 3, 1 ), 0xd3d3d3, 0, -2, 4);
        this.makeInstance(new THREE.BoxGeometry( 16, 3, 1 ), 0xd3d3d3, 0, -2, -4);



        /*this.makeInstance(new THREE.BoxGeometry( 0.25, 3, 8 ), 0x000000, 5.5, -2.41, 0);
        this.makeInstance(new THREE.BoxGeometry( 0.25, 3, 8 ), 0x000000, -5.5, -2.41, 0);
        this.makeInstance(new THREE.BoxGeometry( 12, 3, 0.25 ), 0x000000, 0, -2.41, 3.5);
        this.makeInstance(new THREE.BoxGeometry( 12, 3, 0.25 ), 0x000000, 0, -2.41, -3.5);

        this.makeInstance(new THREE.BoxGeometry(1, 3, 1), 0x000000, 5.5, -2.41, 3.5);
        this.makeInstance(new THREE.BoxGeometry(1, 3, 1), 0x000000, -5.5, -2.41, 3.5);
        this.makeInstance(new THREE.BoxGeometry(1, 3, 1), 0x000000, 5.5, -2.41, -3.5);
        this.makeInstance(new THREE.BoxGeometry(1, 3, 1), 0x000000, -5.5, -2.41, -3.5);*/

        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 10, 32), new THREE.MeshPhongMaterial(0xd3d3d3));
        game.add(pipe);
        pipe.position.y -= 7;


        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

        {

            const planeSize = 8;

            const loader = new THREE.TextureLoader();
            const texture = loader.load( 'assets/grass.png' );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            //texture.colorSpace = THREE.SRGBColorSpace;
            const repeats = planeSize / 2;
            texture.repeat.set( repeats, repeats );

            const planeGeo = new THREE.PlaneGeometry( planeSize * 2, planeSize );
            const planeMat = new THREE.MeshPhongMaterial( {
                map: texture,
                side: THREE.DoubleSide,
            } );
            const mesh = new THREE.Mesh( planeGeo, planeMat );
            mesh.rotation.x = Math.PI * - .5;
            mesh.position.y -= 1;
            game.add( mesh );
        }

        const logo_geometry = new THREE.CircleGeometry(2, 32);

        const loader = new THREE.TextureLoader();
        loader.load('assets/stadium_logo.png', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;

        const logo_material = new THREE.MeshPhongMaterial({
            map: texture,
        });

        const logo = new THREE.Mesh(logo_geometry, logo_material);
        logo.position.x = 0;
        logo.position.y = -0.9;
        logo.position.z = 0;
        logo.rotation.x = -Math.PI / 2;
        game.add(logo);
        });

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
}

export {Stadium}