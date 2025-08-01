// define data for a game to upload/display.
export type IGameTag = {
    id: number; // id is always number.
    name:string;
};

// Developer as a view from table "User"
export interface IDeveloper {
    id: number;
    name: string;
}

export interface IOnlineEmbed{
    width?: number; // pixel, optional, undefined for full screen
    height?: number; // pixel, optional, undefined for full screen
    url: string; // the url for online play, like "https://example.com/game/index.html"
}

export interface IGame {
    id: number; // id is always string.
    title: string;
    description: string;
    coverImage: string;
    screenshots: string[];
    createdAt: string;
    updatedAt: string;

    developers: IDeveloper[];
    tags: IGameTag[];
    // most important: url for download
    downloadUrl: string;
    // optinal, for playing online, string for full-screen jump, canvas for embedded, undefined for off-line game.
    online?: IOnlineEmbed;
    size: string;
}

