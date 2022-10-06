# 指定 PHP 版本的 laravel 開發環境範例

## 假設

假設這是一個 Laravel 5.5 的專案，執行在 php 7.1 的環境中，

如果需要更改到其他 PHP 版本，可以修改 [docker-compose.yml](./docker-compose.yml) 所使用的 php docker image。

## 前置作業

以下步驟都是在開發的電腦上執行，並注意以下的小細節：

1. 已裝有 Docker Desktop。
1. 如果需要 [Composer](https://getcomposer.org/)，可以自己進入 Container 安裝。

## 步驟

1. 啟動 Container 

	```bash
	$ docker compose up -d
	```

2. 啟動 Laravel 的開發環境

	```bash
	$ docker compose exec php-container  php artisan serve --host=0.0.0.0
	```

3. 使用 port 8000 來呼叫 Laravel 的 API

	例如在瀏覽器啟動 http://localhost:8000，就可以看到 Laravel 的首頁了。
