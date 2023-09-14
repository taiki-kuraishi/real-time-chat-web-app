import { roomsInterface } from "./Types";

//socket.idが所属するroomのroomIdを取得する関数
export function GetRoomIdFromSocketId(serverData: roomsInterface, socketId: string) {
    const roomId = Object.keys(serverData.rooms).find((roomId) => {
        return serverData.rooms[Number(roomId)].userList[socketId];
    });
    return roomId;
}