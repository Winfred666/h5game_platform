export const ALL_NAVPATH = {
    home: {name:"浏览", href:(page?:number) => `/${page? "?page=" + page : ""}`}, // default to home page
    game_tag: {name:"按tag搜游戏", href:(tagId: number) => `/games?tag=${tagId}`},
    game_name: {name:"按名称搜游戏", href:(name: string) => `/games?name=${name}`},
    game_id: {name:"指定id游戏", href:(id: number) => `/games/${id}`},
    upload: {name:"上传", href:"/upload"},
    game_update: {name:"更新游戏", href:(id: number) => `/upload/${id}`},
    community: {name:"社区", href:"/community"},
    profile: {name:"个人中心", href:"/user/me"}, // there is actually no "me" router, middleware will handle it to my user_id
    user_id: {name:"指定id用户", href:(id: number) => `/user/${id}`},
    login: {name:"/login", href:(callback:string)=> `/login?callback=${encodeURIComponent(callback)}`},
    not_found: {name: "404", href:"/not-found"},
    not_found_user: {name: "404", href:"/not-found/user"},
    admin: {name:"管理员后台", href:"/admin_dashboard"},
  }