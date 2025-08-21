import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer,
        initCamera, 
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize} from "../libs/util/util.js";

import { CSG } from '../libs/other/CSGMesh.js'        

var scene = new THREE.Scene();   
var stats = new Stats();          

var renderer = initRenderer();    
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(4, -8, 8)); 
   camera.up.set( 0, 0, 1 );

const orbit = new OrbitControls(camera, renderer.domElement);

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
initDefaultBasicLight(scene, true, new THREE.Vector3(12, -15, 20), 28, 1024) ;	

var groundPlane = createGroundPlane(20, 20); 
scene.add(groundPlane);
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

let auxMat = new THREE.Matrix4();
let csgObject, cubeCSG, cylinderCSG

// Cilindro
let cylinderMesh = new THREE.Mesh( new THREE.CylinderGeometry(0.85, 0.85, 2, 20))
cylinderMesh.position.set(1.5, -0.5, 0.0)
cylinderMesh.matrixAutoUpdate = false;
cylinderMesh.updateMatrix();
cylinderCSG = CSG.fromMesh(cylinderMesh)
cylinderMesh.material = new THREE.MeshPhongMaterial({color: 'red'})
//scene.add(cylinderMesh)

// Cubo
let cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))
cubeMesh.material = new THREE.MeshPhongMaterial({color: 'blue'})
//scene.add(cubeMesh)
cubeCSG = CSG.fromMesh(cubeMesh)   

csgObject = cubeCSG.intersect(cylinderCSG) //interseção do cubo com o cilindro

let hitter = CSG.toMesh(csgObject, auxMat)
hitter.material = new THREE.MeshPhongMaterial({color: '#5FA1AD'})
//scene.add(hitter)

hitter.position.set(0, 0, 2.0)
hitter.rotation.y = Math.PI / 2;
scene.add(hitter)

render();

function render()
{
  stats.update(); 
  requestAnimationFrame(render); 
  renderer.render(scene, camera) 
}
