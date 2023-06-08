export * from "./cardStore";
export * from "./chatStore";
export * from "./joinStore";
export * from "./matStore";
export * from "./messageStore";
export * from "./methods";
export * from "./moraStore";
export * from "./placeStore";

import { proxy } from "valtio";
import { devtools } from "valtio/utils";

import { cardStore } from "./cardStore";
import { chatStore } from "./chatStore";
import { joinStore } from "./joinStore";
import { matStore } from "./matStore";
import { messageStore } from "./messageStore";
import { moraStore } from "./moraStore";
import { placeStore } from "./placeStore";

export const store = proxy({
  chatStore,
  joinStore,
  moraStore,
  matStore, // 决斗盘
  messageStore, // 决斗的信息，包括模态框
  cardStore,
  placeStore,
});

devtools(store, { name: "valtio store", enabled: true });
