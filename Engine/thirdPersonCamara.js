class ThirdPersonCamara {

    static get TAU() {
        return Math.PI * 2;
    }
    
    constructor(rotx, roty) {
        this.x = this.y = this.z = 0;
        this.rotx = rotx;
        this.roty = roty;
        this.rotxMin = 0.0;
        this.rotxMax = 1.0;
        this.distBackBase = 10;
        this.distBackFactor = 100;
        this.updateDistBack();
        this.origin = [0, 0, 0];
        this.change = true;
    }

    getLocation() {
        return [this.x, this.y, this.z];
    }

    getInvLocation() {
        return [-this.x, -this.y, -this.z];
    }

    move(vector) {
        const [dx, dy, dz] = vector;
        this.x += dx;
        this.y += dy;
        this.z += dz;
        this.change = true;
    }

    setFocus(vector) {
        const relativeVector = [0, 0, -this.distBack];
        this.worldOrientToCamaraOrient(relativeVector);
        const [x, y, z] = vector;
        const [dx, dy, dz] = relativeVector;
        this.x = -x + dx;
        this.y = -y + dy;
        this.z = -z + dz;
        this.change = true;        
    }

    worldOrientToCamaraOrient(v) {
        vec3.rotateX(v, v, this.origin, -this.rotx);
        vec3.rotateY(v, v, this.origin, -this.roty);
        return v;
    }

    moveForward(d) {
        let v = [0, 0, d];
        this.worldOrientToCamaraOrient(v);
        this.move(v);
    }

    moveBackward(d) {
        this.moveForward(-d);
    }

    moveLeft(d) {
        let v = [d, 0, 0];
        this.worldOrientToCamaraOrient(v);
        this.move(v);
    }

    moveRight(d) {
        this.moveLeft(-d);
    }

    rotateForward(r) {
        this.rotateBackward(-r);
    }

    rotateBackward(r) {
        this.rotx = Math.max(Math.min(this.rotx+r, this.rotxMax), this.rotxMin);
        this.updateDistBack();
        this.change = true;
    }

    rotateLeft(r) {
        this.rotateRight(-r);
    }

    rotateRight(r) {
        this.roty += r;
        this.change = true;
    }

    updateDistBack() {
        this.distBack = this.distBackBase + this.rotx*this.distBackFactor;
    }
}