/*
 * Provides requestAnimationFrame in a cross browser way.
 * paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimationFrame = window.requestAnimationFrame || ( function() {
	return  window.webkitRequestAnimationFrame 	||
			window.mozRequestAnimationFrame 	||
			window.oRequestAnimationFrame 		||
			window.msRequestAnimationFrame 		||
			function(  callback, element ) {
				window.setTimeout( callback, 1000 / 60 );
			};

})();


var controlsChangeCallback = function() {
	mu.cur[0] = Gui.values.r;
	mu.cur[1] = Gui.values.i;
	mu.cur[2] = Gui.values.j;
	mu.cur[3] = Gui.values.k;

}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    Gui.init( controlsChangeCallback );
	Gui.gc.precision.updateDisplay();

	Raymarcher.init('julia3D');
	Raymarcher.update();

};


var mu = {
	cur: [ 0.0, 0.0, 0.0, 0.0 ]
}

