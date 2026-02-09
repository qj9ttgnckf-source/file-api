# File Upload API

окальный сервер на Node.js для загрузки и скачивания файлов

Файлы сохраняются в папку `downloads/`.

## Установка

```bash
npm install
```

## Запуск сервера

```bash
npm start
```

Сервер будет работать тут:

http://127.0.0.1:3000

## Загрузка файла

```bash
curl -F "file=@test.txt" http://127.0.0.1:3000/upload
```

## Список файлов

```bash
curl http://127.0.0.1:3000/files
```

## Скачать файл

```bash
curl -OJ http://127.0.0.1:3000/download/test.txt
```
