import TechRecordsDao from "../../src/models/TechRecordsDAO";
import mockData from "../resources/technical-records.json";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

describe("TechRecordsDAO", () => {
  context("createSingle", () => {
    context("when creating a new vehicle", () => {
      it("should be successful and return {}", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = {...mockData[0]};
        techRecord.vin = Date.now().toString();
        techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
        techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
        techRecord.techRecord[0].bodyType.description = "new tech record";
        const techRecordsDao = new TechRecordsDao();
        const data: any = await techRecordsDao.createSingle(techRecord);
        expect(Object.keys(data).length).toEqual(0);
      });
    });

    context("when trying to create a vehicle that already exists", () => {
      it("should throw error 400 ConditionalCheckFailedException", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = {...mockData[0]};
        techRecord.vin = "XMGDE02FS0H012345";
        techRecord.partialVin = "012345";
        techRecord.primaryVrm = "JY58FPP";
        techRecord.techRecord[0].bodyType.description = "new tech record";
        const techRecordsDao = new TechRecordsDao();
        try {
          expect(await techRecordsDao.createSingle(techRecord)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse.code).toEqual("ConditionalCheckFailedException");
          expect(errorResponse.message).toEqual("The conditional request failed");
        }
      });
    });
  });

  context("updateSingle", () => {
    context("when updating an existing tech record", () => {
      it("should return the updated tech record", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = {...mockData[0]};
        techRecord.techRecord[0].grossGbWeight = 1255;
        techRecord.techRecord[0].bodyType.description = "updated body type";

        const techRecordsDao = new TechRecordsDao();
        const updatedTechRecord: any = await techRecordsDao.updateSingle(techRecord);
        expect(updatedTechRecord.Attributes).not.toEqual(undefined);
        expect(updatedTechRecord.Attributes.techRecord[0].grossGbWeight).toEqual(1255);
        expect(updatedTechRecord.Attributes.techRecord[0].bodyType.description).toEqual("updated body type");
      });
    });

    context("when updating a tech record that does not exist", () => {
      it("should throw error 400 ConditionalCheckFailedException", async () => {
        // @ts-ignore
        const techRecord: ITechRecordWrapper = {...mockData[0]};
        techRecord.techRecord[0].grossGbWeight = 1255;
        techRecord.techRecord[0].bodyType.description = "updated body type";

        const techRecordsDao = new TechRecordsDao();
        techRecord.partialVin = "555555";
        techRecord.vin = "ABCDEFGHS2340294";
        try {
          expect(await techRecordsDao.updateSingle(techRecord)).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse.statusCode).toEqual(400);
          expect(errorResponse.code).toEqual("ConditionalCheckFailedException");
          expect(errorResponse.message).toEqual("The conditional request failed");
        }
      });
    });
  });
});
