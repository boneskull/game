import device;

import isometric.Isometric as Isometric;
import isometric.models.item.SpawnerModel as SpawnerModel;

import menus.views.components.ButtonView as ButtonView;
import ui.TextView as TextView;

import src.settings.TileSettings as tileSettings;
import src.settings.GridSettings as gridSettings;
import src.settings.MapSettings as mapSettings;
import src.settings.EditorSettings as editorSettings;
import src.settings.ItemSettings as itemSettings;

import src.models.CharacterModel as CharacterModel;

import src.views.BattleView as BattleView;

import src.constants.GameConstants as gameConstants;

import src.util as util;

exports = Class(GC.Application, function() {
	this.initUI = function() {
		this.engine.updateOpts({
			alwaysRepaint: true,
			clearEachFrame: false, // Don't clear the isometric tiles always cover the entire screen
			keyListenerEnabled: false,
			logsEnabled: true,
			noTimestep: false,
			noReflow: true, // Don't use the reflow manager
			showFPS: false,
			resizeRootView: false,
			preload: ['resources/images']
		});

		this.scaleUI();

		// Create an instance of Isometric, this class wraps the isometric models and views.
		this._isometric = new Isometric({
			superview: this,
			mapSettings: mapSettings,
			editorSettings: editorSettings,
			itemSettings: itemSettings,
			gridSettings: gridSettings, // Core settings: grid size and layers
			tileSettings: tileSettings, // Information about the graphics
		}).generate().show();

		// Create the tool buttons:
		this._tools = ['Drag', 'MoveTo'];
		for (var i = 0; i < 2; i++) {
			new ButtonView({
				superview: this,
				x: 20 + i * 185,
				y: -20,
				width: 180,
				height: 90,
				title: this._tools[i],
				style: 'BLUE',
				on: {
					up: bind(this, 'onTool', i)
				}
			});
		}

		// Create a text displaying the active tool:
		this._modeText = new TextView({
			superview: this,
			x: this.baseWidth - 180,
			y: 0,
			width: 150,
			height: 60,
			size: 40,
			color: '#FFFFFF',
			strokeColor: '#000000',
			strokeWidth: 6,
			horizontalAlign: 'right',
			text: 'Drag',
			autoFontSize: false,
			autoSize: false,
			blockEvents: true
		});

		this._isometric
			.on('Ready', bind(this, 'onReady'))
			.on('Edit', bind(this, 'onEdit'))
			.on('AddDynamicModel', bind(this, 'onAddDynamicModel'))
			.on('AddStaticModel', bind(this, 'onAddStaticModel'))
			.on('Battle', bind(this, 'onBattle'));

		this._isometric.setTool(false);

		this._battleView = new BattleView({
			visible: false
		});

		// this._isometric.putDynamicItem(CharacterModel, {tileX: 9, tileY: 9});
		// var map = this._isometric.getMap();

		// this would draw a rectangle.
		// map.drawRect(1, 0, 0, 10, 10, gameConstants.tileGroups.GROUND, [
		// 	[15, 15, 15],
		// 	[15, 15, 15],
		// 	[15, 15, 15]
		// ]);
	};

	this.onAddStaticModel = function(model) {
		console.log('adding static model');
		console.log(model);
	};

	this.onBattle = function() {
		console.log("YARRR");
		this._battleView.show();
	};

	this.onAddDynamicModel = function(model) {
		console.log('added');
		console.log(model);
		model.on('Battle', bind(this, 'onBattle'));
	};

	this.onReady = function() {

		var map = this._isometric.getMap();
		map.getTile(0, 9)[0].index = 1;
		map.getTile(9, 18)[0].index = 1;

		this._character = this._isometric.putDynamicItem(CharacterModel, {
			tileX: 0,
			tileY: 9,
			visible: true,
			item: 'warrior',
			range: itemSettings.warrior.range,
			conditions: {
				accept: [{
						layer: 0,
						type: 'group',
						groups: [gameConstants.tileGroups.PASSABLE]
					}
				]
			}
		}, 2);

		this._door = this._isometric.putItem('door', 9, 18, {
			target: this._character
		});

		this._isometric.refreshMap();

	};

	this.onEdit = function(selection) {
		this._character.moveTo(selection.rect.x, selection.rect.y);
	};

	this.scaleUI = function() {

		if (device.height > device.width) {
			this.baseWidth = 576;
			this.baseHeight = device.height * (576 / device.width);
			this.scale = device.width / this.baseWidth;
		} else {
			this.baseWidth = 1024;
			this.baseHeight = device.height * (1024 / device.width);
			this.scale = device.height / this.baseHeight;
		}
		this.view.style.scale = this.scale;
	};

	this.tick = function(dt) {
		this._isometric.tick(dt);
	};


	/**
	 * Select a tool...
	 */
	this.onTool = function(index) {
		var matrix = util.getAdjacentMatrix(this._character.getTileX(), this._character.getTileY()),
			i,
			isometric = this._isometric;

		this._ranges = [];
		this._isometric.setTool(index ? this._tools[index].toLowerCase() : false);
		this._modeText.setText(this._tools[index]);

		if (index) {
			matrix = matrix.filter(function(point) {
				return isometric.getMap().getTile(point[0], point[1])[0].group ===
					gameConstants.tileGroups.PASSABLE;
			});

			i = matrix.length;

			while (i--) {
				this._isometric.putItem('range', matrix[i][0], matrix[i][1], {});
			}

			this._isometric.refreshMap();
		}


	};

});