import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Light
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(5, 5, 5);
topLight.castShadow = true;
scene.add(topLight);

const oppositeLight = new THREE.DirectionalLight(0xffffff, 0.3);
oppositeLight.position.set(-5, -5, -10);
oppositeLight.castShadow = true;
scene.add(oppositeLight);

const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);


// Camera
camera.position.set(0.5, 0.5, 0.5);
camera.lookAt(0, -0.2, 0);

// Axes
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Load models
const racketOffset = new THREE.Object3D();
let racket;
const loader = new GLTFLoader();
const cacheBuster = new Date().getTime(); // Get the current timestamp

loader.load('./assets/3d-models/racket.glb?v=${cacheBuster}', function (gltf) {
    racket = gltf.scene;
    racket.scale.set(0.119 / 1.6143269538879395, 0.119 / 1.6143269538879395, 0.119 / 1.6143269538879395);
    racket.rotation.set(Math.PI/2, 0, Math.PI/2);
    racket.position.set(0, -0.1, 0);
    racketOffset.add(racket);
}
);
scene.add(racketOffset)


// Constants
const g = 9.80665; // acceleration due to gravity
const m = 0.635; // mass of the ball
const l = 0.119; // length to center of mass

let y0 = [];
const Parameters = {
    Phi: { value: 0, min: 0, max: 360, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)' },
    Theta: { value: 1e-1, min: 1e-1, max: 180, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)' },
    Psi: { value: 90, min: 0, max: 360, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)' },
    PhiDot: { value: 1e-3, min: 1e-3, max: 1000, id: '\\( \\dot{\\phi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)' },
    ThetaDot: { value: 200, min: 1e-3, max: 300, id: '\\( \\dot{\\theta}_0 \\)', units: ' \\( \\frac{deg}{s} \\)' },
    PsiDot: { value: 1e-3, min: 1e-3, max: 1000, id: '\\( \\dot{\\psi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)' },
    Damping: { value: 0.1, min: 0, max: 2, id: 'Damping', units: '' },
    Time: { value: 20, min: 1, max: 60, id: 'Run Time', units: ' \\( s \\)' }
};

function setupSlider(parameter) {
    let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

    // create a wrapper for the slider within parameterWrapper
    let sliderWrapper = document.createElement("sliderWrapper");
    parameterWrapper.appendChild(sliderWrapper);

    // create a label for the slider
    let label = document.createElement("label");
    label.innerText = parameter.id;
    label.htmlFor = parameter.id;
    sliderWrapper.appendChild(label);

    // create the slider
    let slider = document.createElement("input");
    slider.type = "range";
    slider.class = "slider";
    sliderWrapper.appendChild(slider);

    // create the output
    let output = document.createElement("output");
    sliderWrapper.appendChild(output);

    slider.min = parameter.min;
    slider.max = parameter.max;
    slider.value = parameter.value;
    slider.step = 0.01;
    output.innerHTML = parameter.value;

    // create the units
    let units = document.createElement("units");
    units.innerHTML = parameter.units;
    sliderWrapper.appendChild(units);

    parameter.index = y0.push(parameter.value * Math.PI / 180) - 1;
    slider.addEventListener("input", function () {
        let variable = Math.round(this.value * 100) / 100 || parameter.min;
        output.innerHTML = variable;
        parameter.value = variable;
        y0[parameter.index] = variable * Math.PI / 180;
        restart();
    });
}

setupSlider(Parameters.Phi);
setupSlider(Parameters.Theta);
setupSlider(Parameters.Psi);
setupSlider(Parameters.PhiDot);
setupSlider(Parameters.ThetaDot);
setupSlider(Parameters.PsiDot);
setupSlider(Parameters.Damping);
setupSlider(Parameters.Time);

const equations = function (t, y) {
    let phi = y[Parameters.Phi.index], theta = y[Parameters.Theta.index], psi = y[Parameters.Psi.index], phiDot = y[Parameters.PhiDot.index], thetaDot = y[Parameters.ThetaDot.index], psiDot = y[Parameters.PsiDot.index];

    // Calculate second derivatives based on your equations
    let psiDotDot = (
        - 1.64443110675595 * Math.pow(Math.sin(psi), 2) * Math.pow(Math.sin(theta), 2) * phiDot * thetaDot
        - 0.0406970983722576 * Math.pow(Math.sin(psi), 2) * Math.cos(theta) * psiDot * thetaDot
        - 0.0406970983722576 * Math.pow(Math.sin(psi), 2) * phiDot * thetaDot
        + 0.842564102564103 * Math.sin(psi) * Math.pow(Math.sin(theta), 3) * Math.cos(psi) * Math.pow(phiDot, 2)
        + 0.0406970983722576 * Math.sin(psi) * Math.sin(theta) * Math.cos(psi) * Math.cos(theta) * phiDot * psiDot
        + 1.10788693471338e-9 * Math.sin(psi) * Math.sin(theta) * Math.cos(psi) * Math.cos(theta)
        - 0.842564102564103 * Math.sin(psi) * Math.sin(theta) * Math.cos(psi) * Math.pow(thetaDot, 2)
        + 0.0203485491861288 * Math.sin(psi) * Math.sin(2.0 * theta) * Math.cos(psi) * Math.cos(theta) * Math.pow(phiDot, 2)
        + 1.79797811530296 * Math.pow(Math.sin(theta), 2) * phiDot * thetaDot
        - 1.95541401273885 * Math.cos(theta) * psiDot * thetaDot
        + 0.0445859872611465 * phiDot * thetaDot
    ) / Math.sin(theta);

    let thetaDotDot = (
        0.0406970983722576 * Math.pow(Math.sin(psi), 2) * Math.sin(theta) * phiDot * psiDot
        + 1.10788693471338e-9 * Math.pow(Math.sin(psi), 2) * Math.sin(theta)
        + 0.0203485491861289 * Math.pow(Math.sin(psi), 2) * Math.sin(2.0 * theta) * Math.pow(phiDot, 2)
        + 0.0406970983722576 * Math.sin(psi) * Math.cos(psi) * Math.cos(theta) * phiDot * thetaDot
        + 0.0406970983722576 * Math.sin(psi) * Math.cos(psi) * psiDot * thetaDot
        - 1.99611111111111 * Math.sin(theta) * phiDot * psiDot
        + 1.0586625e-10 * Math.sin(theta)
        - 0.498055555555556 * Math.sin(2.0 * theta) * Math.pow(phiDot, 2)
    );

    let phiDotDot = (
        -0.0050871372965322 * Math.cos(2 * psi - 2.0 * theta) * Math.pow(phiDot, 2)
        - 0.0101742745930644 * Math.cos(2 * psi - theta) * phiDot * psiDot
        - 0.0101742745930644 * Math.cos(2 * psi - theta) * phiDot * thetaDot
        - 2.76971733678344e-10 * Math.cos(2 * psi - theta)
        + 0.0101742745930644 * Math.cos(2 * psi + theta) * phiDot * psiDot
        - 0.0101742745930644 * Math.cos(2 * psi + theta) * phiDot * thetaDot
        + 2.76971733678344e-10 * Math.cos(2 * psi + theta)
        + 0.0050871372965322 * Math.cos(2 * psi + 2.0 * theta) * Math.pow(phiDot, 2)
        - 0.0203485491861288 * Math.cos(2 * psi) * psiDot * thetaDot
        - 0.0242374380750177 * Math.cos(theta) * phiDot * thetaDot
        + 1.97576256192498 * psiDot * thetaDot
    ) / Math.sin(theta);

    thetaDotDot -= thetaDotDot > 1e-6 ? Parameters.Damping.value * thetaDot : 1e-6;
    phiDotDot -= phiDotDot > 1e-6 ? Parameters.Damping.value * phiDot : 1e-6;;
    psiDotDot -= psiDotDot > 1e-6 ? Parameters.Damping.value * psiDot : 1e-6;

    return [phiDot, thetaDot, psiDot, phiDotDot, thetaDotDot, psiDotDot];
};

// Time span
let t0 = 0, tf = Parameters.Time.value;

// Call the ode solver
let result = numeric.dopri(t0, Parameters.Time.value, y0, equations, 1e-6, 5e4);

console.log(result)

let pointToTrace = new THREE.Vector3(0, -0.43, 0);
var points = [];
var lines = [];
var recentLines = [];
let animationId;

let clock = new Clock();
let time = clock.getElapsedTime();
function animate() {
    animationId = requestAnimationFrame(animate);

    if (time >= Parameters.Time.value) {
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
    let coord_order = 'XYZ';
    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, phi, 0, coord_order));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, theta, coord_order)));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, psi, 0, coord_order)));
    racketOffset.setRotationFromQuaternion(quaternion);

    var worldPointToTrace = racketOffset.localToWorld(pointToTrace.clone());
    points.push(worldPointToTrace);

    var lineGeometry = new THREE.BufferGeometry().setFromPoints(points.slice(-2));
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    var line = new THREE.Line(lineGeometry, lineMaterial);

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

    renderer.render(scene, camera);
};

window.onload = function () {
    animate();
};

let restart = function () {
    cancelAnimationFrame(animationId);
    // Call the ode solver
    result = numeric.dopri(t0, Parameters.Time.value, y0, equations, 1e-6, 5e4);

    time = Parameters.Time.value;
    animate();
}