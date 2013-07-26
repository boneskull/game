jsio("import ui.View as View");
jsio("import ui.TextView as TextView");

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', [opts]);
		new TextView({
			superview: this.view,
			x: this.baseWidth / 2 - 75,
			y: this.baseHeight / 2 - 30,
			width: 150,
			height: 60,
			text: 'BATTLE!'
		});
	}
});