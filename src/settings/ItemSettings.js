jsio("import util.sprintf as sprintf");

exports = {
    door: {
        width: 82,
        height: 82,
        offsetX: -41,
        offsetY: -82,
        images: ['resources/images/change_zones/0007.gif']
    },
    monster: {
        width: 82,
        height: 82,
        offsetX: -41,
        offsetY: -82,
        images: ['resources/images/npc/0024.gif']
    }
};


var klasses = JSON.parse(CACHE['resources/conf/classIndex.json']),
    i = klasses.length,
    klass;
while (i--) {
    klass = JSON.parse(CACHE[sprintf.sprintf('resources/conf/classes/%s.json', klasses[i])]);
    exports[klass.name] = klass;
}

