import * as THREE from 'three';

export class Camera {
    constructor() {
        this.initialPosition = new THREE.Vector3(0, 50, 64);

        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.near = 0.1;
        this.far = 500;
        this.fov = 50;

        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, this.near, this.far);
        this.camera.position.copy(this.initialPosition);
        this.camera.lookAt(new THREE.Vector3(0, 0, 19));
        
        this.camera.layers.enable(0);
    }

    getTHREECamera() {
        return this.camera;
    }

    resetCamera() {
        this.camera.position.copy(new THREE.Vector3(0, 50, 64));
        this.camera.lookAt(new THREE.Vector3(0, 0, 19));
    }
}
