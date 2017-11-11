class TerrainRenderer extends Renderer {

    constructor(programInfo) {
        super(programInfo, [new Terrain()], []);

        this.attributes = [
            new Attribute('vertexData', 2, this.gl.ARRAY_BUFFER, this.gl.STATIC_DRAW),
        ];
        this.initAttributes();
        this.initIndexData();
        
        this.programInfo.use();
        this.programInfo.setRadius(Terrain.prototype.radius);
    }

    render() {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexData.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
