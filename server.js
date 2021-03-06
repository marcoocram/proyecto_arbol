var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

var pixel   = require("node-pixel");
var five    = require("johnny-five");
var firmata = require('firmata');

var strip = null;

var NUM_LEDS = 150;

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
 
//johnny-five
var board = new five.Board();
board.on("ready", function() {
    console.log("Board Ready");

    strip = new pixel.Strip({
        data: 40,
        length: NUM_LEDS,
        board: this,
        controller: "FIRMATA",
    });

/*
//firmata
var board = new firmata.Board('/dev/ttyACM0',function() {
    strip = new pixel.Strip({
        data: 40,
        length: NUM_LEDS,
        firmata: board,
        controller: "FIRMATA",
    });
*/

    strip.on("ready", function() {
        console.log("Strip Ready");

        http.listen(3000, function() {
            console.log('listening on *:3000');
        });

        io.on('connection', function(socket){
            console.log('a user connected');

            socket.on('insert_led', function(data) {
                color = data.color;
                active_led = data.n;

                console.log("INSERTANDO LED: " + active_led);

                if(active_led < NUM_LEDS && active_led >= 0){ // && !leds[active_led].active) {
                    leds[active_led].color  = "#000000";
                    leds[active_led].color  = color;
                    leds[active_led].active = 1;

                    colorize();
                } else {
                    console.log("Led erroneo o ya activado");
                }
            });

            socket.on('turn_off', function(data) {
                for(var i = 0; i < NUM_LEDS; i++) {
                    leds[i].active = 0;
                    leds[i].color = "#000000";
                }
                
                colorize();
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