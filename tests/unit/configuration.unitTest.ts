import Configuration from "../../src/utils/Configuration";

describe("The configuration service", () => {
    context("with good config file", () => {
      it("should return local versions of the config if specified", () => {
        process.env.BRANCH = "local";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(7);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("postTechRecords");
        expect(functions[2].name).toEqual("updateTechRecords");
        expect(functions[3].name).toEqual("updateTechRecordStatus");
        expect(functions[4].name).toEqual("updateEuVehicleCategory");
        expect(functions[5].name).toEqual("addProvisionalTechRecord");
        expect(functions[6].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        const EndpointsConfig = configService.getEndpoints();

        expect(DBConfig).toEqual(configService.getConfig().dynamodb.local);
        expect(EndpointsConfig).toEqual(configService.getConfig().endpoints.local);
      });

      it("should return local-global versions of the config if specified", () => {
        process.env.BRANCH = "local-global";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(7);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("postTechRecords");
        expect(functions[2].name).toEqual("updateTechRecords");
        expect(functions[3].name).toEqual("updateTechRecordStatus");
        expect(functions[4].name).toEqual("updateEuVehicleCategory");
        expect(functions[5].name).toEqual("addProvisionalTechRecord");
        expect(functions[6].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        expect(DBConfig).toEqual(configService.getConfig().dynamodb["local-global"]);
      });

      it("should return remote versions of the config by default", () => {
        process.env.BRANCH = "CVSB-XXX";
        const configService = Configuration.getInstance();
        const functions = configService.getFunctions();
        expect(functions.length).toEqual(7);
        expect(functions[0].name).toEqual("getTechRecords");
        expect(functions[1].name).toEqual("postTechRecords");
        expect(functions[2].name).toEqual("updateTechRecords");
        expect(functions[3].name).toEqual("updateTechRecordStatus");
        expect(functions[4].name).toEqual("updateEuVehicleCategory");
        expect(functions[5].name).toEqual("addProvisionalTechRecord");
        expect(functions[6].name).toEqual("archiveTechRecordStatus");

        const DBConfig = configService.getDynamoDBConfig();
        const EndpointsConfig = configService.getEndpoints();
        expect(DBConfig).toEqual(configService.getConfig().dynamodb.remote);
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
