export interface IBaseStory<IReq, IRes> {
  execute(data: IReq): Promise<IRes> | IRes;
}
