#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D sampler;
uniform float width;
uniform float height;

void main() {
	gl_FragColor = texture2D(sampler, gl_FragCoord.xy / vec2(width, height));
}