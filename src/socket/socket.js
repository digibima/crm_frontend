import { io } from "socket.io-client";

const socket = io("https://api.digibima.in", {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;