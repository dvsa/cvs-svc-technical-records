import HTTPError from "../models/HTTPError";

export class ErrorHandler {

    public static formatErrorMessage = (errorMessage: string | string []) => {
        return {
          errors: Array.isArray(errorMessage)? errorMessage : Array.of(errorMessage)
        };
    }
    public static Error = (status: number, body: string | string []) =>
                         new HTTPError(status, ErrorHandler.formatErrorMessage(body))
}
