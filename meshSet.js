function MeshSet(glContext, meshes) {
	this.gl = glContext;
	this.vertexData = Array.prototype.concat.apply([], meshes.map(p => p.customVertexData));
	let offset = 0;
	this.indexData = Array.prototype.concat.apply([], meshes.map(p => {
		let ret = p.indexData.map(i => i + offset);
		offset += p.vertexLength;
		return ret;
	}));

	this.vertexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertexData), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	this.indexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
}

MeshSet.prototype.draw = function() {
	this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
}

MeshSet.prototype.bind = function() {
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
}

MeshSet.prototype.unbind = function() {
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
}

