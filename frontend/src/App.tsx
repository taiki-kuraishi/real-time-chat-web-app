import './App.scss';
import { useReducer } from 'react';
import { io, Socket } from "socket.io-client";
import { socketInterface, serverActions, clientActions } from './Types'

//userの状態管理
interface userState {
  userName: string;
  isJoined: boolean;
  text: string;
  messageList: string[];
  serverMessage: string;
}

type CounterAction =
  | { type: "reset" }
  | { type: "setIsJoined"; value: userState["isJoined"] }
  | { type: "updateRoom", value: socketInterface, value2: userState["isJoined"] }
  | { type: "serverMessage", value: userState["serverMessage"] }
  | { type: "setUserName", value: userState["userName"] }
  | { type: "setRoomId", value: socketInterface["roomId"] }
  | { type: "setText", value: userState["text"] }
  | { type: "setMessageList", value: userState["messageList"] }

const initialState: userState & socketInterface = {
  // userState
  userName: "",
  isJoined: false,
  text: "",
  messageList: [],
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
      if (action.value.roomId) {
        return { ...state, roomId: action.value.roomId, userList: action.value.userList, isJoined: true };
      }
      return { ...state, roomId: action.value.roomId, userList: action.value.userList, isJoined: false };
    case "serverMessage":
      return { ...state, serverMessage: action.value };
    case "setUserName":
      return { ...state, userName: action.value };
    case "setRoomId":
      return { ...state, roomId: action.value };
    case "setText":
      return { ...state, text: action.value };
    case "setMessageList":
      return { ...state, messageList: action.value };
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

  // roomの作成
  const createRoom = (userName: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    userName.preventDefault();
    socket.emit("create", state.userName);
  }

  // roomに参加
  const enterRoom = (userName: React.MouseEvent<HTMLButtonElement, MouseEvent>, roomId: any) => {
    userName.preventDefault();
    socket.emit("enter", state.userName, roomId);
  }

  //messageの送信
  const postMessage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    socket.emit("post", state.text);
    dispatch({ type: "setText", value: "" });
  }

  socket.on("severMessage", (message) => {
    console.log(message);
    serverMessage(message);
  });

  socket.on("updateRoom", (room) => {
    console.log(room);
    //severMessageの初期化
    // dispatch({ type: "serverMessage", value: "" });

    dispatch({ type: "updateRoom", value: room, value2: state.isJoined });
    console.log(state);
    console.log(state.roomId);
    // if (state.roomId) {
    //   dispatch({ type: "setIsJoined", value: true });
    // }
  });

  socket.on("basicEmit", (userName,message) => {
    dispatch({ type: "setMessageList", value: [...state.messageList, `${userName} : ${message}`] });
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
                  type: 'setRoomId', value: e.target.value
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
            <input type="text"
              placeholder='message'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({
                type: 'setText', value: e.target.value
              })}
              value={state.text}
            />
            <button type='submit'
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => postMessage(e)}
            >send message</button>
          </form>
          {/* messageListの表示 */}
          <div>
            {state.messageList.map((message, index) => {
              return (
                <p key={index}>{message}</p>
              )
            })}
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
