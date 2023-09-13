//4桁のランダムな数字を生成する関数
export function generateRoomId(): number {
    let roomId = Math.floor(Math.random() * 10000);
    console.log(roomId)
    return roomId;
};