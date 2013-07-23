import util.sprintf as sprintf;

exports = Class(function () {

    this.init = function (opts) {
        merge(this, JSON.parse(CACHE[sprintf.sprintf('resources/conf/items/weapons/%s.json', opts.type)])[opts.name]);

    };

});