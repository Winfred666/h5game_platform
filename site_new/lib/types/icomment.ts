export interface IComment {
    id: number;//评论的id
    game_id: number;
    user_id: number;
    user_name: string;//用户名
    user_profile: string;//用户头像
    
    content: string;

    created_time: string;
}
