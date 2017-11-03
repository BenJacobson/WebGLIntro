#version 300 es

precision mediump float;

in vec3 fragColor;

out vec4 outColor;

void main(void) {
    outColor = vec4(fragColor, 0.5);
}
