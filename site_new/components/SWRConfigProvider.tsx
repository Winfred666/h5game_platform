"use client"

import { SWRConfig } from "swr";

export default function SWRConfigProvider(
  { children }: { children: React.ReactNode }
){
  return (<SWRConfig
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
        fetch( process.env.NEXT_PUBLIC_FRONT_URL + "/api" + api /*fetch默认为GET，直接使用本地 api*/,
          {...options, credentials: "include" }
        )
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(api + " 请求失败！" + res.statusText);
            } else return res.json();
          })
          .catch((err) => {
            console.error(err);
            if (api === "/me") return;
            if (err instanceof Error) {
              // 当fetch请求网络错误时,会抛出一个TypeError,其message通常是"Failed to fetch"
              // 如果是服务器返回的错误,则会抛出一个Error,其message是服务器返回的错误信息.
              // toast(err.message);
            } else {
              // open(`${api} 请求失败！`);
            }
          }),
    }}
  >
    {children}
  </SWRConfig>
  )
}