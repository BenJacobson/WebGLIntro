#version 300 es

precision mediump float;

in vec2 vertexData;

out vec2 fragCoord;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
    fragCoord = vertexData;
    gl_Position = mProj * mView * vec4(vertexData.x, 0.0, vertexData.y, 1.0);
}
