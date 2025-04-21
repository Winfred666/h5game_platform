from api.dbapi import *
from api.mcapi import *
from fastapi import FastAPI, File, Form, Query, UploadFile
from typing import Optional
from io import BytesIO
import uvicorn
import time

client = MinioClient()
db = GameDB()
app = FastAPI()


def remove_prefix(text: str, prefix: str) -> str:
    if text.startswith(prefix):
        return text[len(prefix) :]
    return text


def get_file_type(mime_type: str) -> str:
    return mime_type.split("/")[1]


@app.post("/upload")
async def upload_game(
    title: str = Form(),
    kind: str = Form(),
    uploadfile: UploadFile = File(),
    embedop: Optional[str] = Form(None),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    description: str = Form(),
    tags: list[str] = Form(),
    cover: UploadFile = File(),
    screenshot_0: UploadFile = File(),
    screenshot_1: Optional[UploadFile] = File(None),
    screenshot_2: Optional[UploadFile] = File(None),
):
    print("uploading game...")
    game_dict = {
        "title": title,
        "file_size": uploadfile.size,
        "tagline": description,
        "kind": kind,
        "embed_op": embedop if embedop else None,
        "width": width if width else None,
        "height": height if height else None,
        "description": description,
        "genre": tags,
        "author_ids": [],
        "is_private": False,
    }
    game_id = db.create_game(game_dict)
    client.upload_file(
        "g" + str(game_id),
        "game.zip",
        BytesIO(uploadfile.file.read()),
    )
    db.add_game_image(
        game_id,
        "cover",
        f"cover.{get_file_type(cover.content_type)}",
        0,
    )
    image_name = (
        str(int(time.time() * 1000)) + f".{get_file_type(screenshot_0.content_type)}"
    )
    if screenshot_0:
        client.upload_file(
            "g" + str(game_id),
            "0_" + image_name,
            BytesIO(screenshot_0.file.read()),
        )
        db.add_game_image(game_id, "screenshot", "0_" + image_name, 0)
    if screenshot_1:
        image_name = (
            str(int(time.time() * 1000))
            + f".{get_file_type(screenshot_1.content_type)}"
        )
        client.upload_file(
            "g" + str(game_id),
            "1_" + image_name,
            BytesIO(screenshot_1.file.read()),
        )
        db.add_game_image(game_id, "screenshot", "1_" + image_name, 1)
    if screenshot_2:
        image_name = (
            str(int(time.time() * 1000))
            + f".{get_file_type(screenshot_2.content_type)}"
        )
        client.upload_file(
            "g" + str(game_id),
            "2_" + image_name,
            BytesIO(screenshot_2.file.read()),
        )
        db.add_game_image(game_id, "screenshot", "2_" + image_name, 2)
    return {"id": str(game_id)}


@app.get("/game")
async def get_game_by(
    id: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
):
    if id:
        return Game(db.get_game(int(id)), db=db).get_info()
    if tag:
        return [Game(game, db=db).get_info() for game in db.get_games_by_genre(tag)]
    return [Game(game, db=db).get_info() for game in db.list_games()]


@app.get("/tag")
async def get_tags():
    return db.list_tags()


@app.delete("/game/image")
async def delete_game_image(url: str, id: str):
    url = remove_prefix(url, f"http://localhost:9000/g{id}/")
    image = db.get_image(url)[0]
    if image["type"] == "cover":
        return
    db.delete_image(url)
    client.remove_file("g" + id, url)
    return {}


@app.post("/game/image")
async def add_game_image(
    id: str,
    image: UploadFile = File(),
    url: Optional[str] = Form(None),
):
    if url:
        url = remove_prefix(url, f"http://localhost:9000/g{id}/")
        client.remove_file(id, url)
        old_image = db.get_image(url)[0]
        db.delete_image(url)
        image_name = (
            str(int(time.time() * 1000)) + f".{get_file_type(image.content_type)}"
        )
        client.upload_file(
            "g" + id,
            image_name,
            BytesIO(image.file.read()),
        )
        db.add_game_image(
            int(id),
            old_image["type"],
            image_name,
            old_image["position"],
        )
    else:
        images = db.get_game_images(int(id))
        max_pos = -1
        for image in images:
            if image["type"] == "screenshot":
                if image["position"] > max_pos:
                    max_pos = image["position"]
        image_name = (
            str(int(time.time() * 1000)) + f".{get_file_type(image.content_type)}"
        )
        client.upload_file(
            "g" + id,
            image_name,
            BytesIO(image.file.read()),
        )
        db.add_game_image(
            int(id),
            "screenshot",
            image_name,
            max_pos + 1,
        )
    return {}


if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8848, reload=True)
