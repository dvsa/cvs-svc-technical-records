import { CarLgvTechRecord, Vehicle } from "../../../../@Types/TechRecords";
import { EU_VEHICLE_CATEGORY, VEHICLE_TYPE } from "../../../../src/assets";
import { VehicleFactory } from "../../../../src/domain/VehicleFactory";
import TechRecordsDAO from "../../../../src/models/TechRecordsDAO";

describe("SmallTrailerProcessor", () => {
  const techRecordsDAO = new TechRecordsDAO();
  const smallTrailer = {
    systemNumber: "",
    vin: "",
    techRecord: [{ vehicleType: VEHICLE_TYPE.TRL, euVehicleCategory: EU_VEHICLE_CATEGORY.O1 }],
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
        vehicleSubclass: 'o1, o2',
        vehicleClass: {
          code: 123,
          description: "yolo",
        },
      } as unknown as CarLgvTechRecord;

      const validationErrors = vehicle["validateTechRecordFields"](newVehicle);

      expect(validationErrors.length).toBeTruthy();
    });

    it("passes validation", async () => {
      const newVehicle = { vehicleType: VEHICLE_TYPE.TRL, euVehicleCategory: EU_VEHICLE_CATEGORY.O1 } as unknown as CarLgvTechRecord;

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
