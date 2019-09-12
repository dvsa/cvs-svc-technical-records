import TechRecordsDAO from "../../src/models/TechRecordsDAO";
import TechRecordsService from "../../src/services/TechRecordsService";
import * as fs from "fs";
import * as path from "path";

export const populateDatabase = () => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);
    // tslint:disable-next-line:no-shadowed-variable
    const mockBuffer = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/technical-records.json"), "utf8"));
    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    return batches.forEach(async (batch: any) => {
        return await techRecordsService.insertTechRecordsList(batch);
    });
};

export const emptyDatabase = () => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);
    const mockBuffer = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/technical-records.json"), "utf8"));

    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    return batches.forEach(async (batch) => {
        return await techRecordsService.deleteTechRecordsList(
            batch.map((mock: any) => {
                return [mock.partialVin, mock.vin];
            })
        );
    });
};
