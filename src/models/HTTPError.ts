/**
 * Defines a throwable subclass of Error used for signaling an HTTP status code.
 */
class HTTPError extends Error {
  public statusCode: number;
  public body: any;

  /**
   * Constructor for the HTTPResponseError class
   * @param statusCode the HTTP status code
   * @param body - the response body
   * @param headers - optional - the response headers
   */
  constructor(statusCode: number, body: any) {
    super();
    this.statusCode = statusCode;
    this.body = body;
  }
}

export default HTTPError;
