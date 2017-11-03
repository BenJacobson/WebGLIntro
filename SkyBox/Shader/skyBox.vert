#version 300 es

precision mediump float;

in vec3 vertexData;
in vec3 colorData;

out vec3 fragColor;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
    fragColor = colorData;
    gl_Position = mProj * mView * vec4(vertexData, 1.0);
}