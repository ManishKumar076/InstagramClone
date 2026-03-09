import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        addMessage:(state, action) => {
            const incoming = action.payload;
            if (!incoming?._id) {
                state.messages.push(incoming);
                return;
            }
            const exists = state.messages.some((msg) => msg?._id === incoming._id);
            if (!exists) {
                state.messages.push(incoming);
            }
        }
    }
});
export const {setOnlineUsers, setMessages, addMessage} = chatSlice.actions;
export default chatSlice.reducer;
