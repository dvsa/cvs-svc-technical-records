export class Validator {
  // tslint:disable-next-line: no-empty
  public constructor() {}

  /**
   * Validate query or path parameter provided in the request
   * @returns boolean Result of logic determining validity
   * @param parameters This is expecting an object as a parameter
   */
  public parametersAreValid<T extends string>(parameters: T): boolean {
    let isValid: boolean = true;
    for (const key of Object.keys(parameters)) {
      const value: string = Object.values(parameters)[key.indexOf(key)];
      if (value) {
        if (value.trim().length === 0 || value === "undefined" || value === "null") {
          isValid = false;
          break;
        }
      } else {
        isValid = false;
        break;
      }
    }
    return isValid;
  }
}
