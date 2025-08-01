"use client";
import { Form } from "@/components/ui/form";
import {
  IncreGameFormInputSchema,
  GameFormInputSchema,
  GameFormInputType,
} from "@/lib/types/zforms";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { GameFormLeft } from "./GameFormLeft";
import { IGame, IGameTag } from "@/lib/types/igame";
import { GameFormRight } from "./GameFormRight";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  submitNewGameAction,
  updateGameAction,
} from "@/lib/querys&actions/postGame";
import { objectToFormData } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { useLoading } from "@/components/LoadingProvider";

export default function GameForm({
  allTags,
  game,
}: {
  allTags: IGameTag[];
  game?: IGame;
}) {
  // add compoennt
  const router = useRouter();
  const { startLoading } = useLoading();

  // default value with / without game
  const gameForm = useForm<GameFormInputType>({
    resolver: zodResolver(
      game ? IncreGameFormInputSchema : GameFormInputSchema
    ),
    mode: "onBlur",
    defaultValues: (() => {
      if (game) {
        return {
          title: game.title,
          kind: game.online ? "html" : "downloadable",
          uploadfile: [], // Assuming uploadfile is handled separately
          embed_op: game.online
            ? game.online.width
              ? "embed_in_page"
              : "fullscreen"
            : "",
          width: game.online?.width ? game.online.width.toString() : "",
          height: game.online?.height ? game.online.height.toString() : "",
          description: game.description,
          tags: game.tags.map((tag) => tag.id),
          developers: game.developers.map((dev) => ({
            id: dev.id,
            name: dev.name,
          })),
          cover: [],
          screenshots: { add: [], delete: [] },
        };
      } else {
        return {
          title: "",
          kind: "",
          uploadfile: [],
          embed_op: "embed_in_page",
          width: "",
          height: "",
          description: "",
          tags: [],
          developers: [],
          cover: [],
          screenshots: { add: [], delete: [] },
        };
      }
    })(),
  });

  const onInvalid = (errors: FieldErrors<GameFormInputType>) => {
    console.error("Form validation failed:", errors);
    // [""] is for global react-hook-form validate error msg (pop when last refine reject)
    const desp = (errors as any)[""]?.message;
    toast.error(
      "表单验证失败，请检查错误",
      desp ? { description: desp } : undefined
    );
  };

  const onSubmit: SubmitHandler<GameFormInputType> = async (values) => {
    // console.log("Submitted values:", values);
    // directly wrap to formData, and into loading state.
    const gameId = await startLoading(
      async () => {
        const obj = objectToFormData(values);
        return await (game
          ? updateGameAction(game.id, obj)
          : submitNewGameAction(obj));
      },
      {
        loadingMsg: "正在提交游戏信息...",
        successMsg: "游戏信息提交成功，即将跳转到游戏预览页。",
      }
    );
    gameForm.reset();
    // jump to game preview page (private, need token)
    setTimeout(() => {
      router.replace(ALL_NAVPATH.game_id.href(gameId));
    }, 1000);
  };

  return (
    <Form {...gameForm}>
      <form onSubmit={gameForm.handleSubmit(onSubmit, onInvalid)}>
        <div className="flex gap-10 2xl:gap-20">
          <GameFormLeft
            allTags={allTags}
            form={gameForm}
            downloadUrl={game?.downloadUrl}
          />
          <GameFormRight
            form={gameForm}
            oldCoverSrc={game?.coverImage}
            oldScreenshotsSrc={game?.screenshots}
          />
        </div>
        <Button type="submit" className=" mt-4">
          <Upload /> 提交
        </Button>
      </form>
    </Form>
  );
}
