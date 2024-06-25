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

// the order is indeed (red, green, blue)!!
// that will get messed up with the initial conditions though so make sure to comment out the quarterion stuff when setting this up
loader.load('./assets/3d-models/racket.glb?v=${' + cacheBuster + '}', function (gltf) {
    racket = gltf.scene;
    racket.scale.set(0.119 / 1.6143269538879395, 0.119 / 1.6143269538879395, 0.119 / 1.6143269538879395);
    racket.rotation.set(Math.PI/2, 0, 0);
    racket.position.set(0, -0.05, 0);
    racketOffset.add(racket);
}
);
scene.add(racketOffset)


const parameters = {
    Phi: { display_value: 1e-1, min: 1e-1, max: 360, id: '\\( \\phi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Theta: { display_value: 1e-1, min: 1e-1, max: 180, id: '\\( \\theta_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    Psi: { display_value: 90, min: 1e-1, max: 360, id: '\\( \\psi_0 \\)', units: '\\( ^{\\circ} \\)', angle: true },
    PhiDot: { display_value: 1e-1, min: 1e-1, max: 500, id: '\\( \\dot{\\phi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true },
    ThetaDot: { display_value: 200, min: 1e-1, max: 500, id: '\\( \\dot{\\theta}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true },
    PsiDot: { display_value: 1e-1, min: 1e-1, max: 500, id: '\\( \\dot{\\psi}_0 \\)', units: ' \\( \\frac{deg}{s} \\)', angle: true },
    Time: { display_value: 20, min: 1, max: 60, id: 'Run Time', units: ' \\( s \\)' },
    Reset: { id: 'RESET' }
};

let equations = function (t, y) {
    let phi = y[0], theta = y[1], psi = y[2], phiDot = y[3], thetaDot = y[4], psiDot = y[5];

    // Calculate second derivatives based on your equations
    let psiDotDot =
        1.7572810169307 * Math.pow(Math.sin(psi), 2) * Math.sin(theta) * phiDot * thetaDot +
        (0.153547008547009 * Math.pow(Math.sin(psi), 2) * psiDot * thetaDot) / Math.tan(theta) +
        (0.153547008547009 * Math.pow(Math.sin(psi), 2) * phiDot * thetaDot) / Math.sin(theta) -
        0.955414012738854 * Math.sin(psi) * Math.pow(Math.sin(theta), 2) * Math.cos(psi) * Math.pow(phiDot, 2) -
        (0.0767735042735043 * Math.sin(psi) * Math.sin(2.0 * theta) * Math.cos(psi) * Math.pow(phiDot, 2)) / Math.tan(theta) -
        0.153547008547009 * Math.sin(psi) * Math.cos(psi) * Math.cos(theta) * phiDot * psiDot +
        0.955414012738854 * Math.sin(psi) * Math.cos(psi) * Math.pow(thetaDot, 2) -
        1.79797811530296 * Math.sin(theta) * phiDot * thetaDot -
        (0.157435897435897 * psiDot * thetaDot) / Math.tan(theta) +
        (1.8425641025641 * phiDot * thetaDot) / Math.sin(theta);

    let thetaDotDot =
        -0.153547008547009 * Math.sin(Math.pow(psi, 2)) * Math.sin(theta) * phiDot * psiDot
        - 0.0767735042735043 * Math.sin(Math.pow(psi, 2)) * Math.sin(2.0 * theta) * Math.pow(phiDot, 2)
        - 0.153547008547009 * Math.sin(psi) * Math.cos(psi) * Math.cos(theta) * phiDot * thetaDot
        - 0.153547008547009 * Math.sin(psi) * Math.cos(psi) * psiDot * thetaDot
        - 0.00388888888888889 * Math.sin(theta) * phiDot * psiDot
        + 0.498055555555556 * Math.sin(2.0 * theta) * Math.pow(phiDot, 2);
    let phiDotDot =
        (
            -0.153547008547009 * Math.pow(Math.sin(psi), 2) * Math.cos(theta) * phiDot * thetaDot
            - 0.153547008547009 * Math.pow(Math.sin(psi), 2) * psiDot * thetaDot
            + 0.153547008547009 * Math.sin(psi) * Math.sin(theta) * Math.cos(psi) * phiDot * psiDot
            + 0.0767735042735043 * Math.sin(psi) * Math.sin(2.0 * theta) * Math.cos(psi) * Math.pow(phiDot, 2)
            - 1.8425641025641 * Math.cos(theta) * phiDot * thetaDot
            + 0.157435897435897 * psiDot * thetaDot
        ) / Math.sin(theta);

    return [phiDot, thetaDot, psiDot, phiDotDot, thetaDotDot, psiDotDot];
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
        if (parameter.angle) {
            value = value * 180 / Math.PI;
        }

        else {
            value = Math.round(value * 100) / 100;
        }

        parameter.display_value = value;

        let slider = wrapper.getElementsByTagName("input")[0];
        slider.value = value;
        let output = wrapper.getElementsByTagName("output")[0];
        output.innerHTML = value;
    }
}

function setupParameter(parameter) {
    return new Promise((resolve, reject) => {
        let parameterWrapper = document.getElementsByTagName("parameterWrapper")[0];

        // if it has options then create a select
        if (parameter.options) {

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
            resolve();
            return;
        }

        // otherwise if it has a display value create a slider
        if (parameter.display_value != null) {
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
            resolve();
            return;
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

            resolve();
            return;
        }

        else {
            parameter.value = 0;
            resolve();
            return;
        }

    });
}

function animate() {
    animationId = requestAnimationFrame(animate);

    if (time >= parameters.Time.value) {
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

    // these are important
    // this model was solved with a 313 sequence
    // because the viewport is rotated, blue = e1, red = e2, green = e3
    // therefore we want to rotate around green, blue, green
    // which means (0, phi, 0), (theta, 0, 0), (0, psi, 0)
    quaternion.setFromEuler(new THREE.Euler(0, phi, 0, coord_order));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(theta, 0, 0, coord_order)));
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

let restart = function () {
    cancelAnimationFrame(animationId);
    // Call the ode solver
    let y0 = [parameters.Phi.value, parameters.Theta.value, parameters.Psi.value, parameters.PhiDot.value, parameters.ThetaDot.value, parameters.PsiDot.value];
    result = numeric.dopri(t0, parameters.Time.value, y0, equations, 1e-6, 5e4);

    time = parameters.Time.value;
    animate();
}

// Initialize parameters
let promises = [];
for (let parameter in parameters) {
    promises.push(setupParameter(parameters[parameter]));
}
console.log(promises);
await Promise.all(promises);
let defaultParameters = JSON.parse(JSON.stringify(parameters));
console.log("All parameters initialized");

// add event listener to reset button
document.getElementById("RESET").addEventListener("click", function () {
    for (let parameter in parameters) {
        setParameter(parameters[parameter], defaultParameters[parameter].value);
    }
    restart();
});

let y0 = [parameters.Phi.value, parameters.Theta.value, parameters.Psi.value, parameters.PhiDot.value, parameters.ThetaDot.value, parameters.PsiDot.value];
let t0 = 0
let result = numeric.dopri(t0, parameters.Time.value, y0, equations, 1e-6, 5e4);
await result;
console.log(result)

let pointToTrace = new THREE.Vector3(0, -0.37, 0);
var points = [];
var lines = [];
var recentLines = [];
let animationId;

let clock = new Clock();
let time = clock.getElapsedTime();

animate();