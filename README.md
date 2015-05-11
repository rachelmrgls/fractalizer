# fractalizer
final project cos426

julia3d good view:
[-0.05297758802771568, -0.1217767670750618, -0.9911374449729919, 0, 0.8391594886779785, 0.5325657725334167, -0.11028649657964706, 0, 0.5412726998329163, -0.8375768661499023, 0.0739828571677208, 0, 1.461436152458191, -2.261467695236206, 0.19975492358207703, 1]

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


(apollonian gasket - code) https://www.shadertoy.com/view/4ds3zn

Bugs
Controls
	-make the distance estimation only look at part of the thing/make recursion level depend on the amount you're zoomed in
	-make mouse zoom, change up/down keys to deltaY
	-fix controls/add dropdown thingy (thomas)
-inf spheres : why are they breaking :(
-put julia/mandelbrot into actual 2d

-apollonian gasket, with translucency (bubbles + random bubbly colors); look at assignment 3 refraction stuff; colored based on bubble size, smaller bubbles more translucent

-
