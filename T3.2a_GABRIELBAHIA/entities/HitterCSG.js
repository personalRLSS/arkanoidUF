import { CSG } from '../../libs/other/CSGMesh.js'    
import * as THREE from  'three'; 
import { 
    setDefaultMaterial,
    getMaxSize
} from "../../libs/util/util.js";
import {GLTFLoader} from '../../build/jsm/loaders/GLTFLoader.js';

export class HitterCSG {
    constructor(scene) {
        this.auxMat = new THREE.Matrix4();
        this.material1 = setDefaultMaterial();
        this.cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 16), this.material1)
        this.cylinderMesh = new THREE.Mesh( new THREE.CylinderGeometry(8, 8, 2, 100))
        this.hitterMesh;
        this.csgObject;
        this.cubeCSG;
        this.cylinderCSG;
        
        this.cylinderMesh.position.set(7, -0.1, 0.0)
        this.cylinderMesh.matrixAutoUpdate = false;
        this.cylinderMesh.updateMatrix();
        this.cylinderCSG = CSG.fromMesh(this.cylinderMesh)
        this.cubeCSG = CSG.fromMesh(this.cubeMesh)   
        this.csgObject = this.cubeCSG.intersect(this.cylinderCSG) // Execute intersection

        this.hitterMesh = CSG.toMesh(this.csgObject, this.auxMat)
        this.constructTexture(scene);

        this.hitterMesh.material = new THREE.MeshPhongMaterial({
            color: "#5FA1AD",
            shininess: "10",
            specular: "rgb(255, 255, 255)"
        });

        this.hitterMesh.position.set(0, 0, 2.0)
        this.hitterMesh.rotation.y = Math.PI / -2;
        this.hitterMesh.position.set(0, 1, 40)
        this.hitterMesh.castShadow = true;
        this.hitterMesh.receiveShadow = true;

        this.sphereGeometry = new THREE.SphereGeometry(8, 32, 16);
        this.sphereMaterial = setDefaultMaterial('red');
        this.sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
        this.sphere.position.set(0, 1, 47)
        this.boundingSphere = new THREE.Sphere(new THREE.Vector3().copy(this.sphere.position), 8);
        this.sphere.material.opacity = 0;
        this.sphere.material.transparent = true;

        
        let asset = {
            object: null,
            loaded: false,
            bb: new THREE.Box3()
        }
        this.loadGLBFile(asset, './assets/lego_spacecraft.glb', 8.0, scene);
    }

    loadGLBFile(asset, file, desiredScale, scene)
    {
        let loader = new GLTFLoader( );
        let self = this;
        loader.load( file, function ( gltf ) {
            let obj = gltf.scene;
            obj.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
            });
            obj = self.normalizeAndRescaleAsset(obj, desiredScale);
            obj = self.fixPositionAsset(obj);
            obj.updateMatrixWorld( true )
            scene.add(obj);

            asset.object = gltf.scene;
            self.assetObj = asset.object;
        }, null, null);
    }

    normalizeAndRescaleAsset(obj, newScale)
    {
        var scale = getMaxSize(obj);
        obj.scale.set(newScale * (1.0/scale),
                        newScale * (1.0/scale),
                        newScale * (1.0/scale));
        return obj;
    }

    fixPositionAsset(obj)
    {
        var box = new THREE.Box3().setFromObject( obj );
        obj.rotation.y += Math.PI / 90;
        obj.position.set(0, -8, 47)
        if(box > 0)
            obj.translateY(-box.min.y);
        else
            obj.translateY(-1*box.min.y);
        return obj;
    }

    getPosition() {
        return this.hitterMesh.position;
    }

    getBoundingSphere() {
        return this.boundingSphere;
    }

    move(pointX) {
        this.hitterMesh.position.set(pointX, 1, 40);
        this.sphere.position.set(pointX, 1, 47)
        if(this.assetObj !== undefined) {
            this.assetObj.position.set(pointX, -8, 47)
        }
        if (this.meshTextureTop !== undefined) {
            this.meshTextureTop.position.set(pointX, 2, 40.2);
        }
        if(this.meshTextureBack !== undefined) {
            this.meshTextureBack.position.set(pointX, 1, 42.2)
        }
        this.updateBoundingBox();
    }

    resetPosition() {
       this.hitterMesh.position.set(0, 1, 40)
       this.sphere.position.set(0, 1, 46.5)
       this.updateBoundingBox();
       if(this.assetObj !== undefined) {
            this.assetObj.position.set(0, -8, 47)
        }
        if (this.meshTextureTop !== undefined) {
            this.meshTextureTop.position.set(0, 2, 40.2);
        }
        if(this.meshTextureBack !== undefined) {
            this.meshTextureBack.position.set(0, 1, 42.2)
        }
    }

    updateBoundingBox() {
        this.boundingSphere.center.copy(this.sphere.position);
    }    

      constructTexture(scene) {

        let v = [
            -6.3, -2.0, 0.0, // 0
            -5.5, -1.0, 0.0, // 1
            -4.5, 0.2, 0.0,  // 2 
            -3.0, 0.8, 0.0,  // 3 
            -1.0, 1.5, 0.0, // 4 
            0.0, -2.0, 0.0, // 5 MEIO
            1.0, 1.5, 0.0, // 6 
            3.0, 0.8, 0.0, // 7 
            4.5, 0.2, 0.0, // 8 
            5.5, -1.0, 0.0, // 9
            6.3, -2.0, 0.0, // 10 
            -0,5, 1.5, 0.0,
            0,5, 1.5, 0.0,
        ];

        let f = [
            0, 1, 5,
            1, 2, 5,
            2, 3, 5,
            3, 4, 5,
            4, 6, 5,
            6, 7, 5,
            7, 8, 5,
            8, 9, 5,
            9, 10, 5,
        ];

        const n = v;
        var vertices = new Float32Array(v);
        var normals = new Float32Array(n);
        var indices = new Uint32Array(f);
        let geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();

        let material = new THREE.MeshPhongMaterial({
            color: "gray",
            shininess: "10",
            specular: "rgb(255, 255, 255)"
        });
        material.side = THREE.DoubleSide;
        material.flatShading = true;
        this.meshTextureTop = new THREE.Mesh(geometry, material);
        this.meshTextureTop.rotation.x = Math.PI / -2;
        this.meshTextureTop.position.set(0, 2, 40.2)
        this.meshTextureTop.material.opacity = 0.5
        this.setTexture(this.meshTextureTop);

        let geometry2 = new THREE.BoxGeometry(12.5, 2, 0);
        this.meshTextureBack = new THREE.Mesh(geometry2, material);
        this.meshTextureBack.position.set(0, 1, 42.2)

        scene.add(this.meshTextureBack);
        scene.add(this.meshTextureTop);
    }

    setTexture(mesh) {
        let geometry = mesh.geometry;
        let material = mesh.material;

        var uvCoords = [
            0.0, 0.0,   // 0
            0.2, 0.5,   // 1
            0.4, 0.0,   // 2
            0.6, 0.8,   // 3
            0.8, 0.0,   // 4
            1.0, 1,   // 5 (MEIO)
            0.8, 0.0,   // 6
            0.6, 0.8,   // 7
            0.4, 0.0,   // 8
            0.2, 0.5,
            0.0, 0.0];

        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvCoords), 2));
        let texture = new THREE.TextureLoader().load('./assets/texture-lego2.jpg');
        material.map = texture;
    }
}