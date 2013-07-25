import event.Emitter as Emitter;

exports = Scene = Class(Emitter, function (supr) {
    this.init = function (opts) {
        supr(this, 'init', [opts]);
        merge(this, opts);

        this.initiatives = this.characters.concat(this.npcs);

        this.initiatives.sort(function(a, b) {
            return b.initiative() - a.initiative();
        })

        console.log(this.initiatives);

    };

    this.battle = function() {
        this.emit('Battle', 'Achtung!', 'Battle begins!');
    };
});
