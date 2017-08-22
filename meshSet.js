function GLSLAttribute(attributeName, variableName, sizeName) {
	this.attributeName = attributeName;
	this.variableName = variableName;
	this.sizeName = sizeName;
	this.stride = sizeName;
	this.offset = 0;
	this.location = undefined;
	this.buffer = undefined;
}

GLSLAttribute.prototype.aggregateData = function(meshes, name) {
	return Array.prototype.concat.apply([], meshes.map(mesh => mesh[name]));
}

function MeshSet(glContext, meshes, programInfo, attributes, textureIds) {
	this.gl = glContext;
	this.vao = this.gl.createVertexArray();
	this.gl.bindVertexArray(this.vao);

	this.attributes = attributes;
	this.attributes.forEach(attribute => {
		attribute.buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attribute.buffer);
		let data = new Float32Array(attribute.aggregateData(meshes, attribute.variableName));
		this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
		attribute.location = this.gl.getAttribLocation(programInfo.program, attribute.attributeName);
		this.gl.vertexAttribPointer(
			attribute.location,
			Block.prototype[attribute.sizeName],
			this.gl.FLOAT,
			this.gl.FALSE,
			Block.prototype[attribute.sizeName]*Float32Array.BYTES_PER_ELEMENT,
			0*Float32Array.BYTES_PER_ELEMENT
		);
		this.gl.enableVertexAttribArray(attribute.location);
	});

	let offset = 0;
	this.indexData = Array.prototype.concat.apply([], meshes.map(p => {
		let ret = p.indexData.map(i => i + offset);
		offset += p.vertexLength;
		return ret;
	}));
	indexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), this.gl.STATIC_DRAW);

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
	this.bindTextures();
	this.gl.bindVertexArray(null);
}

MeshSet.prototype.updateVertexData = function(meshes) {
	let vertexBuffer = this.attributes.find(attr => attr.variableName === 'vertexData');
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer.buffer);
	let vertexData = Array.prototype.concat.apply([], meshes.map(p => p.vertexData));
	this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(vertexData));
}

MeshSet.prototype.draw = function() {
	this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
}

// MeshSet.prototype.bind = function() {
// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
// 	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
// }

// MeshSet.prototype.unbind = function() {
// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
// 	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
// }

// MeshSet.prototype.enableAttributes = function() {
// 	this.attributes.forEach(attribute => {
// 	});
// }

// MeshSet.prototype.disableAttributes = function() {
// 	this.attributes.forEach(attribute => {
// 		this.gl.disableVertexAttribArray(attribute.location);
// 	});
// }

MeshSet.prototype.bindTextures = function() {
	this.textures.forEach((texture, i) => {
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.activeTexture(this.gl.TEXTURE0 + i);
	});
}
