#version 300 es

precision highp float;

in vec3 fragNormal;
in vec3 fragCoord;
in vec2 fragTexturePoint;

out vec4 fragColor;

uniform vec3 lightPoint;
uniform sampler2D sampler;

void main(void) {
	vec3 ambientLightIntensity = vec3(0.2, 0.2, 0.2);
	vec3 sunNormal = lightPoint - fragCoord;
	float l = length(sunNormal);
	sunNormal *= 25.0;
	sunNormal /= l*l;
	vec3 sunColor = vec3(1.0, 1.0, 1.0);
	vec3 lightIntensity = ambientLightIntensity +
		sunColor * max(dot(fragNormal, sunNormal), 0.0);
	vec4 textureColor = texture(sampler, fragTexturePoint);
	fragColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}
