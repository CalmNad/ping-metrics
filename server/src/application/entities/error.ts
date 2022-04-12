export type IError = {
  code: string;
  message: string;
};

// общие костанты для всего app
export const ERROR_UNPROCESSED = (error: Error) => ({
  code: "ERROR_UNPROCESSED",
  message: `Unprocessed error: ${error.message}`,
});
