import util from "util";
import { exec } from "child_process";
const shell = util.promisify(exec);

let PID_SERVER_IN_CONTAINER;
let PID_DB_IN_CONTAINER;

export const killTestSetup = async () => {
  console.log("Trying to kill test setups in the CI 🦾 ...");
  try {
    const { stdout: serverStream } = await shell(
      `${process.cwd()}/scripts/getServerPid.sh`
    );
    const { stdout: DBStream } = await shell(
      `${process.cwd()}/scripts/getDBPid.sh`
    );
    PID_SERVER_IN_CONTAINER = serverStream.trim();
    PID_DB_IN_CONTAINER = DBStream.trim();
    await exec(`kill -9 ${PID_SERVER_IN_CONTAINER}`);
    console.info(`Server pid:${PID_SERVER_IN_CONTAINER} is now killed!`);
    await exec(`kill -9 ${PID_DB_IN_CONTAINER}`);
    console.info(`DB pid: ${PID_DB_IN_CONTAINER} is now killed!`);
  } catch (e) {
    console.error(`Error: \n ${e}`);
    process.exit(1);
  }
};
