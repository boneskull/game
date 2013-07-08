import src.models.CharacterModel as CharacterModel;

import src.constants.GameConstants as gameConstants;

exports = {
	moveto: {
		type: 'item',
		conditions: {
			accept: [{
					layer: 0,
					type: 'group',
					groups: [gameConstants.tileGroups.PASSABLE]
				}
			]
		}
	}
};