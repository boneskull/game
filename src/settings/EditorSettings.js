import isometric.models.item.SpawnerModel as SpawnerModel;
import isometric.models.item.StaticModel as StaticModel;

import src.models.CharacterModel as CharacterModel;
import src.models.MonsterModel as MonsterModel;
import src.models.DoorModel as DoorModel;

import src.constants.GameConstants as gameConstants;

import math.geom.Rect as Rect;

exports = {
    moveto: {
        type: 'item',
        conditions: {
            accept: [
                {
                    layer: 2,
                    type: 'group',
                    groups: [gameConstants.tileGroups.CURSORS]
                }
            ]
        }
    },
    door: {
        type: 'item',
        model: DoorModel,
        layer: 3,
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
                    layer: 3
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