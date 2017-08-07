precision highp float;

uniform sampler2D sampler;

varying vec2 fragTexturePoint;

void main(void) {
	gl_FragColor = texture2D(sampler, fragTexturePoint);
}