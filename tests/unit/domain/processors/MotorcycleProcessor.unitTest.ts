import { Motorcycle } from "../../../../@Types/TechRecords";
import { VEHICLE_TYPE } from "../../../../src/assets";
import { MotorcycleProcessor } from "../../../../src/domain/Processors";
import { NumberGenerator } from "../../../../src/handlers";
import TechRecordsDAO from "../../../../src/models/TechRecordsDAO";

describe("MotorcycleProcessor", () => {
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

      const vehicle = { techRecord: [{ vehicleType: VEHICLE_TYPE.MOTORCYCLE }] };
      const techRecordDao = new TechRecordsDAO();
      const motorcycle = new MotorcycleProcessor(vehicle as Motorcycle, techRecordDao);

      await motorcycle["setNumberKey"]();

      expect.assertions(4);
      expect(mockGenerateSystemNumber).toBeCalledTimes(1);
      expect(motorcycle['vehicle'].systemNumber).toBe('systemNumber');
      expect(mockGenerateZNumber).toBeCalledTimes(1);
      expect(motorcycle['vehicle'].primaryVrm).toBe('zNumber');
    });
  });
});
