"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { SWRConfig } from "swr";

type SnackBarContextType = {
  open: (msg?: string) => void; //调用open时还可以修改其内容
  close: () => void;
};

const SnackBarContext = createContext<SnackBarContextType | undefined>(
  undefined
);

export const useSnackBar = () => {
  const ctx = useContext(SnackBarContext);
  if (!ctx) throw new Error("useSnackBar must be used within SnackBarProvider");
  return ctx;
};

export const SnackBarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // use a message queue when multiple messages are opened
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("请求失败！"); // to prevent glitch when over.
  const [isOpen, setIsOpen] = useState(false);

  // for active control
  const open = useCallback((msg?: string) => {
    // console.log("insert a message to snackbar !!");
    setMessageQueue((prev) => [...prev, msg || "Fetch Fail!"]);
  }, []);

  const close = () => handleClose(null, "clickaway");
  // for passive reaction
  const handleClose = (event: any, reason?: SnackbarCloseReason) => {
    if (reason == "clickaway") {
      return;
    }
    setIsOpen(false);
    setMessageQueue((prev) => prev.slice(1)); // remove the first message in the queue
  };

  // core function to consume the message queue
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null; // for timeout control
    if (messageQueue.length > 0 && !isOpen) {
      // wait for a while to open the snackbar
      timeoutId = setTimeout(() => {
        setCurrentMessage(() => messageQueue[0]); // set the current message to the first one
        setIsOpen(true);
      }, 200);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [messageQueue, isOpen]);

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <SnackBarContext.Provider value={{ open, close }}>
      {/* init SWRConfig here!*/}
      <SWRConfig
        value={{
          dedupingInterval: 10 * 1000, // 10 秒内去重
          refreshInterval: 0, // refresh only when explicitly called
          errorRetryCount: 2, // retry 2 times
          errorRetryInterval: 2000, // 2s for retry
          revalidateOnFocus: false, // switch tabs back, do not revalidate
          revalidateOnReconnect: true, // reconnect to the network, do revalidate
          revalidateIfStale: true, // if the data is stale, revalidate
          fetcher: (api: string, options: RequestInit) =>
            // api参数类似于'/user?id=123', options中一般包含{ method: 'GET' }.
            fetch(
              process.env.NEXT_PUBLIC_SERVER_URL +
                api /*fetch在当options没有指定method时默认为GET.*/,
              { ...options, credentials: "include" }
            )
              .then(async (res) => {
                if (!res.ok) {
                  return res.json().then((err) => {
                    // if detail is string, throw it
                    if (typeof err.detail === "string")
                      throw new Error(err.detail);
                    else throw new Error("");
                  });
                } else return res.json();
              })
              .catch((err) => {
                console.error("请求失败！", err);
                if (api === "/me") return;
                if (err instanceof Error) {
                  // 当fetch请求网络错误时,会抛出一个TypeError,其message通常是"Failed to fetch"
                  // 如果是服务器返回的错误,则会抛出一个Error,其message是服务器返回的错误信息.
                  open(err.message);
                } else {
                  open(`${api} 请求失败！`);
                }
              }),
        }}
      >
        {children}
      </SWRConfig>
      <Box sx={{ width: 500 }}>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isOpen}
          autoHideDuration={4000} //自动关闭的时间
          onClose={handleClose} //关闭时调用onExited回调函数，不是主动控制
        >
          <Alert severity="error" sx={{ width: "100%" }} action={action}>
            {currentMessage}
          </Alert>
        </Snackbar>
      </Box>
    </SnackBarContext.Provider>
  );
};
