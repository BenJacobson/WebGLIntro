#version 300 es

precision highp float;

in vec3 vertexData;
in vec3 normalData;
in vec2 textureCoords;

out vec3 fragCoord;
out vec3 fragNormal;
out vec2 fragTextureCoords;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
    fragCoord = vertexData;
    fragNormal = normalData;
	fragTextureCoords = textureCoords;
	gl_Position = mProj * mView * vec4(vertexData, 1.0);
}