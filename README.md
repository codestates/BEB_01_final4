# Welcome to the NFT 깐부 플랫폼
![](https://images.velog.io/images/jihonee/post/e65d331d-2831-4a5f-bad3-517804f604fa/image.png)

![](https://images-ext-2.discordapp.net/external/3biXBDBjKfwsnvnLBPvPw3M80UdJPLxTYxWAqEyaRKE/%3Ftable%3Dblock%26id%3Dadce1156-42cb-4267-b837-190acf241c2d%26width%3D2000%26userId%3D%26cache%3Dv2/https/codestates.notion.site/image/https%253A%252F%252Fs3-us-west-2.amazonaws.com%252Fsecure.notion-static.com%252Fe25621a2-2b49-48b9-875d-1ea100b0d26d%252FUntitled.jpeg?width=1247&height=936)



## 배포 서버
### http://www.klaygganbu.com

## 프로젝트 설명
https://codestates.notion.site/4-7f7b634e8de8494bbc618505992566c2

## How to deploy?
### required stack : node.js, npm, mysql

[backend]. 
- `config/config.json` 수정 : db password, host_metadata(서버 주소), cors_allow(서버 주소), KAS API. 
- `npm install`  
- `npx sequelize-cli db:create`  
- `npx sequelize-cli db:migrate`  
- `npm start`  

[frontend]. 
- `.env` 수정 : backend 서버 uri
- `npm install`
- `npm run build`
- `npm run start`

