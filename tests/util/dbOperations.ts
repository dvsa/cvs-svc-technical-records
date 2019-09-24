import TechRecordsDAO from "../../src/models/TechRecordsDAO";
import techRecords from "../resources/technical-records.json";

export const populateDatabase = async () => {
    const mockBuffer = [...techRecords];
    const techRecordsDAO = new TechRecordsDAO();
    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    for (const batch of batches) {
        // @ts-ignore
        await techRecordsDAO.createMultiple(batch);
    }
};

export const emptyDatabase = async () => {
    const techRecordsDAO = new TechRecordsDAO();
    const mockBuffer = [...techRecords].map((record) => [record.partialVin, record.vin]);
    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    for (const batch of batches) {
        await techRecordsDAO.deleteMultiple(batch);
    }
};
