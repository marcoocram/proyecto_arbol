var pixel = require("node-pixel");
var five  = require("johnny-five");

var board = new five.Board();

var NUM_LEDS = 6;

board.on("ready", function() {
    console.log("Board Ready");

    var strip = new pixel.Strip({
        data: 40,
        length: NUM_LEDS,
        board: this,
        controller: "FIRMATA",
    });

    strip.on("ready", function() {
        console.log("Strip Ready");

        for(var i = 0; i < NUM_LEDS; i++) {
            var p = strip.pixel(i);
            p.color("#000000");
        }
        
        strip.show();
    });
});