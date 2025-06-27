// thumbnails of IGames, not paged.
export interface IUserGame {
    id: number;
    title: string;
    cover_image: string;
}

export interface IContact {
    way: string; //联系方式，如微信/QQ/邮箱/电话/网页平台等
    content: string; //对应的 QQ号/邮箱地址/网页URL等
}

export interface IUser {
    id: number;
    qq: string;
    name: string;

    avatar?:string;//头像图片的url
    introduction?:string;//用户自我介绍

    created_at:string;//用户注册日期

    contacts: IContact[]; // 用户联系方式列表, 以IContact[]的形式存储
    //一个长字符串,以"way1,content1;way2,content2"的形式存储.使用时需要转化成IContact[]的形式
    games: IUserGame[]; // 用户参与开发的游戏列表
    is_admin: boolean; // 是否为管理员
}


// also validate form using zod.
