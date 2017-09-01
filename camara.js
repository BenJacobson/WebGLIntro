function Camara(x, y, z, rotx, roty) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.rotx = rotx;
	this.roty = roty;
	this.change = true;
}

Camara.prototype.TAU = Math.PI * 2;
Camara.prototype.origin = [0, 0, 0];

Camara.prototype.getLocation = function() {
	return [this.x, this.y, this.z];
}

Camara.prototype.move = function(vector) {
	let [dx, dy, dz] = vector;
	this.x += dx;
	this.y += dy;
	this.z += dz;
	this.change = true;
}

Camara.prototype.worldOrientToCamaraOrient = function(v) {
	vec3.rotateX(v, v, this.origin, -this.rotx);
	vec3.rotateY(v, v, this.origin, -this.roty);
	return v;
}

Camara.prototype.moveForward = function(d) {
	let v = [0, 0, d];
	this.worldOrientToCamaraOrient(v);
	this.move(v);
}

Camara.prototype.moveBackward = function(d) {
	this.moveForward(-d);
}

Camara.prototype.moveLeft = function(d) {
	let v = [d, 0, 0];
	this.worldOrientToCamaraOrient(v);
	this.move(v);
}

Camara.prototype.moveRight = function(d) {
	this.moveLeft(-d);
}

Camara.prototype.rotateForward = function(r) {
	this.rotateBackward(-r);
}

Camara.prototype.rotateBackward = function(r) {
	this.rotx += r;
	this.change = true;
}

Camara.prototype.rotateLeft = function(r) {
	this.rotateRight(-r);
}

Camara.prototype.rotateRight = function(r) {
	this.roty += r;
	this.change = true;
}
