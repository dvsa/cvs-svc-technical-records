export default interface ITechRecord {
    createdAt: string;
    lastUpdatedAt: string;
    chassisMake: string;
    chassisModel: string;
    bodyMake: string;
    bodyModel: string;
    bodyType: {
        code: string,
        description: string
    };
    manufactureYear: number;
    regnDate: string;
    coifDate: string;
    ntaNumber: string;
    conversionRefNo: string;
    seatsLowerDeck: number;
    seatsUpperDeck: number;
    standingCapacity: number;
    speedLimiterMrk: boolean;
    tachoExemptMrk: boolean;
    dispensations: string;
    remarks: string;
    reasonForCreation: string;
    statusCode: string;
    unladenWeight: number;
    grossKerbWeight: number;
    grossLadenWeight: number;
    grossGbWeight: number;
    grossDesignWeight: number;
    noOfAxles: number;
    brakeCode: string;
    vehicleClass: {
    code: string,
        description: string
    };
    vehicleType: string;
    vehicleSize: string;
    vehicleConfiguration: string;
    brakes: {
    brakeCode: string,
    brakeCodeOriginal: string,
    dataTrBrakeOne: string,
    dataTrBrakeTwo: string,
    dataTrBrakeThree: string,
    retarderBrakeOne: string,
    retarderBrakeTwo: string,
    brakeForceWheelsNotLocked: {
        serviceBrakeForceA: number,
        secondaryBrakeForceA: number,
        parkingBrakeForceA: number
    },
    brakeForceWheelsUpToHalfLocked: {
        serviceBrakeForceB: number,
        secondaryBrakeForceB: number,
        parkingBrakeForceB: number
    }
};
    axles: Axle[];
}

interface Axle {
    parkingBrakeMrk: boolean;
    axleNumber: number;
    weights: {
        kerbWeight: number,
        ladenWeight: number,
        gbWeight: number,
        designWeight: number
    };
    tyres: {
        tyreSize: string,
        plyRating: string,
        fitmentCode: string,
        dataTrAxles: number,
        speedCategorySymbol: string,
        tyreCode: number
    };
}
