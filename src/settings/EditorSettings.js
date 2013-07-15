import isometric.models.item.SpawnerModel as SpawnerModel;
import isometric.models.item.StaticModel as StaticModel;

import src.models.CharacterModel as CharacterModel;
import src.models.MonsterModel as MonsterModel;
import src.models.DoorModel as DoorModel;

import src.constants.GameConstants as gameConstants;

import math.geom.Rect as Rect;

function pointstr(x, y) {
    return '(' + x + ',' + y + ')';
}
exports = {
    moveto: {
        type: 'item',
        conditions: {
            accept: [
                {
                    layer: 0,
                    type: 'emptyOrZero',
                    validator:function(map, weirdX, weirdY, x, y, w, h) {
                        var character = map._character,
                            tileX = character.getTileX(),
                            tileY = character.getTileY(),
                            range = character._range,
                            distance = Math.ceil(Math.sqrt(Math.pow(tileX - x, 2) + Math.pow(tileY - y, 2)));
                        console.log(distance);
                        return distance <= range;
                    }
                }
            ]
        }
    },
    range: {
        type: 'item',
        layer: 1,
        group: gameConstants.tileGroups.CURSORS,
        index: 2,
        model: StaticModel
    },
    door: {
        type: 'item',
        model: DoorModel,
        layer: 2,
        group: gameConstants.tileGroups.CHANGE_ZONES,
        index: 7,
        // Information about the models which are spawned:
        modelOpts: {
            modelInfo: [
                // The opts are passed to the constructor of the dynamic item.
                // The item value refers value in itemSettings to select the view properties.
                {
                    count: 1,
                    ctor: MonsterModel,
                    opts: {
                        item: 'monster'
                    },
                    layer: 2
                }
            ],
            // Condition for finding a valid path:
            conditions: {
                accept: [
                    {
                        layer: 0,
                        type: 'group',
                        groups: [gameConstants.tileGroups.PASSABLE]
                    }
                ]
            }
        }
    }
};