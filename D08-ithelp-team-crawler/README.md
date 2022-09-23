# ithelp-team-crawler

爬取所有團體參賽者最新的貼文資訊，並寫入到 [./logs/ithelp.log](./logs/ithelp.log)。

```bash
sudo docker build . -t ithelp-team-crawler
# or
# make build
```

```bash
sudo docker compose up

# if your docker-compose version is older
# sudo docker-compose up

# or by docker-run only
sudo docker run --volume ${PWD}/logs:/app/logs ithelp-team-crawler
# or
# make run
```

