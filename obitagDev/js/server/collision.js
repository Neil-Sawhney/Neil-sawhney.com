//keeps track of all collision object vectors 
var collision = {

	//array of all objects (which are arrays of vectors, where each vector is an array of points)
	objects: [],


	//apends object to objects array and return the index it puts it in, if it isnt already defined
	addObject(newObject, index) {
		if (index === undefined) {
			this.objects.push(newObject);
		} else {
			this.objects[index] = newObject;
		}

		return (this.objects.length - 1);

	},

	//takes 4 numbers in an array and returns array of 2 numbers
	moveToOrigin(coords) {
		return [coords[2] - coords[0], coords[3] - coords[1]];
	},


	//takes two vectors (not moved to origin)  and determine if their points are on opposite sides of each other 
	intersect(vector1, vector2) {

		//point 1 on vector 1 with vector 2
		let vectorCross1 = this.moveToOrigin([vector1[0], vector1[1], vector2[0], vector2[1]]);
		let vectorCross2 = this.moveToOrigin([vector1[0], vector1[1], vector2[2], vector2[3]]);
		let sign1 = (vectorCross1[0] * vectorCross2[1]) - (vectorCross1[1] * vectorCross2[0]);
		var halfcheck = false;

		if (sign1 > 0) {
			sign1 = true;
		} else if (sign1 < 0) {
			sign1 = false;
		} else {
			if (this.checkExceptions(vector1[0], vector1[1], vector2))
				return true;
			else
				sign1 = "maybe";
		}

		//point 2 on vector 1 with vector 2
		vectorCross1 = this.moveToOrigin([vector1[2], vector1[3], vector2[0], vector2[1]]);
		vectorCross2 = this.moveToOrigin([vector1[2], vector1[3], vector2[2], vector2[3]]);
		let sign2 = (vectorCross1[0] * vectorCross2[1]) - (vectorCross1[1] * vectorCross2[0]);
		if (sign2 > 0) {
			sign2 = true;
		} else if (sign2 < 0) {
			sign2 = false;
		} else {
			if (this.checkExceptions(vector1[2], vector1[3], vector2))
				return true;
		}

		if (sign1 == "maybe")
			return false;

		else if (sign1 == sign2)
			return false;
		else
			halfCheck = true;


		//point 1 on vector 2 with vector 1
		vectorCross1 = this.moveToOrigin([vector2[0], vector2[1], vector1[0], vector1[1]]);
		vectorCross2 = this.moveToOrigin([vector2[0], vector2[1], vector1[2], vector1[3]]);
		sign1 = (vectorCross2[0] * vectorCross1[1]) - (vectorCross2[1] * vectorCross1[0]);

		if (sign1 > 0) {
			sign1 = true;
		} else if (sign1 < 0) {
			sign1 = false;
		} else {
			if (this.checkExceptions(vector2[0], vector2[1], vector1))
				return true;
			else
				sign1 = "maybe";
		}

		//point 2 on vector 2 with vector 1
		vectorCross1 = this.moveToOrigin([vector2[2], vector2[3], vector1[0], vector1[1]]);
		vectorCross2 = this.moveToOrigin([vector2[2], vector2[3], vector1[2], vector1[3]]);
		sign2 = (vectorCross2[0] * vectorCross1[1]) - (vectorCross2[1] * vectorCross1[0]);
		if (sign2 > 0) {
			sign2 = true;
		} else if (sign2 < 0) {
			sign2 = false;
		} else {
			if (this.checkExceptions(vector2[2], vector2[3], vector1))
				return true;
		}




		if ((sign1 != "maybe") && (sign1 != sign2) && (halfCheck = true))
			return true;
		else
			return false;

		if (sign1 == "maybe")
			return false;

		else if (sign1 == sign2)
			return false;

		else if (halfCheck == true)
			return true;
		else
			return false;
	},

	//just check if they intersect. returns true if they do, false otherwise
	checkExceptions(x, y, vector) {
		if ((vector[0] <= x) && (x <= vector[2]) && (vector[1] <= y) && (y <= vector[3])) {
			return true;
		} else {
			return false;
		}
	},




	//contains a list of all colliding vectors and objects in the form [[v1, v2, o1, o2], ....]
	collisions: [],

	/*
	 * checks each vector with every other one, besides the ones of its own shape. Saves intersecting vector index's to
	 * collisions array like this [[0,1,0,1],[2,1,0,2]....] where the first two are the vectors, and the second two are the objects
	 */
	checkCollision() {
		this.collisions = [];
		for (let objectIndex = 0; objectIndex < this.objects.length; ++objectIndex) {

			for (let vectorIndex = 0; vectorIndex < this.objects[objectIndex].length; ++vectorIndex) {

				let vector1 = this.objects[objectIndex][vectorIndex];
				for (let object2Index = 0; object2Index < this.objects.length; ++object2Index) {

					if (object2Index != objectIndex) {
						for (let vector2Index = 0; vector2Index < this.objects[object2Index].length; ++vector2Index) {

							let vector2 = this.objects[object2Index][vector2Index];
							if (this.intersect(vector1, vector2) == true)
								this.collisions.push([vectorIndex, vector2Index, objectIndex, object2Index]);

						}
					}
				}


			}
		}
		return this.collisions;	
	},

	//takes an object index and returns the vectors index's  on it that are colliding with something, in an array  
	whereAmIBeingTouched(objectIndex) {
		this.checkCollision();
		let thisIsWhereHeTouchedMe = [];

		for (let i = 0; i < this.collisions.length; ++i) {
			if (this.collisions[i][2] == objectIndex) {
				let nono = false;
				for (let n = 0; n < thisIsWhereHeTouchedMe.length; n++) {
					if (this.collisions[i][0] == thisIsWhereHeTouchedMe[n])
					{
						nono = true;
					}
				}

				if (nono == false)
					thisIsWhereHeTouchedMe.push(this.collisions[i][0]);
			}

		}
		return thisIsWhereHeTouchedMe;

	},

};
