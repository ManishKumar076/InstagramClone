import { addMessage } from "@/redux/chatSlice";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { selectedUser, user } = useSelector((store) => store.auth);
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = (newMessage) => {
      if (!selectedUser?._id || !user?._id) return;
      const isRelevant =
        (newMessage?.senderId === selectedUser._id && newMessage?.receiverId === user._id) ||
        (newMessage?.senderId === user._id && newMessage?.receiverId === selectedUser._id);
      if (isRelevant) {
        dispatch(addMessage(newMessage));
      }
    };

    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [dispatch, selectedUser?._id, user?._id]);
};
export default useGetRTM;
