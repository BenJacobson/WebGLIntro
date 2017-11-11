class Terrain {
    constructor() {
        this.vertexData = Terrain.prototype.vertexData.map(
            v => v * this.radius
        );
    }
}

Terrain.prototype.vertexLength = 4;
Terrain.prototype.radius = 500.0;

Terrain.prototype.indexData = [
    0, 1, 2,
    0, 2, 3,
];

Terrain.prototype.vertexData = [
    -1.0, -1.0,
     1.0, -1.0,
     1.0,  1.0,
    -1.0,  1.0,
];
