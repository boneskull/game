import src.classes.TileGroup as TileGroup;

var tileGroups = JSON.parse(CACHE['resources/conf/tileGroups.json']).tileGroups,
	i = tileGroups.length,
	tgs = [];
while (i--) {
	tgs.push(new TileGroup(tileGroups[i]));
}

exports = tgs.concat([{
		cursorYes: 'resources/images/cursorYes.png',
		cursorNo: 'resources/images/cursorNo.png'
	}
]);