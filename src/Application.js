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

exports = Class(GC.Application, function () {
    this.initUI = function initUI() {
        var i;
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
            tileSettings: tileSettings // Information about the graphics
        }).generate().show();

        // Create the tool buttons:
        this._tools = ['Drag', 'MoveTo'];
        for (i = 0; i < 2; i++) {
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
    };

    this.onAddStaticModel = function onAddStaticModel(model) {
        console.log('adding static model');

    };

    this.onBattle = function onBattle() {
        console.log("YARRR");
//        this._battleView.show();
    };

    this.onAddDynamicModel = function onAddDynamicModel(model) {
        model.on('Battle', bind(this, 'onBattle'));
    };

    this.onReady = function onReady() {

        var map = this._isometric.getMap(),
            concrete_line = [11, 11, 11];;
        map.getTile(1, 9)[0].index = 1;
        map.getTile(9, 17)[0].index = 1;

        this._character = this._isometric.putDynamicItem(CharacterModel, {
            tileX: 1,
            tileY: 9,
            visible: true,
            item: 'warrior',
            range: itemSettings.warrior.range,
            conditions: {
                accept: [
                    {
                        layer: 0,
                        type: 'group',
                        groups: [gameConstants.tileGroups.PASSABLE]
                    }
                ]
            }
        }, 2);

        this._door = this._isometric.putItem('door', 9, 17, {
            target: this._character
        });

        map.drawLineHorizontal(0, 0, 0, 18, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineHorizontal(0, 18, 0, 18, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineVertical(0, 0, 0, 18, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineVertical(0, 18, 0, 18, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);

        this._isometric.refreshMap();

    };

    this.onEdit = function onEdit(selection) {
        this._character.moveTo(selection.rect.x, selection.rect.y);
        this._isometric.setTool(false);
        this._character.clearRange();
        this._isometric.refreshMap();

    };

    this.scaleUI = function scaleUI() {

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

    this.tick = function tick(dt) {
        this._isometric.tick(dt);
    };

    /**
     * Select a tool...
     */
    this.onTool = function onTool(index) {
        var isometric = this._isometric;

        isometric.setTool(index ? this._tools[index].toLowerCase() : false);
        this._modeText.setText(this._tools[index]);

        if (index) {
            this._character.drawRange();
            isometric.refreshMap();
        } else {
            this._character.clearRange();
            isometric.refreshMap();
        }



    };

});