import React, { CSSProperties } from "react";
import { proxy, useSnapshot } from "valtio";

import { fetchStrings, Region } from "@/api";
import { matStore, replayStore, resetDuel } from "@/stores";

import { NeosModal } from "../NeosModal";
import styles from "./index.module.scss";

interface EndProps {
  isOpen: boolean;
  isWin: boolean;
  reason?: string;
}

const defaultProps: EndProps = {
  isOpen: false,
  isWin: false,
};

const localStore = proxy(defaultProps);

export const EndModal: React.FC = () => {
  const { isOpen, isWin, reason } = useSnapshot(localStore);
  const { isReplay } = useSnapshot(matStore);

  const onReturn = () => {
    resetDuel();
    rs();
  };

  return (
    <NeosModal
      title={fetchStrings(Region.System, 1500)}
      open={isOpen}
      onOk={() => {
        if (!isReplay) {
          const replayBuffers = replayStore.encode();
          const blob = new Blob(replayBuffers, {
            type: "application/octet-stream",
          });
          const url = URL.createObjectURL(blob);

          const anchorElement = document.createElement("a");
          document.body.appendChild(anchorElement);
          anchorElement.style.display = "none";

          anchorElement.href = url;
          anchorElement.download =
            new Date().toLocaleString() + ".neos" + ".yrp3d";
          anchorElement.click();

          // download the replay file
          window.URL.revokeObjectURL(url);

          document.body.removeChild(anchorElement);
        }
        onReturn();
      }}
      onCancel={onReturn}
    >
      <div className={styles["end-container"]}>
        <p
          className={styles.result}
          style={{ "--text-color": isWin ? "blue" : "red" } as CSSProperties}
        >
          {isWin ? "Win" : "Defeated"}
        </p>
        <p className={styles.reason}>{reason}</p>
        {isReplay ? <></> : <p>{fetchStrings(Region.System, 1340)}</p>}
      </div>
    </NeosModal>
  );
};

let rs: (arg?: any) => void = () => {};

export const displayEndModal = async (isWin: boolean, reason?: string) => {
  localStore.isWin = isWin;
  localStore.reason = reason;
  localStore.isOpen = true;
  await new Promise<void>((resolve) => (rs = resolve)); // 等待在组件内resolve
  localStore.isOpen = false;
  localStore.isWin = false;
  localStore.reason = undefined;
};
