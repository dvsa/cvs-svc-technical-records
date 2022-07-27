import Configuration from "../../../src/utils/Configuration";

describe("The configuration service", () => {
    context("with good config file", () => {
      it("should return local versions of the config if specified", () => {
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(14);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("getTechRecordsV2");
        expect(functions[2].name).toEqual("postTechRecords");
        expect(functions[3].name).toEqual("postTechRecords");
        expect(functions[4].name).toEqual("updateTechRecords");
        expect(functions[5].name).toEqual("updateTechRecords");
        expect(functions[6].name).toEqual("updateTechRecordStatus");
        expect(functions[7].name).toEqual("updateTechRecordStatus");
        expect(functions[8].name).toEqual("updateEuVehicleCategory");
        expect(functions[9].name).toEqual("updateEuVehicleCategory");
        expect(functions[10].name).toEqual("addProvisionalTechRecord");
        expect(functions[11].name).toEqual("addProvisionalTechRecord");
        expect(functions[12].name).toEqual("archiveTechRecordStatus");
        expect(functions[13].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        const EndpointsConfig = configService.getEndpoints();

        expect(DBConfig).toEqual(configService.getConfig().dynamodb.local);
        expect(EndpointsConfig).toEqual(configService.getConfig().endpoints.local);
      });

      it("should return local-global versions of the config if specified", () => {
        process.env.BRANCH = "local-global";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(14);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("getTechRecordsV2");
        expect(functions[2].name).toEqual("postTechRecords");
        expect(functions[3].name).toEqual("postTechRecords");
        expect(functions[4].name).toEqual("updateTechRecords");
        expect(functions[5].name).toEqual("updateTechRecords");
        expect(functions[6].name).toEqual("updateTechRecordStatus");
        expect(functions[7].name).toEqual("updateTechRecordStatus");
        expect(functions[8].name).toEqual("updateEuVehicleCategory");
        expect(functions[9].name).toEqual("updateEuVehicleCategory");
        expect(functions[10].name).toEqual("addProvisionalTechRecord");
        expect(functions[11].name).toEqual("addProvisionalTechRecord");
        expect(functions[12].name).toEqual("archiveTechRecordStatus");
        expect(functions[13].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        expect(DBConfig).toEqual(configService.getConfig().dynamodb["local-global"]);
      });

      it("should return remote v1 versions of the config by default", () => {
        process.env.BRANCH = "CVSB-XXX";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(14);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("getTechRecordsV2");
        expect(functions[2].name).toEqual("postTechRecords");
        expect(functions[3].name).toEqual("postTechRecords");
        expect(functions[4].name).toEqual("updateTechRecords");
        expect(functions[5].name).toEqual("updateTechRecords");
        expect(functions[6].name).toEqual("updateTechRecordStatus");
        expect(functions[7].name).toEqual("updateTechRecordStatus");
        expect(functions[8].name).toEqual("updateEuVehicleCategory");
        expect(functions[9].name).toEqual("updateEuVehicleCategory");
        expect(functions[10].name).toEqual("addProvisionalTechRecord");
        expect(functions[11].name).toEqual("addProvisionalTechRecord");
        expect(functions[12].name).toEqual("archiveTechRecordStatus");
        expect(functions[13].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        const EndpointsConfig = configService.getEndpoints();
        expect(DBConfig).toEqual(configService.getConfig().dynamodb.remote);
        expect(EndpointsConfig).toEqual(configService.getConfig().endpoints.remote);
      });

      it("should return remote v2 versions of the config by default", () => {
        process.env.BRANCH = "CVSB-XXX";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(14);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("getTechRecordsV2");
        expect(functions[2].name).toEqual("postTechRecords");
        expect(functions[3].name).toEqual("postTechRecords");
        expect(functions[4].name).toEqual("updateTechRecords");
        expect(functions[5].name).toEqual("updateTechRecords");
        expect(functions[6].name).toEqual("updateTechRecordStatus");
        expect(functions[7].name).toEqual("updateTechRecordStatus");
        expect(functions[8].name).toEqual("updateEuVehicleCategory");
        expect(functions[9].name).toEqual("updateEuVehicleCategory");
        expect(functions[10].name).toEqual("addProvisionalTechRecord");
        expect(functions[11].name).toEqual("addProvisionalTechRecord");
        expect(functions[12].name).toEqual("archiveTechRecordStatus");
        expect(functions[13].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig("v2");
        const EndpointsConfig = configService.getEndpoints();
        expect(DBConfig).toEqual(configService.getConfig().dynamodb["remote-v2"]);
        expect(EndpointsConfig).toEqual(configService.getConfig().endpoints.remote);
      });
    });

    context("with bad config file", () => {
      it("should return an error for missing functions from getFunctions", () => {
        const config = new Configuration("../../tests/resources/badConfig.yml");
        try {
          config.getFunctions();
        } catch (e) {
          expect(e.message).toEqual("Functions were not defined in the config file.");
        }
      });

      it("should return an error for missing DB Config from getDynamoDBConfig", () => {
        const config = new Configuration("../../tests/resources/badConfig.yml");
        try {
          config.getDynamoDBConfig();
        } catch (e) {
          expect(e.message).toEqual("DynamoDB config is not defined in the config file.");
        }
      });

      it("should return an error for missing endpoints Config from getEndpoints", () => {
        const config = new Configuration("../../tests/resources/badConfig.yml");
        try {
          config.getEndpoints();
        } catch (e) {
          expect(e.message).toEqual("Endpoints were not defined in the config file.");
        }
      });
    });
  });
