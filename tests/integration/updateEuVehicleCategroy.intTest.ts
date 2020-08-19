import {emptyDatabase, populateDatabase} from "../util/dbOperations";
import LambdaTester from "lambda-tester";
import {HTTPRESPONSE, EU_VEHICLE_CATEGORY, STATUS, UPDATE_TYPE} from "../../src/assets/Enums";
import {updateEuVehicleCategory} from "../../src/functions/updateEuVehicleCategory";
import ITechRecordWrapper from "../../@Types/ITechRecordWrapper";

describe("updateEuVehicleCategory", () => {

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
        it("should not update the euVehcileCategory if it is already set", async () => {
            const systemNumber: string = "11000027";
            expect.assertions(2);
            await LambdaTester(updateEuVehicleCategory)
                .event({
                    path: `/vehicles/update-eu-vehicle-category/${systemNumber}`,
                    pathParameters: {
                        systemNumber,
                    },
                    queryStringParameters: {
                        euVehicleCategory: "m1",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-eu-vehicle-category/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(200);
                    expect(JSON.parse(result.body)).toBe(HTTPRESPONSE.NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED);
                });
        });

        it("should return 200 and the updated vehicle if it has a euVehicleCategory as undefined", async () => {
            const systemNumber: string = "11000024";
            const createdByName = "dorel";
            const createdById = "1234";
            expect.assertions(11);
            await LambdaTester(updateEuVehicleCategory)
                .event({
                    path: `/vehicles/update-eu-vehicle-category/${systemNumber}`,
                    pathParameters: {
                        systemNumber,
                    },
                    queryStringParameters: {
                        euVehicleCategory: "m1",
                        createdByName,
                        createdById
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-eu-vehicle-category/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    const techRecordWrapper: ITechRecordWrapper = JSON.parse(result.body);
                    expect(result.statusCode).toBe(200);
                    expect(techRecordWrapper.techRecord.length).toBe(2);
                    expect(techRecordWrapper.techRecord[0].euVehicleCategory).toBe(undefined);
                    expect(techRecordWrapper.techRecord[0].statusCode).toEqual(STATUS.ARCHIVED);
                    expect(techRecordWrapper.techRecord[0].lastUpdatedByName).toEqual(createdByName);
                    expect(techRecordWrapper.techRecord[0].lastUpdatedById).toEqual(createdById);
                    expect(techRecordWrapper.techRecord[0].updateType).toEqual(UPDATE_TYPE.TECH_RECORD_UPDATE);
                    expect(techRecordWrapper.techRecord[1].euVehicleCategory).toBe(EU_VEHICLE_CATEGORY.M1);
                    expect(techRecordWrapper.techRecord[1].statusCode).toEqual(STATUS.CURRENT);
                    expect(techRecordWrapper.techRecord[1].createdById).toEqual(createdById);
                    expect(techRecordWrapper.techRecord[1].createdByName).toEqual(createdByName);
                });
        });

        it("should return 200 and the updated vehicle if it has a euVehicleCategory as null", async () => {
            const systemNumber: string = "11000023";
            expect.assertions(4);
            await LambdaTester(updateEuVehicleCategory)
                .event({
                    path: `/vehicles/update-eu-vehicle-category/${systemNumber}`,
                    pathParameters: {
                        systemNumber,
                    },
                    queryStringParameters: {
                        euVehicleCategory: "l1e-a",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-eu-vehicle-category/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(200);
                    const techRecordWrapper: ITechRecordWrapper = JSON.parse(result.body);
                    expect(techRecordWrapper.techRecord.length).toBe(2);
                    expect(techRecordWrapper.techRecord[0].euVehicleCategory).toBe(null);
                    expect(techRecordWrapper.techRecord[1].euVehicleCategory).toBe(EU_VEHICLE_CATEGORY.L1EA);
                });
        });

        it("should return 400 if the euVehicleCategory does not exist", async () => {
            const systemNumber: string = "10000023";
            expect.assertions(2);
            await LambdaTester(updateEuVehicleCategory)
                .event({
                    path: `/vehicles/update-eu-vehicle-category/${systemNumber}`,
                    pathParameters: {
                        systemNumber,
                    },
                    queryStringParameters: {
                        euVehicleCategory: "abc",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-eu-vehicle-category/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(400);
                    expect(JSON.parse(result.body)).toBe(HTTPRESPONSE.INVALID_EU_VEHICLE_CATEGORY);
                });
        });

        it("should return 404 if the vehicle does not exist", async () => {
            const systemNumber: string = "XXX";
            expect.assertions(2);
            await LambdaTester(updateEuVehicleCategory)
                .event({
                    path: `/vehicles/update-eu-vehicle-category/${systemNumber}`,
                    pathParameters: {
                        systemNumber,
                    },
                    queryStringParameters: {
                        euVehicleCategory: "m1",
                    },
                    httpMethod: "PUT",
                    resource: "/vehicles/update-eu-vehicle-category/{systemNumber}"
                })
                .expectResolve((result: any) => {
                    expect(result.statusCode).toBe(404);
                    expect(JSON.parse(result.body)).toBe(HTTPRESPONSE.RESOURCE_NOT_FOUND);
                });
        });
    });
});
