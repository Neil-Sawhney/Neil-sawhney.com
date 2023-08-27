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

// // Controls
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

// Create a GridHelper with size and divisions
let size = 1000;
let divisions = 100;
let grid = new THREE.GridHelper(size, divisions);

scene.add(grid);

// Axes
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Constants
const g = 9.80665; // acceleration due to gravity


const Parameters = {
    X: { value: 0 },
    Y: { value: 0 },
    Z: { value: 0 },
    Phi: { value: 1e-1, min: 1e-1, max: 360, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true, slider: true },
    Theta: { value: 10, min: -89, max: 89, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)', angle: true, slider: true },
    Psi: { value: 1e-1, min: 1e-1, max: 360, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true, slider: true },
    XDot: {dependentParameterCalculation: function () {
        let psi = initial_conditions[Parameters.Psi.index], theta = initial_conditions[Parameters.Theta.index], phi = initial_conditions[Parameters.Phi.index], psiDot = initial_conditions[Parameters.PsiDot.index], thetaDot = initial_conditions[Parameters.ThetaDot.index], phiDot = initial_conditions[Parameters.PhiDot.index];
        initial_conditions[Parameters.XDot.index] = Parameters.r.value * (Math.sin(psi) * Math.cos(theta) * thetaDot
            + Math.sin(theta) * Math.cos(psi) * psiDot
            + Math.cos(psi) * phiDot);
    }},
    YDot: {dependentParameterCalculation: function () {
        let psi = initial_conditions[Parameters.Psi.index], theta = initial_conditions[Parameters.Theta.index], phi = initial_conditions[Parameters.Phi.index], psiDot = initial_conditions[Parameters.PsiDot.index], thetaDot = initial_conditions[Parameters.ThetaDot.index], phiDot = initial_conditions[Parameters.PhiDot.index];
        initial_conditions[Parameters.YDot.index] = Parameters.r.value * (Math.sin(psi) * Math.sin(theta) * psiDot
            + Math.sin(psi) * phiDot
            - Math.cos(psi) * Math.cos(theta) * thetaDot);
    }},
    ZDot: {dependentParameterCalculation: function () {
        let psi = initial_conditions[Parameters.Psi.index], theta = initial_conditions[Parameters.Theta.index], phi = initial_conditions[Parameters.Phi.index], psiDot = initial_conditions[Parameters.PsiDot.index], thetaDot = initial_conditions[Parameters.ThetaDot.index], phiDot = initial_conditions[Parameters.PhiDot.index];
        initial_conditions[Parameters.ZDot.index] = Parameters.r.value * Math.sin(theta) * thetaDot;
    }},
    PhiDot: { value: 150, min: 0, max: 1000, id: '\\( \\dot{\\phi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true, slider: true },
    ThetaDot: { value: 0, min: 0, max: 1000, id: '\\( \\dot{\\theta}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true, slider: true },
    PsiDot: { value: 0, min: 0, max: 1000, id: '\\( \\dot{\\psi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true, slider: true },
    r: { value: 2, min: 0.1, max: 10, id: 'Radius', units: ' \\( m \\)', slider: true },
    Damping: { value: 0.1, min: 0, max: 1, id: 'Damping', units: '', slider: true },
    Time: { value: 20, min: 1, max: 60, id: 'Run Time', units: ' \\( s \\)', slider: true }
};


let initial_conditions = [];
function updateDependentParameters() {
    for (let parameter in Parameters) {
        if (Parameters[parameter].dependentParameterCalculation != null) {
            Parameters[parameter].dependentParameterCalculation();
        }
    }
}

function setupParameter(parameter) {
    if (parameter.slider) {
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

        if (parameter.angle) {
            parameter.index = initial_conditions.push(parameter.value * Math.PI / 180) - 1;
            slider.addEventListener("input", function () {
                let variable = Math.round(this.value * 100) / 100 || parameter.min;
                output.innerHTML = variable;
                parameter.value = variable;
                initial_conditions[parameter.index] = variable * Math.PI / 180;
                updateDependentParameters();
                restart();
            });
        }
        else {
            parameter.index = initial_conditions.push(parameter.value) - 1;
            slider.addEventListener("input", function () {
                let variable = Math.round(this.value * 100) / 100 || parameter.min;
                output.innerHTML = variable;
                parameter.value = variable;
                initial_conditions[parameter.index] = variable;
                updateDependentParameters();
                restart();
            });
        }
    }

    else if (parameter.angle) {
        parameter.index = initial_conditions.push(parameter.value * Math.PI / 180) - 1;
    }
    else {
        parameter.index = initial_conditions.push(parameter.value) - 1;
    }
}

// call setupParameter for each parameter in Parameters
for (let parameter in Parameters) {
    setupParameter(Parameters[parameter]);
}
updateDependentParameters();

// Camera
camera.position.set(Parameters.r.value * 4, Parameters.r.value * 4, Parameters.r.value * 4);

// Load models
let coin;
const loader = new GLTFLoader();
const cacheBuster = new Date().getTime(); // Get the current timestamp

loader.load('./assets/3d-models/coin.glb?v=${cacheBuster}', function (gltf) {
    coin = gltf.scene;
    coin.scale.set(2 * Parameters.r.value, 2 * Parameters.r.value, 2 * Parameters.r.value);
    coin.position.set(0, Parameters.r.value, 0);
    scene.add(coin)
}
);

//create an invisible object frame2 for point to trace
let frame2 = new THREE.Object3D();
frame2.position.set(0, Parameters.r.value, 0);
scene.add(frame2);

const equations = function (t, stuff) {
    let phi = stuff[Parameters.Phi.index], theta = stuff[Parameters.Theta.index], psi = stuff[Parameters.Psi.index], phiDot = stuff[Parameters.PhiDot.index], thetaDot = stuff[Parameters.ThetaDot.index], psiDot = stuff[Parameters.PsiDot.index];
    let x = stuff[Parameters.X.index], y = stuff[Parameters.Y.index], z = stuff[Parameters.Z.index], xDot = stuff[Parameters.XDot.index], yDot = stuff[Parameters.YDot.index], zDot = stuff[Parameters.ZDot.index];

    let psiDotDot = -(2 * phiDot * thetaDot) / Math.cos(theta)
    let thetaDotDot = (8 * g * Math.sin(theta) + Parameters.r.value * (5 * Math.sin(2 * theta) * psiDot + 12 * Math.cos(theta) * phiDot) * psiDot) / (10 * Parameters.r.value)
    let phiDotDot = (-(5 * (1 - Math.cos(4 * theta)) * psiDot) / 4 + 5 * Math.sin(theta) ** 4 * Math.cos(theta) ** 2 * psiDot + 6 * Math.sin(theta) * phiDot - 5 * Math.cos(theta) ** 6 * psiDot) * thetaDot / (3 * Math.cos(theta))

    let xDotDot = Parameters.r.value * (- Math.sin(psi) * Math.sin(theta) * psiDot ** 2 - Math.sin(psi) * Math.sin(theta) * thetaDot ** 2 + Math.sin(psi) * Math.cos(theta) * thetaDotDot - Math.sin(psi) * phiDot * psiDot + Math.sin(theta) * Math.cos(psi) * psiDotDot + 2 * Math.cos(psi) * Math.cos(theta) * psiDot * thetaDot + Math.cos(psi) * phiDotDot);

    let yDotDot = Parameters.r.value * ((((Math.sin(theta) * psiDot + phiDot) * Math.sin(theta) * psiDot + Math.pow(thetaDot, 2)) * Math.sin(theta) * Math.cos(psi)) + (((Math.sin(theta) * psiDot + phiDot) * Math.cos(theta) * psiDot - thetaDotDot) * Math.cos(psi) * Math.cos(theta)) + ((Math.sin(theta) * psiDotDot + 2 * Math.cos(theta) * psiDot * thetaDot + phiDotDot) * Math.sin(psi)));

    let zDotDot = -Parameters.r.value * (Math.sin(theta) * thetaDotDot + Math.cos(theta) * Math.pow(thetaDot, 2));

    // Damping
    thetaDotDot -= thetaDotDot > 1e-6 ? 0.8 * Parameters.Damping.value * thetaDot : 1e-6;
    phiDotDot -= phiDotDot > 1e-6 ? Parameters.Damping.value * phiDot : 1e-6;;
    psiDotDot -= psiDotDot > 1e-6 ? 0.8 * Parameters.Damping.value * psiDot : 1e-6;


    return [xDot, yDot, zDot, phiDot, thetaDot, psiDot, xDotDot, yDotDot, zDotDot, phiDotDot, thetaDotDot, psiDotDot];
};

// Time span
let t0 = 0, tf = Parameters.Time.value;

// Call the ode solver
let result = numeric.dopri(t0, tf, initial_conditions, equations, 1e-6, 5e4);

console.log(result)

let pointToTrace = new THREE.Vector3(0, -Parameters.r.value, 0);
var points = [];
var lines = [];
var recentLines = [];
let animationId;

let clock = new Clock();
let time = clock.getElapsedTime();
function animate() {
    animationId = requestAnimationFrame(animate);

    if (time >= tf) {
        clock = new Clock();
        camera.position.set(Parameters.r.value * 4, Parameters.r.value * 4, Parameters.r.value * 4);
        // remove all lines
        for (let i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
    }

    let x = result.at(time)[0];
    let y = result.at(time)[1];
    let z = result.at(time)[2];
    let phi = result.at(time)[3];
    let theta = result.at(time)[4];
    let psi = result.at(time)[5];

    // Camera
    controls.target.set(y + Parameters.r.value, z - Parameters.r.value, x + Parameters.r.value);
    // // Let OrbitControls know the camera has moved
    controls.update();

    coin.position.set(y, z + Parameters.r.value, x);
    frame2.position.set(y, z + Parameters.r.value, x);

    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, psi, 0, 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, theta, 'XYZ')));
    frame2.setRotationFromQuaternion(quaternion);
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(phi, 0, 0, 'XYZ')));
    coin.setRotationFromQuaternion(quaternion);

    var worldPointToTrace = frame2.localToWorld(pointToTrace.clone());
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
    result = numeric.dopri(t0, Parameters.Time.value, initial_conditions, equations, 1e-6, 5e4);

    coin.scale.set(2 * Parameters.r.value, 2 * Parameters.r.value, 2 * Parameters.r.value);
    coin.position.set(0, Parameters.r.value, 0);
    frame2.position.set(0, Parameters.r.value, 0);
    pointToTrace = new THREE.Vector3(0, -Parameters.r.value, 0);

    time = Parameters.Time.max;
    animate();
}