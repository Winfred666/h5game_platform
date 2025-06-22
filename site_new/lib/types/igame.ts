// define data for a game to upload/display.
export type IGameTag = string;

// Developer as a view from table "User"
export interface IDeveloper {
    id: number;
    name: string;
}

export interface IOnlineEmbed{
    width?: number; // pixel, optional, undefined for full screen
    height?: number; // pixel, optional, undefined for full screen
    url: string;
}

export interface IGame {
    id: number; // id is always string.
    title: string;
    description: string;
    cover_image: string;
    screenshots: string[];
    release_date: string;
    
    developers: IDeveloper[];

    joinDevelopers: string; // a long string, like "dev1,dev2,dev3", computed attribute.
    
    tags: IGameTag[];

    // most important: url for download
    download_url: string;
    // optinal, for playing online, string for full-screen jump, canvas for embedded, undefined for off-line game.
    online?: IOnlineEmbed;
    size: string;
}
