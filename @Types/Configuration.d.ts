export interface IParams {
    path: string,
    proxy: string,
    method: string,
    function: any
}

export interface IFunctions {
    [s: string]: IParams
}

interface IS3Config {
    endpoint: string;
}
