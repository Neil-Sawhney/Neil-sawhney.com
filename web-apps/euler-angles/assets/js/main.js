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
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

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
    Psi: { display_value: 0, min: -180, max: 180, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Theta: { display_value: 0, min: -180, max: 180, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Phi: { display_value: 0, min: -180, max: 180, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Seqeunce: { display_value: "321", id: 'Sequence', options: ['321', '312', '313', '231', '123', '132']},
    Reset: { id: 'Reset' }
};


function setParameter(parameter, value) {
    let wrapper = document.getElementById(parameter.id);
    parameter.value = value;

    // if it has options then it is a select
    if (parameter.options) {
        parameter.display_value = value;

        let select = wrapper.getElementsByTagName("select")[0];
        select.value = value;
    }

    // otherwise if it has a display value then it is a slider
    else if (parameter.display_value != null) {
        parameter.display_value = value;

        let slider = wrapper.getElementsByTagName("input")[0];
        slider.value = value;
        let output = wrapper.getElementsByTagName("output")[0];
        output.innerHTML = value;
    }
}


function setupParameter(parameter) {
    // if it has options then create a select
    if (parameter.options) {
        let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

        // create a wrapper for the select within parameterWrapper
        let selectWrapper = document.createElement("selectWrapper");
        selectWrapper.id = parameter.id;
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
            parameter.value = this.value;
            restart();
        });
        return
    }
    
    // otherwise if it has a display value create a slider
    if (parameter.display_value != null) {
        let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

        // create a wrapper for the slider within parameterWrapper
        let sliderWrapper = document.createElement("sliderWrapper");
        parameterWrapper.appendChild(sliderWrapper);
        sliderWrapper.id = parameter.id;

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
                restart();
            });
        }
    }
    
    // if it doesn't have a display value then it's a button
    if (parameter.display_value == null) {
        let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

        // create a wrapper for the button within parameterWrapper
        let buttonWrapper = document.createElement("buttonWrapper");
        parameterWrapper.appendChild(buttonWrapper);
        buttonWrapper.id = parameter.id;

        // create the button
        let button = document.createElement("button");
        button.innerText = parameter.id;
        buttonWrapper.appendChild(button);

        button.addEventListener("click", function () {
            setParameter(Parameters.X, 0);
            setParameter(Parameters.Y, 0);
            setParameter(Parameters.Z, 0);
            setParameter(Parameters.Psi, 0);
            setParameter(Parameters.Theta, 0);
            setParameter(Parameters.Phi, 0);
        });
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
let planeModel;
const loader = new GLTFLoader();
const cacheBuster = new Date().getTime(); // Get the current timestamp
let plane = new THREE.Object3D();

loader.load('./assets/3d-models/plane.glb?v=${cacheBuster}', function (gltf) {
    planeModel = gltf.scene;
    planeModel.scale.set(.2, .2, .2);
    planeModel.position.set(0, .35, 0);
    plane.add(planeModel)
    scene.add(plane)
}
);

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);

    let x = Parameters.X.value;
    let y = Parameters.Y.value;
    let z = Parameters.Z.value;
    let psi = Parameters.Psi.value;
    let theta = Parameters.Theta.value;
    let phi = Parameters.Phi.value;

    // Camera

    // blue is actually y, red is z, green is x
    // x -> y, y -> z, z -> x
    // 1 -> 2, 2 -> 3, 3 -> 1
    plane.position.set(y, z, x);

    // rotate them in the order given by Parameters.Sequence.value
    let sequence = Parameters.Seqeunce.value;
    let quaternion = new THREE.Quaternion();
    let rotation1 = [0, 0, 0];
    let rotation2 = [0, 0, 0];
    let rotation3 = [0, 0, 0];
    // 123 is actually 231
    // 1 maps to index 2
    // 2 maps to index 0
    // 3 maps to index 1
    rotation1[(Number(sequence[0]) + 1) % 3] = psi;
    rotation2[(Number(sequence[1]) + 1) % 3] = theta;
    rotation3[(Number(sequence[2]) + 1) % 3] = phi;
    quaternion.setFromEuler(new THREE.Euler(...rotation1, 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation2, 'XYZ')));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation3, 'XYZ')));


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
