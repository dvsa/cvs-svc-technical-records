/* global describe context it before beforeEach after afterEach */
import supertest from "supertest";
import {expect} from "chai";
const url = "http://localhost:3005/";
const request = supertest(url);
import TechRecordsService from "../../src/services/TechRecordsService";
import TechRecordsDAO from "../../src/models/TechRecordsDAO";
import * as fs from "fs";
import * as path from "path";
import mockData from "../resources/technical-records.json";

describe("techRecords", () => {
  describe("getTechRecords", () => {
    context("when database is populated", () => {
      const convertToResponse = (dbObj: any) => { // Needed to convert an object from the database to a response object
        const responseObj = Object.assign({}, dbObj);

        // Adding primary and secondary VRMs in the same array
        const vrms: any = [{ isPrimary: true }];
        if (responseObj.primaryVrm) { vrms[0].vrm = responseObj.primaryVrm; }

        Object.assign(responseObj, {
          vrms
        });

        // Cleaning up unneeded properties
        delete responseObj.primaryVrm; // No longer needed
        delete responseObj.secondaryVrms; // No longer needed
        delete responseObj.partialVin; // No longer needed

        return responseObj;
      };

      // Populating the database
      beforeAll(async (done) => {
        await populateDatabase();
        done();
      });

      context("and when a search by VRM is done", () => {
        context("and no statusCode is provided", () => {
          context("and the tech record for that VRM has statusCode 'current'", () => {
            it("should return the tech record for that VRM with default status 'current'", (done) => {
              request.get("vehicles/JY58FPP/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).is.eql(convertToResponse(mockData[0]));
                  done();
                });
            });
          });

          context("and the tech record for that VRM does not have statusCode 'current'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/V916FSB/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });

        context("and statusCode is provided", () => {
          context("and the tech record for that VRM has the statusCode provided", () => {
            it("should return the tech record for that VRM with statusCode 'archived'", (done) => {
              request.get("vehicles/AA12BCD/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(convertToResponse(mockData[2])).to.eql(res.body);
                  done();
                });
            });
          });

          context("and the tech record for that VRM does not have statusCode 'archived'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/BQ91YHQ/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });
      });

      context("and when a search by partial VIN is done", () => {
        context("and no statusCode is provided", () => {
          context("and the tech record for that partial VIN has statusCode 'current'", () => {
            it("should return the tech record for that partial VIN with default status 'current'", (done) => {
              request.get("vehicles/012345/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(convertToResponse(mockData[0])).to.eql(res.body);
                  done();
                });
            });
          });

          context("and the tech record for that partial VIN does not have statusCode 'current'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/021430/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });

        context("and statusCode is provided", () => {
          context("and the tech record for that partial VIN has the statusCode provided", () => {
            it("should return the tech record for that partial VIN with statusCode 'archived'", (done) => {
              request.get("vehicles/012461/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  // console.log(convertToResponse(mockData[2]))
                  expect(convertToResponse(mockData[2])).to.eql(res.body);
                  expect(res.statusCode).to.equal(200);
                  done();
                });
            });
          });

          context("and the tech record for that partial VIN does not have statusCode 'archived'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/012345/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });

        context("and the partial VIN provided returns more than one match", () => {
          it("should return 422", (done) => {
            request.get("vehicles/678413/tech-records")
              .end((err, res: any) => {
                if (err) { expect.fail(err); }
                expect(res.statusCode).to.equal(422);
                expect(res.headers["access-control-allow-origin"]).to.equal("*");
                expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                expect(res.body).to.equal("The provided partial VIN returned more than one match.");
                done();
              });
          });
        });
      });

      context("and when a search by full VIN is done", () => {
        context("and no statusCode is provided", () => {
          context("and the tech record for that full VIN has statusCode 'current'", () => {
            it("should return the tech record for that full VIN with default status 'current'", (done) => {
              request.get("vehicles/XMGDE02FS0H012345/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(convertToResponse(mockData[0])).to.eql(res.body);
                  done();
                });
            });
          });

          context("and the tech record for that full VIN does not have statusCode 'current'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/XMGDE02FS0H012461/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });

        context("and statusCode is provided", () => {
          context("and the tech record for that full VIN has the statusCode provided", () => {
            it("should return the tech record for that full VIN with statusCode 'archived'", (done) => {
              request.get("vehicles/XMGDE02FS0H012461/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(convertToResponse(mockData[2])).to.eql(res.body);
                  done();
                });
            });
          });

          context("and the tech record for that full VIN does not have statusCode 'archived'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/XMGDE02FS0H012345/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });
      });

      context("and when a search by Trailer ID is done", () => {
        context("and no statusCode is provided", () => {
          context("and the tech record for that Trailer ID has statusCode 'current'", () => {
            it("should return the tech record for that Trailer ID with default status 'current'", (done) => {
              request.get("vehicles/C000001/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).is.eql(convertToResponse(mockData[10]));
                  done();
                });
            });
          });

          context("and the tech record for that TrailerID does not have statusCode 'current'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/A456789/tech-records")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });

        context("and statusCode is provided", () => {
          context("and the tech record for that Trailer ID has the statusCode provided", () => {
            it("should return the tech record for that Trailer ID with statusCode 'archived'", (done) => {
              request.get("vehicles/Q000001/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(convertToResponse(mockData[21])).to.eql(res.body);
                  done();
                });
            });
          });

          context("and the tech record for that Trailer ID does not have statusCode 'archived'", () => {
            it("should return 404", (done) => {
              request.get("vehicles/09876543/tech-records?status=archived")
                .end((err, res: any) => {
                  if (err) { expect.fail(err); }
                  expect(res.statusCode).to.equal(404);
                  expect(res.headers["access-control-allow-origin"]).to.equal("*");
                  expect(res.headers["access-control-allow-credentials"]).to.equal("true");
                  expect(res.body).to.equal("No resources match the search criteria.");
                  done();
                });
            });
          });
        });
      });
    });

    context("when database is empty,", () => {
        beforeAll(async (done) => {
            await emptyDatabase();
            done();
        });

        it("should return error code 404", (done) => {
            request.get("techRecords").expect(404, done);
        });

    });
  });
  afterAll(async (done) => {
    await populateDatabase();
    done();
  });
});

const populateDatabase = () => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);
    // tslint:disable-next-line:no-shadowed-variable
    const mockData = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/technical-records.json"), "utf8"));
    const batches = [];
    while (mockData.length > 0) {
        batches.push(mockData.splice(0, 25));
    }

    return batches.forEach(async (batch: any) => {
        return await techRecordsService.insertTechRecordsList(batch);
    });
};

const emptyDatabase = () => {
    const techRecordsDAO = new TechRecordsDAO();
    const techRecordsService = new TechRecordsService(techRecordsDAO);
    const mockBuffer = mockData;

    const batches = [];
    while (mockBuffer.length > 0) {
        batches.push(mockBuffer.splice(0, 25));
    }

    return batches.forEach(async (batch) => {
        return await techRecordsService.deleteTechRecordsList(
            batch.map((mock) => {
                return [mock.partialVin, mock.vin];
            })
        );
    });
};
