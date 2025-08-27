import { IGame } from "./igame";

// 减少包体，只是 thumbnails of IGames
export type IUserGame = Pick<IGame, 'id' | 'title' | 'coverImage'>;

export interface IContact {
    way: string; //联系方式，如微信/QQ/邮箱/电话/网页平台等
    content: string; //对应的 QQ号/邮箱地址/网页URL等
}

// WARNING: IUser 是
export interface IUser {
    id: string;
    name: string;
    
    introduction?:string;//用户自我介绍
    avatar?:string; //头像图片的url，可为 undefined
    contacts: IContact[]; // 用户联系方式列表, 以IContact[]的形式存储
    //一个长字符串,以"way1,content1;way2,content2"的形式存储.使用时需要转化成IContact[]的形式
    
    createdAt:string;//用户注册日期
    games: IUserGame[]; // 用户参与开发的游戏列表
}

export interface IUserSelf extends IUser {
    qq: string;       // 只有自己或管理员能看到 qq 号
    isAdmin: boolean; // 是否为管理员
}

// 用户管理界面显示的用户信息，只包括必要的字段
export type IUserAdmin = Omit<IUserSelf, 'introduction' | 'contacts' | 'games'>;

// also validate form using zod.
