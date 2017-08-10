precision highp float;

varying vec3 fragNormal;
varying vec3 fragCoord;
varying vec2 fragTexturePoint;

uniform vec3 lightPoint;
uniform mat4 mView;
uniform sampler2D sampler;

void main(void) {
	vec3 ambientLightIntensity = vec3(0.15, 0.15, 0.15);
	vec3 sunNormal = lightPoint - fragCoord;
	float l = length(sunNormal);
	sunNormal *= 25.0;
	sunNormal /= l*l;
	vec3 sunColor = vec3(1.0, 1.0, 1.0);
	vec3 lightIntensity = ambientLightIntensity +
		sunColor * max(dot(fragNormal, sunNormal), 0.0);
	vec4 textureColor = texture2D(sampler, fragTexturePoint);
	gl_FragColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}
