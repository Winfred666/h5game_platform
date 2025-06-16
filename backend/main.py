from api.dbapi import *
from api.minio import *
from fastapi import (
    FastAPI,
    File,
    Form,
    Query,
    UploadFile,
    HTTPException,
    status,
    Cookie,
    Depends,
    Request,
)
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Union, Dict, Any, List
from pydantic import BaseModel
from io import BytesIO
import uvicorn
import time
from functools import wraps
import inspect
import os
import jwt
from datetime import datetime, timedelta
import base64


# log装饰器修改，用于异步和同步函数
def log(func):
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        global log_level
        if log_level > 0:
            print(f"Calling async function {func.__name__}")
        if log_level > 1:
            print(f"Arguments: {args}, {kwargs}")
        return await func(*args, **kwargs)

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        global log_level
        if log_level > 0:
            print(f"Calling sync function {func.__name__}")
        if log_level > 1:
            print(f"Arguments: {args}, {kwargs}")
        return func(*args, **kwargs)

    return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper


private_key_base64 = os.getenv("RS256_PRIVATE_KEY", "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tDQpNSUlFdmdJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLZ3dnZ1NrQWdFQUFvSUJBUURqZGxBL211S3ozTGJ6DQpmaDlidnJ4YlhzNitnZzFZOHM0b3dpYXpGZ0pPQ2hvenZuWUV6TXh0S1g3RVVFQ2tGZVNPaktjajl0ZnFFemtSDQpMb2JOUmgzdkZZbkYvZEJnK3ByS2FlM0huOEtnbHZQbjlHdFZhcFF3WGhKRXNmUUFkNHZPYWlrUG9EUkRmdndJDQpFMkxiZ29QaTY1Q0FrZVcwZWZ3M0hxaTQxLzNvOTdFcEVjUDZkQ04zQmh6MFFFakxEeVR6c3IybnI5Zi96QlRiDQplREFJYnp3emNJYjg0azBCODBncXhweUduT0J4dzk2bm9EOFd4V080enowdk9FZkFQUVpsS1hrdVNta0ZRcUVYDQpHZjhyU21FcUp4S2Y4MHFaeWVMWXRidGNvVitPUjczajhiNjNBbXlEcWlhZjdCMHFaQ2ZFdDFVcEpNMTNOVVJGDQpTUjZwVld0VEFnTUJBQUVDZ2dFQU1mYU5sd01URS9ZQjI4ZFM1UWluQUJ6NXBjQVVaWHJrRFBEa3BrYkoxOUdCDQpRdWR0cmcwOFJDZ3V0N2wzRVhQYm9mSkVUbktNcDlaMEhSR091NjFRcXZFY3M3aFdXczhCVEQvcllvTjFzV2VuDQpDTWJZQXNtbjVsM3JmbHBtWWVuZ2RFVStZcmZLY3g4RUJsUVh6V2JFU0laODFiajJiMmV5SG50bURVQW9mbERyDQovalZUZnhoeE1nOWlkMlI2RnVLTjNDdE0xaTZ3dS9BVDdzaEt2bVNjdWdEb0FPdkVoRU5USkJwWmN3aEVUY0x3DQpYbXZSOXp1SC9maytCVk9iMDgyVXJ4bzV2QktxelFWWDVOakZ3NkNxY1BHNTdWa0JOaUwxUlBDVkRVMzlZOEpFDQp2eTlPeW1BQmptYWtmYjBrY2o5aTYvZy9qYU9yTDFzc0RTVldleUJPeVFLQmdRRHpCK1NFNS9XUkx6RlYwUytjDQpVZWpqNnhpM2k4YTl3ZFZlQXkzMnpSeFprNlVFOThKL1NQbnJJR1hEKzZQamdMcldJZHM1QlJuckVheXdXeXQxDQpWYzAyUDljWmhwQlpGcWNQbk85dDFpTGNkcG1XSU9JREZWZEhPUGVIQjhpT1Voem9WM0xJRk9qd1RqTTV0V2kvDQo4d1kvVzE5WjFvaDZ3VmFoUmNxOC9rS3VHUUtCZ1FEdm1idXlOanNxMmtqT0Jla05ncTNDT2I0NHcrSHY4M1IwDQpIOUhFaG5xTWdaK0hrazBpYWtiWTNnQUtsbGRaYnFKNWQ0eHBsNjloTUF0dzFneGtkRDcwSGtOdC9meVMrNll5DQpBUVh6S1JqdlQzM2tnb0E2Z2FCQ2FDVmlLNFNKNUl2SHFTM3pyWXYzZFRraFdqTHgwTmNKT1d4bnpaUVZhU3cxDQprazVVSlFqNlN3S0JnUUN3SXdaQ05RTkxTQkxQaVo2aUF0TnhiRkFycHNoUmV3d3k2TWNGV2o2enhVZ1NRNmJaDQpMWURFSW1UZkY1LytJS3hJeVp6aXhJbTJUc2NEd2UvTFNIWkVYUngrU1lLUXJ0UkJncEljM3RmQlJNdW5mUW1SDQpCb1NOQUFLV0FOUWdJZThGald1SkMyNlB5MzFnMDlPcFdtOHF1QVJ4VGdUNFF1dVFVczdQRHRBdzhRS0JnUURzDQo5QitRL2xzRFpUN3RLU0V6TUZLQks3UDQxWmZqUXVTZlZ6eVAyK0xrZytqdUhYelZGVCtkaCtlSWtPZ3YxTjh2DQp1MUFNdVd0RGRVMUxPUlNtWCtSR2JvdUhBdEUvMTBta1dDaTNNcVNyUHZVbEFQNnBYYnJORWN3dXl4VFhma1BTDQpvSGlHYmRKblZ2RzZEMGNrcU1HUktNNFIxbGlsMkE1VnFLeDRRT3doQXdLQmdDVkQ4dVNvY2pwaGMvZkRBSTFUDQpQdXVYQU5ma1JSZ0VObEp0cSswK09RbUJvZ2RjWkRuUmZyOHE1WDlTaHNHdGJYdlBIaGxMeGkwTW5PcXB3R0k3DQpZbFZ4Z083ZmNRZmpBcXFqOWtEZFdzR2lsajQ3bk5JckErMXBSM2plMWErYjNBMm5RQWs0cGdXbWtabEZIekoyDQpvVVlna254dUFHaDZDZ3BzVjQzTzYrUUsNCi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K")
public_key_base64 = os.getenv("RS256_PUBLIC_KEY", "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBNDNaUVA1cmlzOXkyODM0Zlc3NjgNClcxN092b0lOV1BMT0tNSW1zeFlDVGdvYU03NTJCTXpNYlNsK3hGQkFwQlhram95bkkvYlg2aE01RVM2R3pVWWQNCjd4V0p4ZjNRWVBxYXltbnR4NS9Db0piejUvUnJWV3FVTUY0U1JMSDBBSGVMem1vcEQ2QTBRMzc4Q0JOaTI0S0QNCjR1dVFnSkhsdEhuOE54Nm91TmY5NlBleEtSSEQrblFqZHdZYzlFQkl5dzhrODdLOXA2L1gvOHdVMjNnd0NHODgNCk0zQ0cvT0pOQWZOSUtzYWNocHpnY2NQZXA2QS9Gc1ZqdU04OUx6aEh3RDBHWlNsNUxrcHBCVUtoRnhuL0swcGgNCktpY1NuL05LbWNuaTJMVzdYS0ZmamtlOTQvRyt0d0pzZzZvbW4rd2RLbVFueExkVktTVE5kelZFUlVrZXFWVnINClV3SURBUUFCDQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0K")
private_key = base64.b64decode(private_key_base64).decode("utf-8")
public_key = base64.b64decode(public_key_base64).decode("utf-8")
algorithm = "RS256"
access_token_expires = timedelta(minutes=30)
refresh_token_expires = timedelta(days=7)


async def check_auth(
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None),
):
    if not access_token and not refresh_token:
        return {"id": "", "access_token": "", "refresh_token": ""}
    if not access_token or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens invalid",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    try:
        refresh_decode_data = jwt.decode(
            refresh_token, public_key, algorithms=[algorithm]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens expired",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens invalid",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    try:
        access_decode_data = jwt.decode(
            access_token, public_key, algorithms=[algorithm]
        )
    except jwt.ExpiredSignatureError:
        access_decode_data = {
            "sub": refresh_decode_data["sub"],
            "exp": datetime.utcnow() + access_token_expires,
        }
        access_token = jwt.encode(access_decode_data, private_key, algorithm=algorithm)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens invalid",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    if access_decode_data["sub"] != refresh_decode_data["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tokens invalid",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    user = db.get_user(access_decode_data["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No such user",
            headers={"Set-Cookie": "access_token=; refresh_token=;"},
        )
    return {
        "id": refresh_decode_data["sub"],
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


async def check_auth_user(content: dict = Depends(check_auth)):
    if not content["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not logged in",
        )
    return content


async def check_admin(content: dict = Depends(check_auth_user)):
    user = db.get_user(content["id"])
    if user["is_admin"] == 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not admin",
        )
    return content


log_level = 2
client = MinIOClient()
db = GameDB()
app = FastAPI()

# 添加CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("PUBLIC_FRONT_URL", "http://localhost:3000"),
        "http://frontend:3000", "http://localhost:3000",
    ],  # frontend 使用容器内网，固定 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def remove_prefix(text: str, prefix: str) -> str:
    if text.startswith(prefix):
        return text[len(prefix) :]
    return text


def get_file_type(mime_type: str) -> str:
    return mime_type.split("/")[1]


CHECKED_ID_PARAMS = ["id", "user_id", "game_id", "comment_id", "qq"]


@app.middleware("http")
async def id_validator_middleware(request: Request, call_next):
    try:
        path_params = request.path_params
        for param in CHECKED_ID_PARAMS:
            if param in path_params:
                raw_id = path_params[param]
                if not validate_id(raw_id):
                    return invalid_id_response(param, raw_id)

        if request.method in ["GET", "DELETE"]:
            query_params = dict(request.query_params)
            for param in CHECKED_ID_PARAMS:
                if param in query_params:
                    raw_id = query_params[param]
                    if not validate_id(raw_id):
                        return invalid_id_response(param, raw_id)

        return await call_next(request)

    except Exception as e:
        import traceback

        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(e)},
        )


def validate_id(raw_id) -> bool:
    try:
        int(raw_id)
        if int(raw_id) <= 0:
            return False
        return True
    except (ValueError, TypeError):
        return False


def invalid_id_response(param: str, raw_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "error": "Invalid ID format",
            "detail": f"Parameter '{param}' must be a positive integer, got '{raw_id}'",
        },
    )


@app.post("/upload")
@log
async def upload_game(
    title: str = Form(),
    kind: str = Form(),
    uploadfile: UploadFile = File(),
    embedop: str = Form(),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    description: str = Form(),
    tags: str = Form(),
    cover: UploadFile = File(),
    screenshot_0: Optional[UploadFile] = File(None),
    screenshot_1: Optional[UploadFile] = File(None),
    screenshot_2: Optional[UploadFile] = File(None),
    developers: str = Form(),
    auth_info: dict = Depends(check_auth_user),
):
    if not uploadfile.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="please upload zip file")
    ids = developers.split(",")
    if not auth_info["id"] in ids:
        ids.append(auth_info["id"])
        developers = ",".join(ids)
    game_dict = {
        "title": title,
        "kind": kind,
        "embed_op": embedop,
        "width": width,
        "height": height,
        "description": description,
        "genre": tags,
        "author_ids": developers,
        "size": uploadfile.size,
    }
    # check developers
    for id in ids:
        if db.get_user(id) is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid developer ID"
            )

    file_data = BytesIO()
    while chunk := await uploadfile.read(8192):
        file_data.write(chunk)
    file_data.seek(0)
    if kind == "html":
        with zipfile.ZipFile(file_data, "r") as zip_ref:
            html_exists = any(
                name.lower().endswith("index.html") for name in zip_ref.namelist()
            )
            if not html_exists:
                raise HTTPException(status_code=400, detail="no index.html in zip")
        file_data.seek(0)
    game_id = db.create_game(game_dict)
    await client.upload_game_package(game_id, file_data)
    for id in ids:
        db.user_bind_game(id, game_id)

    cover_extension = os.path.splitext(cover.filename)[1].lower().lstrip(".")
    file_data = BytesIO()
    while chunk := await cover.read(8192):
        file_data.write(chunk)
    file_data.seek(0)
    await client.upload_image(game_id, 1, file_data, cover_extension)

    screenshots = [screenshot_0, screenshot_1, screenshot_2]
    s = str()
    for i, screenshot in enumerate(screenshots):
        if screenshot is not None:
            screenshot_extension = (
                os.path.splitext(screenshot.filename)[1].lower().lstrip(".")
            )
            if i != 0:
                s = s + ","
            s = s + screenshot_extension
            file_data = BytesIO()
            while chunk := await screenshot.read(8192):
                file_data.write(chunk)
            file_data.seek(0)
            await client.upload_image(game_id, i + 2, file_data, screenshot_extension)
    db.add_game_image(game_id, cover_extension, s)
    response = JSONResponse(content={"id": str(game_id)})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.put("/game")
async def update_game(
    id: str,
    title: Optional[str] = Form(None),
    kind: Optional[str] = Form(None),
    uploadfile: Optional[UploadFile] = File(None),
    embedop: Optional[str] = Form(None),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    cover: Optional[UploadFile] = File(None),
    screenshot_0: Union[UploadFile, str, None] = File(None),
    screenshot_1: Union[UploadFile, str, None] = File(None),
    screenshot_2: Union[UploadFile, str, None] = File(None),
    developers: Optional[str] = Form(None),
    auth_info: dict = Depends(check_auth_user),
):
    def update_value(**kwargs):
        for name, value in kwargs.items():
            if value is not None:
                db.update_game_stats(int(id), name, value)

    if uploadfile and uploadfile.size > 0:
        if not uploadfile.filename.endswith(".zip"):
            raise HTTPException(status_code=400, detail="please upload zip file")
        file_data = BytesIO()
        while chunk := await uploadfile.read(8192):
            file_data.write(chunk)
        file_data.seek(0)
        if kind == "html" or (kind is None and db.get_game_info1(int(id))[2] == "html"):
            with zipfile.ZipFile(file_data, "r") as zip_ref:
                html_exists = any(
                    name.lower().endswith("index.html") for name in zip_ref.namelist()
                )
                if not html_exists:
                    raise HTTPException(status_code=400, detail="no index.html in zip")
            file_data.seek(0)
        client.delete_folder("games", f"{id}/")
        time.sleep(1)
        url = await client.upload_game_package(id, file_data)
        update_value(size=uploadfile.size)

    screenshots = [screenshot_0, screenshot_1, screenshot_2]
    for idx, screenshot in enumerate(screenshots):
        if isinstance(screenshot, str) and screenshot == "":
            if idx != len(db.get_image_type(id)) - 2:
                return {"error": "Invalid screenshot index"}
            file_type = db.delete_image(id, idx + 2)
            client.delete_image(id, idx + 2, file_type)

        # 情况2：上传新图片（UploadFile 且大小 > 0）
        elif type(screenshot).__name__ == "UploadFile" and screenshot.size > 0:
            # print("检测到 UploadFile，文件大小:", screenshot.size)
            if screenshot.size > 0:
                # print("上传操作")
                new_type = screenshot.content_type.split("/")[1]
                file_data = BytesIO()
                while chunk := await screenshot.read(8192):
                    file_data.write(chunk)
                file_data.seek(0)

                # 删除旧图片（如果有）
                type_list = db.get_image_type(id)
                if len(type_list) >= idx + 2:
                    old_type = type_list[idx + 1]
                    client.delete_image(id, idx + 2, old_type)

                # 上传新图片
                await client.upload_image(id, idx + 2, file_data, new_type)
                db.update_sc_type(id, idx + 2, new_type)

    update_value(
        title=title,
        kind=kind,
        embed_op=embedop,
        width=width,
        height=height,
        description=description,
        genre=tags,
        author_ids=developers,
    )

    if developers:
        game = db.get_game(int(id))
        if game is None:
            game = db.get_game(int(id), True)
        if game is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="error with game_id"
            )
        for developer in game["developers"]:
            db.user_unbind_game(developer["id"], game["id"])
        developer_ids = [developer["id"] for developer in game["developers"]]
        if int(auth_info["id"]) not in developer_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the developer of this game",
            )
        ids = developers.split(",")
        for id1 in ids:
            if db.get_user(id1) is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid developer ID",
                )
        for u_id in ids:
            db.user_bind_game(u_id, int(id))

    if cover and cover.size > 0:
        new_type = cover.content_type.split("/")[1]
        file_data = BytesIO()
        while chunk := await cover.read(8192):
            file_data.write(chunk)
        file_data.seek(0)
        type1 = db.get_image_type(int(id))
        client.delete_image(id, 1, type1[0])
        await client.upload_image(id, 1, file_data, new_type),
        if type1[0] != new_type:
            db.update_cov_type(id, new_type)

    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.get("/game")
@log
async def get_game_by(
    id: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    auth_info: dict = Depends(check_auth),
):
    res = []
    if id:
        result = db.get_game(int(id))
        if result is not None:
            db.inc_game_count(id, "views")
            res = result
        elif auth_info["id"]:
            user_info = db.get_user(auth_info["id"])
            if user_info["is_admin"] is True or db.check_owner(auth_info["id"], id):
                result = db.get_game(int(id), True)
                if result is not None:
                    res = result
                else:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND, detail="No such game"
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No such game"
            )
    elif tag:
        res = db.get_games_by_tag(tag)
    elif name:
        res = db.get_game_by_name(name)
    else:
        res = db.list_games()
    response = JSONResponse(content=res)
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.get("/game/top")
@log
async def rem_game(auth_info: dict = Depends(check_auth)):
    response = JSONResponse(content=db.rem_game())
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.get("/tag")
@log
async def get_tags(auth_info: dict = Depends(check_auth)):
    response = JSONResponse(content=db.get_tag())
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.post("/user")
@log
async def user_login(qq: str = Form(), hash: str = Form()):
    user = db.search_user("qq", qq)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No such user"
        )
    user_passwd = user["hash"]
    if user_passwd == hash:
        access_encode_data = {
            "sub": str(user["id"]),
            "exp": datetime.utcnow() + access_token_expires,
        }
        refresh_encode_data = {
            "sub": str(user["id"]),
            "exp": datetime.utcnow() + refresh_token_expires,
        }
        access_token = jwt.encode(access_encode_data, private_key, algorithm=algorithm)
        refresh_token = jwt.encode(
            refresh_encode_data, private_key, algorithm=algorithm
        )
        response = JSONResponse(content={"id": str(user["id"])})
        response.set_cookie(key="access_token", value=access_token)
        response.set_cookie(key="refresh_token", value=refresh_token)
        return response
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Wrong password"
        )


@app.get("/me")
@log
async def get_id(auth_info: dict = Depends(check_auth_user)):
    user = db.get_user(auth_info["id"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No such user"
        )
    response = JSONResponse(content={"id": user["id"]})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.delete("/me")
@log
async def logout(auth_info: dict = Depends(check_auth_user)):
    user = db.get_user(auth_info["id"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No such user"
        )
    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value="")
    response.set_cookie(key="refresh_token", value="")
    return response


@app.put("/user")
@log
async def update_user(
    introduction: Optional[str] = Form(None),
    hash: Optional[str] = Form(None),
    name: Optional[str] = Form(),
    profile: Optional[UploadFile] = File(None),
    contacts: Optional[str] = Form(None),
    auth_info: dict = Depends(check_auth_user),
):
    id = auth_info["id"]
    if profile:
        old_profile = db.get_user(int(id))["profile_path"]
        if "." in old_profile:
            client.delete_photo(id, old_profile.split(".")[1])
        type = profile.content_type.split("/")[1]
        await client.upload_photo(id, BytesIO(profile.file.read()), type)
        url = f"{id}.{type}"
    else:
        url = None
    db.update_user_info(id, introduction, hash, name, url, contacts)
    response = JSONResponse(content={"id": id})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


def split_contacts(contacts: str) -> list[dict]:
    contacts_list = []
    for contact in contacts.split(","):
        key, value = contact.split(":")
        contacts_list.append({"way": key, "content": value})
    return contacts_list


@app.get("/user")
@log
async def search_user(
    name_qq: Optional[str] = Query(None),
    id: Optional[str] = Query(None),
    auth_info: dict = Depends(check_auth),
):
    users = []
    if name_qq is None and id is None:
        user_ids = db.list_users()
        users = [db.get_user(uid) for uid in user_ids]
    elif name_qq:
        name_user = db.search_user("name", name_qq)
        qq_user = db.search_user("qq", name_qq)
        if name_user is not None:
            users.append(name_user)
        if qq_user is not None and (
            name_user is None or qq_user["id"] != name_user["id"]
        ):
            users.append(qq_user)
    else:
        if db.get_user(int(id)) is None:
            return []
        users.append(db.get_user(int(id)))
    for i, user in enumerate(users):
        games = db.get_user_games(user["id"])
        print(games)
        games = [db.get_game(game_id[0]) for game_id in games if game_id is not None]
        print(games)
        users[i] = {
            "id": user["id"],
            "qq": user["qq"],
            "name": user["name"],
            "profile": user["profile_path"],
            "introduction": user["introduction"],
            "created_at": user["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
            "contacts": user["contacts"],
            "is_admin": user["is_admin"],
            "games": [
                {
                    "id": game["id"],
                    "title": game["title"],
                    "cover_image": game["cover_image"],
                }
                for game in games
                if game is not None
            ],
        }
    response = JSONResponse(content=users)
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.get("/user_game")
def get_unreleased_games_by_user(auth_info: dict = Depends(check_auth_user)):
    user = db.get_user(auth_info["id"])
    games = db.get_user_games(user["id"])
    game_list = []
    for game_id in games:
        game = db.get_game(game_id, True)
        if game:
            game_list.append(game)
    response = JSONResponse(content=game_list)
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.delete("/admin/game")
@log
async def delete_game_from_user(
    id: str, game_id: str, auth_info: dict = Depends(check_admin)
):
    game = db.get_game(game_id)
    if not game:
        game = db.get_game(game_id, True)
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No such game"
        )
    developers = []
    for developer in game["developers"]:
        if developer["id"] != int(id):
            developers.append(str(developer["id"]))
    db.user_unbind_game(id, game_id)
    if not developers:
        db.delete_game(game_id)
        client.delete_folder("games", f"{game_id}/")
        client.delete_folder("images", f"{game_id}/")
    else:
        db.update_game_stats(game_id, "author_ids", ",".join(developers))
    response = JSONResponse(content={"id": id})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.put("/admin/game")
@log
async def check_game(id: str, state: bool, auth_info: dict = Depends(check_admin)):
    db.update_game_stats(id, "is_private", not state)
    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.delete("/admin/user")
@log
async def delete_user(id: str, auth_info: dict = Depends(check_admin)):
    games = db.get_user_games(id)
    for game_id in games:
        game_id = game_id[0]  # game_id is a tuple (game_id,)
        game = db.get_game(game_id)
        if game is None:
            game = db.get_game(game_id, True)
        if game is None:
            continue
        developers = []
        for developer in game["developers"]:
            if developer["id"] != int(id):
                developers.append(str(developer["id"]))
        db.user_unbind_game(id, game["id"])
        if not developers:
            db.delete_game(game["id"])
            client.delete_folder("games", f"{game['id']}/")
            client.delete_folder("images", f"{game['id']}/")
        else:
            db.update_game_stats(game["id"], "author_ids", ",".join(developers))
    db.delete_user(id)
    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


class UserList(BaseModel):
    list: list[dict]


@app.put("/admin/user")
@log
async def create_user(list: UserList, auth_info: dict = Depends(check_admin)):
    cnt = 0
    for user in list.list:
        if not db.search_user("qq", user["qq"]):
            password = os.getenv("ADMIN_HASH")
            db.create_user(
                user["qq"],
                user["name"],
                str(password),
            )
            cnt += 1
    response = JSONResponse(content={"number": cnt})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.put("/admin/bind")
@log
async def rebind_qq(
    id: str,
    qq: Optional[str] = Form(None),
    hash: Optional[str] = Form(None),
    admin: Optional[bool] = Form(None),
    auth_info: dict = Depends(check_admin),
):
    if qq:
        if db.admin_rebind_qq(id, qq) is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="QQ already exists"
            )
    if hash:
        db.update_user_info(id, None, hash, None, None, None)
    if admin is not None:
        db.set_admin(id, admin)
    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


@app.get("/admin/game")
@log
async def get_unreviewed_game(auth_info: dict = Depends(check_admin)):
    return db.get_unreviewed_games()


@app.get("/comment")
@log
async def get_comment(
    game_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    auth_info: dict = Depends(check_auth),
):
    if game_id and user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
        )
    elif game_id:
        response = JSONResponse(content=db.get_comments_by_gameid(game_id))
        response.set_cookie(key="access_token", value=auth_info["access_token"])
        response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
        return response
    elif user_id:
        response = JSONResponse(content=db.get_comments_by_user_id(user_id))
        response.set_cookie(key="access_token", value=auth_info["access_token"])
        response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
        return response
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
        )


@app.post("/comment")
@log
async def create_comment(
    game_id: Optional[int] = Form(),
    content: Optional[str] = Form(),
    auth_info: dict = Depends(check_auth_user),
):
    user_id = auth_info["id"]
    if db.get_game(game_id) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="game not exist/ is private"
        )
    id = db.add_comment(game_id, user_id, content)
    response = JSONResponse(content={"id": str(id)})
    return response


@app.delete("/comment")
@log
async def delete_comment(id: str, auth_info: dict = Depends(check_admin)):
    db.delete_comment(id)
    response = JSONResponse(content={})
    return response


@app.put("/admin/tag")
@log
async def update_tag(tags: str = Form(), auth_info: dict = Depends(check_admin)):
    if not tags:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Tags cannot be empty"
        )
    tag_list = tags.split(",")
    db.delete_all_tags()
    for tag in tag_list:
        if tag.strip():
            db.add_tag(tag.strip())
    response = JSONResponse(content={})
    response.set_cookie(key="access_token", value=auth_info["access_token"])
    response.set_cookie(key="refresh_token", value=auth_info["refresh_token"])
    return response


if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8848, reload=True)
