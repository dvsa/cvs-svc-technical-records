import {ERRORS} from "../assets/Enums";
import TechRecordsDAO from "../models/TechRecordsDAO";

export class NumberGenerator {

  private techRecordsDAO: TechRecordsDAO;

  constructor(techRecordsDAO: TechRecordsDAO) {
    this.techRecordsDAO = techRecordsDAO;
  }

  public async generateSystemNumber(): Promise<string> {
    try {
      const systemNumberObj = await this.techRecordsDAO.getSystemNumber();
      if (systemNumberObj.error) {
        return Promise.reject({statusCode: 500, body: systemNumberObj.error});
      }
      if (!systemNumberObj.systemNumber) {
        return Promise.reject({statusCode: 500, body: ERRORS.SYSTEM_NUMBER_GENERATION_FAILED});
      }
      return systemNumberObj.systemNumber;
    } catch (error) {
      return Promise.reject({statusCode: 500, body: error});
    }
  }

  public async generateTrailerId(): Promise<string> {
    try {
      const trailerIdObj = await this.techRecordsDAO.getTrailerId();
      if (trailerIdObj.error) {
        return Promise.reject({statusCode: 500, body: trailerIdObj.error});
      }
      if (!trailerIdObj.trailerId) {
        return Promise.reject({statusCode: 500, body: ERRORS.TRAILER_ID_GENERATION_FAILED});
      }
      return trailerIdObj.trailerId;
    } catch (error) {
      return Promise.reject({statusCode: 500, body: error});
    }
  }
}
