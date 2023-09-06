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

const Parameters = {
    Phi: { display_value: 1e-1, min: 0, max: 360, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Theta: { display_value: 5, min: -89, max: 89, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Psi: { display_value: 1e-1, min: -180, max: 180, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
};


function setupParameter(parameter) {
    if (parameter.display_value != null) {
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
        slider.value = parameter.display_value;
        slider.step = 0.01;
        output.innerHTML = parameter.display_value;

        // create the units
        let units = document.createElement("units");
        units.innerHTML = parameter.units;
        sliderWrapper.appendChild(units);

        if (parameter.angle) {
            parameter.value = parameter.display_value * Math.PI / 180;
            slider.addEventListener("input", function () {
                let variable = Math.round(this.value * 100) / 100 || parameter.min;
                output.innerHTML = variable;
                parameter.display_value = variable;
                parameter.value = variable * Math.PI / 180;
                ics[parameter.index] = parameter.value;
                updateDependentParameters();
                restart();
            });
        }
        else {
            parameter.value = parameter.display_value;
            slider.addEventListener("input", function () {
                let variable = Math.round(this.value * 100) / 100 || parameter.min;
                output.innerHTML = variable;
                parameter.display_value = variable;
                parameter.value = variable;
                ics[parameter.index] = parameter.value;
                updateDependentParameters();
                restart();
            });
        }
    }
    else {
        parameter.value = 0;
    }
}

for (let parameter in Parameters) {
    setupParameter(Parameters[parameter]);
}

// Camera
camera.position.set(Parameters.r.value * 4, Parameters.r.value * 4, Parameters.r.value * 4);

// Load models
let plane;
const loader = new GLTFLoader();
const cacheBuster = new Date().getTime(); // Get the current timestamp

loader.load('./assets/3d-models/coin.glb?v=${cacheBuster}', function (gltf) {
    plane = gltf.scene;
    plane.scale.set(2 * Parameters.r.value, 2 * Parameters.r.value, 2 * Parameters.r.value);
    plane.position.set(0, Parameters.r.value, 0);
    scene.add(plane)
}
);

let clock = new Clock();
let time = clock.getElapsedTime();
function animate() {
    animationId = requestAnimationFrame(animate);

    if (time >= Parameters.Time.value) {
        clock = new Clock();
        camera.position.set(Parameters.r.value * 4, Parameters.r.value * 4, Parameters.r.value * 4);
        // remove all lines
        for (let i = 0; i < lines.length; i++) {
            scene.remove(lines[i]);
        }
    }


    let x = result.at(time)[Parameters.X0.index];
    let y = result.at(time)[Parameters.Y0.index];
    let z = result.at(time)[Parameters.Z0.index];
    let phi = result.at(time)[Parameters.Phi0.index];
    let theta = result.at(time)[Parameters.Theta0.index];
    let psi = result.at(time)[Parameters.Psi0.index];
    // Camera
    controls.target.set(y + Parameters.r.value, z - Parameters.r.value, x + Parameters.r.value);
    // // Let OrbitControls know the camera has moved
    controls.update();

    plane.position.set(y, z + Parameters.r.value, x);
    frame2.position.set(y, z + Parameters.r.value, x);

    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, psi, 0, 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, theta, 'XYZ')));
    frame2.setRotationFromQuaternion(quaternion);
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(phi, 0, 0, 'XYZ')));
    plane.setRotationFromQuaternion(quaternion);

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
    result = numeric.dopri(t0, Parameters.Time.value, ics, equations, 1e-6, 5e4);

    plane.scale.set(2 * Parameters.r.value, 2 * Parameters.r.value, 2 * Parameters.r.value);
    plane.position.set(0, Parameters.r.value, 0);
    frame2.position.set(0, Parameters.r.value, 0);
    pointToTrace = new THREE.Vector3(0, -Parameters.r.value, 0);

    time = Parameters.Time.max;
    animate();
}