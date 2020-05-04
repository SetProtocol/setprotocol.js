export declare enum LogType {
    Info = 0,
    Warn = 1,
    Err = 2
}
export declare enum LogLevel {
    Normal = 0,
    Verbose = 1,
    Silent = 2
}
export declare enum SpinnerAction {
    Add = "spinning",
    Update = "update",
    Fail = "fail",
    Succeed = "succeed",
    NonSpinnable = "non-spinnable"
}
export declare const Loggy: {
    [key: string]: any;
};
