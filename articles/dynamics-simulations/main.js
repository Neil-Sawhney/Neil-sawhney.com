import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Clock } from 'three/src/core/Clock.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera
camera.position.set(2, 2, 2);
camera.lookAt(0, 0, 0);


// Axes
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Sphere
const sphere = new THREE.Object3D();
const geometry = new THREE.SphereGeometry(0.5, 25, 25);
const material = new THREE.MeshBasicMaterial( { color: 0x00ffff, transparent: true, opacity: 0.9} );
const sphereGeom = new THREE.Mesh( geometry, material );
const edges = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 2});
const wireframe = new THREE.LineSegments(edges, edgeMaterial);
sphere.add( sphereGeom );
sphereGeom.add( wireframe );
sphereGeom.position.set(0, 0.5, 0);
scene.add( sphere );

class Data {
    constructor(filename) {
        this.data = [];
        this.loaded = this.getData(filename);
    }

    then(callback) {
        if (this.loaded) {
            callback(this);
        } else {
            setTimeout(() => this.then(callback), 100); // Check again in a little bit
        }
    }

    // loads in the data from phi.csv, theta.csv, and psi.csv and stores them in the arrays
    // the data has 2 columns, the first is the time and the second is the angle
    // the first row is the header, so it is skipped
    async getData(filename) {
        let response = await fetch(filename);
        let allText = await response.text();
        let allTextLines = allText.split(/\r\n|\n/);
        for (let i = 1; i < allTextLines.length; i++) {
            let row = allTextLines[i].split(',');
            if (row.length == 2) {
                this.data.push([parseFloat(row[0]), parseFloat(row[1])*Math.PI/180]);
            }
        }
        this.loaded = true;
    }

    // returns the value of the data at a given time
    // if the time is not in the data, it will return the value of the closest time
    // after the last time, the cycle will repeat
    interpolate(time) {
        let i = 0;
        time = time % this.data[this.data.length-1][0];
        while (this.data[i][0] < time) {
            i++;
        }
        return this.data[i][1];
    }
}

let phi = new Data("/articles/dynamics-simulations/calculations/phi.csv");
let theta= new Data("/articles/dynamics-simulations/calculations/theta.csv");
let psi= new Data("/articles/dynamics-simulations/calculations/psi.csv");
phi.then(() => { console.log(phi.data); });
theta.then(() => { console.log(theta.data); });
psi.then(() => { console.log(psi.data); });

const clock = new Clock();
function animate() {
	requestAnimationFrame( animate );

    let time = clock.getElapsedTime();
    // consolV.log("time: " + time);
    // console.log("phi: " + phi.interpolate(time));
    // console.log("theta: " + theta.interpolate(time));
    // console.log("psi: " + psi.interpolate(time));

    // sphere and outline rotate together
    let quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, 0, phi.interpolate(time), 'XYZ'));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(theta.interpolate(time), 0, 0, 'XYZ')));
    quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, psi.interpolate(time), 'XYZ')));
    sphere.setRotationFromQuaternion(quaternion);

	renderer.render( scene, camera );
}
animate();