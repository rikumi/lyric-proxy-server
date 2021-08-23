# podez-proxy-server
一个为老牌 Windows 音乐播放器软件 Airplay3（又名 PodEZ）提供歌词和图片下载服务的代理服务器。

## 效果展示

![image](https://user-images.githubusercontent.com/5051300/130475315-8fbd7b2d-69fb-4a62-b69f-188e25919945.png)
![image](https://user-images.githubusercontent.com/5051300/130475796-2b6732f4-0ec7-430c-98b4-c9468940f36c.png)

## 使用
```
npm install
npm run start
```

在 Airplay3 设置 - 网络连接中，选择 “使用自定义的代理服务器”，填写 HTTP 代理服务器 localhost 端口 8187，即可进行词图搜索。

## 心路历程

Airplay3 官方的服务器早已下线，其服务器返回的数据格式不得而知，破解这个返回的数据格式是这个工具开发的主要难点；相关的心路历程后续我将会更新到博客文章中。
