// Sean Im, 2022
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.145.0/three.module.js';

// Global variables
const timer = new THREE.Clock(true);
const vec_v_pos = new THREE.Vector3( 2, 2, 1 );
const vec_w_pos = new THREE.Vector3( 0, 3/Math.pow(5, 0.5), -6/Math.pow(5, 0.5) );
let speed = 1;
let theta = Math.PI*(3/4);

// GUI controller
import { GUI } from '../libs/lil-gui.esm.min.js';
import { OrbitControls } from '../libs/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '../libs/CSS2DRenderer.js';

const gui = new GUI();

const Controller = {
    X_v: vec_v_pos.x,
    Y_v: vec_v_pos.y,
    Z_v: vec_v_pos.z,

    X_w: vec_w_pos.x,
    Y_w: vec_w_pos.y,
    Z_w: vec_w_pos.z,

    Speed: speed,
    Angle_Theta: theta
};

const valuesChanger = function () {
    vec_v_pos.x = Controller.X_v;
    vec_v_pos.y = Controller.Y_v;
    vec_v_pos.z = Controller.Z_v;

    vec_w_pos.x = Controller.X_w;
    vec_w_pos.y = Controller.Y_w;
    vec_w_pos.z = Controller.Z_w;

    speed = Controller.Speed;
    theta = Controller.Angle_Theta;
};

const folder1 = gui.addFolder( 'Vector V' );
folder1.add( Controller, 'X_v', -5, 5.0, 0.01 ).onChange( valuesChanger );
folder1.add( Controller, 'Y_v', -5, 5.0, 0.01 ).onChange( valuesChanger );
folder1.add( Controller, 'Z_v', -5, 5.0, 0.01 ).onChange( valuesChanger );

const folder2 = gui.addFolder( 'Vector W' );
folder2.add( Controller, 'X_w', -5, 5.0, 0.01 ).onChange( valuesChanger );
folder2.add( Controller, 'Y_w', -5, 5.0, 0.01 ).onChange( valuesChanger );
folder2.add( Controller, 'Z_w', -5, 5.0, 0.01 ).onChange( valuesChanger );

gui.add( Controller, 'Speed', -10, 10, 0.2 ).onChange( valuesChanger );
gui.add( Controller, 'Angle_Theta', -Math.PI*2, Math.PI*2, 0.01 ).onChange( valuesChanger );

valuesChanger();

// Getting started
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const frustumSize = 9;
let aspect = window.innerWidth / window.innerHeight;
//let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );

const controls = new OrbitControls( camera, labelRenderer.domElement );


window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    /*aspect = window.innerWidth / window.innerHeight;
    camera.left = - frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = - frustumSize / 2;*/

    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
}

// initiate
function init() {
    let geometry, material, pixelDiv, pixelLabel;
    // Center
    geometry = new THREE.IcosahedronGeometry( 0.5 );
    material = new THREE.MeshMatcapMaterial( { color: 0xcfcfcf } );
    const center = ( new THREE.Mesh( geometry, material ) );

    // Vector V
    geometry = new THREE.OctahedronGeometry( 0.5 );
    material = new THREE.MeshMatcapMaterial( { color: 0x36eb66 } );
    const vector_v = ( new THREE.Mesh( geometry, material ) );

    // Vector W
    geometry = new THREE.OctahedronGeometry( 0.5 );
    material = new THREE.MeshMatcapMaterial( { color: 0xf7af31 } );
    const vector_w = ( new THREE.Mesh( geometry, material ) );

    // Vector Rotated
    geometry = new THREE.SphereGeometry( 0.5 );
    material = new THREE.MeshBasicMaterial( { color: 0xdb3d48 } );
    const vector_v_rotated = ( new THREE.Mesh( geometry, material ) );

    // Plane of Normal Vector U
    /*geometry = new THREE.CircleGeometry( 5 );
    material = new THREE.MeshBasicMaterial( 
        { 
            color: 0xdb3d48,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide} 
        );

    const plane_u = ( new THREE.Mesh( geometry, material ) );*/

    // < Init: Transformations >
    vector_v.position.copy( vec_v_pos );
    vector_w.position.copy( vec_w_pos );
    vector_v_rotated.position.copy( vector_v.position );

    // < Normalize vectors >
    const magnitude = 4;
    vector_v.position.normalize().multiplyScalar(magnitude);
    vector_w.position.normalize().multiplyScalar(magnitude);

    // < scene.add >
    scene.add( new THREE.AxesHelper( 10 ) ); // scene.children[0]
    scene.add( center ); // scene.children[1]
    scene.add( vector_v ); // scene.children[2]
    scene.add( vector_w ); // scene.children[3]
    scene.add( vector_v_rotated ); // scene.children[4]
    //scene.add( plane_u ); // scene.children[5]

    camera.position.z = 10;
}

// game loop
function animate() {
    requestAnimationFrame( animate );

    const vector_v = scene.children[2].position;
    const vector_w = scene.children[3].position;
    // update vector' position
    vector_v.copy( vec_v_pos );
    vector_w.copy( vec_w_pos );

    // updating rotating vector
    // Formula: Rot(v) = cos(theta)*(v) + sin(theta)*(w)
    // Must meet the requirement |v| = |w| to use the formula
    // The formula above rotates v in the direction of w.
    const time = timer.getElapsedTime(); // time since the beginning
    let angle = time*speed + theta;
    let v = new THREE.Vector3();
    v.copy(scene.children[2].position);
    const w = new THREE.Vector3();
    w.copy(scene.children[3].position);
    let rot_v = new THREE.Vector3();
    // Formula: Rot(v) = cos(theta)*(v) + sin(theta)*(w)
    rot_v.addVectors( v.multiplyScalar( Math.cos(angle) ), w.multiplyScalar( Math.sin(angle) ) );

    let rotv = scene.children[ 4 ];
    rotv.position.copy(rot_v);

    // draw vectors
    const number_of_vectors = 4;
    for( let i = 1; i <= number_of_vectors; i++ ) {
        draw_vector( i );
    }

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
};

init();
animate();

function draw_vector( index ) {
    let pixelDiv, pixelLabel;
    const vector = scene.children[ index ];
    pixelDiv = document.createElement( 'div' );
    pixelDiv.className = 'label';
    pixelDiv.textContent = String( Math.round( vector.position.x * 10 ) / 10  ) + "," 
                            + String( Math.round( vector.position.y * 10 ) / 10  ) + "," 
                            + String( Math.round( vector.position.z * 10 ) / 10  );
    pixelLabel = new CSS2DObject( pixelDiv );
    scene.children[ index ].remove(scene.children[ index ].children[0]);
    scene.children[ index ].add(pixelLabel);
}