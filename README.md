# cvs-svc-technical-records

## Introduction

To capture and persist technical records for a Vehicle submitted by the client (VTM) which is then made available to VTA/VTM for searching a vehicle. If the submitted technical record is applicable for a ministry plate certificate, it triggers the generation of the certificate via dynamo streams of the technical results table.

## Dependencies

The project runs on node >10.x with typescript and serverless framework. For further details about project dependencies, please refer to the `package.json` file.
Please install and configure [nvm](https://github.com/nvm-sh/nvm) with this node version so it can be used during installation (or similar tools).
[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md) is used to managed node versions and configuration explicitly done per project using an `.npmrc` file.

### Prerequisites

Please install and run the following security programs as part of your development process:

- [git-secrets](https://github.com/awslabs/git-secrets)
  After installing, do a one-time set up with `git secrets --register-aws`. Run with `git secrets --scan`.

- [repo-security-scanner](https://github.com/UKHomeOffice/repo-security-scanner)

These will be run as part of your projects hooks so you don't accidentally introduce any new security vulnerabilities.

## Architecture

### End to end design

[All in one view](https://wiki.dvsacloud.uk/pages/viewpage.action?pageId=79254695)

### Technical record microservice

[Further details about this micro service](https://wiki.dvsacloud.uk/pages/viewpage.action?spaceKey=HVT&title=Technical+Records+Microservice).

#### API Specs

[Technical records API](https://wiki.dvsacloud.uk/download/attachments/33863060/API_Vehicle_Tech_Records_v32.yaml?version=2&modificationDate=1591883253725&api=v2).

#### Database Model

Being a NoSQL database data isn't stored in the relational model, but as a JSON document which is native to dynamodb database. The JSON document is the representation of API specification, hence API specification should be referred, to understand document structure stored in the database.

#### Database Indexes

       Table Name: cvs-{$environment-name}-technical-records

       Partition / Hash Key: systemNumber

       Sort Key: vin

       LSI: N/A

       GSI:
              primaryVrm (Partition Key),

              trailerId (Partition Key),

              vin (Partition Key),

              partialVin (Partition Key),

#### Interactions/Integration with other AWS service

The diagram illustrates that technical records integrate with Test Number service to request a unique number (systemNumber, trailorId, plateSerialNumber), before the information is saved into dynamo table. Technical record service also receives status updates from test result microservice to update a record from Provisional to Active [refer Test Result Submisson triggering Technical Record Status update](https://wiki.dvsacloud.uk/display/HVT/Test+Result+Submisson+triggering+Technical+Record+Status+update).
![Integration AWS](/docs/awsintegration.png)

Above Diagram shows orchestration/event publishing involved within Technical Records service. Following are the approved patterns it uses:

#### Orchestration

![Orchestration](./docs/orchestration.png)

#### Choregraphy

![Choregraphy](/docs/choregraphy.png)

In order to understand more about the responsibility of technical records service in the end to end design, please refer to [Ministry Plate Generation Design](https://wiki.dvsacloud.uk/display/HVT/Ministry+Plate+Generation+Design).

## Getting started

Set up your nodejs environment running `nvm use` and once the dependencies are installed using `npm i`, you can run the scripts from `package.json` to build your project.
This code repository uses [serverless framework](https://www.serverless.com/framework/docs/) to mock AWS capabilities for local development.
You will also require to install dynamodb serverless to run your project with by running the following command `npm run tools-setup` in your preferred shell.
Once dynamoDB is installed, you will need a local serverless profile to be created so that you can start developping locally.
The profiles are stored under `~/.aws/credentials`.
```sh
# ~/.aws/credentials

# Please not only serverless is used to develop locally, not deployment of services are done with this framework
# It might look like this
[default]
aws_access_key_id=<yourDummyAccesskey>
aws_secret_access_key=<yourDummySecret>

```
Please refer to the local development section to [scripts](#scripts).

### Environmental variables

- The `BRANCH` environment variable indicates in which environment is this application running. Use `BRANCH=local` for local deployment. This variable is required when starting the application or running tests.

### Feature flags

Feature flags are available within the application from `config.yml` file.
Below is the list of feature switches:

```yml
# set to false by default, only validate ADR fields on PUT request
allowAdrUpdatesOnly
```

If you wish to toggle the switches, you will need to update its value, then run `npm run build` to rebuild the service and restart the server with `npm start`.

### Configuration

#### DynamoDB

You won't need to do anything however if you want the database to be populated with mock data on start, in your `serverless.yml` file, you need to set `seed` to `true`. You can find this setting under `custom > dynamodb > start`.

If you choose to run the DynamoDB instance separately, you can send the seed command with the following command:

`sls dynamodb seed --seed=seed_name`

Under `custom > dynamodb > seed` you can define new seed operations with the following config:

```yml
custom:
  dynamodb:
    seed:
      seed_name:
        sources:
          - table: TABLE_TO_SEED
            sources: [./path/to/resource.json]
```

#### Seeding the database

From within the resource folder type the following:
`cat techRecords.json | json-dynamo-putrequest cvs-BRANCH-dft-tech-records --beautify >test.json`
`aws dynamodb batch-write-item --request-items file://test.json --region=eu-west-1`

### Scripts

Please request the relevant credentials to be added locally to the `~/.aws/credentials` file.

- install deps: `npm install`
- build project: `npm run build`
- local development and webserver: `BRANCH=local npm start`


## Debugging

The following environmental variables can be given to your serverless scripts to trace and debug your service:

```shell
AWS_XRAY_CONTEXT_MISSING = LOG_ERROR
SLS_DEBUG = *
BRANCH = local
```

## Testing

Jest is used for unit testing.
Please refer to the [Jest documentation](https://jestjs.io/docs/en/getting-started) for further details.

### Unit test

In order to test, you need to run the following:

```sh
npm run test # unit tests
```

### Integration test

In order to test, you need to run the following, with the service running locally:

```sh
npm run test-i # for integration tests
```

### End to end

- [Automation test repository](https://github.com/dvsa/cvs-auto-svc)
- [Java](https://docs.oracle.com/en/java/javase/11/)
- [Serenity Cucumber with Junit](https://serenity-bdd.github.io/theserenitybook/latest/junit-basic.html)

## Infrastructure

We follow a [gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) approach for development.
For the CI/CD and automation please refer to the following pages for further details:

- [Development process](https://wiki.dvsacloud.uk/display/HVT/CVS+Pipeline+Infrastructure)
- [Pipeline](https://wiki.dvsacloud.uk/pages/viewpage.action?pageId=36870584)

## Contributing

### Hooks and code standards

The projects has multiple hooks configured using [husky](https://github.com/typicode/husky#readme) which will execute the following scripts: `security-checks`, `audit`, `tslint`, `prepush`.
The codebase uses [typescript clean code standards](https://github.com/labs42io/clean-code-typescript) as well as sonarqube for static analysis.

SonarQube is available locally, please follow the instructions below if you wish to run the service locally (brew is the preferred approach).

### Static code analysis

_Brew_ (recommended):

- Install sonarqube using brew
- Change `sonar.host.url` to point to localhost, by default, sonar runs on `http://localhost:9000`
- run the sonar server `sonar start`, then perform your analysis `npm run sonar-scanner`

_Manual_:

- [Download sonarqube](https://www.sonarqube.org/downloads/)
- Add sonar-scanner in environment variables in your profile file add the line: `export PATH=<PATH_TO_SONAR_SCANNER>/sonar-scanner-3.3.0.1492-macosx/bin:$PATH`
- Start the SonarQube server: `cd <PATH_TO_SONARQUBE_SERVER>/bin/macosx-universal-64 ./sonar.sh start`
- In the microservice folder run the command: `npm run sonar-scanner`
