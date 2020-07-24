"use strict"
const Obniz = require("obniz")
const obniz = new Obniz("XXXX-XXXX")  // Obniz ID
var mqtt = require('mqtt');
var mqtturl = 'mqtt://[user]:[password]@[mqtt_host]';  // MQTT
console.log('connecting to: '+mqtturl);
var client = mqtt.connect(mqtturl, {cliendId: 'nodejs_sub'});

client.on('connect', function(){
    console.log('subscriber connected.');
});

client.subscribe('#', function(err, granted){
    if (err) {
        console.log('subscriber subscribe failed:', err);
    } else {
        console.log('subscriber subscribed.');
    }
});


const keymap = {
    "36": 65.4,  // C2
    "37": 69.3,  // C#2
    "38": 73.4,  // D2
    "39": 77.8,  // D#2
    "40": 82.4,  // E2
    "41": 87.3,  // F2
    "42": 92.5,  // F#2
    "43": 98.0,  // G2
    "44": 103.8, // G#2
    "45": 110.0, // A2
    "46": 116.5, // A#2
    "47": 123.5, // B2
    "48": 130.8, // C3
    "49": 138.6, // C#3
    "50": 146.8, // D3
    "51": 155.6, // D#3
    "52": 164.8, // E3
    "53": 174.6, // F3
    "54": 185.0, // F#3
    "55": 196.0, // G3
    "56": 207.7, // G#3
    "57": 220.0, // A3
    "58": 233.1, // A#3
    "59": 246.9, // B3
    "60": 261.6, // C4
}

obniz.onconnect = async () => {
    const speakers = []
    speakers.push(
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 1, gnd: 0}) },
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 2, gnd: 0}) },
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 3, gnd: 0}) },
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 4, gnd: 0}) },
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 5, gnd: 0}) },
        { assign: 0, obniz: obniz.wired("Speaker", {signal: 6, gnd: 0}) }
    )

    client.on('message', function(topic, message){
        console.log('subscriber on.message', 'topic:', topic, 'message:', message.toString());
        // subscriber on.message topic: nuno/midi/out/0/noteon/53 message: 100
        // subscriber on.message topic: nuno/midi/out/0/noteoff/53 message: 100
        const note = topic.toString().split('/')[4]
        const key = topic.toString().split('/')[5]
        console.log(note, key);
        if (note === `noteon`) {
            if (speakers.some(speaker => speaker.assign === key)) return
            for (const speaker of speakers) {
                if (speaker.assign) continue
                speaker.assign = key
                speaker.obniz.play(keymap[key])
                return
            }
        }
        if (note === `noteoff`) {
            for (const speaker of speakers) {
                if (speaker.assign !== key) continue
                speaker.assign = 0
                speaker.obniz.stop()
                return
            }
        }
    });
}

