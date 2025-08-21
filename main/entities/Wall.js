import * as THREE from 'three';
import { setDefaultMaterial } from '../../libs/util/util.js';

export class Wall {
    constructor(width, height, depth, position, direction) {
        this.width = width;
        this.height = height,
        this.depth = depth;
        this.position = position;
        this.direction = direction;
        this.createTHREEObject();
    }

    getTHREEObject() {
        return this.box;
    }

    createTHREEObject() {
        this.boxGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        this.boxMaterial =  new THREE.MeshLambertMaterial({color:"gray"});
        this.box = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.box.position.copy(this.position);

        this.boundingBox = new THREE.Box3().setFromObject(this.box);
    }

    getBoundingBox() {
        return this.boundingBox;
    }

    static createLeftWall() {
        return new Wall(2, 2, 100, new THREE.Vector3(-24, 1, 0), 'left');
    }

    static createRightWall() {
        return new Wall(2, 2, 100, new THREE.Vector3(24, 1, 0), 'right');
    }

    static createTopWall() {
        return new Wall(50, 2, 2, new THREE.Vector3(0, 1, -49), 'top');
    }

    static createBottomWall() {
        return new Wall(50, 2, 2, new THREE.Vector3(0, 1, 51), 'bottom')
    }

    collisionBottomWall(ball) {
        if (ball.boundingSphere.intersectsBox(this.boundingBox)) {
            return true;
        }
    }
}
