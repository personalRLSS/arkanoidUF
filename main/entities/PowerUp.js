import * as THREE from 'three';
import { Game } from '../Game.js';
import { Ball } from './Ball.js';

export class PowerUp {
    static lastPowerUpSpawned = null;

    constructor(initialPosition, textureFilePath) {
        this.initialPosition = initialPosition;
        this.textureFilePath = textureFilePath;
        this.direction = new THREE.Vector3(0, 0, 1).normalize();
        this.speed = 0.4;

        this.createTHREEObject();
    }

    createTHREEObject() {
        this.capsuleGeometry = new THREE.CapsuleGeometry(1, 3, 4, 20);
        this.capsuleMaterial = new THREE.MeshLambertMaterial({
            color: "white",
        });
        this.capsule = new THREE.Mesh(this.capsuleGeometry, this.capsuleMaterial);
        this.capsule.castShadow = true;
        this.capsule.receiveShadow = true;
        this.capsule.rotateZ(Math.PI / 2);
        this.capsule.position.copy(this.initialPosition);
        this.addTexture();
        this.boundingBox = new THREE.Box3().setFromObject(this.capsule);
    }

    getTHREEObject() {
        return this.capsule;
    }
    
    move() {
        this.capsule.position.z += this.direction.z * this.speed;
        this.capsule.rotateY(-0.1);        
        this.updateColor();
        this.updateBoundingBox();
        this.collisionsDetection();
    }
    
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.capsule);
    }

    collisionsDetection() {
        this.collectPowerUpWhenCollideHitter();
        this.destroyPowerUpWhenCollideBottomWall();
    }

    collectPowerUpWhenCollideHitter() {
        const isCollidingWithHitter = this.checkCollisionWithHitter();
        if (!isCollidingWithHitter) {
            return;
        }

        var listener = new THREE.AudioListener();
        var sound = new THREE.Audio( listener );  
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load('./main/assets/sounds/bloco3.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setVolume(1);
            sound.play(); 
        });

        this.collect();
    }

    collect() {
        Game.getInstance().deletePowerUp(this);
        this.powerUpAction();
    }

    destroyPowerUpWhenCollideBottomWall() {
        const isCollidingBottomWall = this.checkCollisionWithBottomWall();
        if (!isCollidingBottomWall) {
            return;
        }

        Game.getInstance().deletePowerUp(this);
    }

    checkCollisionWithHitter() {
        return this.boundingBox.intersectsSphere(Game.getInstance().getHitter().getBoundingSphere());
    }

    checkCollisionWithBottomWall() {
        return this.boundingBox.intersectsBox(Game.getInstance().getBottomWall().getBoundingBox());
    }

    static canIncreasePowerUpCounter() {
        return Game.getInstance().balls.length === 1 && !Ball.isDrillMode;
    }

    addTexture() {
        const object = this.getTHREEObject();
        const textureLoader = new THREE.TextureLoader();
        
        object.material.map = textureLoader.load(this.textureFilePath);
        object.material.map.wrapS = THREE.RepeatWrapping;
        object.material.map.wrapT = THREE.RepeatWrapping;
        object.material.map.minFilter = THREE.LinearFilter;
        object.material.map.magFilter = THREE.LinearFilter;
        object.material.map.rotation = -Math.PI / 2;
        object.material.map.repeat.set(9, 1);
    }

    updateColor() {}

    powerUpAction() {}
}