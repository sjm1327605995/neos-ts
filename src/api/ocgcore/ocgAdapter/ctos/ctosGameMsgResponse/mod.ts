import { ygopro } from "../../../idl/ocgcore";
import { YgoProPacket } from "../../packet";
import { CTOS_RESPONSE } from "../../protoDecl";
import adaptSelectBattleCmdResponse from "./selectBattleCmd";
import adaptSelectCardResponse from "./selectCard";
import adaptSelectChainResponse from "./selectChain";
import adaptSelectCounterResponse from "./selectCounter";
import adaptSelectEffectYnResponse from "./selectEffectYn";
import adaptSelectIdleCmdResponse from "./selectIdleCmd";
import adaptSelectOptionResponse from "./selectOption";
import adaptSelectPlaceResponse from "./selectPlace";
import adaptSelectPositionResponse from "./selectPosition";
import adaptSelectUnselectCardResponse from "./selectUnselectCard";
import adaptSortCardResponse from "./sortCard";

/*
 * CTOS CTOS_RESPONSE
 *
 * @param response: any - 对于服务端传给端上的`GameMsg`，回传一个`Response`
 *
 * @usage - 告知服务端玩家对局内的操作选择
 *
 * */
export default class CtosResponsePacket extends YgoProPacket {
  constructor(pb: ygopro.YgoCtosMsg) {
    const response = pb.ctos_response;
    let extraData = new Uint8Array(0);

    switch (response.gameMsgResponse) {
      case "select_idle_cmd": {
        extraData = adaptSelectIdleCmdResponse(response.select_idle_cmd);

        break;
      }
      case "select_place": {
        extraData = adaptSelectPlaceResponse(response.select_place);

        break;
      }
      case "select_card": {
        extraData = adaptSelectCardResponse(response.select_card);

        break;
      }
      case "select_chain": {
        extraData = adaptSelectChainResponse(response.select_chain);

        break;
      }
      case "select_effect_yn": {
        extraData = adaptSelectEffectYnResponse(response.select_effect_yn);

        break;
      }
      case "select_position": {
        extraData = adaptSelectPositionResponse(response.select_position);

        break;
      }
      case "select_option": {
        extraData = adaptSelectOptionResponse(response.select_option);

        break;
      }
      case "select_battle_cmd": {
        extraData = adaptSelectBattleCmdResponse(response.select_battle_cmd);

        break;
      }
      case "select_unselect_card": {
        extraData = adaptSelectUnselectCardResponse(
          response.select_unselect_card
        );

        break;
      }
      case "select_counter_response": {
        extraData = adaptSelectCounterResponse(
          response.select_counter_response
        );

        break;
      }
      case "sort_card": {
        extraData = adaptSortCardResponse(response.sort_card);

        break;
      }
      default: {
        break;
      }
    }

    super(extraData.length + 1, CTOS_RESPONSE, extraData);
  }
}
