export const vehicleType: string[] = [
  "psv",
  "trl",
  "hgv"
];

export const fuelPropulsionSystem: string[] = [
  "DieselPetrol",
  "Hybrid",
  "Electric",
  "CNG",
  "Fuel cell",
  "LNG",
  "Other"
];

export const vehicleClassDescription: string[] = [
  "motorbikes over 200cc or with a sidecar",
  "not applicable",
  "small psv (ie: less than or equal to 22 seats)",
  "motorbikes up to 200cc",
  "trailer",
  "large psv(ie: greater than 23 seats)",
  "3 wheelers",
  "heavy goods vehicle",
  "MOT class 4",
  "MOT class 7",
  "MOT class 5"
];

export const vehicleConfiguration: string[] = [
  "rigid",
  "articulated",
  "centre axle drawbar",
  "semi-car transporter",
  "semi-trailer",
  "low loader",
  "other",
  "drawbar",
  "four-in-line",
  "dolly",
  "full drawbar"
];

export const euVehicleCategory: string[] = [
  "m1",
  "m2",
  "m3",
  "n1",
  "n2",
  "n3",
  "o1",
  "o2",
  "o3",
  "o4",
  "l1e-a",
  "l1e",
  "l2e",
  "l3e",
  "l4e",
  "l5e",
  "l6e",
  "l7e"
];

export const approvalType: string[] = [
  "NTA",
  "ECTA",
  "IVA",
  "NSSTA",
  "ECSSTA"
];

export const bodyTypeDescription: string[] = [
  "articulated",
  "single decker",
  "double decker",
  "other",
  "petrol/oil tanker",
  "skeletal",
  "tipper",
  "box",
  "flat",
  "refuse",
  "skip loader",
  "refrigerated"
];

export const microfilmDocumentType: string[] = [
  "PSV Miscellaneous",
  "AAT - Trailer Annual Test",
  "AIV - HGV International App",
  "COIF Modification",
  "Trailer COC + Int Plate",
  "RCT - Trailer Test Cert paid",
  "HGV COC + Int Plate",
  "PSV Carry/Auth",
  "OMO Report",
  "AIT - Trailer International App",
  "IPV - HGV EEC Plate/Cert",
  "XCV - HGV Test Cert free",
  "AAV - HGV Annual Test",
  "COIF Master",
  "Tempo 100 Sp Ord",
  "Deleted",
  "PSV N/ALT",
  "XPT - Tr Plating Cert paid",
  "FFV - HGV First Test",
  "Repl Vitesse 100",
  "TCV - HGV Test Cert",
  "ZZZ -  Miscellaneous",
  "Test Certificate",
  "XCT - Trailer Test Cert free",
  "C52 - COC and VTG52A",
  "Tempo 100 Report",
  "Main File Amendment",
  "PSV Doc",
  "PSV COC",
  "PSV Repl COC",
  "TAV - COC",
  "NPT - Trailer Alteration",
  "OMO Certificate",
  "PSV Repl COIF",
  "PSV Repl COF",
  "COIF Application",
  "XPV - HGV Plating Cert Free",
  "TCT  - Trailer Test Cert",
  "Tempo 100 App",
  "PSV Decision on N/ALT",
  "Special Order PSV",
  "NPV - HGV Alteration",
  "No Description Found",
  "Vitesse 100 Sp Ord",
  "Brake Test Details",
  "COIF Productional",
  "RDT - Test Disc Paid",
  "RCV -  HGV Test Cert",
  "FFT -  Trailer First Test",
  "IPT - Trailer EEC Plate/Cert",
  "XDT - Test Disc Free",
  "PRV - HGV Plating Cert paid",
  "COF Cert",
  "PRT - Tr Plating Cert paid",
  "Tempo 100 Permit"
];

export const plateReasonForIssue: string[] = [
  "Free replacement",
  "Replacement",
  "Destroyed",
  "Provisional",
  "Original",
  "Manual"
];

export const fitmentCode: string[] = [
  "double",
  "single"
];

export const speedCategorySymbol: string[] = [
  "a7",
  "a8",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "q"
];

export const vehicleSize: string[] = [
  "small",
  "large"
];

export const populateVehicleClassCode = (parent: any, helpers: any) => {
  switch (parent.description) {
    case "motorbikes over 200cc or with a sidecar":
      return "2";
    case "not applicable":
      return "n";
    case "small psv (ie: less than or equal to 22 seats)":
      return "s";
    case "motorbikes up to 200cc":
      return "1";
    case "trailer":
      return "t";
    case "large psv(ie: greater than 23 seats)":
      return "l";
    case "3 wheelers":
      return "3";
    case "heavy goods vehicle":
      return "v";
    case "MOT class 4":
      return "4";
    case "MOT class 7":
      return "7";
    case "MOT class 5":
      return "5";
    default:
      throw new Error("Not valid");
  }
};

export const populateBodyTypeCode = (parent: any, helpers: any) => {
  switch (parent.description) {
    case "articulated":
      return "a";
    case "single decker":
      return "s";
    case "double decker":
      return "d";
    case "other":
      return "o";
    case "petrol/oil tanker":
      return "p";
    case "skeletal":
      return "k";
    case "tipper":
      return "t";
    case "box":
      return "b";
    case "flat":
      return "f";
    case "refuse":
      return "r";
    case "skip loader":
      return "s";
    case "refrigerated":
      return "c";
    default:
      throw new Error("Not valid");
  }
};
