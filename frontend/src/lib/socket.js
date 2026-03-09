let socketInstance = null;

export const getSocket = () => socketInstance;

export const setSocket = (socket) => {
  socketInstance = socket;
};

export const clearSocket = () => {
  socketInstance = null;
};
