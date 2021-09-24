# podez-proxy-server
一个为老牌 Windows 音乐播放器软件 Airplay3（又名 PodEZ）提供歌词和图片下载服务的代理服务器。

## 效果展示

![image](https://user-images.githubusercontent.com/5051300/134684454-86e8cea6-084f-43bd-b6e8-5a57aca2b793.png)
![image](https://user-images.githubusercontent.com/5051300/134683858-1fba9c99-688d-4a34-bd98-723ccb7b0f1a.png)


## 使用
```
npm install
npm run start
```

在 Airplay3 设置 - 网络连接中，选择 “使用自定义的代理服务器”，填写 HTTP 代理服务器 localhost 端口 8187，即可进行词图搜索。

也可以使用部署好的服务器 pod.rikumi.dev 端口 8187。

## 心路历程

Airplay3 官方的服务器早已下线，其服务器返回的数据格式不得而知，破解这个返回的数据格式是这个工具开发的主要难点；相关的心路历程后续我将会更新到博客文章中。
