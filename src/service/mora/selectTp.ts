import { ygopro } from "@/api/ocgcore/idl/ocgcore";
import { selectTpAble } from "@/reducers/moraSlice";
import { store } from "@/store";
import { moraStore } from "@/valtioStores";

export default function handleSelectTp(_: ygopro.YgoStocMsg) {
  const dispatch = store.dispatch;

  dispatch(selectTpAble());
  moraStore.selectTpAble = true;
}
