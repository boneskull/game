jsio("import isometric.models.item.SpawnerModel as SpawnerModel");
jsio("import isometric.models.item.StaticModel as StaticModel");

jsio("import src.models.CharacterModel as CharacterModel");
jsio("import src.models.MonsterModel as MonsterModel");

jsio("import src.constants.GameConstants as gameConstants");

jsio("import math.geom.Rect as Rect");

exports = {
    Move: {
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
    Attack: {
        type: 'item',
        layer: 2
    }
};