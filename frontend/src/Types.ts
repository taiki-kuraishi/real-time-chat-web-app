export interface socketInterface {
    roomId: number | null,
    userList: {
        [userId: string]: string
    } | null,
}

export interface clientActions {
    create: (userName: string) => void;
    enter: (userName: string, roomId: number) => void;
    send: (data: string) => void;
    exit: (userName: string) => void;
}

export interface serverActions {
    updateRoom: (room: socketInterface) => void;
    basicEmit: (data: string) => void;
    severMessage: (data: string) => void;
}