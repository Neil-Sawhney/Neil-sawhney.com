class Text {

	constructor(x, y, spdx, spdy) {
		this.x = x;
		this.y = y;
		this.spdx = spdx;
		this.spdy = spdy;
	}



	updateEntity() {

		ctx.font = '40px monospace';
		ctx.fillStyle = 'black';
		if (this.x >= canvas.width || this.x <= 0) this.spdx = -this.spdx;
		if (this.y >= canvas.height || this.y <= 0) this.spdy = -this.spdy;
		this.x += this.spdx;
		this.y += this.spdy;
		ctx.fillText("HELLO", this.x, this.y);
	}
}

var blinkyLeft = new Image();
var blinkyRight = new Image();
var obiPinkLeft = new Image();
var obiPinkRight = new Image();
var obiSilverLeft = new Image();
var obiSilverRight = new Image();
var obiTealLeft = new Image();
var obiTealRight = new Image();
var obiYellowLeft = new Image();
var obiYellowRight = new Image();
blinkyLeft.src = "/obitag/img/blinkyLeft.png";
blinkyRight.src = "/obitag/img/blinkyRight.png";
obiPinkLeft.src = "/obitag/img/obiPinkLeft.png";
obiPinkRight.src = "/obitag/img/obiPinkRight.png";
obiSilverLeft.src = "/obitag/img/obiSilverLeft.png";
obiSilverRight.src = "/obitag/img/obiSilverRight.png";
obiTealLeft.src = "/obitag/img/obiTealLeft.png";
obiTealRight.src = "/obitag/img/obiTealRight.png";
obiYellowLeft.src = "/obitag/img/obiYellowLeft.png";
obiYellowRight.src = "/obitag/img/obiYellowRight.png";

class playerData {

	constructor(x, y, speed, player) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.yVel = 0;
		this.player = player;

		this.width = 40;
		this.height = 40;
		this.frame = 0;
		this.direction = "right";
		this.isMoving = false;

		this.counter = 0;

		this.ticket = -1;

		this.jumpBool = false;



	}

	key(direction) {
		if (direction == "left") {
			switch (this.player) {
				case 0:
					return Key.LEFT;
				case 1:
					return Key.LEFT;
				case 2:
					return Key.A;
				case 3:
					return Key.F;
				case 4:
					return Key.J;

			}
		} else if (direction == "right") {

			switch (this.player) {
				case 0:
					return Key.RIGHT;
				case 1:
					return Key.RIGHT;
				case 2:
					return Key.D;
				case 3:
					return Key.H;
				case 4:
					return Key.L;
			}
		} else if (direction == "up") {

			switch (this.player) {
				case 0:
					return Key.UP;
				case 1:
					return Key.UP;
				case 2:
					return Key.W;
				case 3:
					return Key.T;
				case 4:
					return Key.I;
			}
		}

	}
	move() {

		if (this.x > 0) {
			if (Key.isDown(this.key("left"))) {
				this.moveLeft();
				this.isMoving = true;
			} else if (!Key.isDown(this.key("right"))) this.isMoving = false;
		}

		if (this.x + this.width < canvas.width) {
			if (Key.isDown(this.key("right"))) {
				this.moveRight();
				this.isMoving = true;
			} else if (!Key.isDown(this.key("left"))) this.isMoving = false;
		}

		if (Key.isDown(this.key("up")) /* || Key.isDown(Key.SPACE)*/ ) this.jump();

	}

	moveLeft() {

		if (!collision.whereAmIBeingTouched(this.ticket).includes(0)) {
			this.direction = "left";
			this.x -= this.speed;
		}
	}

	moveRight() {

		if (!collision.whereAmIBeingTouched(this.ticket).includes(1)) {
			this.direction = "right";
			this.x += this.speed;
		}

	}

	jump() {
		if (collision.whereAmIBeingTouched(this.ticket).includes(3) && !collision.whereAmIBeingTouched(this.ticket).includes(2)) {
			this.jumpBool = true;
			this.yVel = 10;

			//how far the up will be
			this.boopdeba = 15;
		}

	}


	gravity() {

		if (!collision.whereAmIBeingTouched(this.ticket).includes(3) && this.jumpBool == false) {

			this.yVel = -10;

		} else if (this.jumpBool == false) {
			this.yVel = 0;
		}


		if (this.jumpBool == true) {
			if (this.boopdeba > 0 && !collision.whereAmIBeingTouched(this.ticket).includes(2) ) {
				this.y -= this.yVel;
				this.boopdeba--;
			} else
				this.jumpBool = false;

		} else {
			this.y -= this.yVel;
		}





	}

	drawPlayer(x, y, width, height, img) {
		if (this.isMoving) {

			if ((this.counter++ % 3) == 0) {
				if (this.frame < 11) this.frame++;
				else {
					this.frame = 0;

				}
			}

		} else {

			if ((this.counter++ % 5) == 0) {
				if (this.frame < 10) this.frame += 2;
				else {
					this.frame = 0;
				}
			}
		}


		ctx.drawImage(this.pickPlayer(), 150 * this.frame, 0, 150, 160, x, y, width, height);
	}

	pickPlayer() {

		if (this.direction == "left") {
			switch (this.player) {
				case 0:
					return blinkyLeft;
				case 1:
					return obiPinkLeft;
				case 2:
					return obiSilverLeft;
				case 3:
					return obiTealLeft;
				case 4:
					return obiYellowLeft;
			}
		} else if (this.direction == "right") {
			switch (this.player) {
				case 0:
					return blinkyRight;
				case 1:
					return obiPinkRight;
				case 2:
					return obiSilverRight;
				case 3:
					return obiTealRight;
				case 4:
					return obiYellowRight;
			}
		}
	}

	//sends coords for vectors that make up  border [[x1, y1, x2, y2],[x1, y1, x2, y2]]
	touching() {

		this.bounds = {
			left: [this.x, this.y + 1, this.x, this.y + this.height - 1],
			right: [this.x + this.width, this.y + 1, this.x + this.width, this.y + this.height - 1],
			top: [this.x + 1, this.y, this.x + this.width - 1, this.y],
			bottom: [this.x + 1, this.y + this.height, this.x + this.width - 1, this.y + this.height],
		};


		this.combined = [this.bounds.left, this.bounds.right, this.bounds.top, this.bounds.bottom];

		if (this.ticket == -1) {
			this.ticket = collision.addObject(this.combined);
		} else {
			collision.addObject(this.combined, this.ticket);
		}


	}


	updateEntity() {
		this.drawPlayer(this.x, this.y, this.width, this.height, 1);
		this.move();
		this.gravity();
		this.touching();
	}
}
