/**
 * Created with PyCharm.
 * User: chiller
 * Date: 7/21/13
 * Time: 10:23 PM
 * To change this template use File | Settings | File Templates.
 */

import .Character as Character;

exports = Class(Character, function(supr) {
    this.init = function(opts) {
        supr(this, 'init', [opts]);
    };

});