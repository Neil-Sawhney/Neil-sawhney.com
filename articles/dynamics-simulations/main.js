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

const Parameters = {
    Phi: { value: 0, min: 0, max: 360},
    Theta: { value: 10, min: 1e-1, max: 180},
    Psi: { value: 0, min: 0, max: 360}, 
    PhiDot: { value: 1e-3, min: 1e-3, max: 1000},
    ThetaDot: { value: 1e-3, min: 1e-3, max: 300},
    PsiDot: { value: 3000, min: 1e-3, max: 5000},
    Damping: { value: 0.1, min: 0, max: 1}
};

let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

let y0 = [];
function setupSlider(slider, output, parameter) {
  output.innerHTML = parameter.value;

  slider.min = parameter.min;
  slider.max = parameter.max;
  slider.value = parameter.value;

  parameter.index = y0.push(parameter.value * Math.PI / 180) - 1;
  slider.addEventListener("input", function() {
    let variable = Math.round(this.value * 100) / 100 || parameter.min;
    output.innerHTML = variable;
    parameter.value = variable;
    y0[parameter.index] = variable * Math.PI / 180;
    restart();
  });
}

setupSlider(document.getElementById("phi0"), document.getElementById("phi0Value"), Parameters.Phi);
setupSlider(document.getElementById("theta0"), document.getElementById("theta0Value"), Parameters.Theta);
setupSlider(document.getElementById("psi0"), document.getElementById("psi0Value"), Parameters.Psi);
setupSlider(document.getElementById("phiDot0"), document.getElementById("phiDot0Value"), Parameters.PhiDot);
setupSlider(document.getElementById("thetaDot0"), document.getElementById("thetaDot0Value"), Parameters.ThetaDot);
setupSlider(document.getElementById("psiDot0"), document.getElementById("psiDot0Value"), Parameters.PsiDot);
setupSlider(document.getElementById("damping"), document.getElementById("dampingValue"), Parameters.Damping);

// Your differential equations
const equations = function(t, y) {
    let phi = y[Parameters.Phi.index], theta = y[Parameters.Theta.index], psi = y[Parameters.Psi.index], phiDot = y[Parameters.PhiDot.index], thetaDot = y[Parameters.ThetaDot.index], psiDot = y[Parameters.PsiDot.index];

    // Calculate second derivatives based on your equations
    let thetaDotDot = Math.sin(theta)*(m*g*l/I1 + Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1 * Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1*phiDot*psiDot);
    let phiDotDot = thetaDot/(I1*Math.sin(theta)) * (I3*psiDot + I3*phiDot*Math.cos(theta) - 2*I1*phiDot*Math.cos(theta));
    let psiDotDot = -1/Math.tan(theta) *(I3/I1 *thetaDot * psiDot + I3/I1 * thetaDot * phiDot * Math.cos(theta) - 2*thetaDot*phiDot*Math.cos(theta)) + thetaDot*phiDot*Math.sin(theta);

    thetaDotDot -= thetaDotDot > 1e-6 ? Parameters.Damping.value * thetaDot : 1e-6;
    phiDotDot -= phiDotDot > 1e-6 ? Parameters.Damping.value * phiDot : 1e-6;;
    psiDotDot -= psiDotDot > 1e-6 ? Parameters.Damping.value * psiDot : 1e-6;

    return [phiDot, thetaDot, psiDot, phiDotDot, thetaDotDot, psiDotDot];
};

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

    // FIXME: if statement is temporary untill line thing is fixed
    if (time < 0.1) {
        // remove all lines
        for (let i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
    }

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
    result = numeric.dopri(t0, tf, y0, equations, 1e-6, 5e4);

    time = tf;
    animate();
}