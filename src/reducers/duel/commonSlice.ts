import { ygopro } from "@/api/ocgcore/idl/ocgcore";

import {
  clearIdleInteractivities,
  clearPlaceInteractivities,
  DuelReducer,
  reloadFieldMeta,
  updateCardData,
} from "./generic";
import { judgeSelf } from "./util";
import MsgReloadField = ygopro.StocGameMessage.MsgReloadField;
type MsgUpdateData = ReturnType<
  typeof ygopro.StocGameMessage.MsgUpdateData.prototype.toObject
>;

export const clearAllIdleInteractivitiesImpl: DuelReducer<number> = (
  state,
  action
) => {
  const player = action.payload;

  const states = judgeSelf(player, state)
    ? [
        state.meHands,
        state.meMonsters,
        state.meMagics,
        state.meGraveyard,
        state.meBanishedZone,
        state.meExtraDeck,
      ]
    : [
        state.opHands,
        state.opMonsters,
        state.opMagics,
        state.opGraveyard,
        state.opBanishedZone,
        state.opExtraDeck,
      ];

  states.forEach((item) => clearIdleInteractivities(item));
};

export const clearAllPlaceInteractivitiesImpl: DuelReducer<number> = (
  state,
  action
) => {
  const player = action.payload;

  const states = judgeSelf(player, state)
    ? [
        state.meHands,
        state.meMonsters,
        state.meMagics,
        state.meGraveyard,
        state.meBanishedZone,
      ]
    : [
        state.opHands,
        state.opMonsters,
        state.opMagics,
        state.opGraveyard,
        state.opBanishedZone,
      ];

  states.forEach((item) => clearPlaceInteractivities(item));
};

export const updateFieldDataImpl: DuelReducer<MsgUpdateData> = (
  state,
  action
) => {
  const player = action.payload.player;
  const zone = action.payload.zone;
  const actions = action.payload.actions;

  if (player !== undefined && zone !== undefined && actions !== undefined) {
    switch (zone) {
      case ygopro.CardZone.HAND: {
        const hand = judgeSelf(player, state) ? state.meHands : state.opHands;
        updateCardData(hand, actions);

        break;
      }
      case ygopro.CardZone.EXTRA: {
        const extra = judgeSelf(player, state)
          ? state.meExtraDeck
          : state.opExtraDeck;
        updateCardData(extra, actions);

        break;
      }
      case ygopro.CardZone.MZONE: {
        const monster = judgeSelf(player, state)
          ? state.meMonsters
          : state.opMonsters;
        updateCardData(monster, actions);

        break;
      }
      case ygopro.CardZone.SZONE: {
        const magics = judgeSelf(player, state)
          ? state.meMagics
          : state.opMagics;
        updateCardData(magics, actions);

        break;
      }
      case ygopro.CardZone.GRAVE: {
        const graveyard = judgeSelf(player, state)
          ? state.meGraveyard
          : state.opGraveyard;
        updateCardData(graveyard, actions);

        break;
      }
      case ygopro.CardZone.REMOVED: {
        const BanishedZone = judgeSelf(player, state)
          ? state.meBanishedZone
          : state.opBanishedZone;
        updateCardData(BanishedZone, actions);

        break;
      }
      default: {
        break;
      }
    }
  }
};

export const reloadFieldImpl: DuelReducer<MsgReloadField> = (state, action) => {
  const _duel_rule = action.payload.duel_rule;

  // 初始化`DuelState`
  state.meDeck = { inner: [] };
  state.opDeck = { inner: [] };
  state.meExtraDeck = { inner: [] };
  state.opExtraDeck = { inner: [] };
  state.meMonsters = { inner: [] };
  state.opMonsters = { inner: [] };
  state.meMagics = { inner: [] };
  state.opMagics = { inner: [] };
  state.meGraveyard = { inner: [] };
  state.opGraveyard = { inner: [] };
  state.meBanishedZone = { inner: [] };
  state.opBanishedZone = { inner: [] };
  state.meHands = { inner: [] };
  state.opHands = { inner: [] };

  for (const reload of action.payload.actions) {
    const player = reload.player;

    // DECK
    const deck = judgeSelf(player, state) ? state.meDeck : state.opDeck;
    reloadFieldMeta(
      deck,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.DECK),
      player
    );
    // EXTRA_DECK
    const extraDeck = judgeSelf(player, state)
      ? state.meExtraDeck
      : state.opExtraDeck;
    reloadFieldMeta(
      extraDeck,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.EXTRA),
      player
    );
    // MZONE
    const monster = judgeSelf(player, state)
      ? state.meMonsters
      : state.opMonsters;
    reloadFieldMeta(
      monster,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.MZONE),
      player
    );
    // SZONE
    const magics = judgeSelf(player, state) ? state.meMagics : state.opMagics;
    reloadFieldMeta(
      magics,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.SZONE),
      player
    );
    // GRAVE
    const graveyard = judgeSelf(player, state)
      ? state.meGraveyard
      : state.opGraveyard;
    reloadFieldMeta(
      graveyard,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.GRAVE),
      player
    );
    // REMOVED
    const banishedZone = judgeSelf(player, state)
      ? state.meBanishedZone
      : state.opBanishedZone;
    reloadFieldMeta(
      banishedZone,
      reload.zone_actions.filter(
        (item) => item.zone == ygopro.CardZone.REMOVED
      ),
      player
    );
    // HANDS
    const hands = judgeSelf(player, state) ? state.meHands : state.opHands;
    reloadFieldMeta(
      hands,
      reload.zone_actions.filter((item) => item.zone == ygopro.CardZone.HAND),
      player
    );
  }
};
