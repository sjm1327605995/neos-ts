import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type Player = {
  name?: string;
  state?: string;
  isHost?: boolean;
};

export interface playerState {
  player0: Player;
  player1: Player;
  observerCount: number;
}

const initialState: playerState = {
  player0: {},
  player1: {},
  observerCount: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    player0Enter: (state, action: PayloadAction<string>) => {
      state.player0.name = action.payload;
    },
    player1Enter: (state, action: PayloadAction<string>) => {
      state.player1.name = action.payload;
    },
    player0Update: (state, action: PayloadAction<string>) => {
      state.player0.state = action.payload;
    },
    player1Update: (state, action: PayloadAction<string>) => {
      state.player1.state = action.payload;
    },
    hostChange: (state, action: PayloadAction<number>) => {
      const i = action.payload;

      if (i === 0) {
        state.player0.isHost = true;
        state.player1.isHost = false;
      } else {
        state.player1.isHost = true;
        state.player0.isHost = false;
      }
    },
    observerChange: (state, action: PayloadAction<number>) => {
      state.observerCount += action.payload;
    },
  },
});

export const {
  player0Enter,
  player1Enter,
  player0Update,
  player1Update,
  hostChange,
  observerChange,
} = playerSlice.actions;
export const selectPlayer0 = (state: RootState) => state.player.player0;
export const selectPlayer1 = (state: RootState) => state.player.player1;
export default playerSlice.reducer;
