var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

var pixel = require("node-pixel");
var five  = require("johnny-five");

var board = new five.Board();
var strip = null;

var NUM_LEDS = 100;

app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.use(express.static('public'));

var leds = [];
for(var i = 0; i < NUM_LEDS; i++) {
    leds[i] = {
        active   : 0,
        interval : null,
        color    : "#000000"
    };
}

board.on("ready", function() {
    console.log("Board Ready");

    strip = new pixel.Strip({
        data: 40,
        length: NUM_LEDS,
        board: this,
        controller: "FIRMATA",
    });

    strip.on("ready", function() {
        console.log("Strip Ready");

        http.listen(3000, function() {
            console.log('listening on *:3000');
        });

        io.on('connection', function(socket){
            console.log('a user connected');

            socket.on('insert_led', function(data) {
                color = data.color;
                active_led = NUM_LEDS - 1;

                console.log("INSERTANDO LED: " + active_led);

                var interval = setInterval(function() {
                    if(!leds[active_led - 1].active && active_led - 1 > 0) {
                        leds[active_led].color = "#000000";
                        active_led--;
                        leds[active_led].color = color;

                        colorize();
                    } else {
                        console.log("FIN");
                        leds[active_led].active = 1;
                        clearInterval(interval);
                    }
                }, 100);
            });

            socket.on('turn_off', function(data) {
                for(var i = 0; i < NUM_LEDS; i++) {
                    var p = strip.pixel(i);
                    p.color("#000000");
                }
                
                strip.show();

                clearInterval(interval);
            });
        });
    });
});

function colorize() {    
    for(var i = 0; i < NUM_LEDS; i++) {
        var p = strip.pixel(i);
        p.color(leds[i].color);
    }

    strip.show();
}