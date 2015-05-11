attribute vec3 position;
attribute vec3 rayDirection;

varying highp vec3 vRayDirection;

void main() {
	gl_Position = vec4(position, 1.0);
	vRayDirection = rayDirection;
}