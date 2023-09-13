import { createServer } from "http";
import { Server } from "socket.io";

import { generateRoomId } from "./src/GenerateRoomId"
import { socketInterface, serverActions, clientActions } from "./src/Types"


interface roomsInterface {
    rooms: {
        [roomId: number]: socketInterface;
    };
}

const http = createServer();
const io = new Server<clientActions, serverActions, socketInterface>(http, {
    cors: {
        origin: '*',
    },
});

// serverDataの初期化
const serverData: roomsInterface = {
    rooms: {},
};


io.on('connection', (socket) => {
    //roomの作成
    socket.on("create", (userName: string) => {
        console.log("create room");
        const room: socketInterface = {
            roomId: generateRoomId(),
            userList: {
                [socket.id]: userName,
            },
        };
        serverData.rooms[room.roomId] = room;
        console.log(serverData.rooms);

        io.to(socket.id).emit("severMessage", `あなたは${room.roomId}番の部屋を作成しました。`);
        io.to(socket.id).emit("updateRoom", room);
    });

    //roomへの入室
    socket.on("enter", (userName: string, roomId: number) => {
        console.log("enter room");
        console.log("roomId : ", roomId);

        //roomが存在しない場合
        if (!serverData.rooms[roomId]) {
            io.to(socket.id).emit("severMessage", `部屋${roomId}は存在しません。`);
            return;
        }

        //roomが存在する場合
        serverData.rooms[roomId].userList[socket.id] = userName;
        console.log(serverData.rooms[roomId].userList);

        io.to(socket.id).emit("severMessage", `あなたは${roomId}番の部屋に入室しました。`);
        io.to(socket.id).emit("updateRoom", serverData.rooms[roomId]);
    });

    //切断
    socket.on("disconnect", () => {
        console.log("disconnect");
        console.log(socket.id);

        //socket.idが所属するroomのroomIdを取得
        const roomId = Object.keys(serverData.rooms).find((roomId) => {
            return serverData.rooms[Number(roomId)].userList[socket.id];
        });
        console.log("roomId : ", roomId);

        //socket.idが所属するroomのuserListからsocket.idを削除
        if (roomId) {
            delete serverData.rooms[Number(roomId)].userList[socket.id];
            console.log("serverData.rooms[Number(roomId)].userList : ", serverData.rooms[Number(roomId)].userList);
        }

        //roomのuserListが空になったらroomを削除
        if (roomId && Object.keys(serverData.rooms[Number(roomId)].userList).length === 0) {
            delete serverData.rooms[Number(roomId)];
        }

        console.log(serverData);
    });
});

http.listen(3031);
console.log("server started...");