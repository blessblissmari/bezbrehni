# DNS-план для `безбрехни.рф`

Домен: `безбрехни.рф`
Punycode: `xn--90aalbii8aw0c.xn--p1ai`

Все SSL-сертификаты и CDN-интеграции (Yandex Cloud CDN, Let's Encrypt) принимают punycode-форму. Браузеры отображают кириллический вариант.

## Записи

| Имя                         | Тип   | Значение                                                                 | Комментарий                                                  |
| --------------------------- | ----- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `xn--90aalbii8aw0c.xn--p1ai.`   | ALIAS/A (или CNAME через CDN) | `<bucket>.website.yandexcloud.net` или CDN-домен | Лендинг (Yandex Object Storage website endpoint) |
| `app.xn--90aalbii8aw0c.xn--p1ai.` | CNAME | `<bucket>.website.yandexcloud.net` или CDN-домен                         | Личный кабинет (тот же bucket или отдельный)                 |
| `api.xn--90aalbii8aw0c.xn--p1ai.` | CNAME | `<function-id>.apigw.yandexcloud.net`                                   | API Gateway, перед которым Cloud Function                    |
| `_acme-challenge.*`         | TXT   | выдаётся CA                                                              | Проверка домена для Let's Encrypt / Yandex Certificate Manager |

> Если провайдер DNS (Cloudflare, Reg.ru и т.п.) не поддерживает ALIAS на apex — используйте перенаправление с apex на `app.` через HTTP-редирект.

## TLS

Рекомендуется Yandex Cloud Certificate Manager с автоматическим выпуском Let's Encrypt сертификатов. При запросе сертификата используйте **оба** варианта DNS-имени:

- `xn--90aalbii8aw0c.xn--p1ai`
- `*.xn--90aalbii8aw0c.xn--p1ai`

## Публикация API

API-шлюз Yandex Cloud API Gateway, маршрут `/*` → Cloud Function `bezbrehni-api`. Включить CORS. Привязать custom domain `api.xn--90aalbii8aw0c.xn--p1ai` с сертификатом из Certificate Manager.

## Один домен вместо поддоменов (fallback)

Если удобно жить на одном домене без поддоменов (`безбрехни.рф` для сайта, а API на `/api/*`) — это допустимо, нужно только:

1. В `.env` выставить `API_URL=https://xn--90aalbii8aw0c.xn--p1ai/api`.
2. В API Gateway навесить путь `/api/*` на функцию.
3. Убрать CORS-хосты (one-origin).

Мы явно выбрали схему **с поддоменами** для MVP, потому что Object Storage website endpoint не умеет проксировать пути в Cloud Functions. Если поддомены по какой-то причине недоступны — переключайтесь на fallback: обновите только `.env` и маршрутизацию API Gateway.
