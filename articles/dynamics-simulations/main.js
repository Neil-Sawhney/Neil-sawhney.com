import * as THREE from '/articles/dynamics-simulations/node_modules/three/build/three.module.js';
import { Clock } from '/articles/dynamics-simulations/node_modules/three/src/core/Clock.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera
camera.position.set(2, 0, 0);
camera.lookAt(0, 0, 0);

// camnera rotate  along x
camera.rotateZ(Math.PI/2);
camera.rotateY(Math.PI/4);
camera.position.set(2, 2, 1);


var axis = new THREE.Vector3(1, 1, 1);
// Set the amount to rotate (in radians; e.g., 90 degrees)
var angle = Math.PI / 2; // 90 degrees
// Assuming `object` is the object you want to rotate
// camera.rotateOnAxis(axis, angle);



// Axes
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Sphere
const sphere = new THREE.Object3D();
const geometry = new THREE.SphereGeometry(0.5, 25, 25);
const material = new THREE.MeshBasicMaterial( { color: 0x005555, transparent: true, opacity: 1} );
const sphereGeom = new THREE.Mesh( geometry, material );
const edges = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
const wireframe = new THREE.LineSegments(edges, edgeMaterial);
sphere.add( sphereGeom );
sphereGeom.add( wireframe );
sphereGeom.position.set(0, 0, 0.5);
scene.add( sphere );


// Constants
const g = 9.80665; // acceleration due to gravity
const m = 0.1; // mass of the ball
const l = 0.5; // length to center of mass
const I1 = 2/5 * m * Math.pow(l, 2); // moment of inertia about the first axis
const I3 = 7/5 * m * Math.pow(l, 2); // moment of inertia about the third axis

// Your differential equations
const equations = function(t, y) {
    // y = [theta, phi, psi, thetaDot, phiDot, psiDot]
    let phi = y[0], theta = y[1], psi = y[2], phiDot = y[3], thetaDot = y[4], psiDot = y[5];
    // Calculate second derivatives based on your equations
    let thetaDotDot = Math.sin(theta)*(m*g*l/I1 + Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1 * Math.pow(phiDot, 2) * Math.cos(theta) - I3/I1*phiDot*psiDot);
    let phiDotDot = thetaDot/(I1*Math.sin(theta)) * (I3*psiDot + I3*phiDot*Math.cos(theta) - 2*I1*phiDot*Math.cos(theta));
    let psiDotDot = -1/Math.tan(theta) *(I3/I1 *thetaDot * psiDot + I3/I1 * thetaDot * phiDot * Math.cos(theta) - 2*thetaDot*phiDot*Math.cos(theta)) + thetaDot*phiDot*Math.sin(theta);
    return [phiDot, thetaDot, psiDot, phiDotDot, thetaDotDot, psiDotDot];
};

// Initial conditions
let phi0 = 1e-3; // degrees
let theta0 = 20; // degrees
let psi0 = 1e-3; // degrees
let phiDot0 = 1e-3; // degrees per second
let thetaDot0 = 1e-3; // degrees per second
let psiDot0 = 500; // degrees per second

let y0 = [phi0 * Math.PI / 180, theta0 * Math.PI / 180, psi0 * Math.PI / 180, thetaDot0 * Math.PI / 180, phiDot0 * Math.PI / 180, psiDot0 * Math.PI / 180];

// Time span
let t0 = 0, tf = 20;

// Call the ode solver
let result = numeric.dopri(t0, tf, y0, equations, 1e-6, 5e4);

console.log(result)

const clock = new Clock();
function animate() {
	requestAnimationFrame( animate );

    let time = clock.getElapsedTime() % tf;

    let phi = result.at(time)[0];
    let theta = result.at(time)[1];
    let psi = result.at(time)[2];

    // sphere and outline rotate together
    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, 0, phi, 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(theta, 0, 0, 'XYZ')));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, psi, 'XYZ')));
    sphere.setRotationFromQuaternion(quaternion);

	renderer.render( scene, camera );
}
animate();