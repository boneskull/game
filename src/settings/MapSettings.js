import src.constants.GameConstants as gameConstants;

exports = {
    generatorSteps: [{
            type: 'fill',
            layer: 0,
            group: gameConstants.tileGroups.PASSABLE, // The group defined in the tile settings
            index: 1,
            chance: 1
        },
        {
            type: 'fill',
            layer: 0,
            group: gameConstants.tileGroups.IMPASSABLE, // The group defined in the tile settings
            index: 9,
            chance: .25
        }
    ]

}