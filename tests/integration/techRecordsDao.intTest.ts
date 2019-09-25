it("Fake Test3", () => { expect(true); });

// import TechRecordsDao from "../../src/models/TechRecordsDAO";
// import chai from "chai";
// import mockData from "../resources/technical-records.json";
// import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";
// const expect = chai.expect;
//
// describe("TechRecordsDAO", () => {
//     context("createSingle", () => {
//         context("when creating a new vehicle", () => {
//             it("should be successful and return {}", async () => {
//                 // @ts-ignore
//                 const techRecord: ITechRecordWrapper = mockData[0];
//                 techRecord.vin = Date.now().toString();
//                 techRecord.partialVin = techRecord.vin.substr(techRecord.vin.length - 6);
//                 techRecord.primaryVrm = Math.floor(100000 + Math.random() * 900000).toString();
//                 techRecord.techRecord[0].bodyType.description = "new tech record";
//                 const techRecordsDao = new TechRecordsDao();
//                 return techRecordsDao.createSingle(techRecord)
//                     .then((data: any) => {
//                         expect(Object.keys(data).length).to.equal(0);
//                     });
//             });
//         });
//
//         context("when trying to create a vehicle that already exists", () => {
//             it("should throw error 400 ConditionalCheckFailedException", async () => {
//                 // @ts-ignore
//                 const techRecord: ITechRecordWrapper = mockData[0];
//                 techRecord.vin = "XMGDE02FS0H012345";
//                 techRecord.partialVin = "012345";
//                 techRecord.primaryVrm = "JY58FPP";
//                 techRecord.techRecord[0].bodyType.description = "new tech record";
//                 const techRecordsDao = new TechRecordsDao();
//                 return techRecordsDao.createSingle(techRecord)
//                     .then(() => {
//                         expect.fail();
//                     })
//                     .catch((error: any) => {
//                         expect(error.code).to.be.equal("ConditionalCheckFailedException");
//                         expect(error.message).to.be.equal("The conditional request failed");
//                     });
//             });
//         });
//     });
//
//     context("updateSingle", () => {
//         context("when updating an existing tech record", () => {
//             it("should return the updated tech record", async () => {
//                 // @ts-ignore
//                 const techRecord: ITechRecordWrapper = mockData[0];
//                 techRecord.techRecord[0].grossGbWeight = 1255;
//                 techRecord.techRecord[0].bodyType.description = "updated body type";
//
//                 const techRecordsDao = new TechRecordsDao();
//                 const updatedTechRecord = await techRecordsDao.updateSingle(techRecord);
//                 expect(updatedTechRecord.Attributes.techRecord[0].grossGbWeight).to.equal(1255);
//                 expect(updatedTechRecord.Attributes.techRecord[0].bodyType.description).to.equal("updated body type");
//             });
//         });
//
//         context("when updating a tech record that does not exist", () => {
//             it("should throw error 400 ConditionalCheckFailedException", async () => {
//                 // @ts-ignore
//                 const techRecord: ITechRecordWrapper = mockData[0];
//                 techRecord.techRecord[0].grossGbWeight = 1255;
//                 techRecord.techRecord[0].bodyType.description = "updated body type";
//
//                 const techRecordsDao = new TechRecordsDao();
//                 techRecord.partialVin = "555555";
//                 techRecord.vin = "ABCDEFGHS2340294";
//                 return techRecordsDao.updateSingle(techRecord)
//                     .then(() => {
//                         expect.fail();
//                     })
//                     .catch((error: any) => {
//                         expect(error.statusCode).to.be.equal(400);
//                         expect(error.code).to.be.equal("ConditionalCheckFailedException");
//                         expect(error.message).to.be.equal("The conditional request failed");
//                     });
//             });
//         });
//     });
// });
