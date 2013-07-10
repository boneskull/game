import src.classes.TileGroup as TileGroup;
import src.constants.GameConstants as gameConstants;
var tileGroups = JSON.parse(CACHE['resources/conf/tileGroups.json']).tileGroups,
	i = tileGroups.length,
	tgs = [];
while (i--) {
	tgs.push(new TileGroup(tileGroups[i]));
}

exports = tgs.concat([{
		width: 82,
		height: 41,
		group: gameConstants.tileGroups.CURSORS,
		images: [{
				url: 'resources/images/cursorYes.png',
				index: 0
			}, {
				index: 1,
				url: 'resources/images/cursorNo.png'
			}, {
				index: 2,
				url: 'resources/images/cursorTile.png'
			}
		]
	}, {
		cursorYes: 'resources/images/cursorYes.png',
		cursorNo: 'resources/images/cursorNo.png'
	}
]);