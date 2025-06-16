import useSWR from 'swr';

//返回当前用户的user_id，可以作为判断用户是否登录的依据
function useCurUserId(): string | undefined { 
  const { data } = useSWR<{ id: string } | undefined>(`/me`, {
    fallbackData: undefined,
  })
  // longer cache time, since user_id is not expected to change frequently
  const id = data?.id?.toString();
  console.log("id = " + id);
  return id;
}

// 客户端 user_id 设置为 cookie
export const setCurUserIdCookie = (id: string) => {
  document.cookie = [
    `userid=${encodeURIComponent(id)}`,
    "path=/", // 全站可访问
    "max-age=31536000", // 1年有效期（单位：秒）
    // "Secure", "HttpOnly", // 安全限制，防止 http / JavaScript 访问，但也会阻止 edge CDN
    "SameSite=Lax" // 基本安全限制
  ].join('; ');

}

export const clearCurUserIdCookie = () => {
  document.cookie = "userid=; path=/; max-age=0"; // 清除 cookie
}


export default useCurUserId;