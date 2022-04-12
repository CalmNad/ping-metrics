import { IReq, IRes } from "@application/entities";

import { IBaseStory } from "./base-story";

export type ICollectPingDataReqData = {
  pingId: number;
  deliveryAttempt: number;
  date: number;
  responseTime: number;
};
export type ICollectPingDataResData = {
  done: boolean;
};

export type ICollectPingDataReq = IReq<ICollectPingDataReqData>;
export type ICollectPingDataRes = IRes<ICollectPingDataResData>;
export type ICollectPingDataStory = IBaseStory<
  ICollectPingDataReq,
  ICollectPingDataRes
>;
// MEMO: token для DI контейнера
// export const TCollectPingDataStory = Symbol('ICollectPingDataStory');
