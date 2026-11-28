import { io } from "socket.io-client";
import { API } from "./config.js";

export const socket = io(API, { autoConnect: false });