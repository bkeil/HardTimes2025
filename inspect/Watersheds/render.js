import * as THREE from "three";
import { DiamondSquare } from "./diamond_square.js";
import { Simplex } from "./simplex.js";

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

class Terrain {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.geometry = new THREE.PlaneBufferGeometry(
            width,
            height,
            width - 1,
            height - 1
        );
        let rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
        this.geometry.applyMatrix(rotation);
        this.array = this.geometry.attributes.position.array;
        this.mesh = null;
    }

    build() {
        this.geometry.computeBoundingSphere();
        this.geometry.computeVertexNormals();
        this.material = new THREE.MeshLambertMaterial({});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.x = this.width / 2;
        this.mesh.position.z = this.height / 2;
        return this.mesh;
    }
}

class App {
    constructor() {
        // Grab window properties
        let width = window.innerWidth;
        let height = window.innerHeight;
        let pixelRatio = window.devicePixelRatio;
        let aspect = width / height;
        // Setup three.js
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 1500);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);
        // Catch resize events
        window.onresize = (evt) => {
            this.resize(window.innerWidth, window.innerHeight);
        };
    }

    /* Resize viewport */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /* Start the main loop */
    start() {
        this.loop();
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.update();
        this.render();
    }

    update() {
        // Just spin in circles for now
        this.camera.rotation.y += 0.001;
    }

    render() {
        let scene = this.scene;
        let camera = this.camera;
        let renderer = this.renderer;
        renderer.render(scene, camera);
    }
}

window.onload = function () {
    let app = new App();

    // Let there be light
    let light = new THREE.DirectionalLight(0xe0e0e0);
    light.position.set(1, 1, 0).normalize();
    app.scene.add(light);

    let terrain = new Terrain(1024, 1024);
    // Fill terrain with noise
    console.log("array length", terrain.array.length);
    // let noise = DiamondSquare(
    //     terrain.width,
    //     terrain.height,
    //     1,
    //     64,
    //     1,
    //     256,
    //     false
    // );
    let noise = Simplex(terrain.height, terrain.width, 2, 192, 5, 256, true);
    for (let row = 0; row < terrain.height; ++row) {
        for (let col = 0; col < terrain.width; ++col) {
            terrain.array[3 * (row * terrain.width + col) + 1] =
                noise[row][col] / 256;
        }
    }
    app.scene.add(terrain.build());

    // Position camera
    let camera = app.camera;
    camera.position.x = terrain.width / 2;
    camera.position.y = 50;
    camera.position.z = terrain.height / 2;

    terrain.mesh.scale.y = 50;

    app.start();
};
