precision highp float;

varying vec3 fragNormal;

void main(void) {
    vec3 ambientLightIntensity = vec3(0.15, 0.15, 0.15);
    vec3 sun = vec3(1.0, 1.0, 1.0);
    vec3 sunColor = vec3(1.0, 1.0, 1.0);
    vec3 lightIntensity = ambientLightIntensity +
        sunColor * max(dot(fragNormal, sun), 0.0);
    vec4 textureColor = vec4(0.8, 0.5, 0.3, 1.0);
    gl_FragColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}
