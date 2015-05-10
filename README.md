# fractalizer
final project cos426

julia - good view rotation matrix
[[0.56428, -0.04487374, -0.82436, 0], [0.73668, 0.478091, 0.47824, 0], [0.37265, -0.87716, 0.302836, 0], [-0.28108, 0.2766, 0.156457, 1]] * [0,0,-16,1]

(13.1898, -7.65184, -4.84538, -1.50331)

Sources

(controls) http://www.javascriptkit.com/javatutors/javascriptkey2.shtml

(sound stuff) http://joshondesign.com/p/books/canvasdeepdive/chapter12.html

http://blog.hvidtfeldts.net/index.php/2011/06/distance-estimated-3d-fractals-part-i/

http://inst.eecs.berkeley.edu/~cs184/sp12/assignments/Archive/HW6/Fractal%20Renderer.htm
(menger) http://iquilezles.org/www/articles/menger/menger.htm
(mandelbulb) http://iquilezles.org/www/articles/mandelbulb/mandelbulb.htm
(primitives + boolean ops -- union, subtraction, intersection) http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
(distance estimation) http://iquilezles.org/www/articles/distance/distance.htm
http://www.iquilezles.org/www/material/nvscene2008/nvscene2008.htm
(apollonian gasket) http://en.wikipedia.org/wiki/Apollonian_gasket

(frames per second) https://documentation.apple.com/en/finalcutpro/usermanual/index.html#chapter=D%26section=3%26tasks=true


Bugs
Controls
	-make the distance estimation only look at part of the thing/make recursion level depend on the amount you're zoomed in
	-make arrows translate in x and y directions, make mouse zoom
	-fix controls/add dropdown thingy (thomas)
-inf spheres : why are they breaking :(
-how to render stuff overnight/make a video of higher quality?
-julia: make less tempermental
-put julia/mandelbrot into actual 2d



-apollonian gasket, with translucency (bubbles + random bubbly colors); look at assignment 3 refraction stuff; colored based on bubble size, smaller bubbles more translucent
