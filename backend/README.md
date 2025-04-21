本实验的后端实现。
注意，安装依赖包前请安装 Rust 编译器，否则有些依赖包无法 build。同时，若你此前没有安装 Build Tools For Visual Studio 中的 Visual C++，也请进行安装。



错误请求返回示例（以 /upload获取 为例）

```json
{
    "detail": [
        {
            "type": "value_error",
            "loc": [
                "body",
                "screenshot_2"
            ],
            "msg": "Value error, Expected UploadFile, received: <class 'str'>",
            "input": "",
            "ctx": {
                "error": {}
            }
        }
    ]
}
```

正确请求返回示例

```json
{
    "id": "1"
}
```