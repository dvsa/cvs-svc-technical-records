import { cloneDeep } from "lodash";
import mockData from "../../resources/technical-records.json";
import { STATUS, VEHICLE_TYPE, RECORD_COMPLETENESS } from '../../../src/assets/Enums';

import {
  Car,
  HeavyGoodsVehicle,
  LightGoodsVehicle,
  Motorcycle,
  PublicServiceVehicle,
  Trailer
} from "../../../@Types/TechRecords";
import IMsUserDetails from "../../../@Types/IUserDetails";
import * as processors from "../../../src/domain/Processors";

const msUserDetails: IMsUserDetails = {
  msOid: "1234",
  msUser: "Blabla"
};

describe("createVehicle", () => {
  context("When creating a vehicle", () => {
    context("and the payload is valid", () => {
      it("should pass the validation and return the validated payload for TRL", async () => {
        // @ts-ignore
        const techRec: Trailer = cloneDeep(mockData[132]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].bodyType.description = "articulated";
        techRec.techRecord[0].vehicleClass.description = "trailer";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber:() =>
            Promise.resolve({
              systemNumber: "WA1234"
            }),
            getTrailerId: () =>
              Promise.resolve({
                trailerId: "TR12345"
              })
          };
        });

        const trailerVehicle = new processors.TrailerProcessor(techRec, new MockDAO());
        // @ts-ignore
        const createdVehicle = await trailerVehicle.validateAndMapTechRecord(msUserDetails);
        expect(createdVehicle).toBeDefined();
        expect(createdVehicle.techRecord[0].bodyType.code).toEqual("a");
        expect(createdVehicle.techRecord[0].vehicleClass.code).toEqual("t");
        expect(createdVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(createdVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.TRL
        );
        expect(createdVehicle.techRecord[0].recordCompleteness).toEqual(
          RECORD_COMPLETENESS[0]
        );
      });

      it("should pass the validation and return the validated payload for PSV", async () => {
        // @ts-ignore
        const techRec: PublicServiceVehicle = cloneDeep(mockData[74]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].bodyType.description = "skeletal";
        techRec.techRecord[0].vehicleClass.description =
          "small psv (ie: less than or equal to 22 seats)";
        techRec.techRecord[0].brakes.brakeCode = "BR1234";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () =>
              Promise.resolve({
                systemNumber: "12345"
              })
          };
        });
        const psvVehicle = new processors.PsvProcessor(techRec, new MockDAO());
        // @ts-ignore
        const validatedVehicle = await psvVehicle.validateAndMapTechRecord(msUserDetails);
        expect(validatedVehicle).toBeDefined();
        expect(validatedVehicle.techRecord[0].bodyType.code).toEqual("k");
        expect(validatedVehicle.techRecord[0].vehicleClass.code).toEqual("s");
        expect(validatedVehicle.techRecord[0].brakes.brakeCodeOriginal).toEqual(
          "234"
        );
        expect(validatedVehicle.techRecord[0].brakeCode).toEqual("BR1234");
        expect(validatedVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.PSV
        );
      });

      it("should pass the validation and return the validated payload for HGV", async () => {
        // @ts-ignore
        const techRec: HeavyGoodsVehicle = cloneDeep(mockData[43]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].bodyType.description = "double decker";
        techRec.techRecord[0].vehicleClass.description = "heavy goods vehicle";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () =>
              Promise.resolve({
                systemNumber: "12345"
              })
          };
        });
        const hgvVehicle = new processors.HgvProcessor(techRec, new MockDAO());
        // @ts-ignore
        const validatedVehicle = await hgvVehicle.validateAndMapTechRecord(msUserDetails);
        expect(validatedVehicle).toBeDefined();
        expect(validatedVehicle.techRecord[0].bodyType.code).toEqual("d");
        expect(validatedVehicle.techRecord[0].vehicleClass.code).toEqual("v");
        expect(validatedVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.HGV
        );
      });

      it("should pass the validation and return the validated payload for LGV", async () => {
        // @ts-ignore
        const techRec: LightGoodsVehicle = cloneDeep(mockData[124]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].vehicleClass!.description =
          "motorbikes up to 200cc";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () =>
              Promise.resolve({
                systemNumber: "12345"
              })
          };
        });
        const lgvVehicle = new processors.LgvProcessor(techRec, new MockDAO());
        // @ts-ignore
        const validatedVehicle = await lgvVehicle.validateAndMapTechRecord(msUserDetails);
        expect(validatedVehicle).toBeDefined();
        expect(validatedVehicle.techRecord[0].vehicleClass!.code).toEqual("1");
        expect(validatedVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.LGV
        );
      });

      it("should pass the validation and return the validated payload for CAR", async () => {
        // @ts-ignore
        const techRec: Car = cloneDeep(mockData[123]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].vehicleClass!.description =
          "motorbikes up to 200cc";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () =>
              Promise.resolve({
                systemNumber: "12345"
              })
          };
        });
        const carVehicle = new processors.CarProcessor(techRec, new MockDAO());
        // @ts-ignore
        const validatedVehicle = await carVehicle.validateAndMapTechRecord(msUserDetails);
        expect(validatedVehicle).toBeDefined();
        expect(validatedVehicle.techRecord[0].vehicleClass!.code).toEqual("1");
        expect(validatedVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.CAR
        );
      });

      it("should pass the validation and return the validated payload for MOTORCYCLE", async () => {
        // @ts-ignore
        const techRec: Motorcycle = cloneDeep(mockData[122]);
        delete techRec.techRecord[0].statusCode;
        techRec.techRecord[0].vehicleClass.description =
          "motorbikes up to 200cc";
        const MockDAO = jest.fn().mockImplementation(() => {
          return {
            getSystemNumber: () =>
              Promise.resolve({
                systemNumber: "12345"
              })
          };
        });
        const motoVehicle = new processors.MotorcycleProcessor(techRec, new MockDAO());
        // @ts-ignore
        const validatedVehicle = await motoVehicle.validateAndMapTechRecord(msUserDetails);
        expect(validatedVehicle).toBeDefined();
        expect(validatedVehicle.techRecord[0].vehicleClass.code).toEqual("1");
        expect(validatedVehicle.techRecord[0].statusCode).toEqual(
          STATUS.PROVISIONAL
        );
        expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
          VEHICLE_TYPE.MOTORCYCLE
        );
      });

      context("when creating an LGV without vehicleClass field", () => {
        it("should not auto-populate vehicleClass", async () => {
          // @ts-ignore
          const techRec: LightGoodsVehicle = cloneDeep(mockData[124]);
          delete techRec.techRecord[0].vehicleClass;
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getSystemNumber: () =>
                Promise.resolve({
                  systemNumber: "12345"
                })
            };
          });
          const lgvVehicle = new processors.LgvProcessor(techRec, new MockDAO());
          // @ts-ignore
          const validatedVehicle = await lgvVehicle.validateAndMapTechRecord(
            msUserDetails
          );
          expect(validatedVehicle).toBeDefined();
          expect(validatedVehicle.techRecord[0]).not.toHaveProperty(
            "vehicleClass"
          );
          expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
            VEHICLE_TYPE.LGV
          );
        });
      });

      context("when creating a CAR without vehicleClass field", () => {
        it("should not auto-populate vehicleClass", async () => {
          // @ts-ignore
          const techRec: Car = cloneDeep(mockData[123]);
          delete techRec.techRecord[0].vehicleClass;
          const MockDAO = jest.fn().mockImplementation(() => {
            return {
              getSystemNumber: () =>
                Promise.resolve({
                  systemNumber: "12345"
                })
            };
          });
          const carVehicle = new processors.CarProcessor(techRec, new MockDAO());
          // @ts-ignore
          const validatedVehicle = await carVehicle.validateAndMapTechRecord(
            msUserDetails
          );
          expect(validatedVehicle).toBeDefined();
          expect(validatedVehicle.techRecord[0]).not.toHaveProperty(
            "vehicleClass"
          );
          expect(validatedVehicle.techRecord[0].vehicleType).toEqual(
            VEHICLE_TYPE.CAR
          );
        });
      });
      context("when the vin, partialVin, primaryVrm, secondaryVrms or trailerId for a tech-record contains lower case letters", () => {
      it("should capitalise the vin, partialVin, primaryVrm, secondaryVrms or trailerId", () => {
        // @ts-ignore
        const techRec: HeavyGoodsVehicle = cloneDeep(mockData[43]);
        techRec.vin = "abcd123456Nm";
        techRec.partialVin = "3456Nm";
        techRec.primaryVrm = "abd1234";
        techRec.secondaryVrms = ["nmb1234", "uio0985"];

        const MockDAO = jest.fn().mockImplementation();

        const hgvVehicle = new processors.HgvProcessor(techRec, new MockDAO());
        // @ts-ignore
        const expectedTechRecord = hgvVehicle.capitaliseGeneralVehicleAttributes(techRec);
        expect(expectedTechRecord.vin).toEqual("ABCD123456NM");
        expect(expectedTechRecord.partialVin).toEqual("3456NM");
        expect(expectedTechRecord.primaryVrm).toEqual("ABD1234");
        expect(expectedTechRecord.secondaryVrms).toEqual(["NMB1234", "UIO0985"]);
      });
    });
  });
});
});
