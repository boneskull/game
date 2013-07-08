/*
 * The title screen consists of a background image and a
 * start button. When this button is pressed, and event is
 * emitted to itself, which is listened for in the top-level
 * application. When that happens, the title screen is removed,
 * and the game screen shown.
 */

import device;
import ui.View;
import ui.widget.ButtonView as ButtonView;
import ui.TextView as TextView;

/* The title screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
exports = Class(ui.View, function (supr) {
	this.init = function (opts) {

		supr(this, 'init', [opts]);

        var textview = new TextView({
            superview: this,
            width: device.width,
            height: device.height,            
            layout: "box",
            text: "loot hell",
            color: "white"
        });

        var startbutton = new ButtonView({
            superview: this,
            width: 70,
            clickOnce: true,
            height: 70,
            title: "Tap",
            x: device.width / 2 - 35,
            y: 220,
            text: {
                size: 16,
                color: '#FFF'
            },            
            images: {
                up: 'resources/images/button1Up.png',
                down: 'resources/images/button1Down.png'
            },
            on: {
                down: bind(this, function() {
                  this.emit('titlescreen:start');  
                })
            }
        });

	};


});
