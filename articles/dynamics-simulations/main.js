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

const oppositeLight = new THREE.DirectionalLight( 0xffffff, 1);
oppositeLight.position.set(-500, -500, -500);
oppositeLight.castShadow = true;
scene.add( oppositeLight );


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
let phi0 = 0; // degrees
let theta0 = 10; // degrees
let psi0 = 0; // degrees
let phiDot0 = 1e-9; // degrees per second
let thetaDot0 = 1e-9; // degrees per second
let psiDot0 = 3000; // degrees per second
let damping = 0.1; // decay of the ball's spin

var phi0Slider = document.getElementById("phi0");
var theta0Slider = document.getElementById("theta0");
var psi0Slider = document.getElementById("psi0");
var phiDot0Slider = document.getElementById("phiDot0");
var thetaDot0Slider = document.getElementById("thetaDot0");
var psiDot0Slider = document.getElementById("psiDot0");
var dampingSlider = document.getElementById("damping");

document.getElementById("phi0Value").innerHTML = phi0;
document.getElementById("theta0Value").innerHTML = theta0;
document.getElementById("psi0Value").innerHTML = psi0;
document.getElementById("phiDot0Value").innerHTML = phiDot0;
document.getElementById("thetaDot0Value").innerHTML = thetaDot0;
document.getElementById("psiDot0Value").innerHTML = psiDot0;
document.getElementById("dampingValue").innerHTML = damping;
phi0Slider.value = phi0;
theta0Slider.value = theta0;
psi0Slider.value = psi0;
phiDot0Slider.value = phiDot0;
thetaDot0Slider.value = thetaDot0;
psiDot0Slider.value = psiDot0;
dampingSlider.value = damping;

phi0Slider.oninput = function() {
    phi0 = this.value;
    document.getElementById("phi0Value").innerHTML = phi0;
    restart();
}

theta0Slider.oninput = function() {
    theta0 = this.value;
    document.getElementById("theta0Value").innerHTML = theta0;
    restart();
}

psi0Slider.oninput = function() {
    psi0 = this.value;
    document.getElementById("psi0Value").innerHTML = psi0;
    restart();
}

phiDot0Slider.oninput = function() {
    phiDot0 = Math.round(this.value);
    document.getElementById("phiDot0Value").innerHTML = phiDot0;
    restart();
}

thetaDot0Slider.oninput = function() {
    thetaDot0 = Math.round(this.value);
    document.getElementById("thetaDot0Value").innerHTML = thetaDot0;
    restart();
}

psiDot0Slider.oninput = function() {
    psiDot0 = Math.round(this.value);
    document.getElementById("psiDot0Value").innerHTML = psiDot0;
    restart();
}

dampingSlider.oninput = function() {
    damping = Math.round((this.value/6000 * 3)*100)/100;
    document.getElementById("dampingValue").innerHTML = damping;
    restart();
}





// Your differential equations
const equations = function(t, y) {
    // y = [theta, phi, psi, thetaDot, phiDot, psiDot]
    let phi = y[0], theta = y[1], psi = y[2], phiDot = y[3], thetaDot = y[4], psiDot = y[5];
    // Calculate second derivatives based on your equations
    let thetaDotDot = Math.sin(theta)*(m*g*l/I1 + Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1 * Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1*phiDot*psiDot);
    let phiDotDot = thetaDot/(I1*Math.sin(theta)) * (I3*psiDot + I3*phiDot*Math.cos(theta) - 2*I1*phiDot*Math.cos(theta));
    let psiDotDot = -1/Math.tan(theta) *(I3/I1 *thetaDot * psiDot + I3/I1 * thetaDot * phiDot * Math.cos(theta) - 2*thetaDot*phiDot*Math.cos(theta)) + thetaDot*phiDot*Math.sin(theta);

    thetaDotDot -= thetaDotDot > 1e-6 ? damping * thetaDot : 1e-6;
    phiDotDot -= phiDotDot > 1e-6 ? damping * phiDot : 1e-6;;
    psiDotDot -= psiDotDot > 1e-6 ? damping * psiDot : 1e-6;

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
let animationId;

let clock = new Clock();
let time = clock.getElapsedTime();
function animate() {
	animationId = requestAnimationFrame( animate );

    if (time >= tf) {
        clock = new Clock();

        // remove all lines
        for (let i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
        var lightness = 1;
    }

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

    time = clock.getElapsedTime();

	renderer.render( scene, camera );
};

window.onload = function() {
    animate();
};

let restart = function() {
    cancelAnimationFrame(animationId);
    // Call the ode solver
    let y0 = [phi0 * Math.PI / 180, theta0 * Math.PI / 180, psi0 * Math.PI / 180, thetaDot0 * Math.PI / 180, phiDot0 * Math.PI / 180, psiDot0 * Math.PI / 180];
    result = numeric.dopri(t0, tf, y0, equations, 1e-6, 5e4);

    time = tf;
    animate();
}