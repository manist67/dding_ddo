const io = require("socket.io");
const http = require('http');

const ranking = [ ];

async function getRankingList() {
    return ranking;
}

async function joinNewId(nickname) {
    const uid = Math.random().toString().slice(5);
    const item = { uid, nickname, count: 0, isNew: true };
    ranking.push(item);
    return item;
}

async function addPop(uid) {
    const idx = ranking.findIndex(e=>e.uid === uid);
    if(idx === -1) { return; }
    ranking[idx].count += 1;
    ranking[idx].isNew = false;

    return ranking[idx];
}

async function getMyRanking(uid) {
    const idx = ranking.findIndex(e=>e.uid == uid);
    if(idx === -1) return ranking.length;
    return idx + 1;
}

module.exports = (server) => {
    const socket = io(server, {
        path: "/pop",
        cors: {  
            origin: '*',
        }
    });
    
    socket.on("connection", (socket) => {
        console.log("socket connected");
        let user;

        socket.on("enter", async ({ nickname: _nickname }) => {
            nickname = _nickname;
            console.log(nickname, "has enter the game.");

            user = await joinNewId(nickname);
            socket.emit("join", { ...user, ranking: await getMyRanking(user.uid) });
            socket.broadcast.emit("user", { ...user });
            socket.emit("ranking", { ranking: await getRankingList() });
        });

        socket.on("pop", async () => {
            const result = await addPop(user.uid);
            socket.broadcast.emit("user", { ...result });
        });
    });


    console.log("RUN SOCKET SERVER")
}