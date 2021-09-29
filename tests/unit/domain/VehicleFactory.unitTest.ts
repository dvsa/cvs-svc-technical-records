import { cloneDeep } from "lodash";
import mockData from "../../resources/technical-records.json";
import {
  Car,
  HeavyGoodsVehicle,
  LightGoodsVehicle,
  Motorcycle,
  PublicServiceVehicle,
  Trailer
} from "../../../@Types/TechRecords";
import IMsUserDetails from "../../../@Types/IUserDetails";
import { VehicleFactory } from "../../../src/domain/VehicleFactory";
import { ERRORS } from "../../../src/assets/Enums";
import { ErrorHandler } from "../../../src/handlers/ErrorHandler";

const msUserDetails: IMsUserDetails = {
  msOid: "1234",
  msUser: "Blabla"
};

describe("VehicleFactory", () => {
  context("generateVehicleInstance", () => {
    context("When the payload is valid", () => {
      it("should create processor instance for PSV vehicle type", async () => {
        // @ts-ignore
        const techRec: PublicServiceVehicle = cloneDeep(mockData[0]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("PsvProcessor");
      });

      it("should create HgvProcessor instance for HGV vehicle type", async () => {
        // @ts-ignore
        const techRec: HeavyGoodsVehicle = cloneDeep(mockData[12]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("HgvProcessor");
      });

      it("should create TrailerProcessor instance for TRL vehicle type", async () => {
        // @ts-ignore
        const techRec: Trailer = cloneDeep(mockData[13]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("TrailerProcessor");
      });

      it("should create LgvProcessor instance for Lgv vehicle type", async () => {
        // @ts-ignore
        const techRec: LightGoodsVehicle = cloneDeep(mockData[76]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("LgvProcessor");
      });

      it("should create CarProcessor instance for CAR vehicle type", async () => {
        // @ts-ignore
        const techRec: Car = cloneDeep(mockData[123]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("CarProcessor");
      });

      it("should create MotorcycleProcessor instance for MOTORCYCLE vehicle type", async () => {
        // @ts-ignore
        const techRec: Motorcycle = cloneDeep(mockData[77]);
        const MockDAO = jest.fn().mockImplementation();

        const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        expect.assertions(2);
        expect(processor).toBeDefined();
        expect(processor.constructor.name).toEqual("MotorcycleProcessor");
      });
    });

    context("When the payload is invalid", () => {
      it("should throw error", async () => {
        // @ts-ignore
        const techRec: Motorcycle = cloneDeep(mockData[77]);
        const MockDAO = jest.fn().mockImplementation();
        techRec.techRecord[0].vehicleType = "WRONG_TYPE";
        try{
          const processor = VehicleFactory.generateVehicleInstance(techRec, new MockDAO());
        } catch(error) {
          expect.assertions(1);
          expect(error).toEqual(ErrorHandler.Error(400,ERRORS.INVALID_VEHICLE_TYPE));
        }
      });
    });
  });
});
