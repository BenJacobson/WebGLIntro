precision highp float;

attribute vec3 vertCoord;
attribute vec3 normal;
attribute vec2 texturePoint;

varying vec2 fragTexturePoint;
varying vec3 fragCoord;
varying vec3 fragNormal;

uniform mat4 mView;
uniform mat4 mProj;

void main(void) {
	fragTexturePoint = texturePoint;
	fragCoord = (mView * vec4(vertCoord, 1.0)).xyz;
	fragNormal = (mView * vec4(normal, 0.0)).xyz;
	gl_Position = mProj * mView * vec4(vertCoord, 1.0);
}