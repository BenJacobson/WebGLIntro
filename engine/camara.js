class Camara {

	static get TAU() {
		return Math.PI * 2;
	}
	
	constructor(x, y, z, rotx, roty) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.rotx = rotx;
		this.roty = roty;
		this.origin = [0, 0, 0];
		this.change = true;
	}

	getLocation() {
		return [this.x, this.y, this.z];
	}

	move(vector) {
		let [dx, dy, dz] = vector;
		this.x += dx;
		this.y += dy;
		this.z += dz;
		this.change = true;
	}

	worldOrientToCamaraOrient(v) {
		vec3.rotateX(v, v, this.origin, -this.rotx);
		vec3.rotateY(v, v, this.origin, -this.roty);
		return v;
	}

	moveForward(d) {
		let v = [0, 0, d];
		this.worldOrientToCamaraOrient(v);
		this.move(v);
	}

	moveBackward(d) {
		this.moveForward(-d);
	}

	moveLeft(d) {
		let v = [d, 0, 0];
		this.worldOrientToCamaraOrient(v);
		this.move(v);
	}

	moveRight(d) {
		this.moveLeft(-d);
	}

	rotateForward(r) {
		this.rotateBackward(-r);
	}

	rotateBackward(r) {
		this.rotx += r;
		this.change = true;
	}

	rotateLeft(r) {
		this.rotateRight(-r);
	}

	rotateRight(r) {
		this.roty += r;
		this.change = true;
	}
}