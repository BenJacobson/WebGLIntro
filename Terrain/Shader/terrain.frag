#version 300 es

precision mediump float;

in vec2 fragCoord;

out vec4 outColor;

uniform float radius;

void main(void) {
    float len = length(fragCoord);
    if ( len < radius) {
        float color = 1.0 - ((len / radius) * 0.8);
        outColor = vec4(color, color, color, 1.0);
    } else {
        discard;
    }
}
