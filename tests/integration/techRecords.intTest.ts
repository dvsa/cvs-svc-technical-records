/* global describe context it before beforeEach after afterEach */
import supertest from "supertest";

const url = "http://localhost:3005/";
const request = supertest(url);
import {populateDatabase, emptyDatabase, convertToResponse} from "../util/dbOperations";
import mockData from "../resources/technical-records.json";
import {HTTPRESPONSE} from "../../src/assets/Enums";

describe("techRecords", () => {
  describe("getTechRecords", () => {
    beforeAll(async () => {
      await emptyDatabase();
    });

    beforeEach(async () => {
      await populateDatabase();
    });

    afterEach(async () => {
      await emptyDatabase();
    });

    afterAll(async () => {
      await populateDatabase();
    });

    context("and when a search by VRM is done", () => {
      context("and no statusCode is provided", () => {
        context("and the tech record for that VRM has statusCode 'current'", () => {
          it("should return the tech record for that VRM with status 'current'", async () => {
            const res = await request.get("vehicles/JY58FPP/tech-records");
            expect(res.status).toEqual(200);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual("true");
            expect(res.body).toEqual(convertToResponse(mockData[0]));
          });
        });

        context("and the tech record for that VRM does not have statusCode 'current'", () => {
          it("should return 404", async () => {
            const res = await request.get("vehicles/V916FSB/tech-records");
            expect(res.status).toEqual(404);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual("true");
            expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
          });
        });
      });

      context("and statusCode is provided", () => {
        context("and the tech record for that VRM has the statusCode provided", () => {
          it("should return the tech record for that VRM with statusCode 'archived'", async () => {
            const res = await request.get("vehicles/AA12BCD/tech-records?status=archived");
            expect(res.status).toEqual(200);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual("true");
            expect(convertToResponse(mockData[2])).toEqual(res.body);
          });
        });

        context("and the tech record for that VRM does not have statusCode 'archived'", () => {
          it("should return 404", async () => {
            const res = await request.get("vehicles/BQ91YHQ/tech-records?status=archived");
            expect(res.status).toEqual(404);
            expect(res.header["access-control-allow-origin"]).toEqual("*");
            expect(res.header["access-control-allow-credentials"]).toEqual("true");
            expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
          });
        });
      });

      context("and the vehicle has more than one tech record", () => {
        it("should return all tech records for that VRM", async () => {
          const res = await request.get("vehicles/C47WLL/tech-records?status=all");
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual("true");
          expect(convertToResponse(mockData[8])).toEqual(res.body);
          expect(res.body.techRecord.length).toEqual(mockData[8].techRecord.length);
        });
      });
    });
  });

  context("and when a search by partial VIN is done", () => {
    context("and no statusCode is provided", () => {
      context("and the tech record for that partial VIN has statusCode 'current'", () => {
        it("should return the tech record for that partial VIN with status 'current'", async () => {
          const res = await request.get("vehicles/012345/tech-records");
          expect(res.status).toEqual(200);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual("true");
          expect(convertToResponse(mockData[0])).toEqual(res.body);
        });
      });

      context("and the tech record for that partial VIN does not have status code current or provisional", () => {
        it("should return 404", async () => {
          const res = await request.get("vehicles/541234/tech-records");
          expect(res.status).toEqual(404);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual("true");
          expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
        });
      });
    });

    context("and statusCode is provided", () => {
      context("and the tech record for that partial VIN has the statusCode provided", () => {
        it("should return the tech record for that partial VIN with statusCode 'archived'", async () => {
          const res = await request.get("vehicles/012461/tech-records?status=archived");
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual("true");
          expect(convertToResponse(mockData[2])).toEqual(res.body);
          expect(res.status).toEqual(200);
        });
      });

      context("and the tech record for that partial VIN does not have statusCode 'archived'", () => {
        it("should return 404", async () => {
          const res = await request.get("vehicles/012345/tech-records?status=archived");
          expect(res.status).toEqual(404);
          expect(res.header["access-control-allow-origin"]).toEqual("*");
          expect(res.header["access-control-allow-credentials"]).toEqual("true");
          expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
        });
      });
    });

    context("and the vehicle has more than one tech record", () => {
      it("should return all tech records for that partial VIN", async () => {
        const res = await request.get("vehicles/011900/tech-records?status=all");
        expect(res.status).toEqual(200);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(convertToResponse(mockData[8])).toEqual(res.body);
        expect(res.body.techRecord.length).toEqual(mockData[8].techRecord.length);
      });
    });
  });

  context("and the partial VIN provided returns more than one match", () => {
    it("should return 422", async () => {
      const res = await request.get("vehicles/678413/tech-records");
      expect(res.status).toEqual(422);
      expect(res.header["access-control-allow-origin"]).toEqual("*");
      expect(res.header["access-control-allow-credentials"]).toEqual("true");
      expect(res.body).toEqual("The provided partial VIN returned more than one match.");
    });
  });
});

context("and when a search by full VIN is done", () => {
  context("and no statusCode is provided", () => {
    context("and the tech record for that full VIN has statusCode 'current'", () => {
      it("should return the tech record for that full VIN with status 'current'", async () => {
        const res = await request.get("vehicles/XMGDE02FS0H012345/tech-records");
        expect(res.status).toEqual(200);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(convertToResponse(mockData[0])).toEqual(res.body);
      });
    });

    context("and the tech record for that full VIN does not have statusCode 'current'", () => {
      it("should return 404", async () => {
        const res = await request.get("vehicles/XMGDE02FS0H012461/tech-records");
        expect(res.status).toEqual(404);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      });
    });
  });

  context("and statusCode is provided", () => {
    context("and the tech record for that full VIN has the statusCode provided", () => {
      it("should return the tech record for that full VIN with statusCode 'archived'", async () => {
        const res = await request.get("vehicles/XMGDE02FS0H012461/tech-records?status=archived");
        expect(res.status).toEqual(200);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(convertToResponse(mockData[2])).toEqual(res.body);
      });
    });

    context("and the tech record for that full VIN does not have statusCode 'archived'", () => {
      it("should return 404", async () => {
        const res = await request.get("vehicles/XMGDE02FS0H012345/tech-records?status=archived");
        expect(res.status).toEqual(404);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      });
    });
  });

  context("and the vehicle has more than one tech record", () => {
    it("should return all tech records for that full VIN", async () => {
      const res = await request.get("vehicles/YV31MEC18GA011900/tech-records?status=all");
      expect(res.status).toEqual(200);
      expect(res.header["access-control-allow-origin"]).toEqual("*");
      expect(res.header["access-control-allow-credentials"]).toEqual("true");
      expect(convertToResponse(mockData[8])).toEqual(res.body);
      expect(res.body.techRecord.length).toEqual(mockData[8].techRecord.length);
    });
  });
});

context("and when a search by Trailer ID is done", () => {
  context("and no statusCode is provided", () => {
    context("and the tech record for that Trailer ID has statusCode 'current'", () => {
      it("should return the tech record for that Trailer ID with status 'current'", async () => {
        const res = await request.get("vehicles/09876543/tech-records");
        expect(res.status).toEqual(200);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(res.body).toEqual(convertToResponse(mockData[0]));
      });
    });

    context("and the tech record for that TrailerID does not have statusCode 'current'", () => {
      it("should return 404", async () => {
        const res = await request.get("vehicles/A456789/tech-records");
        expect(res.status).toEqual(404);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      });
    });
  });

  context("and statusCode is provided", () => {
    context("and the tech record for that Trailer ID has the statusCode provided", () => {
      it("should return the tech record for that Trailer ID with statusCode 'archived'", async () => {
        const res = await request.get("vehicles/A456789/tech-records?status=archived");
        expect(res.status).toEqual(200);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(convertToResponse(mockData[2])).toEqual(res.body);
      });
    });

    context("and the tech record for that Trailer ID does not have statusCode 'archived'", () => {
      it("should return 404", async () => {
        const res = await request.get("vehicles/09876543/tech-records?status=archived");
        expect(res.status).toEqual(404);
        expect(res.header["access-control-allow-origin"]).toEqual("*");
        expect(res.header["access-control-allow-credentials"]).toEqual("true");
        expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
      });
    });
  });

  context("and the vehicle has more than one tech record", () => {
    it("should return all tech records for that Trailer ID", async () => {
      const res = await request.get("vehicles/09876543/tech-records?status=all");
      expect(res.status).toEqual(200);
      expect(res.header["access-control-allow-origin"]).toEqual("*");
      expect(res.header["access-control-allow-credentials"]).toEqual("true");
      expect(convertToResponse(mockData[0])).toEqual(res.body);
      expect(res.body.techRecord.length).toEqual(mockData[0].techRecord.length);
    });
  });
});


