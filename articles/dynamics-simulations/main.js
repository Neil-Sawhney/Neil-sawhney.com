import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('container3D').appendChild( renderer.domElement );

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}, false);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Light
const topLight = new THREE.DirectionalLight( 0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add( topLight );


// Camera
camera.position.set(0.3,0.5,0.3);
camera.lookAt(0,0,0);
// camera.position.set(2, 0, 0);
// camera.lookAt(0, 0, 0);

// camera.rotateZ(Math.PI/2);
// camera.rotateY(Math.PI/4);
// camera.position.set(2, 2, 1);

// Axes
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Load model
const basketballOffset = new THREE.Object3D();
let basketball;
const loader = new GLTFLoader();

loader.load( './assets/basketball.glb', function ( gltf ) {
    basketball = gltf.scene;
    basketball.scale.set(0.119/1.6143269538879395, 0.119/1.6143269538879395, 0.119/1.6143269538879395);
    basketball.position.set(0, 0.119, 0);

    basketballOffset.add( basketball);
}
);
scene.add(basketballOffset)


// Constants
const g = 9.80665; // acceleration due to gravity
const m = 0.635; // mass of the ball
const l = 0.119; // length to center of mass
const I1 = 2/5 * m * Math.pow(l, 2); // moment of inertia about the first axis
const I3 = 2/5 * m * Math.pow(l, 2); // moment of inertia about the third axis

// Initial conditions
let phi0 = 1e-3; // degrees
let theta0 = 5; // degrees
let psi0 = 1e-3; // degrees
let phiDot0 = 1e-3; // degrees per second
let thetaDot0 = 1e-3; // degrees per second
let psiDot0 = 3000; // degrees per second

const psiDecay = 1.5; // decay of the ball's spin


// Your differential equations
const equations = function(t, y) {
    // y = [theta, phi, psi, thetaDot, phiDot, psiDot]
    let phi = y[0], theta = y[1], psi = y[2], phiDot = y[3], thetaDot = y[4], psiDot = y[5];
    // Calculate second derivatives based on your equations
    let thetaDotDot = Math.sin(theta)*(m*g*l/I1 + Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1 * Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1*phiDot*psiDot);
    let phiDotDot = thetaDot/(I1*Math.sin(theta)) * (I3*psiDot + I3*phiDot*Math.cos(theta) - 2*I1*phiDot*Math.cos(theta));
    let psiDotDot = -1/Math.tan(theta) *(I3/I1 *thetaDot * psiDot + I3/I1 * thetaDot * phiDot * Math.cos(theta) - 2*thetaDot*phiDot*Math.cos(theta)) + thetaDot*phiDot*Math.sin(theta) - psiDecay;
    return [phiDot, thetaDot, psiDot, phiDotDot, thetaDotDot, psiDotDot];
};

let y0 = [phi0 * Math.PI / 180, theta0 * Math.PI / 180, psi0 * Math.PI / 180, thetaDot0 * Math.PI / 180, phiDot0 * Math.PI / 180, psiDot0 * Math.PI / 180];

// Time span
let t0 = 0, tf = 20;

// Call the ode solver
let result = numeric.dopri(t0, tf, y0, equations, 1e-6, 5e4);

console.log(result)

let pointToTrace = new THREE.Vector3(0, 0.119*2, 0);
var points = [];
var lines = [];
var recentLines = [];

const clock = new Clock();
function animate() {
	requestAnimationFrame( animate );

    let time = clock.getElapsedTime() % tf;

    let phi = result.at(time)[0];
    let theta = result.at(time)[1];
    let psi = result.at(time)[2];

    // sphere and outline rotate together
    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, phi, 0, 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, theta, 'XYZ')));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, psi, 0, 'XYZ')));
    basketballOffset.setRotationFromQuaternion(quaternion);

    var worldPointToTrace = basketballOffset.localToWorld(pointToTrace.clone());
    points.push(worldPointToTrace);

    if (time < 1) {
        // remove all lines
        for (let i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
        var lightness = 1;
    }

    var lineGeometry = new THREE.BufferGeometry().setFromPoints( points.slice(-2) );
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    var line = new THREE.Line( lineGeometry, lineMaterial );

    // Add this line to the scene and to the lines array
    scene.add(line);
    lines.push(line);

    if (recentLines.push(line) > 10) {
        var oldestLine = recentLines.shift();
        oldestLine.material.color.setHex(0x009999);

    }

	renderer.render( scene, camera );
}
window.onload = function() {
    animate();
};

function reset() {
    points = [];
    if (line) {
        scene.remove(line);
        line = undefined;
    }
}