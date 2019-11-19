import TechRecordsDAO from "../../src/models/TechRecordsDAO";
import techRecords from "../resources/technical-records.json";
import * as _ from "lodash";

export const populateDatabase = async () => {
    const mockBuffer = _.cloneDeep(techRecords);
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
    const mockBuffer = _.cloneDeep(techRecords).map((record) => [record.partialVin, record.vin]);
    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    for (const batch of batches) {
        await techRecordsDAO.deleteMultiple(batch);
    }
};

export const convertToResponse = (dbObj: any) => { // Needed to convert an object from the database to a response object
    const responseObj = Object.assign({}, dbObj);

    // Adding primary and secondary VRMs in the same array
    const vrms: any = [{ isPrimary: true }];
    if (responseObj.primaryVrm) { vrms[0].vrm = responseObj.primaryVrm; }
    if (responseObj.secondaryVrms) {
        for (const secondaryVrm of responseObj.secondaryVrms) {
            vrms.push({vrm: secondaryVrm, isPrimary: false});
        }
    }
    Object.assign(responseObj, {
        vrms
    });

    // Cleaning up unneeded properties
    delete responseObj.primaryVrm; // No longer needed
    delete responseObj.secondaryVrms; // No longer needed
    delete responseObj.partialVin; // No longer needed

    responseObj.techRecord.forEach((techRecord: any) => {
        if (techRecord.euroStandard !== undefined && techRecord.euroStandard !== null) {
          techRecord.euroStandard = techRecord.euroStandard.toString();
        }
        if (techRecord.adrDetails) {
            if (techRecord.adrDetails.documents) {
                techRecord.adrDetails.documents = techRecord.adrDetails.documents.map((document: string) => {
                    const filename = document.split("/");
                    if (filename.length > 1) {
                        return document.split("/")[1];
                    } else {
                        return filename[0];
                    }
                });
            } else {
                techRecord.adrDetails.documents = [];
            }
        }
      });

    return responseObj;
};

export const convertTo7051Response = (dbObj: any, resolvedRecordIndex: number) => { // Needed to convert an object from the database to a response object
    const responseObj = convertToResponse(_.cloneDeep(dbObj));


    // replace techRecord with resolvedRecordIndex
    const resolvedRecord = _.cloneDeep(responseObj.techRecord[resolvedRecordIndex]);
    responseObj.techRecord.length = 0;
    responseObj.techRecord.push(resolvedRecord);

    return responseObj;
};
