#version 300 es

precision mediump float;

out vec4 outColor;

uniform vec3 color;

void main(void) {
    outColor = vec4(color, 1.0);
}
