/**
 * Created with PyCharm.
 * User: chiller
 * Date: 7/23/13
 * Time: 10:56 PM
 * To change this template use File | Settings | File Templates.
 */

import .CharacterModel as CharacterModel;

exports = NPCModel = Class(CharacterModel, function(supr) {
    this.init = function(opts) {
        supr(this, 'init', [opts]);
    }
});

