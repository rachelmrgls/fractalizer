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
	Raymarcher.mu.cur[0] = Gui.values.r;
	Raymarcher.mu.cur[1] = Gui.values.i;
	Raymarcher.mu.cur[2] = Gui.values.j;
	Raymarcher.mu.cur[3] = Gui.values.k;
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    Gui.init( controlsChangeCallback );

	Raymarcher.init('julia3D');
	Raymarcher.update();

};


