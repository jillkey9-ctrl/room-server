const express = require('express');
const app = express();

app.use(express.json());

let rooms = {};

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = {
        ip: req.body.ip,
        time: Date.now()
    };
    setTimeout(() => delete rooms[code], 60000);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (room) {
        res.json({ ip: room.ip });
        delete rooms[req.body.code];
    } else {
        res.status(404).json({ error: "Room not found" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
