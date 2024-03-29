import {emptyDatabase, populateDatabase} from "../util/dbOperations";
import LambdaTester from "lambda-tester";
import {HTTPRESPONSE, STATUS} from "../../src/assets/Enums";
import {updateTechRecordStatus} from "../../src/functions/updateTechRecordStatus";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

describe("UpdateTechRecordStatus", () => {

    beforeAll(async () => {
        jest.restoreAllMocks();
        // await emptyDatabase();
        await populateDatabase();
    });
    beforeEach(async () => {
        // await populateDatabase();
    });
    afterEach(async () => {
        // await emptyDatabase();
    });
    afterAll(async () => {
        // await populateDatabase();
        await emptyDatabase();
    });

    context("when trying to update a vehicle", () => {
        it("should return 200 and the updated vehicle if it has a provisional techRecord", async () => {
            const systemNumber: string = "11000027";
            expect.assertions(4);
            await LambdaTester(updateTechRecordStatus)
                .event({
                    path: "/vehicles/update-status/" + systemNumber,
                    pathParameters: {
                      systemNumber,
                    },
                    queryStringParameters: {
                        testStatus: "submitted",
                        testResult: "pass",
                        testTypeId: "47",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-status/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(200);
                    const techRecordWrapper: ITechRecordWrapper = JSON.parse(result.body);
                    expect(techRecordWrapper.techRecord.length).toBe(2);
                    expect(techRecordWrapper.techRecord[0].statusCode).toBe(STATUS.ARCHIVED);
                    expect(techRecordWrapper.techRecord[1].statusCode).toBe(STATUS.CURRENT);
                });
        });

        it("should return 400 if the vehicle status cannot be updated", async () => {
            const systemNumber: string = "11000032";
            expect.assertions(2);
            await LambdaTester(updateTechRecordStatus)
                .event({
                    path: "/vehicles/update-status/" + systemNumber,
                    pathParameters: {
                      systemNumber,
                    },
                    queryStringParameters: {
                        testStatus: "submitted",
                        testResult: "pass",
                        testTypeId: "47",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-status/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(400);
                    expect(JSON.parse(result.body)).toBe("The tech record status cannot be updated to current");
                });
        });

        it("should return 404 if the vehicle does not exist", async () => {
            const systemNumber: string = "XXX";
            expect.assertions(2);
            await LambdaTester(updateTechRecordStatus)
                .event({
                    path: "/vehicles/update-status/" + systemNumber,
                    pathParameters: {
                      systemNumber,
                    },
                    queryStringParameters: {
                        testStatus: "submitted",
                        testResult: "pass",
                        testTypeId: "47",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-status/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(404);
                    // FIXME: array to string
                    expect(JSON.parse(result.body).errors).toContain(HTTPRESPONSE.RESOURCE_NOT_FOUND);
                });
        });

        it("should return an error 200 and the updated vehicle with duplicate system number", async () => {
            const systemNumber: string = "30000011";
            expect.assertions(4);
            await LambdaTester(updateTechRecordStatus)
                .event({
                    path: "/vehicles/update-status/" + systemNumber,
                    pathParameters: {
                      systemNumber,
                    },
                    queryStringParameters: {
                        testStatus: "submitted",
                        testResult: "pass",
                        testTypeId: "47",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-status/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(200);
                    const techRecordWrapper: ITechRecordWrapper = JSON.parse(result.body);
                    expect(techRecordWrapper.techRecord.length).toBe(2);
                    expect(techRecordWrapper.techRecord[0].statusCode).toBe(STATUS.ARCHIVED);
                    expect(techRecordWrapper.techRecord[1].statusCode).toBe(STATUS.CURRENT);
                });
        });
    });
});
