const express = require('express');
const app = express();
app.use(express.json());

let rooms = {};

app.post('/create', (req, res) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms[code] = { ip: req.body.ip };
    console.log("✅ Комната создана:", code);
    res.json({ code });
});

app.post('/join', (req, res) => {
    const room = rooms[req.body.code];
    if (room) {
        res.json({ ip: room.ip });
        delete rooms[req.body.code];
        console.log("✅ Комната найдена!");
    } else {
        res.status(404).json({ error: "Room not found" });
        console.log("❌ Комната не найдена");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
