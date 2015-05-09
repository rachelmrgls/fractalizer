# fractalizer
final project cos426


Sources

(sound stuff) http://joshondesign.com/p/books/canvasdeepdive/chapter12.html

http://blog.hvidtfeldts.net/index.php/2011/06/distance-estimated-3d-fractals-part-i/

http://inst.eecs.berkeley.edu/~cs184/sp12/assignments/Archive/HW6/Fractal%20Renderer.htm


(menger) http://iquilezles.org/www/articles/menger/menger.htm
(mandelbulb) http://iquilezles.org/www/articles/mandelbulb/mandelbulb.htm
(primitives + boolean ops -- union, subtraction, intersection) http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
(distance estimation) http://iquilezles.org/www/articles/distance/distance.htm
http://www.iquilezles.org/www/material/nvscene2008/nvscene2008.htm

apollonian gasket

http://en.wikipedia.org/wiki/Apollonian_gasket

Bugs
Controls


	-make the distance estimation only look at part of the thing/make recursion level depend on the amount you're zoomed in (???da fuck!?)
	-make arrows translate in x and y directions, make mouse zoom
	-fix controls/add dropdown thingy (thomas)

-inf spheres : why are they breaking :(

-apollonian gasket, with translucency (bubbles + random bubbly colors); look at assignment 3 refraction stuff; colored based on bubble size, smaller bubbles more translucent
-how to render stuff overnight/make a video of higher quality?


-julia: bounding volume/possibly revisit 3d version
bounding thing: do in main before you shoot ray,
intersect it with the bounding volume, if it hits then shoot ray, if doesn't hit just black --> try for julia set in 3d (not 2d) to contain it

-put julia/mandelbrot into actual 2d
