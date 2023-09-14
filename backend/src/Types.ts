export interface socketInterface {
    roomId: string,
    userList: {
        [userId: string]: string
    }
}

export interface clientActions {
    create: (userName: string) => void;
    enter: (userName: string, roomId: string) => void;
    post: (message: string) => void;
    exit: (userName: string) => void;
}

export interface serverActions {
    updateRoom: (room: socketInterface) => void;
    basicEmit: (userName: string, message: string) => void;
    severMessage: (message: string) => void;
}

export interface roomsInterface {
    rooms: {
        [roomId: string]: socketInterface;
    };
}