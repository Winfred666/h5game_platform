// define data for a game to upload/display.
export type IGameTag = string;

// Developer as a view from table "User"
export interface IDeveloper {
    id: string;
    name: string;
}

export interface IOnlineEmbed{
    width: string;
    height: string;
    url: string;
}

export interface IGame {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    screenshots: string[];
    release_date: string;
    
    developer: IDeveloper[];
    joinDevelopers: string;
    
    tags: IGameTag[];

    // most important: url for download
    download_url: string;
    // optinal, for playing online, string for full-screen jump, canvas for embedded, undefined for off-line game.
    online?: IOnlineEmbed;
    size: string;
}
