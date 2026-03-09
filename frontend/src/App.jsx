import { useEffect } from "react";
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { clearSocket, getSocket, setSocket } from "./lib/socket";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            {" "}
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <h1 className="text-4xl font-bold text-black mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a
          href="/"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go to Home
        </a>
      </div>
    ),
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

  useEffect(() => {
    const userId = user?._id;
    if (!userId) {
      const existingSocket = getSocket();
      if (existingSocket) {
        existingSocket.off("getOnlineUsers");
        existingSocket.off("notification");
        existingSocket.disconnect();
        clearSocket();
      }
      dispatch(setOnlineUsers([]));
      return;
    }

    let socketio = getSocket();
    const existingUserId = socketio?.io?.opts?.query?.userId;
    if (!socketio || existingUserId !== userId) {
      if (socketio) {
        socketio.disconnect();
      }
      socketio = io(socketUrl, {
        query: {
          userId,
        },
        withCredentials: true,
      });
      setSocket(socketio);
    }

    socketio.off("getOnlineUsers");
    socketio.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketio.off("notification");
    socketio.on("notification", (notification) => {
      dispatch(setLikeNotification(notification));
    });

    return () => {
      socketio.off("getOnlineUsers");
      socketio.off("notification");
    };
  }, [user?._id, dispatch, socketUrl]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
