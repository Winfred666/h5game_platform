"use client";

import {
  createContext,
  useContext,
  useTransition,
  ReactNode,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { ActionResponse } from "@/lib/types/iaction";
import { toast } from "sonner";

type StartLoadingOptions<T> = {
  loadingMsg?: string;
  successMsg?: string | ((data: T) => string);
  // Error message is not controllable, toasting is shown
  // if directly thrown error or return ActionFailedResponse
};

type LoadingContextType = {
  isPending: boolean;
  startLoading: <T>(
    action: () => Promise<ActionResponse<T>>,
    options?: StartLoadingOptions<T>
  ) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [spinningMsg, setSpinningMsg] = useState<string | undefined>();

  const startLoading = <T,>(
    action: () => Promise<ActionResponse<T>>,
    options: StartLoadingOptions<T> = {}
  ): Promise<T> => {
    const { loadingMsg = "操作中...", successMsg = "操作成功！" } = options;

    setSpinningMsg(loadingMsg);

    // we wrap the action in a promise to handle loading state
    return new Promise<T>((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await action();
          if (!result.success) {
            throw new Error(result.msg);
          }

          toast.success(
            typeof successMsg === "string"
              ? successMsg
              : successMsg(result.data)
          );
          resolve(result.data);
        } catch (error) {
          toast.dismiss();
          if (error instanceof Error) {
            toast.error("提交失败", { description: error.message });
          } else {
            toast.error("网络错误，请稍后再试。");
          }
          reject(error);
        }
      });
    });
  };
  return (
    <LoadingContext.Provider value={{ isPending, startLoading }}>
      {isPending && (
        <div
          className="fixed inset-0 bg-background/60 z-60 flex 
          flex-col items-center justify-center"
        >
          {spinningMsg && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="bg-background">{spinningMsg}</p>
            </>
          )}
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}
