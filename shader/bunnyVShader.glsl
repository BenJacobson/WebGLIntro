precision highp float;

attribute vec3 vertCoord;
attribute vec3 normal;

varying vec3 fragNormal;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
    fragNormal = normal;
    gl_Position = mProj * mView * vec4(vertCoord, 1.0);
}