# lyric-proxy-server

一个为 Airplay3（老牌 Windows 音乐播放器软件）和魅族 Flyme 3 旧版音乐播放器提供歌词和图片下载服务的怀旧代理服务器。

## 效果展示

![image](https://user-images.githubusercontent.com/5051300/134684454-86e8cea6-084f-43bd-b6e8-5a57aca2b793.png)
![image](https://user-images.githubusercontent.com/5051300/134683858-1fba9c99-688d-4a34-bd98-723ccb7b0f1a.png)

## 使用

```
npm install
npm run start
```

Airplay3：在设置 - 网络连接中，选择 “使用自定义的代理服务器”，填写 HTTP 代理服务器 localhost:8187。

Flyme 音乐：在 Flyme 系统设置中修改 Wi-Fi 的代理服务器到电脑的 IP 地址:8187。
