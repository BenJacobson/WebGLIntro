#version 300 es

precision highp float;

in vec3 vertCoord;
in vec3 normal;

out vec3 fragCoord;
out vec3 fragNormal;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
	fragCoord = vertCoord;
    fragNormal = normal;
    gl_Position = mProj * mView * vec4(vertCoord, 1.0);
}