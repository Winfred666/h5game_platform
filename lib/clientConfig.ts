// could expose to client side.

export enum MINIO_BUCKETS{
  GAME="games", 
  UNAUDIT_GAME="unaudit-games", // private, visit with temp token.
  IMAGE="images", 
  AVATAR="avatars",
};

// savely add private, because the url is not secret, the security is protected by minio policy + cuid
// for shared array buffer, use prefix for nginx to set proper headers
export const genGamePlayableURL = (gameId: string, isPrivate: boolean, useSharedArrayBuffer: boolean) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}${useSharedArrayBuffer ? "/sab" : ""}/${isPrivate ? MINIO_BUCKETS.UNAUDIT_GAME : MINIO_BUCKETS.GAME}/${gameId}/index.html`;

export const genGameCoverURL = (gameId: string) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.IMAGE}/${gameId}/cover.webp`;

export const genGameScreenshotsURL = (
  gameId: string,
  screenshotNum: number
) => {
  const screenshotsURL = [];
  for (let i = 0; i < screenshotNum; i++) {
    screenshotsURL.push(
      `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.IMAGE}/${gameId}/screenshot${i}.webp`
    );
  }
  return screenshotsURL;
};

export const genGameDownloadURL = (gameId: string, isPrivate: boolean) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${isPrivate ? MINIO_BUCKETS.UNAUDIT_GAME : MINIO_BUCKETS.GAME}/${gameId}/game.zip`;

export const genUserAvatarURL = (userId: string) =>
  `${process.env.NEXT_PUBLIC_MINIO_URL}/${MINIO_BUCKETS.AVATAR}/${userId}.webp`;


export const MAX_ZIP_SIZE = 200 * 1024 * 1000; // 200MB

export const ACCEPTED_ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
];

export const MAX_IMG_SIZE = 1024 * 1024 * 20; // 20MB
export const MAX_SCREENSHOT_NUMBER = 4; // Maximum number of screenshots allowed

export const ACCEPTED_IMG_MINE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const GAME_PAGE_SIZE = 20;

export const ALL_NAVPATH = {
    home: {name:"浏览", href:(page:number|string = 1) => `/home/${page}`}, // default to home page
    
    game_tag: {name:"按tag搜游戏", href:(tagId: string) => `/games?tag=${tagId}`},
    game_name: {name:"按名称搜游戏", href:(name: string) => `/games?name=${name}`},
    game_id: {name:"指定id游戏", href:(id: string) => `/games/${id}`},

    game_id_unaudit: {name:"指定id未审核游戏", href:(id: string) => `/games/unaudit/${id}`},
    upload: {name:"上传", href:"/upload"},
    game_update: {name:"更新游戏", href:(id: string) => `/upload/${id}`},

    community: {name:"社区", href:"/community"},
    // there is actually no "me" router, middleware will handle it to my user_id
    user_id: {name:"指定id用户", href:(id: string) => `/user/${id}`},
    
    // user_id is public, but profile and user_update are protected
    profile: {name:"个人中心", href:(idOrMe:string|"me") => `/user/self/${idOrMe}`},
    user_update: {name:"更新个人信息", href:"/user/update"},
    
    login: {name:"登录", href:(callback?:string)=> callback ? `/login?callback=${encodeURIComponent(callback)}` : "/login"},
    not_found: {name: "404", href:"/not-found"},

    admin_review: {name:"审核发布", href:"/admin-dashboard/review"},
    admin_games: {name:"游戏列表", href:"/admin-dashboard/games"},
    admin_users: {name:"用户列表", href:"/admin-dashboard/users"},
    admin_tags: {name:"标签管理", href:"/admin-dashboard/tags"},
    
    auto_signout: {name:"手动登出", href:"/logout"}, // this is a route handler, not a page
  }