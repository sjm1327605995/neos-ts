import { ygopro } from "@/api";
import { matStore, placeStore } from "@/stores";

// FIXME: 处理连锁会存在三种结果：
// 1. Solved - 已处理；
// 2. NEGATED - 被无效；
// 3. DISABLED - 被禁用。
//
// 对于这三种情况`service`层的逻辑是一致的，但是UI展示应该有区别，
// 因为现在还没实现连锁处理的动画，因此暂时先都一致处理，
// 体现在 `penetrage.json`文件中三个一样的配置。
export default async (chainSolved: ygopro.StocGameMessage.MsgChainSolved) => {
  const location = matStore.chains
    .splice(chainSolved.solved_index - 1, 1)
    .at(0);
  if (location) {
    // 设置被连锁状态为空，解除连锁
    const block = placeStore.of(location);
    if (block) {
      block.chainIndex.pop();
    } else {
      console.warn(`<ChainSolved>block from ${location} is null`);
    }
  } else {
    console.warn(
      `pop from chains return null! solved_index=${chainSolved.solved_index}, len of chains in store=${matStore.chains.length}`,
    );
  }
};
