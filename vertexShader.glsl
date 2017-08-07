precision highp float;

attribute vec3 coordinates;
attribute vec2 texturePoint;

varying vec2 fragTexturePoint;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
	fragTexturePoint = texturePoint;
	gl_Position = mProj * mView * vec4(coordinates, 1.0);
}