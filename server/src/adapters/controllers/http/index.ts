import { IncomingMessage, ServerResponse } from "http";

import {
  ICollectPingDataStory,
  ICollectPingDataReqData,
} from "@ports/stories/collect-ping-data.port";

export const makeRouter = (controller: PingDataController) => ({
  "/data": {
    POST: (
      req: IncomingMessage,
      res: ServerResponse,
      data: ICollectPingDataReqData
    ) => controller.collectPingData(req, res, data),
  },
});

export class PingDataController {
  constructor(private story: ICollectPingDataStory) {}

  public async collectPingData(
    req: IncomingMessage,
    res: ServerResponse,
    data: ICollectPingDataReqData
  ): Promise<void> {
    try {
      const result = await this.story.execute({ data });
      if (result.success) {
        res.statusCode = 200;
        res.end("OK");
      } else {
        res.statusCode = 500;
        res.end("");
      }
    } catch (error) {
      console.error(
        "\x1b[31m[FAIL PingDataController]\x1b[0m unprocessed error:",
        error,
        data
      );
    }
  }
}
