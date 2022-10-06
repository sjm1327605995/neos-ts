import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ygopro } from "./api/idl/ocgcore";
import { fetchDeck, IDeck } from "./Card";
import "./css/WaitRoom.css";

type Player = {
  name?: string;
  state?: string;
};

export default function WaitRoom() {
  const params = useParams<{
    player?: string;
    passWd?: string;
    ip?: string;
  }>();

  const [joined, setJoined] = useState<boolean>(false);
  const [chat, setChat] = useState<string>("");
  const [choseDeck, setChoseDeck] = useState<boolean>(false);
  const [observerCount, setObserverCount] = useState<number>(0);
  const [player0, setPlayer0] = useState<Player>({});
  const [player1, setPlayer1] = useState<Player>({});

  const ws = useRef<WebSocket | null>(null);

  const { player, passWd, ip } = params;
  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket("ws://" + ip);
    }

    ws.current.onopen = () => {
      console.log("websocket open");

      if (
        player != null &&
        player.length != 0 &&
        passWd != null &&
        passWd.length != 0 &&
        ws.current
      ) {
        const wsCurrent = ws.current;

        wsCurrent.binaryType = "arraybuffer";

        sendPlayerInfo(wsCurrent, player);
        sendJoinGame(wsCurrent, 4947, passWd);
      }
    };

    ws.current.onclose = () => {
      console.log("websocket closed");
    };

    ws.current.onmessage = e => {
      const pb = ygopro.YgoStocMsg.deserializeBinary(e.data);

      switch (pb.msg) {
        case "stoc_join_game": {
          const msg = pb.stoc_join_game;
          // todo
          setJoined(true);
          break;
        }
        case "stoc_chat": {
          const chat = pb.stoc_chat;

          setChat(chat.msg);
          break;
        }
        case "stoc_hs_player_change": {
          const change = pb.stoc_hs_player_change;

          if (change.pos > 1) {
            console.log("Currently only supported 2v2 mode.");
          } else {
            switch (change.state) {
              case ygopro.StocHsPlayerChange.State.UNKNOWN: {
                console.log("Unknown HsPlayerChange State");

                break;
              }
              case ygopro.StocHsPlayerChange.State.MOVE: {
                console.log(
                  "Player " + change.pos + " moved to " + change.moved_pos
                );

                let src = change.pos;
                let dst = change.moved_pos;

                if (src === 0 && dst === 1) {
                  setPlayer1(player0);
                  setPlayer0({});
                } else if (src === 1 && dst === 0) {
                  setPlayer0(player1);
                  setPlayer1({});
                }

                break;
              }
              case ygopro.StocHsPlayerChange.State.READY: {
                console.log("Player " + change.pos + " has ready");

                const state = "ready";
                let player = change.pos == 0 ? player0 : player1;
                player.state = state;

                change.pos == 0 ? setPlayer0(player) : setPlayer1(player);

                break;
              }
              case ygopro.StocHsPlayerChange.State.NO_READY: {
                console.log("Player " + change.pos + " not ready");

                const state = "not ready";
                let player = change.pos == 0 ? player0 : player1;
                player.state = state;

                change.pos == 0 ? setPlayer0(player) : setPlayer1(player);

                break;
              }
              case ygopro.StocHsPlayerChange.State.LEAVE: {
                console.log("Player " + change.pos + " has leave");

                change.pos == 0 ? setPlayer0({}) : setPlayer1({});

                break;
              }
              case ygopro.StocHsPlayerChange.State.TO_OBSERVER: {
                console.log("Player " + change.pos + " has moved to observer");

                change.pos == 0 ? setPlayer0({}) : setPlayer1({});
                setObserverCount(observerCount + 1);

                break;
              }
              default: {
                break;
              }
            }
          }

          break;
        }
        case "stoc_hs_watch_change": {
          const count = pb.stoc_hs_watch_change.count;

          setObserverCount(count);
          break;
        }
        default: {
          break;
        }
      }
    };

    const wsCurrent = ws.current;

    return () => {
      if (wsCurrent.readyState == 1) {
        wsCurrent.close();
      }
    };
  }, [ws]);

  const handleChoseDeck = async () => {
    if (ws.current) {
      const deck = await fetchDeck("hero.ydk");

      sendUpdateDeck(ws.current, deck);

      setChoseDeck(true);
    }
  };

  const handleChoseReady = () => {
    if (ws.current) {
      sendHsReady(ws.current);
    }
  };

  return (
    <div className="container">
      <div className="playerRegion">
        <h2>{joined ? "Room Joined!" : "Room Not Joined."}</h2>
        <p>
          <button disabled={!joined} onClick={handleChoseDeck}>
            choose hero.ydk
          </button>
        </p>
        <p>
          <button disabled={!choseDeck} onClick={handleChoseReady}>
            ready
          </button>
        </p>
      </div>
      <div className="roomRegion">
        <h2>Room PassWd: {passWd}</h2>
        <p>
          player0: {player0.name} {player0.state}
        </p>
        <p>
          player1: {player1.name} {player1.state}
        </p>
        <p>observer: {observerCount}</p>
        <p>chat: {chat}</p>
      </div>
    </div>
  );
}

function sendPlayerInfo(ws: WebSocket, player: string) {
  const playerInfo = new ygopro.YgoCtosMsg({
    ctos_player_info: new ygopro.CtosPlayerInfo({
      name: player
    })
  });

  ws.send(playerInfo.serialize());
}

function sendJoinGame(ws: WebSocket, version: number, passWd: string) {
  const joinGame = new ygopro.YgoCtosMsg({
    ctos_join_game: new ygopro.CtosJoinGame({
      version, // todo: use config
      gameid: 0,
      passwd: passWd
    })
  });

  ws.send(joinGame.serialize());
}

function sendUpdateDeck(ws: WebSocket, deck: IDeck) {
  const updateDeck = new ygopro.YgoCtosMsg({
    ctos_update_deck: new ygopro.CtosUpdateDeck({
      main: deck.main,
      extra: deck.extra,
      side: deck.side
    })
  });

  ws.send(updateDeck.serialize());
}

function sendHsReady(ws: WebSocket) {
  const hasReady = new ygopro.YgoCtosMsg({
    ctos_hs_ready: new ygopro.CtosHsReady({})
  });

  ws.send(hasReady.serialize());
}
