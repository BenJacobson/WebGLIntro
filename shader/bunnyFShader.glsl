#version 300 es

precision highp float;

in vec3 fragNormal;
in vec3 fragCoord;

out vec4 fragColor;

uniform vec3 lightPoint;

void main(void) {
vec3 ambientLightIntensity = vec3(0.2, 0.2, 0.2);
	vec3 sunNormal = lightPoint - fragCoord;
	float l = length(sunNormal);
	sunNormal = sunNormal / (1.0 + (0.1 * l) + (0.02 * l * l));
	vec3 sunColor = vec3(1.0, 1.0, 1.0);
	vec3 lightIntensity = ambientLightIntensity +
		sunColor * max(dot(fragNormal, sunNormal), 0.0);
    vec4 textureColor = vec4(0.8, 0.5, 0.3, 1.0);
    fragColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}
