// define data for a game to upload/display.
export type IGameTag = {
  id: string; // id is always string.
  name: string;
};

export type IGameTagAdmin = IGameTag & {
  hide: boolean; // hide tag from normal user, only admin can see it.
  _count: {
    games: number; // number of games using this tag
  };
};

// Developer as a view from table "User"
export interface IDeveloper {
  id: string;
  name: string;
}

export type IOnlineEmbed =
  | {
      mode: "embed";
      width: number; // pixel, optional, undefined for full screen
      height: number; // pixel, optional, undefined for full screen
      url: string; // the url for online play, like "https://example.com/game/index.html"

      isAutoStarted: boolean; // auto start the embeded game
      hasFullscreenButton: boolean; // show fullscreen button for embeded game
      enableScrollbars: boolean; // enable scrollbars for iframe
    }
  | {
      mode: "fullscreen"; // fullscreen, still jump to minio resource.
      url: string; // the url for online play, like "https://example.com/game/index.html"
    }
  | {
     mode: "jump"; // jump to another page, like itch.io page.
     url: string;
  };

export interface IGame {
  id: string; // id is always string.
  title: string;
  description: string;
  coverImage: string;
  screenshots: string[];
  createdAt: string;
  updatedAt: string;

  developers: IDeveloper[];
  tags: IGameTag[];
  // important: url for download, 
  // for jumping page there is no downloadUrl, which set to "".
  downloadUrl: string;
  // optinal, for playing online, string for full-screen jump, canvas for embedded, undefined for off-line game.
  online?: IOnlineEmbed;
  size: string;
}

export type IGameAdmin = IGame & { views: number };
