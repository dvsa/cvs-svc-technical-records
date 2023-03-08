import { Car } from "../../../../@Types/TechRecords";
import { VEHICLE_TYPE } from "../../../../src/assets";
import { CarProcessor } from "../../../../src/domain/Processors";
import { NumberGenerator } from "../../../../src/handlers";
import TechRecordsDAO from "../../../../src/models/TechRecordsDAO";

describe("CarProcessor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  context("setNumberKey", () => {
    it("should try to generate systemNumber and z number", async () => {
      const mockGenerateSystemNumber = jest
        .fn()
        .mockResolvedValue("systemNumber");
      const mockGenerateZNumber = jest.fn().mockResolvedValue("zNumber");
      NumberGenerator.prototype.generateSystemNumber = mockGenerateSystemNumber;
      NumberGenerator.prototype.generateZNumber = mockGenerateZNumber;

      const vehicle = { techRecord: [{ vehicleType: VEHICLE_TYPE.CAR }] };
      const techRecordDao = new TechRecordsDAO();
      const car = new CarProcessor(vehicle as Car, techRecordDao);

      await car["setNumberKey"]();

      expect.assertions(4);
      expect(mockGenerateSystemNumber).toBeCalledTimes(1);
      expect(car['vehicle'].systemNumber).toBe('systemNumber');
      expect(mockGenerateZNumber).toBeCalledTimes(1);
      expect(car['vehicle'].primaryVrm).toBe('zNumber');
    });
  });
});
