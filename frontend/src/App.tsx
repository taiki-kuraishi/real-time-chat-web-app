import './App.scss';
import { useReducer } from 'react';
import { io, Socket } from "socket.io-client";
import { socketInterface, serverActions, clientActions } from './Types'

//userの状態管理
interface userState {
  userName: string;
  isJoined: boolean;
  text: string;
  serverMessage: string;
}

type CounterAction =
  | { type: "reset" }
  | { type: "setIsJoined"; value: userState["isJoined"] }
  | { type: "updateRoom", value: socketInterface }
  | { type: "serverMessage", value: userState["serverMessage"] }
  | { type: "setUserName", value: userState["userName"] }
  | { type: "setRoomId", value: socketInterface["roomId"] }

const initialState: userState & socketInterface = {
  // userState
  userName: "",
  isJoined: false,
  text: "",
  serverMessage: "",

  // socketInterface
  roomId: null,
  userList: null,
};

function stateReducer(state: userState & socketInterface, action: CounterAction): userState & socketInterface {
  switch (action.type) {
    case "reset":
      return initialState;
    case "setIsJoined":
      return { ...state, isJoined: action.value };
    case "updateRoom":
      return { ...state, roomId: action.value.roomId, userList: action.value.userList };
    case "serverMessage":
      return { ...state, serverMessage: action.value };
    case "setUserName":
      return { ...state, userName: action.value };
    case "setRoomId":
      return { ...state, roomId: action.value };
    default:
      throw new Error("Unknown action");
  }
}

const socket: Socket<serverActions, clientActions> = io("http://localhost:3031");

socket.on("connect", () => {
  console.log("connected");
});


function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  const reset = () => dispatch({ type: "reset" });
  const serverMessage = (message: string) => dispatch({ type: "serverMessage", value: message });


  const createRoom = (userName: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    userName.preventDefault();
    socket.emit("create", state.userName);
  }

  const enterRoom = (userName: React.MouseEvent<HTMLButtonElement, MouseEvent>, roomId: any) => {
    userName.preventDefault();
    socket.emit("enter", state.userName, roomId);
  }

  socket.on("severMessage", (message) => {
    console.log(message);
    serverMessage(message);
  });

  socket.on("updateRoom", async (room) => {
    console.log(room);
    await dispatch({ type: "updateRoom", value: room });
    console.log(state);
    console.log(state.roomId);
    dispatch({ type: "setIsJoined", value: true });
  });

  console.log(state);

  return (
    <div className="App">
      <h1>real-time-chat-app</h1>

      <button onClick={reset}>Reset</button>
      <p>serverMessage: {state.serverMessage}</p>
      {!state.isJoined ? (
        <div>
          <p>this is top page</p>
          {/* roomの作成 */}
          <div>
            <p>roomの作成</p>
            <form>
              <input type="text"
                placeholder='name'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({
                  type: 'setUserName', value: e.target.value
                })}
              />
              <button type='submit'
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => createRoom(e)}
              >create room</button>
            </form>
          </div>

          {/* roomに参加 */}
          <div>
            <p>roomに参加</p>
            <form>
              <input type="text" placeholder='name'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({
                  type: 'setUserName', value: e.target.value
                })}
              />
              <input type="text" placeholder='roomId'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({
                  type: 'setRoomId', value: Number(e.target.value)
                })}
              />
              <button type='submit'
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => enterRoom(e, state.roomId)}
              >enter room</button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <p>this is chat room</p>
          <p>room id : {state.roomId}</p>
          <p>your name : {state.userName}</p>
          <p>{JSON.stringify(state.userList)}</p>
          <form>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
