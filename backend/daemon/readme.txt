[1. DB setting]
~/backend/config/config.js 에 본인 계정 세팅
# npx sequelize-cli db:create
# npx sequelize-cli db:migrate

[2. 트랜잭션 모니터링]
# cd ~/backend/daemon
'blockNumber' 파일값을 0 으로 세팅
# npx pm2 start daemon.js --cron "* * * * *"
# npx pm2 monit

[3. dummy_data (컬랙션과 NFT) 가나쉬에 일괄 배포]
# cd ~/backend/daemon
# node batch_collection_NFT.js

