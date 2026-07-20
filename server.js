const express = require('express');
const app = express();
app.use(express.json());

let rooms = {};

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = { 
        ip: req.body.ip, 
        port: req.body.port || 9999
    };
    console.log("✅ Комната создана:", code, "IP:", req.body.ip, "PORT:", req.body.port);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (room) {
        res.json({ ip: room.ip, port: room.port });
        delete rooms[req.body.code];
        console.log("✅ Комната найдена! IP:", room.ip, "PORT:", room.port);
    } else {
        res.status(404).json({ error: "Room not found" });
        console.log("❌ Комната не найдена");
    }
});

app.post('/close', (req, res) => {
    const code = req.body.code;
    if (rooms[code]) {
        delete rooms[code];
        console.log("🗑️ Комната удалена:", code);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Room not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
