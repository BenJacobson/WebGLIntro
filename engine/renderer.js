class Renderer {
    
    constructor(programInfo, entities, textureIds) {
        this.gl = programInfo.gl;
        this.programInfo = programInfo;


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

}
