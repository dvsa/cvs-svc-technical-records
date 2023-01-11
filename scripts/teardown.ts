import { killTestSetup } from "./destroyServices";

module.exports = async () => {
  console.log(`
      Integration tests ✅
      ...Tearing down tests...
    `);
  // Serverless runs containers and pid's are not managed the same way in the CI/CD pipeline
  // We are not using the pid of our instance to kill the task
  // instead created sh commands to manually kill the webserver and dynamoDB instances which work equally in the pipeline

  try {
    await killTestSetup();
    console.log("processes killed");
  } catch (e) {
    console.log("Can not kill processes");
    console.error(e);
    throw e;
  }
};
