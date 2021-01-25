/* eslint-disable */
const gulp = require("gulp");
const exec = require("child_process").exec;
const process = require("process");

gulp.task("start-serverless", function (done) {
  const instance = exec("serverless offline start &");

  instance.stdout.on("data", function (output) {
    process.stdout.write(output);

    if (output.search("replay the last request") !== -1) {
      done();
      process.exit(0);
    }

    if (output.search("Error") !== -1) {
      done();
      process.exit(-1);
    }
  });

  instance.on("close", function (code) {
    console.info(`Process exited with code ${code}`);
    done();
  });
});

gulp.task("kill-serverless", function (done) {
  exec("pkill -2 node");
  exec("pkill -2 java");

  done();
});
