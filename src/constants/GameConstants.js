import lib.Enum as Enum;

exports = {

	tileGroups: Enum(
		'PASSABLE',
		'IMPASSABLE',
		'CHARACTERS',
		'NPCS',
		'CHANGE_ZONES',
		'CURSORS',
        'CLUTTER'
		),

    abilities: [
        'STR',
        'DEX',
        'CON',
        'INT',
        'WIS',
        'CHA'
    ]
}