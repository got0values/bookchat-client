import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_CHATSERVER, {
  closeOnBeforeunload: false
})
export const socketId = socket.id;