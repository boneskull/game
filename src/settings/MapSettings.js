jsio("import src.constants.GameConstants as gameConstants");
jsio("import src.settings.TileSettings as tileSettings");

exports = {
    generatorSteps: [
        {
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
        },
        {
            type: 'fill',
            group: gameConstants.tileGroups.CLUTTER,
            chance: .05,
            layer: 1,
            index: 0
        }
    ],
        randomTiles: [
        {
            group: gameConstants.tileGroups.CLUTTER,
            index: 0,
            chances: (function(group) {
                var i = tileSettings.length, tsGroup, ts;
                while (i--) {
                    ts = tileSettings[i];
                    tsGroup = ts.group;
                    if (tsGroup && tsGroup === group) {
                        return ts.images[0].url.map(function () {
                            return 1 / ts.images[0].url.length;
                        });
                    }
                }
            })(gameConstants.tileGroups.CLUTTER)
        }
    ]


};
