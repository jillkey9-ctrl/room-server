const express = require('express');
const app = express();
app.use(express.json());

let rooms = {};
const ROOM_TIMEOUT = 300000;

setInterval(() => {
    const now = Date.now();
    for (const code in rooms) {
        if (now - rooms[code].created > ROOM_TIMEOUT) {
            delete rooms[code];
        }
    }
}, 60000);

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = {
        offer: req.body.offer,
        hostId: req.body.hostId || 'host',
        created: Date.now(),
        clients: []
    };
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ 
        offer: room.offer,
        hostId: room.hostId
    });
});

app.post('/answer', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    room.answer = req.body.answer;
    res.json({ success: true });
});

app.post('/candidate', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    if (!room.candidates) room.candidates = [];
    room.candidates.push(req.body.candidate);
    res.json({ success: true });
});

app.post('/get_candidates', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ candidates: room.candidates || [] });
});

app.post('/close', (req, res) => {
    const code = req.body.code;
    if (rooms[code]) {
        delete rooms[code];
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Signaling server running on port ' + PORT));
