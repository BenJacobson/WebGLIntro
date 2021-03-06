class Player {
    constructor(x=0, y=0, z=0) {
        this.x = this.y = this.z = 0;
        this.vertexLength = 24;
        this.vertexComponents = 3;
        this.vertexData = new Array(Player.prototype.vertexData.length);
        this.updateVertexData(x, y, z);
        this.vertexDataUpdated = false;
        this.origin = [0, 0, 0];
    }

    updateVertexData(dx, dy, dz) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
        const offsets = [this.x, this.y, this.z];
        Player.prototype.vertexData.forEach((v, i) => {
            this.vertexData[i] = v + offsets[i % offsets.length];
        });
        this.vertexDataUpdated = true;
    }

    * boundingBox() {
        const points = [-1, 1];
        for (const dx of points) {
            for (const dy of points) {
                for (const dz of points) {
                    yield [this.x+dx, this.y+dy, this.z+dz];
                }
            }
        }
    }

    getLocation() {
        return [this.x, this.y, this.z];
    }

    getInvLocation() {
        return [-this.x, -this.y, -this.z];
    }

    worldOrientToViewOrient(v, roty) {
        vec3.rotateY(v, v, this.origin, -roty);
        return v;
    }

    moveForward(d, roty) {
        this.moveBackward(-d, roty);
    }

    moveBackward(d, roty) {
        const v = [0, 0, d];
        this.worldOrientToViewOrient(v, roty);
        this.updateVertexData.apply(this, v);
    }

    moveLeft(d, roty) {
        this.moveRight(-d, roty);
    }

    moveRight(d, roty) {
        const v = [d, 0, 0];
        this.worldOrientToViewOrient(v, roty);
        this.updateVertexData.apply(this, v);
    }
}

Player.prototype.normalData = [
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

Player.prototype.vertexData = [
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

Player.prototype.indexData =
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
