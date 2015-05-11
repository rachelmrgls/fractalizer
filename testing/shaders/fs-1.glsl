/*
 * Copyright 1984-2012 Keenan Crane. All rights reserved.
 *
 *  - Ported to WebGL by Jordan Phillips; 2012.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE FREEBSD PROJECT OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those
 * of the author and should not be interpreted as representing official policies,
 * either expressed or implied, of any other person or institution.
 */

#ifdef GL_ES
	precision highp float;
#endif

#define BOUNDING_RADIUS_2  3.0      // radius of a bounding sphere for the set used to accelerate intersection
#define ESCAPE_THRESHOLD   10.0
#define DEL                0.0001   // delta is used in the finite difference approximation of the gradient
                                  // (to determine normals)
#define LOOP_UPPER_BOUND   1000     // Provides the upper bound on for(i=0;...;i++) loops, since GL_ES shaders
                                  // cannot use variables in the loop check, and can't use while(true) loops

varying highp vec3 vRayDirection;

uniform vec3 rayOrigin;

uniform vec4 mu;                      // quaternion constant specifying the particular set
uniform float epsilon;                // specifies precision of intersection
uniform vec3 eye;                     // location of the viewer
uniform vec3 diffuse;                 // location of the viewer
uniform vec3 light;                   // location of a single point light
uniform int maxIterations;            // maximum number of iterations used to test convergence

// const vec4 backgroundColor = vec4(0.89, 0.95686, 0.98, 0.0);
const vec4 backgroundColor = vec4(0.0, 0.0, 0.0, 0.0);
const float specularExponent = 10.0;   // shininess of shading
const float specularity = 0.45;        // amplitude of specular highlight

// -------- quatMult() ----------------------------------------------------------
//
// Returns the product of quaternions q1 and q2.
// Note that quaternion multiplication is NOT commutative (i.e., q1 ** q2 != q2 ** q1 ).
//
vec4 quatMult(vec4 q1, vec4 q2) {
	vec4 r;

	r.x   = q1.x * q2.x - dot(q1.yzw, q2.yzw);
	r.yzw = q1.x * q2.yzw + q2.x * q1.yzw + cross(q1.yzw, q2.yzw);

	return r;
}

// ------- quatSq() --------------------------------------------------------------
//
// Returns the square of quaternion q.  This function is a special (optimized)
// case of quatMult().
//
vec4 quatSq(vec4 q) {
	vec4 r;

	r.x   = q.x * q.x - dot(q.yzw, q.yzw);
	r.yzw = 2.0 * q.x * q.yzw;

	return r;
}

// ------- iterateIntersect() -----------------------------------------------------
//
// Iterates the quaternion q for the purposes of intersection.  This function also
// produces an estimate of the derivative at q, which is required for the distance
// estimate.  The quaternion c is the parameter specifying the Julia set, and the
// integer maxIterations is the maximum number of iterations used to determine
// whether a point is in the set or not.
//
// To estimate membership in the set, we recursively evaluate
//
// q = q*q + c
//
// until q has a magnitude greater than the threshold value (i.e., it probably
// diverges) or we've reached the maximum number of allowable iterations (i.e.,
// it probably converges).  More iterations reveal greater detail in the set.
//
// To estimate the derivative at q, we recursively evaluate
//
// q' = 2*q*q'
//
// concurrently with the evaluation of q.
//
void iterateIntersect(inout vec4 q, inout vec4 qp, vec4 c) {
	for (int i = 0; i < LOOP_UPPER_BOUND; i++) {
		if (i > maxIterations) break;

		qp = 2.0 * quatMult(q, qp);
		q = quatSq(q) + c;

		if (dot(q, q) > ESCAPE_THRESHOLD) break;
	}
}

// ---------- intersectQJulia() ------------------------------------------
//
// Finds the intersection of a ray with origin rO and direction rD with the
// quaternion Julia set specified by quaternion constant c.  The intersection
// is found using iterative sphere tracing, which takes a conservative step
// along the ray at each iteration by estimating the minimum distance between
// the current ray origin and the closest point in the Julia set.  The
// parameter maxIterations is passed on to iterateIntersect() which determines
// whether the current ray origin is in (or near) the set.
//
float intersectQJulia(inout vec3 rO, inout vec3 rD, out int stepCount, vec4 c, float epsilon) {
	float dist; // the (approximate) distance between the first point along the ray within
	        	// epsilon of some point in the Julia set, or the last point to be tested if
	        	// there was no intersection.

	for (int i = 0; i < LOOP_UPPER_BOUND; i++) {
		stepCount = i;

		vec4 z = vec4(rO, 0.0);	// iterate on the point at the current ray origin.  We
								// want to know if this point belongs to the set.

		vec4 zp = vec4(1.0, 0.0, 0.0, 0.0);		// start the derivative at real 1.  The derivative is
												// needed to get a lower bound on the distance to the set.

		// iterate this point until we can guess if the sequence diverges or converges.
		iterateIntersect(z, zp, c);

		// find a lower bound on the distance to the Julia set and step this far along the ray.
		float normZ = length(z);
		dist = 0.5 * normZ * log(normZ) / length(zp);  //lower bound on distance to surface

		rO += rD * dist; // (step)

		// Intersection testing finishes if we're close enough to the surface
		// (i.e., we're inside the epsilon isosurface of the distance estimator
		// function) or have left the bounding sphere.
		if (dist < epsilon || dot(rO, rO) > BOUNDING_RADIUS_2) break;
	}
	// return the distance for this ray
	return dist;
}

// ---------- intersectSphere() ---------------------------------------
//
// Finds the intersection of a ray with a sphere with statically
// defined radius BOUNDING_RADIUS centered around the origin.  This
// sphere serves as a bounding volume for the Julia set.
//
vec3 intersectSphere(vec3 rO, vec3 rD) {
	float B, C, d, t0, t1, t;

	B = 2.0 * dot(rO, rD);
	C = dot(rO, rO) - BOUNDING_RADIUS_2;
	d = sqrt(B * B - 4.0 * C);
	t0 = (-B + d) * 0.5;
	t1 = (-B - d) * 0.5;
	t = min(t0, t1);
	rO += t * rD;

	return rO;
}

// ----------- normEstimate() -------------------------------------------------------
//
// Create a shading normal for the current point.  We use an approximate normal of
// the isosurface of the potential function, though there are other ways to
// generate a normal (e.g., from an isosurface of the potential function).
//
vec3 normEstimate(vec3 p, vec4 c) {
	vec4 qP = vec4(p, 0.0);

	vec4 gx1 = qP - vec4(DEL, 0.0, 0.0, 0.0);
	vec4 gx2 = qP + vec4(DEL, 0.0, 0.0, 0.0);
	vec4 gy1 = qP - vec4(0.0, DEL, 0.0, 0.0);
	vec4 gy2 = qP + vec4(0.0, DEL, 0.0, 0.0);
	vec4 gz1 = qP - vec4(0.0, 0.0, DEL, 0.0);
	vec4 gz2 = qP + vec4(0.0, 0.0, DEL, 0.0);

	for (int i = 0; i < LOOP_UPPER_BOUND; i++) {
		// Note that too many iterations here (>10) will result in extremely small values (which
		// won't make for very useful normals)
		//if (i > maxIterations) break;
		if (i > 5) break;

		gx1 = quatSq(gx1) + c;
		gx2 = quatSq(gx2) + c;
		gy1 = quatSq(gy1) + c;
		gy2 = quatSq(gy2) + c;
		gz1 = quatSq(gz1) + c;
		gz2 = quatSq(gz2) + c;
	}

	float gradX = length(gx2) - length(gx1);
	float gradY = length(gy2) - length(gy1);
	float gradZ = length(gz2) - length(gz1);

	return normalize(vec3(gradX, gradY, gradZ));
}

// ----------- Phong() --------------------------------------------------
//
// Computes the direct illumination for point pt with normal N due to
// a point light at light and a viewer at eye.
//
vec3 Phong(vec3 light, vec3 eye, vec3 pt, vec3 N) {
	vec3 newDiffuse = diffuse;

	vec3 L      = normalize(light - pt);  // find the vector to the light
	vec3 E      = normalize(eye   - pt);  // find the vector to the eye
	float NdotL = dot(N, L);              // find the cosine of the angle between light and normal
	vec3 R      = L - 2.0 * NdotL * N;    // find the reflected vector

	newDiffuse += abs(N) * 0.3;  // add some of the normal to the
	                          // color to make it more interesting

	// compute the illumination using the Phong equation
	return newDiffuse * max(NdotL, 0.0) + specularity * pow(max(dot(E, R), 0.0), specularExponent);
}

// ------------ main() -------------------------------------------------
//
//  Each fragment performs the intersection of a single ray with
//  the quaternion Julia set.  In the current implementation
//  the ray's origin and direction are passed in on texture
//  coordinates, but could also be looked up in a texture for a
//  more general set of rays.
//
//  The overall procedure for intersection performed in main() is:
//
//  -move the ray origin forward onto a bounding sphere surrounding the Julia set
//  -test the new ray for the nearest intersection with the Julia set
//  -if the ray does include a point in the set:
//      -estimate the gradient of the potential function to get a "normal"
//      -use the normal and other information to perform Phong shading
//      -cast a shadow ray from the point of intersection to the light
//      -if the shadow ray hits something, modify the Phong shaded color to represent shadow
//  -return the shaded color if there was a hit and the background color otherwise
//
void main(void) {
	// Initially set the output color to the background color.  It will stay
	// this way unless we find an intersection with the Julia set.
	vec4 color = backgroundColor;

	// First, intersect the original ray with a sphere bounding the set, and
	// move the origin to the point of intersection.  This prevents an
	// unnecessarily large number of steps from being taken when looking for
	// intersection with the Julia set.
	vec3 rD = normalize(vRayDirection);  //the ray direction is interpolated and may need to be normalized
	vec3 rO = intersectSphere(rayOrigin, vRayDirection);

	// Next, try to find a point along the ray which intersects the Julia set.
	// (More details are given in the routine itself.)
	int stepCount = 0;
	float dist = intersectQJulia(rO, rD, stepCount, mu, epsilon);

	// We say that we found an intersection if our estimate of the distance to
	// the set is smaller than some small value epsilon.  In this case we want
	// to do some shading / coloring.
	if (dist < epsilon) {
		// Determine a "surface normal" which we'll use for lighting calculations.
		vec3 N = normEstimate(rO, mu);

		// Compute the Phong illumination at the point of intersection.
		color.rgb = Phong(light, rD, rO, N);
		color.a = 1.0;  // (make this fragment opaque)

		// The shadow ray will start at the intersection point and go
		// towards the point light.  We initially move the ray origin
		// a little bit along this direction so that we don't mistakenly
		// find an intersection with the same point again.
		vec3 L = normalize(light - rO);
		rO += N * epsilon * 2.0;
		dist = intersectQJulia(rO, L, stepCount, mu, epsilon);

		// Again, if our estimate of the distance to the set is small, we say
		// that there was a hit.  In this case it means that the point is in
		// shadow and should be given darker shading.
		if (dist < epsilon)
		color.rgb *= 0.4;  // (darkening the shaded value is not really correct, but looks good)

		// Ambient Occlusion step: Simply darken the surface by a factor proportional to the number of ray tracing
		// steps taken for each point and the result is comparable to ambient occlusion. It works thanks to a side
		// effect of the unbounded volume ray tracing approach; points that are least occluded are likely to be
		// reached in fewer steps as the distance estimator function will return a large step size for the ray.
		// Whereas rays to points nested in creases or dips will require more steps because the neighbouring surfaces
		// will cause the distance estimator to return a smaller step size.
		// From: http://www.subblue.com/blog/2009/9/20/quaternion_julia
		color.rgb *= clamp(1.0 - float(stepCount) / float(maxIterations), 0.75, 1.0);
	}

	gl_FragColor = color;
}