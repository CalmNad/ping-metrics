import { IPingMetrics } from "@domain/entities";

import { IRes } from "@application/entities";

import { IBaseStory } from "./base-story";

export type ICalculatePingMetricsResData = IPingMetrics;

export type ICalculatePingMetricsReq = void;
export type ICalculatePingMetricsRes = IRes<ICalculatePingMetricsResData>;
export type ICalculatePingMetricsStory = IBaseStory<
  ICalculatePingMetricsReq,
  ICalculatePingMetricsRes
>;
// MEMO: token для DI контейнера
// export const TCalculatePingMetricsStory = Symbol('ICalculatePingMetricsStory');
