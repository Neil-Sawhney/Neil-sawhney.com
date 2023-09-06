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
    restart();
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
    X: { display_value: 0, min: 0, max: 10, id: '\\( x \\)', units: '\\( m \\)' },
    Y: { display_value: 0, min: 0, max: 10, id: '\\( y \\)', units: '\\( m \\)' },
    Z: { display_value: 0, min: 0, max: 10, id: '\\( z \\)', units: '\\( m \\)' },
    Phi: { display_value: 0, min: 0, max: 360, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Theta: { display_value: 0, min: -90, max: 90, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Psi: { display_value: 0, min: -180, max: 180, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Seqeunce: { display_value: "313", id: 'Sequence', options: ['313', '321', '123', '231', '132', '312']}
};


function setupParameter(parameter) {
    // if it has options then create a select
    if (parameter.options) {
        let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

        // create a wrapper for the select within parameterWrapper
        let selectWrapper = document.createElement("selectWrapper");
        parameterWrapper.appendChild(selectWrapper);

        // create a label for the select
        let label = document.createElement("label");
        label.innerText = parameter.id;
        label.htmlFor = parameter.id;
        selectWrapper.appendChild(label);

        // create the select
        let select = document.createElement("select");
        selectWrapper.appendChild(select);

        // create the options
        for (let option in parameter.options) {
            let optionElement = document.createElement("option");
            optionElement.value = parameter.options[option];
            optionElement.text = parameter.options[option];
            select.appendChild(optionElement);
        }

        parameter.value = parameter.display_value;
        // add an event listener to the select
        select.addEventListener("change", function () {
            parameter.display_value = this.value;
            ics[parameter.index] = parameter.value;
            restart();
        });
        return
    }
    
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
camera.position.set(3, 1, 3);
camera.lookAt(0, -1, 0);

// Load models
let plane;
const loader = new GLTFLoader();
const cacheBuster = new Date().getTime(); // Get the current timestamp

loader.load('./assets/3d-models/coin.glb?v=${cacheBuster}', function (gltf) {
    plane = gltf.scene;
    plane.scale.set(2, 2, 2);
    plane.position.set(0, 0, 0);
    scene.add(plane)
}
);

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);

    let x = Parameters.X.value;
    let y = Parameters.Y.value;
    let z = Parameters.Z.value;
    let phi = Parameters.Phi.value;
    let theta = Parameters.Theta.value;
    let psi = Parameters.Psi.value;

    // Camera

    plane.position.set(y, z, x);

    // let quaternion = new THREE.Quaternion();
    // quaternion.setFromEuler(new THREE.Euler(0, psi, 0, 'XYZ'));
    // quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, theta, 'XYZ')));
    // quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(phi, 0, 0, 'XYZ')));
    // 

    // rotate them in the order given by Parameters.Sequence.value
    let quaternion = new THREE.Quaternion();
    let sequence = Parameters.Seqeunce.value;
    //TODO: do the sequence thing
    plane.setRotationFromQuaternion(quaternion);

    renderer.render(scene, camera);
};

function restart() {
    cancelAnimationFrame(animationId);
    animate();
}

window.onload = function () {
    animate();
};
