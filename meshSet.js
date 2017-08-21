function MeshSet(glContext, meshes, programInfo, attributes, textureIds) {
	this.gl = glContext;
	this.vao = this.gl.createVertexArray();
	this.gl.bindVertexArray(this.vao);
	this.vertexBuffer = this.gl.createBuffer();
	this.indexBuffer = this.gl.createBuffer();
	this.bind();
	this.updateMeshData(meshes, true);
	this.attributes = attributes;
	this.attributes.forEach(attribute => {
		attribute.location = this.gl.getAttribLocation(programInfo.program, attribute.name);
	});

	this.textures = textureIds.map(textureId => {
		let texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			document.getElementById(textureId)
		);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		return texture;
	});
	this.enableAttributes();
	this.bindTextures();
	this.gl.bindVertexArray(null);
}

MeshSet.prototype.updateMeshData = function(meshes, first=false) {
	this.vertexData = Array.prototype.concat.apply([], meshes.map(p => p.customVertexData));
	let offset = 0;
	this.indexData = Array.prototype.concat.apply([], meshes.map(p => {
		let ret = p.indexData.map(i => i + offset);
		offset += p.vertexLength;
		return ret;
	}));
	
	this.bind();
	if (first) {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertexData), this.gl.DYNAMIC_DRAW);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), this.gl.DYNAMIC_DRAW);
	} else {
		this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.vertexData));
		this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(this.indexData));
	}
}

MeshSet.prototype.draw = function() {
	this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
}

MeshSet.prototype.bind = function() {
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
}

// MeshSet.prototype.unbind = function() {
// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
// 	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
// }

MeshSet.prototype.enableAttributes = function() {
	this.attributes.forEach(attribute => {
		this.gl.vertexAttribPointer(
			attribute.location,
			attribute.size,
			this.gl.FLOAT,
			this.gl.FALSE,
			attribute.stride*Float32Array.BYTES_PER_ELEMENT,
			attribute.offset*Float32Array.BYTES_PER_ELEMENT
		);
		this.gl.enableVertexAttribArray(attribute.location);
	});
}

MeshSet.prototype.disableAttributes = function() {
	this.attributes.forEach(attribute => {
		this.gl.disableVertexAttribArray(attribute.location);
	});
}

MeshSet.prototype.bindTextures = function() {
	this.textures.forEach((texture, i) => {
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.activeTexture(this.gl.TEXTURE0 + i);
	});
}
