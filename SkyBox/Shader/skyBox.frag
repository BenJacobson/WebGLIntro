#version 300 es

precision mediump float;

in float y;

out vec4 outColor;

void main(void) {
    float height = clamp(y, -300.0, 300.0);
    float a = (height + 300.0) / 600.0;
    outColor = mix(vec4(0.99, 0.75, 0.14, 1.0), vec4(0.5, 0.75, 0.9, 1.0), a);
}
