#version 300 es

precision mediump float;

in vec3 vertexData;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
    gl_Position = mProj * mView * vec4(vertexData, 1.0);
}
