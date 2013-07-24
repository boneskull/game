import device;

import isometric.Isometric as Isometric;
import isometric.models.item.SpawnerModel as SpawnerModel;

import menus.views.components.ButtonView as ButtonView;
import menus.views.TextDialogView as TextDialogView;

import ui.TextView as TextView;

import src.settings.TileSettings as tileSettings;
import src.settings.GridSettings as gridSettings;
import src.settings.MapSettings as mapSettings;
import src.settings.EditorSettings as editorSettings;
import src.settings.ItemSettings as itemSettings;


import src.constants.GameConstants as gameConstants;

import src.classes.Character as Character;
import src.classes.NPC as NPC;
import src.classes.Combat as Combat;

import src.util as util;

exports = Game = Class(GC.Application, function () {

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
        console.log(mapSettings);
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
        this._tools = ['Drag', 'MoveTo', 'Attack'];
        for (i = 0; i < this._tools.length; i++) {
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
            .on('Message', bind(this, 'onMessage'))
            .on('Combat', bind(this, 'onCombat'));

        this._isometric.setTool(false);
    };

});


Game.prototype.onCombat = function onBattle() {
    console.log("YARRR");
};

Game.prototype.onReady = function onReady() {

    var map = this._isometric.getMap(),
        concrete_line = [11, 11, 11],
        message = bind(this, 'onMessage');
    map.getTile(1, 9)[0].index = 1;
    map.getTile(1, 10)[0].index = 1;
//        map.getTile(9, 17)[0].index = 1;

    this.character = new Character({
        klass: 'warrior',
        tileX: 1,
        tileY: 9,
        layer: 3,
        createModelCB: bind(this._isometric, 'putDynamicItem'),
        modelListCB: bind(this._isometric, 'getDynamicModels')
    }).on('Disabled', message)
        .on('Dying', message)
        .on('Dead', message);

    this.npc = new NPC({
        klass: 'mage',
        tileX: 1,
        tileY: 10,
        layer: 3,
        createModelCB: bind(this._isometric, 'putDynamicItem'),
        modelListCB: bind(this._isometric, 'getDynamicModels')
    }).on('Disabled', message)
        .on('Dying', message)
        .on('Dead', message);

//
//        this._door = this._isometric.putItem('door', 9, 17, {
//            target: this._character
//        });

    map.drawLineHorizontal(0, 0, 0, 18, gameConstants.tileGroups.IMPASSABLE,
        concrete_line);
    map.drawLineHorizontal(0, 18, 0, 18, gameConstants.tileGroups.IMPASSABLE,
        concrete_line);
    map.drawLineVertical(0, 0, 0, 18, gameConstants.tileGroups.IMPASSABLE,
        concrete_line);
    map.drawLineVertical(0, 18, 0, 18, gameConstants.tileGroups.IMPASSABLE,
        concrete_line);

    this._isometric.setTool(false);
    this._isometric.refreshMap();

};

Game.prototype.onEdit = function onEdit(selection) {
    this.character.model.moveTo(selection.rect.x, selection.rect.y);
    this._isometric.setTool(false);
    this.character.model.clearRange();
    this._isometric.refreshMap();

};

Game.prototype.scaleUI = function scaleUI() {

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

Game.prototype.tick = function tick(dt) {
    this._isometric.tick(dt);
};

/**
 * Select a tool...
 */
Game.prototype.onTool = function onTool(index) {
    var isometric = this._isometric;

    isometric.setTool(index ? this._tools[index].toLowerCase() : false);
    this._modeText.setText(this._tools[index]);

    switch (index) {
        case 1:
            this.character.model.drawRange();
            isometric.refreshMap();
            break;
        case 2:
            this.initiateCombat();
            break;
        default:
            this.character.model.clearRange();
            isometric.refreshMap();
            break;

    }

};

Game.prototype.initiateCombat = function () {

    this._isometric.emit('Combat');
    var message = bind(this, 'onMessage');
    var c = new Combat(this.character, this.npc)
        .on('Miss', message)
        .on('Hit', message)
        .on('OutOfRange', message);


    c.begin();

    c.end();
};

Game.prototype.onMessage = function (title, msg) {

    new TextDialogView({
        superview: this,
        title: title,
        text: msg,
        width: 800,
        modal: true,
        buttons: [
            {
                title: 'Ok',
                width: 160,
                style: 'GREEN'
            }
        ]
    }).show();
};

Game.prototype.showInfo = function showInfo(c) {


};
