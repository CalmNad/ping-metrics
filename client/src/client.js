const http = require("http");
const https = require("https");
const { performance, PerformanceObserver } = require("perf_hooks");

const logger = require("./logger");

// константы для запроса к пингуемой странице
// TODO: вынести в env
const PING_INTERVAL = 1000; // msec
const PING_TIMEOUT = 60000; // msec
const PING_HOSTNAME = "youtube.com";
const PING_PORT = 443;
// const PING_HOSTNAME = "fundraiseup.com";
const PING_PATH = "/";

// константы для подклчюения к серверу сбора статистики
// TODO: вынести в env
const REPORT_TIMEOUT = 10000; // msec
const REPORT_HOSTNAME = "127.0.0.1";
const REPORT_PORT = 8080;
const REPORT_PATH = "/data";

// номер пинга с момента старта клиента, используется в качестве pingId
let pingCount = 0;

// статистика по работе клиента
const clientStats = {
  reportsTotal: 0,
  reportsSuccess: 0,
  reportsError500: 0,
  reportsUnanswered: 0,
};

// постоянные параметры запроса к серверу сбора статистики
const postProps = {
  method: "POST",
  hostname: REPORT_HOSTNAME,
  port: REPORT_PORT,
  path: REPORT_PATH,
  timeout: REPORT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
};

// постоянные параметры запроса для получения пинга
const getProps = {
  method: "GET",
  hostname: PING_HOSTNAME,
  port: PING_PORT,
  path: PING_PATH,
  timeout: PING_TIMEOUT,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
  },
};

setInterval(ping, PING_INTERVAL);
ping();

// метод пинга отслеживаемой страницы
async function ping() {
  const pingId = pingCount++;
  const pingDate = new Date().getTime();

  const markStart = `A:${pingId}`;
  const markStop = `B:${pingId}`;
  const markName = `Query:${pingId}`;

  try {
    performance.mark(markStart);

    const req = https.request(getProps, async (res) => {
      // MEMO: получаем тело ответа, сами данные нам не нужны, но затрачиваемое на передачу время надо учитывать
      for await (const chunk of res) {
      }

      performance.mark(markStop);
      // MEMO: по performance.measure автоматически вызывается установленный PerformanceObserver (см. ниже)
      performance.measure(markName, {
        start: markStart,
        end: markStop,
        detail: { pingId, pingDate },
      });
    });

    req.on("error", (error) => {
      console.error("\x1b[31m[FAIL ping]\x1b[0m error:", error);
    });

    req.end();
  } catch (error) {
    console.error("\x1b[31m[FAIL ping]\x1b[0m unprocessed error:", error);
  }
}

// навешиваем обработчик событий измерения производительности,
// по которым получаем продолжительность выполнения ping запроса
const obs = new PerformanceObserver(async (list) => {
  const entry = list.getEntries()[0];

  const pingData = {
    pingId: entry.detail.pingId,
    deliveryAttempt: 0,
    date: entry.detail.pindDate,
    responseTime: entry.duration,
  };

  await repeatReport(pingData);
});
obs.observe({ entryTypes: ["measure"], buffered: false });

// метод отправки отчета с экспоненциальной задержкой повторных попыток в случае неудачи
async function repeatReport(pingData) {
  setTimeout(() => {
    report(pingData);
  }, calcPauseMsec(pingData.deliveryAttempt));
}

// метод отправки отчета
async function report(pingData) {
  pingData.deliveryAttempt++;

  const postData = JSON.stringify(pingData);

  logger.info(pingData, `try send data to server: ${postData}`);

  postProps.headers["Content-Length"] = Buffer.byteLength(postData);

  try {
    clientStats.reportsTotal++;
    const req = http.request(postProps, async (res) => {
      res.setEncoding("utf8");

      switch (res.statusCode) {
        case 200:
          clientStats.reportsSuccess++;
          logger.info(pingData, "data successfully sended");
          break;
        case 500:
          clientStats.reportsError500++;
          logger.error(
            pingData,
            "server return error code 500, will try again later"
          );
          repeatReport(pingData);
          break;
        default:
          logger.error(pingData, "unknown error");
          break;
      }
    });

    req.on("error", (error) => {
      if ("timeout" == error.message) {
        return;
      }
      console.error(
        "\x1b[31m[FAIL report]\x1b[0m unknown error:",
        error,
        pingData
      );
    });

    req.on("timeout", (a, b) => {
      clientStats.reportsUnanswered++;
      logger.error(pingData, "timeout, will try again later");
      repeatReport(pingData);
      req.destroy(new Error("timeout"));
    });

    req.write(postData);

    req.end();
  } catch (error) {
    console.error(
      "\x1b[31m[FAIL report]\x1b[0m unprocessed error:",
      error,
      pingData
    );
  }
}

// навешиваем вывод статистики на остановку клиента по Ctrl+C
process.on("SIGINT", async () => {
  console.info("\nclient statistics:", clientStats);
  process.exit(0);
});

// вычисление экспоненциальной задержки по номеру попытки
function calcPauseMsec(attempt) {
  return ((Math.pow(2, attempt) - 1) / 2) * 1000;
}
