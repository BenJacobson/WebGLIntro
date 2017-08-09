precision highp float;


varying vec3 fragNormal;
varying vec3 fragCoord;
varying vec2 fragTexturePoint;

uniform float sunRot;
uniform mat4 mView;
uniform sampler2D sampler;

void main(void) {
	vec3 ambientLightIntensity = vec3(0.4, 0.4, 0.4); // vec3(0.0, 0.0, 0.0);
	// vec3 sunNormal = normalize((mView * vec4(1.0, 1.0, 1.0, 0.0)).xyz);
	vec3 sunPoint = vec3(cos(sunRot)*10.0, sin(sunRot)*10.0, 0.0);
	vec3 sunNormal = normalize(sunPoint - fragCoord);
	vec3 sunColor = vec3(1.0, 1.0, 1.0);
	vec3 lightIntensity = ambientLightIntensity +
		sunColor * max(dot(fragNormal, sunNormal), 0.0);
	vec4 textureColor = texture2D(sampler, fragTexturePoint);
	gl_FragColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}
