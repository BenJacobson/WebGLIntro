class Renderer {
    
    constructor(programInfo, entities, textureIds) {
        this.gl = programInfo.gl;
        this.programInfo = programInfo;
        this.entities = entities;

        this.vao = this.gl.createVertexArray();
        this.initTextures(textureIds);
    }

    aggregateData(name) {
        return Array.prototype.concat.apply([], this.entities.map(entity => entity[name]));
    }

    initAttributes() {
        this.gl.bindVertexArray(this.vao);

        this.attributes.forEach(attribute => {
            attribute.buffer = this.gl.createBuffer();
            this.gl.bindBuffer(attribute.bufferType, attribute.buffer);
            let data = new Float32Array(this.aggregateData(attribute.name));
            this.gl.bufferData(attribute.bufferType, data, attribute.drawType);
            attribute.location = this.programInfo.getAttribLocation(attribute.name);
            this.gl.vertexAttribPointer(
                attribute.location,
                attribute.size,
                this.gl.FLOAT,
                false,
                attribute.stride*Float32Array.BYTES_PER_ELEMENT,
                0*Float32Array.BYTES_PER_ELEMENT
            );
            this.gl.enableVertexAttribArray(attribute.location);
        });
    }

    initIndexData() {
        let offset = 0;
        this.indexData = Array.prototype.concat.apply([], this.entities.map(entity => {
            const ret = entity.indexData.map(i => i + offset);
            offset += entity.vertexLength;
            return ret;
        }));
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), this.gl.STATIC_DRAW);
        this.gl.bindVertexArray(null);
    }

    initTextures(textureIds) {
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
    }

    bindTextures() {
        this.textures.forEach((texture, i) => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
        });
    }


    checkUpdates() {
        this.entities.forEach((entity, i) => {
            if (entity.vertexDataUpdated) {
                const vertexAttribute = this.attributes.find(attribute => attribute.name.includes('vertexData'));
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexAttribute.buffer);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(entity.vertexData));
                entity.vertexDataUpdated = false;
            }
        });
    }

}
