import { cloneDeep } from "lodash";
import { CarLgvTechRecord, Vehicle } from "../../../../@Types/TechRecords";
import { VEHICLE_TYPE } from "../../../../src/assets";
import { VehicleFactory } from "../../../../src/domain/VehicleFactory";
import TechRecordsDAO from "../../../../src/models/TechRecordsDAO";
import records from "../../../resources/technical-records.json";

describe("SmallTrailerProcessor", () => {
  const techRecordsDAO = new TechRecordsDAO();
  const smallTrailer = {
    systemNumber: "",
    vin: "",
    techRecord: [{ vehicleType: VEHICLE_TYPE.SMALL_TRL }],
  } as Vehicle;
  const vehicle = VehicleFactory.generateVehicleInstance(
    smallTrailer,
    techRecordsDAO
  );

  beforeAll(() => {
    jest.resetAllMocks();
  });

  it("setNumberKey returns 123", async () => {
    await vehicle["setNumberKey"]();
    expect(vehicle["vehicle"].systemNumber).toBe("123");
  });

  context("validateTechRecordFields", () => {
    it("fails validation", async () => {
      const newVehicle = {
        vehicleSubclass: [],
        vehicleClass: {
          code: "",
          description: "",
        },
      } as unknown as CarLgvTechRecord;

      const validationErrors = vehicle["validateTechRecordFields"](newVehicle);

      expect(validationErrors.length).toBeTruthy();
    });

    it("passes validation", async () => {
      const newVehicle = {
        vehicleType: VEHICLE_TYPE.SMALL_TRL,
      } as unknown as CarLgvTechRecord;

      const validationErrors = vehicle["validateTechRecordFields"](newVehicle!);

      expect(validationErrors.length).toBeFalsy();
    });
  });

  context("mapFields", () => {
    it("passes validation", async () => {
      const newVehicle = {
        vehicleClass: {
          code: "",
          description: "trailer",
        },
      } as unknown as CarLgvTechRecord;

      const mappedRecord = vehicle["mapFields"](newVehicle) as CarLgvTechRecord;

      expect(mappedRecord?.vehicleClass?.code).toBe("t");
    });
  });
});
