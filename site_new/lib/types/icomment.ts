export interface IComment {
    id: string;//评论的id
    game_id: string;
    user_id: string;
    user_name: string;//用户名
    user_profile: string;//用户头像
    
    content: string;

    created_time: string;
}
