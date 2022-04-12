import { createServer, IncomingMessage, ServerResponse } from "http";

import { PingDataStorage } from "@adapters/storages/ping-data";
import { CollectPingDataStory, CalculatePingMetricsStory } from "@stories";
import { PingDataController, makeRouter } from "@adapters/controllers/http";
import {
  CalculatePingMetricsController,
  initSystemControllers,
} from "@adapters/controllers/system";

// TODO: получать значения SERVER_HOSTNAME, SERVER_PORT, etc. из env через отдельный сервис конфигурации
const SERVER_HOSTNAME = "127.0.0.1";
const SERVER_PORT = 8080;

function bootstrap() {
  // TODO: использовать DI контейнер

  // создание класса хранилища данных
  const pingDataStorage = new PingDataStorage();

  // связка http контроллера и story сбора данных
  const pingDataStory = new CollectPingDataStory(pingDataStorage);
  const pingDataController = new PingDataController(pingDataStory);
  // TBD: тип для routing надо где-то определять, скорее всего в сущностях адаптера http контроллера
  const routing: { [id: string]: { [id: string]: Function } } =
    makeRouter(pingDataController);

  // связка system контроллера и story вычисления значения метрик
  const calculatePingMetricsStory = new CalculatePingMetricsStory(
    pingDataStorage
  );
  const calculatePingMetricsController = new CalculatePingMetricsController(
    calculatePingMetricsStory
  );
  initSystemControllers(calculatePingMetricsController);

  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const buffer = [];
      for await (const chunk of req) {
        buffer.push(chunk);
      }

      const data = buffer.length
        ? JSON.parse(Buffer.concat(buffer).toString())
        : {};

      if (
        req.url &&
        req.method &&
        routing[req.url] &&
        routing[req.url][req.method]
      ) {
        return await routing[req.url][req.method](req, res, data);
      }

      res.statusCode = 404;
      res.end("Method Not Found");
    }
  );

  server.on("error", (error) => {
    console.error("\x1b[31m[FAIL server]\x1b[0m", error);
  });

  server.listen(SERVER_PORT, SERVER_HOSTNAME, () => {
    console.info(`Server running at http://${SERVER_HOSTNAME}:${SERVER_PORT}/`);
  });
}

bootstrap();
