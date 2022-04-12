import {
  ICalculatePingMetricsStory,
  ICalculatePingMetricsRes,
  ICalculatePingMetricsResData,
} from "@ports/stories/calculate-ping-metrics.port";
import { IPingDataStorage } from "@ports/storages";

import {
  ResSuccess,
  ResFailure,
  ERROR_UNPROCESSED,
} from "@application/entities";

export class CalculatePingMetricsStory implements ICalculatePingMetricsStory {
  constructor(private pingDataStorage: IPingDataStorage) {}

  public async execute(): Promise<ICalculatePingMetricsRes> {
    try {
      const { responseTimes } = await this.pingDataStorage.getPingsData();

      const mean = this.calculateMeanPing(responseTimes);
      const median = this.calculateMedianPing(responseTimes);

      return new ResSuccess<ICalculatePingMetricsResData>({ mean, median });
    } catch (error) {
      return new ResFailure(ERROR_UNPROCESSED(error as Error));
    }
  }

  private calculateMeanPing(responseTimes: number[]): number {
    // MEMO: граничное условие: нет данных по пингу
    if (responseTimes.length < 1) {
      return 0;
    }

    return (
      responseTimes.reduce((acc, num) => acc + num, 0) / responseTimes.length
    );
  }

  private calculateMedianPing(responseTimes: number[]): number {
    // MEMO: граничное условие: нет данных по пингу
    if (responseTimes.length < 1) {
      return 0;
    }

    responseTimes.sort((a, b) => a - b);

    const meanIdx = responseTimes.length >> 1;

    // MEMO: для нечетного количества данных - центральное значение отсортированного массива
    if (responseTimes.length % 2) {
      return responseTimes[meanIdx];
    }
    // MEMO: для четного количества данных - среднее арифметическое двух центральных значений отсортированного массива
    return (responseTimes[meanIdx - 1] + responseTimes[meanIdx]) / 2;
  }
}
