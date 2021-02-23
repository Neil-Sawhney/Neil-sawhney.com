//canvas
var canvas = document.getElementById('coolcanvas'),
	ctx = canvas.getContext('2d');

var background = new Image();
background.src = "/obitag/img/obiTagBackground.png";

function setBackground() {
	ctx.drawImage(background, 0, 0,canvas. width,canvas.height);
}
window.onload = function() {document.querySelector(".cover").style.visibility = "hidden";};


const text1 = new Text(50, 50, 1, 1);
const text2 = new Text(10, 50, -1, 2);
const player = new playerData(0, 0, 5, 0);
const player1 = new playerData(100, 0, 5, 1);
const player2 = new playerData(200, 0, 5, 2);
const player3 = new playerData(300, 0, 5, 3);
const player4 = new playerData(400, 0, 5, 4);

//update functions

const FRAMES_PER_SECOND = 60; 

// set the mim time to render the next frame
const FRAME_MIN_TIME = (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;
var lastFrameTime = 0; // the last frame time

//add floor to collision detection
collision.addObject([[0,canvas.height,canvas.width, canvas.height]]);
function update(time) {

	if (time - lastFrameTime < FRAME_MIN_TIME) { //skip the frame if the call is too early
		requestAnimationFrame(update);
		return; // return as there is nothing to do
	}
	lastFrameTime = time; // remember the time of the rendered frame
	// render the frame
	setBackground();

	text1.updateEntity();
	text2.updateEntity();
	player.updateEntity();
	player2.updateEntity();
	player3.updateEntity();
	player4.updateEntity();
	requestAnimationFrame(update); // get next farme
}
requestAnimationFrame(update); // start animation



var Key = {
	_pressed: {},

	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	SPACE: 32,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	T: 84,
	F: 70,
	G: 71,
	H: 72,
	W: 87,
	A: 65,
	S: 83,
	D: 68,

	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},

	onKeydown: function(event) {
		this._pressed[event.keyCode] = true;
	},

	onKeyup: function(event) {
		delete this._pressed[event.keyCode];
	}
};


window.addEventListener('keyup', function(event) {
	Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function(event) {
	Key.onKeydown(event);
}, false);
