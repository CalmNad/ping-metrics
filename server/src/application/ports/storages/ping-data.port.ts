export type IAddPingDataReq = {
  pingId: number;
  responseTime: number;
};
export type IAddPingDataRes = void;

export type IGetPingsDataReq = void;
export type IGetPingsDataRes = {
  responseTimes: number[];
};

export interface IPingDataStorage {
  addPingData(data: IAddPingDataReq): Promise<IAddPingDataRes>;
  getPingsData(data: IGetPingsDataReq): Promise<IGetPingsDataRes>;
}
// MEMO: token для DI контейнера
// export const TPingDataStorage = Symbol("IPingDataStorage");
