var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

var pixel = require("node-pixel");
var five  = require("johnny-five");

var board = new five.Board();
var strip = null;

var NUM_LEDS = 10;

app.get('/', function(req, res){
    res.sendfile('index_motion.html');
});

app.use(express.static('public'));

var strip_color = {
    r : 255,
    g : 0,
    b : 0
};

var leds = [];
for(var i = 0; i < NUM_LEDS; i++) {
    leds[i] = {
        interval : null,
        color    : {
            r : 0,
            g : 0,
            b : 0
        }
    };
}
var led_activo = -1;

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

        active_led(0);

        http.listen(3000, function() {
            console.log('listening on *:3000');
        });

        io.on('connection', function(socket){
            console.log('a user connected');

            socket.on('change_color', function(data) {
                //strip_color = data.color;
/*
                console.log("CAMBIO: " + strip_color);

                for(var i = 0; i < NUM_LEDS; i++) {
                    var p = strip.pixel(i);
                    p.color(strip_color);
                }
                
                strip.show();
                */
                /*
                clearInterval(interval);
                */
            });

            socket.on('light_position', function(data) {
                active_led(data.x);
                //console.log(data);
            });

            socket.on('turn_off', function(data) {
                for(var i = 0; i < NUM_LEDS; i++) {
                    var p = strip.pixel(i);
                    p.color("#000000");
                }
                
                strip.show();
            });
        });
    });
});

var pos_ant = -1;

function active_led(pos) {
    // minimo -80, maximo 80
    pos = Math.round(((pos + 80) * 100) / 160); // ahora min 0, max 160
    pos = Math.round(pos / 10);
     
    // apagamos el resto
    for(var i = 0; i < NUM_LEDS; i++) {
        leds[i].color.r = 0;
        leds[i].color.g = 0;
        leds[i].color.b = 0;
    }

    pos--;

    leds[pos].color.r = strip_color.r;
    leds[pos].color.g = strip_color.g;
    leds[pos].color.b = strip_color.b;

    //console.log(pos);

    if(pos !== pos_ant)
        colorize();

    pos_ant = pos;
}

function colorize() {    
    //console.log(leds);

    for(var i = 0; i < NUM_LEDS; i++) {
        var p = strip.pixel(i);
        //console.log("rgb(" + leds[i].color.r + ", " + leds[i].color.g + ", " + leds[i].color.b + ")");
        p.color("rgb(" + leds[i].color.r + "," + leds[i].color.g + "," + leds[i].color.b + ")");

    }

    strip.show();
}