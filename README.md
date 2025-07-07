## @e22m4u/ts-rest-router-openapi

Генератор OpenAPI документации для [REST-маршрутизатора](https://www.npmjs.com/package/@e22m4u/ts-rest-router)

## Установка

```bash
npm install @e22m4u/ts-rest-router-openapi
```

#### Поддержка декораторов

Для включения поддержки декораторов, добавьте указанные
ниже опции в файл `tsconfig.json` вашего проекта.

```json
{
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

## Использование

Генерация OpenAPI документа:

```ts
import {RestRouter} from '@e22m4u/ts-rest-router';
import {RestRouterOpenAPI} from '@e22m4u/ts-rest-router-openapi';

// создание маршрутизатора и регистрация контроллеров
const router = new RestRouter();
// router.registerController(...);

// создание сервиса генерации OpenAPI документа,
// и иньекция маршрутизатора в данный сервис
const routerOpenAPI = new RestRouterOpenAPI();
routerOpenAPI.setService(RestRouter, router);

// генерация документа
const openAPIDoc = routerOpenAPI.genOpenAPIDocument({
  info: {
    title: 'My Amazing Api',
    version: '0.0.1',
  },
});
```

Модуль экспортирует декоратор `@oaHidden`, позволяющий
скрыть метод контроллера из *OpenAPI* документа.

```ts
import {getAction} from '@e22m4u/ts-rest-router';
import {restController} from '@e22m4u/ts-rest-router';
import {oaHidden} from '@e22m4u/ts-rest-router-openapi'

@restController()
class MyController {
  @oaHidden()  // <- исключает операцию из OpenAPI схемы
  @getAction() // <- декоратор метода GET
  myAction() {
    // ...
  }
}
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
