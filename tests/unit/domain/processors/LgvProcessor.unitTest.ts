import { Car } from "../../../../@Types/TechRecords";
import { VEHICLE_TYPE } from "../../../../src/assets";
import { LgvProcessor } from "../../../../src/domain/Processors";
import { NumberGenerator } from "../../../../src/handlers";
import TechRecordsDAO from "../../../../src/models/TechRecordsDAO";

describe("LgvProcessor", () => {
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

      const vehicle = { techRecord: [{ vehicleType: VEHICLE_TYPE.LGV }] };
      const techRecordDao = new TechRecordsDAO();
      const lgv = new LgvProcessor(vehicle as Car, techRecordDao);

      await lgv["setNumberKey"]();

      expect.assertions(4);
      expect(mockGenerateSystemNumber).toBeCalledTimes(1);
      expect(lgv['vehicle'].systemNumber).toBe('systemNumber');
      expect(mockGenerateZNumber).toBeCalledTimes(1);
      expect(lgv['vehicle'].primaryVrm).toBe('zNumber');
    });
  });
});
