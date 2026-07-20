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
    const port = req.body.port || 9999;
    
    // Проверяем, не занят ли порт
    if (rooms[code]) {
        return res.status(400).json({ error: 'Room already exists' });
    }
    
    rooms[code] = {
        ip: req.body.ip || '127.0.0.1',
        port: port,
        created: Date.now(),
        players: [],
        active: true
    };
    console.log('✅ Room created:', code, 'IP:', rooms[code].ip, 'Port:', port);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (!room) {
        console.log('❌ Room not found:', req.body.code);
        return res.status(404).json({ error: 'Room not found' });
    }
    
    if (!room.active) {
        return res.status(410).json({ error: 'Room is closed' });
    }
    
    // Добавляем игрока, если его еще нет
    const playerId = req.body.playerId || 'unknown';
    if (!room.players.includes(playerId)) {
        room.players.push(playerId);
    }
    
    console.log('✅ Player joined room:', req.body.code, 'Players:', room.players.length);
    res.json({ 
        ip: room.ip, 
        port: room.port 
    });
});

app.post('/close', (req, res) => {
    const code = req.body.code;
    if (rooms[code]) {
        rooms[code].active = false;
        delete rooms[code];
        console.log('🗑️ Room closed:', code);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Room not found' });
    }
});

app.get('/rooms', (req, res) => {
    const roomList = Object.keys(rooms).map(code => ({
        code: code,
        players: rooms[code].players.length,
        created: rooms[code].created,
        active: rooms[code].active
    }));
    res.json({ rooms: roomList });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server running on port ' + PORT));
