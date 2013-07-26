jsio("import device");

jsio("import isometric.Isometric as Isometric");
jsio("import isometric.models.item.SpawnerModel as SpawnerModel");

jsio("import menus.views.components.ButtonView as ButtonView");
jsio("import menus.views.TextDialogView as TextDialogView");

jsio("import util.sprintf as sprintf");

jsio("import ui.TextView as TextView");

jsio("import src.settings.TileSettings as tileSettings");
jsio("import src.settings.GridSettings as gridSettings");
jsio("import src.settings.MapSettings as mapSettings");
jsio("import src.settings.EditorSettings as editorSettings");
jsio("import src.settings.ItemSettings as itemSettings");

jsio("import src.constants.GameConstants as gameConstants");

jsio("import src.classes.Character as Character");
jsio("import src.classes.NPC as NPC");
jsio("import src.classes.Combat as Combat");
jsio("import src.classes.Scene as Scene");

jsio("import src.lib.watch");

jsio("import src.util as util");

var spf = sprintf.sprintf;

var klasses = JSON.parse(CACHE['resources/conf/classIndex.json']);

exports = Game = Class(GC.Application, function () {

    /**
     * Initializes the user interface?
     */
    this.initUI = function initUI() {
        var i, title, btn, toolTitles;
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
        toolTitles = ['Pan', 'Move', 'Attack'];
        this._tools = {};
        for (i = 0; i < toolTitles.length; i++) {
            title = toolTitles[i];
            btn = new ButtonView({
                superview: this,
                x: 20 + i * 185,
                y: -20,
                width: 180,
                visible: false,
                height: 90,
                title: title,
                style: 'BLUE',
                on: {
                    up: bind(this, 'onTool', title)
                }
            });
            btn.on('game:showTools', function () {
                btn.updateOpts({visible: true});
                console.log(this);
                console.log(arguments);
            });
            this._tools[title] = btn;

        }

        this._pass = new ButtonView({
            superview: this,
            x: 20 + i++ * 185,
            y: -20,
            width: 180,
            visible: false,
            height: 90,
            title: 'Pass',
            style: 'BLUE',
            on: {
                up: bind(this, 'onPass')
            }
        });


        this._isometric
            .on('Ready', bind(this, 'onReady'))
            .on('Message', bind(this, 'onMessage'))
            .on('AddDynamicModel', bind(this, 'onAddDynamicModel'));

        this._isometric.setTool(false);
    };

    this.onAddDynamicModel = function(model){
          console.log(model);
    };

    this._generateCharacters = function _generateCharacters(count) {
        var map = this._isometric.getMap(),
            xs = [12, 12, 12],
            ys = [23, 24, 25],
            message = bind(this, 'onMessage'),
            character;

        this.characters = [];

        while (count--) {
            character = new Character({
                klass: klasses[util.getRandomInt(0, klasses.length - 1)],
                tileX: xs[count],
                tileY: ys[count],
                layer: 3,
                createModelCB: bind(this._isometric, 'putDynamicItem'),
                modelListCB: bind(this._isometric, 'getDynamicModels')
            }).on('Disabled', message)
                .on('Dying', message)
                .on('Dead', message)
                .on('Alive', message)
                .on('character:beginTurn', bind(this, 'onCharacterBeginTurn'));

            this.characters.push(character);

            console.log(spf('created character %s %s', character.klassName, character.name));

            map.getTile(xs[count], ys[count])[0].index = 1;
        }


    };

    this._generateNPCs = function _generateNPCs(count) {
        var map = this._isometric.getMap(),
            xs = [24, 24, 24],
            ys = [23, 24, 25],
            message = bind(this, 'onMessage'),
            npc;

        this.npcs = [];

        while (count--) {
            npc = new NPC({
                klass: klasses[util.getRandomInt(0, klasses.length - 1)],
                tileX: xs[count],
                tileY: ys[count],
                layer: 3,
                createModelCB: bind(this._isometric, 'putDynamicItem'),
                modelListCB: bind(this._isometric, 'getDynamicModels')
            }).on('Disabled', message)
                .on('Dying', message)
                .on('Dead', message)
                .on('Alive', message)
                .on('npc:beginTurn', bind(this, 'onNPCBeginTurn'));

            this.npcs.push(npc);

            console.log(spf('created NPC %s %s', npc.klassName, npc.name));

            map.getTile(xs[count], ys[count])[0].index = 1;
        }
    };

    this.onReady = function onReady() {

        var map = this._isometric.getMap(),
            concrete_line = [11, 11, 11];

        this._generateCharacters(3);
        this._generateNPCs(3);

        this.scene = new Scene({
            characters: this.characters,
            npcs: this.npcs
        }).on('Battle', bind(this, 'onMessage'));

        map.drawLineHorizontal(0, 0, 0, 36, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineHorizontal(0, 36, 0, 36, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineVertical(0, 0, 0, 36, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);
        map.drawLineVertical(0, 36, 0, 36, gameConstants.tileGroups.IMPASSABLE,
            concrete_line);

        this._isometric.refreshMap();

        this.scene.battle();

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

    this.hideTools = function hideTools() {

    };

    /**
     * Select a tool...
     */
    this.onTool = function onTool(title) {

        var iso = this._isometric;

        iso.setTool(title === 'Pan' || iso.getTool() === title ? false : title);

        //TODO: make buttons sticky

        switch (title) {
            case 'Move':
                this.scene.currentPlayer.model.drawRange();
                iso.refreshMap();
                iso.on('Edit', bind(this, '_move'));
                break;
            case 'Attack':
                this.scene.currentPlayer.model.clearRange();
                iso.on('Edit', bind(this, '_attack'));
                break;
            default:
                this.scene.currentPlayer.model.clearRange();
                iso.refreshMap();

        }

    };

    this._move = function _move(selection) {
        this.scene.currentPlayer.model.moveTo(selection.rect.x, selection.rect.y);
        this._isometric.setTool(false);
        this.scene.currentPlayer.model.clearRange();
        this._isometric.refreshMap();

    };

    this._attack = function _attack(selection) {
        var i = this.scene.players.length;
        while(i--) {
            this.scene.players[i].model.emit('characterModel:attack', selection, this.scene.currentPlayer);
        }

        return;
        var message = bind(this, 'onMessage');
        var c = new Combat(this.character, this.npc)
            .on('Miss', message)
            .on('Hit', message)
            .on('OutOfRange', message);


        c.begin();

        c.end();
    };

    this.onMessage = function (title, msg) {

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

    this.showTools = function () {
        this.emit('game:showTools');
        var t, tool;
        for (t in this._tools) {
            if (this._tools.hasOwnProperty(t)) {
                tool = this._tools[t];
                tool.updateOpts({visible: true});
            }
        }
        this._pass.updateOpts({visible: true});
    };

    this.onCharacterBeginTurn = function () {
        this.showTools();
    };

    this.onNPCBeginTurn = function(npc) {
        var defender = npc.chooseTarget(this.characters);
    };

    this.onPass = function () {
        this.scene.pass();
    };

    this.showInfo = function showInfo(c) {


    };

});
