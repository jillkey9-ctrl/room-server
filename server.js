const express = require('express');
const app = express();
app.use(express.json());

let rooms = {};

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = {
        ip: req.body.ip || '127.0.0.1',
        port: req.body.port || 9999,
        created: Date.now()
    };
    console.log('✅ Room created:', code, 'IP:', rooms[code].ip);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    console.log('✅ Player joined room:', req.body.code);
    res.json({ ip: room.ip, port: room.port });
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
app.listen(PORT, () => console.log('🚀 Server running on port ' + PORT));
