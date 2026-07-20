const express = require('express');
const app = express();
app.use(express.json());

let rooms = {};

// Очистка старых комнат каждые 10 минут
setInterval(() => {
    const now = Date.now();
    for (const code in rooms) {
        if (now - rooms[code].created > 600000) { // 10 минут
            delete rooms[code];
            console.log('🗑️ Room expired:', code);
        }
    }
}, 60000);

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const ip = req.body.ip || '127.0.0.1';
    const port = req.body.port || 9999;
    
    // Проверяем, не занят ли уже этот порт другой комнатой
    for (const existingCode in rooms) {
        if (rooms[existingCode].port === port && rooms[existingCode].ip === ip) {
            return res.status(409).json({ error: 'Port already in use' });
        }
    }
    
    rooms[code] = {
        ip: ip,
        port: port,
        created: Date.now()
    };
    console.log('✅ Room created:', code, 'IP:', ip, 'Port:', port);
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

app.get('/rooms', (req, res) => {
    const list = Object.keys(rooms).map(code => ({
        code: code,
        ip: rooms[code].ip,
        port: rooms[code].port,
        created: rooms[code].created
    }));
    res.json({ rooms: list });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Signaling server running on port', PORT));
