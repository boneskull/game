/**
 * Created with PyCharm.
 * User: chiller
 * Date: 7/21/13
 * Time: 10:23 PM
 * To change this template use File | Settings | File Templates.
 */

import .Character as Character;
import src.models.NPCModel as NPCModel;

exports = NPC = Class(Character, function (supr) {
    this.modelKlass = NPCModel;
});