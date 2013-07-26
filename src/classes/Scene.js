jsio("import event.Emitter as Emitter");

exports = Scene = Class(Emitter, function (supr) {
    this.init = function (opts) {
        supr(this, 'init', [opts]);
        merge(this, opts);

    };

    this.battle = function () {
        this.emit('Battle', 'Achtung!', 'Battle begins!');

        // roll initiatives
        var players = this.characters.concat(this.npcs);
        var i = players.length;
        while (i--) {
            players[i]._currentInitiative = players[i].rollInitiative();
        }
        players.sort(function (a, b) {
            return b._currentInitiative - a._currentInitiative;
        });

        this.round = 0;
        this.players = players;
        this.nextTurn();

    };

    this.nextTurn = function () {
        if (this.round > this.players.length - 1) {
            this.round = 0;
        }
        this.currentPlayer = this.players[this.round]
        this.currentPlayer.beginTurn();
    };

    this.pass = function () {
        this.round++;
        this.nextTurn();
    };


});
