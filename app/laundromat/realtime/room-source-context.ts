"use client";

import { createContext } from "react";

import type { RoomSource } from "./room-source";

export const RoomSourceContext = createContext<RoomSource | undefined>(
  undefined
);
