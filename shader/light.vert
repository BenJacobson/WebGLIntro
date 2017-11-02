#version 300 es

precision highp float;

in vec3 vertexData;
in vec3 normalData;

out vec3 fragCoord;
out vec3 fragNormal;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
	fragCoord = vertexData;
    fragNormal = normalData;
    gl_Position = mProj * mView * vec4(vertexData, 1.0);
}