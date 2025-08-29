"use client";

import { GameCard } from "@/components/GameCards";
import { GameThumbnail } from "@/components/GameListItem";
import { useLoading } from "@/components/LoadingProvider";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  setAutoTopGameAction,
  updateTopGameAction,
} from "@/lib/querys&actions/postAdminCmd";
import { IGame } from "@/lib/types/igame";
import { useEffect, useState } from "react";

export default function TopGameTab({
  topGames,
  autoEnabler,
}: {
  topGames: IGame[];
  autoEnabler: "0" | "1";
}) {
  const { startLoading } = useLoading();
  const [_topGame, set_topGame] = useState<IGame[]>([]);
  const [_autoEnabler, set_autoEnabler] = useState(true);

  useEffect(() => {
    set_topGame(topGames);
    set_autoEnabler(autoEnabler === "1");
  }, [topGames, autoEnabler]);

  const enablerChanged = _autoEnabler !== (autoEnabler === "1");
  const topGamesChanged =
    _topGame.length !== topGames.length ||
    _topGame.some((game, idx) => game.id !== topGames[idx].id);

  const handleTopGameChange = async () => {
    if (enablerChanged)
      await startLoading(
        async () => setAutoTopGameAction(_autoEnabler ? "1" : "0"),
        {
          loadingMsg: (_autoEnabler ? "开启" : "关闭") + "每日推荐...",
          successMsg: "每日推荐已" + (_autoEnabler ? "开启" : "关闭"),
        }
      );
    if (!_autoEnabler && topGamesChanged)
      await startLoading(async () =>
        updateTopGameAction(_topGame.map((g) => g.id).join(",")),
        {
          loadingMsg: "正在手动设置首屏游戏",
          successMsg: "首屏游戏设置成功！"
        }
      );
  };

  return (
    <div className=" space-y-4">
      <h3>更改首页轮播图热门游戏</h3>
      <div className=" flex gap-4 items-center overflow-x-auto">
        {_topGame.map(game => (
          <div
            className=" flex flex-col items-center"
            key={"topgame_" + game.id}
          >
            <GameCard small game={{ ...game, isMeOrAdmin: true }} />
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => set_topGame(_topGame.filter(g=>g.id !== game.id))}
              disabled={_autoEnabler}
            >
              删除
            </Button>
          </div>
        ))}
      </div>
      {/* using a searchbar to add games */}
        <SearchBar<IGame>
          disabled={_autoEnabler}
          thing="game"
          className="lg:w-3/5"
          renderListItem={(game) => GameThumbnail({ game })}
          onSelect={(game) => {
            if(_topGame.every(g=>g.id !== game.id)){
              set_topGame([..._topGame, game]);
            }
          }}
        />
      <div className="flex items-center gap-2">
        <Checkbox
          id="set-auto-topgame-update"
          checked={_autoEnabler}
          onCheckedChange={(checked) => set_autoEnabler(checked as boolean)}
        />
        <Label htmlFor="set-auto-topgame-update"> 是否每日自动推荐首屏游戏 </Label>
      </div>
      {(topGamesChanged || enablerChanged) && (
        <Button onClick={() => handleTopGameChange()}>保存轮播图设置</Button>
      )}
    </div>
  );
}
