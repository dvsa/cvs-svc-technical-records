export interface IParams {
    path: string,
    proxy: string,
    method: string,
    function: any
}

export interface IFunctions {
    [s: string]: IParams
}
