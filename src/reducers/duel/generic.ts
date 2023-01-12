import { AsyncThunk, createAsyncThunk } from "@reduxjs/toolkit";
import { CardMeta } from "../../api/cards";
import { ygopro } from "../../api/ocgcore/idl/ocgcore";
import { fetchCard } from "../../api/cards";
import { DuelState } from "./mod";

export interface DuelFieldState {
  inner: CardState[];
}

export interface CardState {
  occupant?: CardMeta; // 占据此位置的卡牌元信息
  location: {
    controler: number;
    location?: number;
    sequence: number;
    position?: ygopro.CardPosition;
    overlay_sequence?: number;
  }; // 位置信息
  idleInteractivities: Interactivity<number>[]; // IDLE状态下的互动信息
  placeInteractivities?: Interactivity<{
    controler: number;
    zone: ygopro.CardZone;
    sequence: number;
  }>; // 选择位置状态下的互动信息
}

export enum InteractType {
  // 可普通召唤
  SUMMON = 1,
  // 可特殊召唤
  SP_SUMMON = 2,
  // 可改变表示形式
  POS_CHANGE = 3,
  // 可前场放置
  MSET = 4,
  // 可后场放置
  SSET = 5,
  // 可发动效果
  ACTIVATE = 6,
  // 可作为位置选择
  PLACE_SELECTABLE = 7,
}

export interface Interactivity<T> {
  interactType: InteractType;
  // 如果`interactType`是`ACTIVATE`，这个字段是对应的效果编号
  activateIndex?: number;
  // 用户点击后，需要回传给服务端的`response`
  response: T;
}

export function createAsyncMetaThunk(name: string): AsyncThunk<
  { controler: number; sequence: number; meta: CardMeta },
  {
    controler: number;
    sequence: number;
    position?: ygopro.CardPosition;
    code: number;
  },
  {}
> {
  return createAsyncThunk(
    name,
    async (param: {
      controler: number;
      sequence: number;
      position?: ygopro.CardPosition;
      code: number;
    }) => {
      const code = param.code;

      const meta = await fetchCard(code);
      const response = {
        controler: param.controler,
        sequence: param.sequence,
        meta,
      };

      return response;
    }
  );
}

export function extendState<T extends DuelFieldState>(
  state: T | undefined,
  newState: CardState
) {
  if (state) {
    state.inner.push(newState);
  }
}

export function extendOccupant<T extends DuelFieldState>(
  state: T | undefined,
  newMeta: CardMeta,
  sequence: number,
  position?: ygopro.CardPosition
) {
  if (state) {
    for (const item of state.inner) {
      if (item.location.sequence == sequence) {
        item.occupant = newMeta;
        if (position) {
          item.location.position = position;
        }
      }
    }
  }
}

export function extendMeta<T extends DuelFieldState>(
  state: T | undefined,
  newMeta: CardMeta,
  sequence: number
) {
  if (state) {
    for (const item of state.inner) {
      if (item.location.sequence == sequence) {
        item.occupant = newMeta;
      }
    }
  }
}
