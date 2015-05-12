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
	Raymarcher.mu.cur[0] = Gui.values.mu1;
	Raymarcher.mu.cur[1] = Gui.values.mu2;
	Raymarcher.mu.cur[2] = Gui.values.mu3;
	Raymarcher.mu.cur[3] = Gui.values.mu4;
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    Gui.init( controlsChangeCallback );

	Raymarcher.init('julia3D');
	Raymarcher.update();

	window.addEventListener( 'keydown', function( event ) {
        // user pressed the enter key
        console.log(event.which)
        if (event.which == 189) {
        	Raymarcher.translate[2] += 0.1;
        }
        else if (event.which == 187) {
        	Raymarcher.translate[2] -= 0.1;
        }
        else if (event.which == 37) {
        	Raymarcher.translate[1] += 0.1;
        }
        else if (event.which == 38) {
        	Raymarcher.translate[0] -= 0.1;
        }
        else if (event.which == 39) {
        	Raymarcher.translate[1] -= 0.1;
        }
        else if (event.which == 40) {
        	Raymarcher.translate[0] += 0.1;
        }

    });

};


