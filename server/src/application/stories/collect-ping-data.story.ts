import {
  ICollectPingDataStory,
  ICollectPingDataReq,
  ICollectPingDataReqData,
  ICollectPingDataRes,
  ICollectPingDataResData,
} from "@ports/stories/collect-ping-data.port";
import { IPingDataStorage } from "@ports/storages";

import {
  ResSuccess,
  ResFailure,
  IError,
  ERROR_UNPROCESSED,
} from "@application/entities";

// MEMO: при рандомном значении
// от 0.0 до 0.6 - успешная обработка
// от 0.6 до 0.8 - 500 ошибка
// от 0.8 до 1.0 - "зависаем" на 15 секунд, что бы у клиента сработал timeout
const SUCCESS_THRESHOLD_OK = 0.6;
const SUCCESS_THRESHOLD_500 = 0.8; // from 0.6 to 0.8 - return error 500

const ERROR_INTERNAL_SERVER_ERROR: IError = {
  code: "ERROR_INTERNAL_SERVER_ERROR",
  message: "Internal Server Error",
};

const PAUSE_FOR_SERVER_SILENCE = 15000; // MEMO: milliseconds

export class CollectPingDataStory implements ICollectPingDataStory {
  constructor(private pingDataStorage: IPingDataStorage) {}

  public async execute({
    data,
  }: ICollectPingDataReq): Promise<ICollectPingDataRes> {
    try {
      const successThreshold = Math.random();

      if (successThreshold < SUCCESS_THRESHOLD_OK) {
        const { pingId, responseTime } = data;

        await this.pingDataStorage.addPingData({ pingId, responseTime });

        this.logSuccess(data);

        return new ResSuccess<ICollectPingDataResData>({ done: true });
      } else if (successThreshold < SUCCESS_THRESHOLD_500) {
        return new ResFailure(ERROR_INTERNAL_SERVER_ERROR);
      } else {
        await pause(PAUSE_FOR_SERVER_SILENCE);
        return new ResSuccess<ICollectPingDataResData>({ done: true });
      }
    } catch (error) {
      return new ResFailure(ERROR_UNPROCESSED(error as Error));
    }
  }

  logSuccess(pingData: ICollectPingDataReqData) {
    console.info(
      `\x1b[32m[${new Date().toISOString()} INFO for pingId:${
        pingData.pingId
      }/attempt:${pingData.deliveryAttempt}]\x1b[0m\n\tpingId: ${
        pingData.pingId
      }\n\tdate: ${new Date(
        pingData.date
      )}\n\tresponseTime: {data.responseTime}\n\tdeliveryAttempt: ${
        pingData.deliveryAttempt
      }`
    );
  }
}

const pause = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));
