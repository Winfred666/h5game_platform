"use client";
import { Form, FormMessage } from "@/components/ui/form";
import {
  GameFormSchema,
  GameFormInputType,
} from "@/lib/types/zforms";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { GameFormLeft } from "./GameFormLeft";
import { IGame, IGameTag } from "@/lib/types/igame";

export default function GameForm({
  allTags,
  game,
}: {
  allTags: IGameTag[];
  game?: IGame;
}) {
  // add compoennt
  // default value with / without game
  const gameForm = useForm<GameFormInputType>({
    resolver: zodResolver(GameFormSchema),
    mode: "onBlur",
    defaultValues: (() => {
      if (game) {
        return {
          title: game.title,
          kind: game.online ? "html" : "downloadable",
          uploadfile: "", // Assuming uploadfile is handled separately
          embed_op: game.online ? ( game.online.width ? "embed_in_page" : "fullscreen") : "",
          width: (game.online?.width) ? game.online.width.toString() : "",
          height: (game.online?.height) ? game.online.height.toString() : "",
          description: game.description,
          tags: game.tags.map((tag) => tag.id),
          developers: game.developers.map((dev) => ({
            id: dev.id,
            name: dev.name,
          })),
          cover: "",
          screenshots: "",
        };
      } else {
        return {
          title: "",
          kind: "",
          uploadfile: "",
          embed_op: "embed_in_page",
          width: "",
          height: "",
          description: "",
          tags: [],
          developers: [],
          cover: "",
          screenshots: [],
        };
      }
    })(),
  });

  const onSubmit:SubmitHandler<GameFormInputType> = (values) => {
    // directly turn into output type!!
    console.log("Submitted values:", values);
  }

  return (
    <Form {...gameForm}>
      <form onSubmit={gameForm.handleSubmit(onSubmit)} className="space-y-8">
        <div className=" flex justify-between">
          <GameFormLeft allTags={allTags} form={gameForm} />
        </div>
        {/* For error crossing multiple fields */}
        <FormMessage />
      </form>
    </Form>
  );
}
