import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_CHATSERVER, {
  closeOnBeforeunload: true
})
export const socketId = socket.id;
console.log(socketId)