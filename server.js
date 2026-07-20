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
            console.log('🗑️ Room expired:', code);
        }
    }
}, 60000);

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = {
        offer: req.body.offer,
        created: Date.now(),
        candidates: []
    };
    console.log('✅ Room created:', code);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        console.log('❌ Room not found:', req.body.code);
        return res.status(404).json({ error: 'Room not found' });
    }
    console.log('✅ Join request for room:', req.body.code);
    res.json({ offer: room.offer });
});

app.post('/answer', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    room.answer = req.body.answer;
    console.log('✅ Answer received for room:', req.body.code);
    res.json({ success: true });
});

app.post('/candidate', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    if (!room.candidates) room.candidates = [];
    room.candidates.push(req.body.candidate);
    console.log('✅ Candidate received for room:', req.body.code);
    res.json({ success: true });
});

app.post('/get_candidates', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    console.log('✅ Candidates requested for room:', req.body.code);
    res.json({ candidates: room.candidates || [] });
});

app.post('/close', (req, res) => {
    const code = req.body.code;
    if (rooms[code]) {
        delete rooms[code];
        console.log('🗑️ Room closed:', code);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Signaling server running on port ' + PORT));
