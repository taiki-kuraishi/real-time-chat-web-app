export interface socketInterface {
    roomId: string | null,
    userList: {
        [userId: string]: string
    } | null,
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
    severMessage: (data: string) => void;
}