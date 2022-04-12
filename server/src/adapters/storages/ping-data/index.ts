import {
  IAddPingDataReq,
  IAddPingDataRes,
  IGetPingsDataReq,
  IGetPingsDataRes,
  IPingDataStorage,
} from "@ports/storages/ping-data.port";

export class PingDataStorage implements IPingDataStorage {
  private responseTimes: Map<number, number> = new Map();

  async addPingData(data: IAddPingDataReq): Promise<IAddPingDataRes> {
    this.responseTimes.set(data.pingId, data.responseTime);
  }

  async getPingsData(data: IGetPingsDataReq): Promise<IGetPingsDataRes> {
    const responseTimes: number[] = Array.from(this.responseTimes.values());

    return { responseTimes };
  }
}
