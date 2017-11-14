class Block {
	constructor(x=0, y=0, z=0, size=1) {
		this.vertexLength = 24;
		this.vertexComponents = 3;
		this.size = size;
		this.updateVertexData(x, y, z);
		this.vertexDataUpdated = false;
	}

	updateVertexData(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		const offsets = [x, y, z];
		this.vertexData = Block.prototype.vertexData.map((v, i) => {
			return v * this.size + offsets[i % offsets.length];
		});
		this.vertexDataUpdated = true;
	}

	contains(x, y, z) {
		return this.x-this.size <= x && x <= this.x+this.size &&
				this.y-this.size <= y && y <= this.y+this.size &&
				this.z-this.size <= z && z <= this.z+this.size;
	}
}

Block.prototype.normalData = [
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,

	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,

	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,

	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,

	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,
	0.0, 0.0, -1.0,

	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
	0.0, -1.0, 0.0,
];

Block.prototype.textureCoords = [
	0.0, 0.0,
	0.0, 1.0,
	1.0, 1.0,
	1.0, 0.0,

	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,

	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,

	1.0, 1.0,
	1.0, 0.0,
	0.0, 0.0,
	0.0, 1.0,

	0.0, 0.0,
	0.0, 1.0,
	1.0, 1.0,
	1.0, 0.0,

	1.0, 1.0,
	1.0, 0.0,
	0.0, 0.0,
	0.0, 1.0,
];

Block.prototype.vertexData = [
	// Top
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

	// Left
	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	// Right
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

	// Front
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	// Bottom
	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
];

Block.prototype.indexData =
[
	// Top
	0, 1, 2,
	0, 2, 3,

	// Left
	5, 4, 6,
	6, 4, 7,

	// Right
	8, 9, 10,
	8, 10, 11,

	// Front
	13, 12, 14,
	15, 14, 12,

	// Back
	16, 17, 18,
	16, 18, 19,

	// Bottom
	21, 20, 22,
	22, 20, 23
];
