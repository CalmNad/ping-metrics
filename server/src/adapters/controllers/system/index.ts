import { ICalculatePingMetricsStory } from "@ports/stories/calculate-ping-metrics.port";

export const initSystemControllers = (
  controller: CalculatePingMetricsController
) => {
  process.on("SIGINT", async () => {
    await controller.calculatePingMetrics();
    process.exit(0);
  });
};

export class CalculatePingMetricsController {
  constructor(private story: ICalculatePingMetricsStory) {}

  public async calculatePingMetrics(): Promise<void> {
    const result = await this.story.execute();

    if (result.success) {
      console.info("\nserver ping metrics:", result.data);
    } else {
      console.error(
        "\n\x1b[31m[FAIL CalculatePingMetricsController]\x1b[0m can't get metrics' data"
      );
    }
  }
}
