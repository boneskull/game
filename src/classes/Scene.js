import event.Emitter as Emitter;

exports = Scene = Class(Emitter, function (supr) {
    this.init = function (opts) {
        supr(this, 'init', [opts]);
    };
});
