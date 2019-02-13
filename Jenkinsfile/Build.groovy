def label = "jenkins-node-${UUID.randomUUID().toString()}"
podTemplate(label: label, containers: [
        containerTemplate(name: 'dynamodb',
                image: 'amazon/dynamodb-local',
                command: 'java -jar /home/dynamodblocal/DynamoDBLocal.jar -inMemory -sharedDb -port 8003',
                ports: [portMapping(name: 'dynamoport', containerPort: 8003, hostPort: 8003)]),
        containerTemplate(name: 'node', image: '086658912680.dkr.ecr.eu-west-1.amazonaws.com/cvs/nodejs-builder:latest', ttyEnabled: true, alwaysPullImage: true, command: 'cat'),]){
    node(label) {

        stage('checkout') {
            checkout scm
        }

        container('node'){

            withFolderProperties{
                LBRANCH="${env.BRANCH}".toLowerCase()
            }

            stage ("npm deps") {
                sh "npm install"
            }

            stage ("security") {
                sh "git secrets --register-aws"
                sh "git secrets --scan"
                sh "git log -p | scanrepo"
            }

            stage ("credentials") {
                withCredentials([usernamePassword(credentialsId: 'dummy-credentials', passwordVariable: 'SECRET', usernameVariable: 'KEY')]) {
                    sh "sls config credentials --provider aws --key ${KEY} --secret ${SECRET}"
                }
            }
            stage ("create-seed-table") {

                sh '''
                aws dynamodb create-table \
                --region=eu-west-1 \
                --endpoint-url http://localhost:8003 \
                --table-name cvs-local-technical-records \
                --attribute-definitions AttributeName=partialVin,AttributeType=S AttributeName=vin,AttributeType=S AttributeName=primaryVrm,AttributeType=S --key-schema AttributeName=partialVin,KeyType=HASH AttributeName=vin,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --global-secondary-indexes IndexName=VRMIndex,KeySchema=[{AttributeName=primaryVrm,KeyType=HASH}],Projection={ProjectionType=INCLUDE,NonKeyAttributes=[secondaryVrms,vin,techRecord]},ProvisionedThroughput="{ReadCapacityUnits=1,WriteCapacityUnits=1}"

                '''

                sh "sls dynamodb seed --seed=tech-records"
            }

            stage ("sonar") {
                sh "npm run sonar-scanner"
            }

            stage ("unit test") {
                sh "npm run test"
            }

            stage ("integration test") {
                sh "BRANCH=local node_modules/gulp/bin/gulp.js start-serverless"
                sh "BRANCH=local node_modules/.bin/mocha tests/**/*.intTest.js"
            }

            stage("zip dir"){
                sh "rm -rf ./node_modules"
                sh "npm install --production"
                sh "mkdir ${LBRANCH}"
                sh "cp -r src/* ${LBRANCH}/"
                sh "cp -r node_modules ${LBRANCH}/node_modules"
                sh "cd ${LBRANCH} && zip -qr ../${LBRANCH}.zip *"           
            }

            stage("upload to s3") {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                  credentialsId: 'jenkins-iam',
                                  secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {

                    sh "aws s3 cp ${LBRANCH}.zip s3://cvs-services/technical-records/${LBRANCH}.zip --metadata sha256sum=\"\$(openssl dgst -sha256 -binary ${LBRANCH}.zip | openssl enc -base64)\""

                }
            }
        }
    }
}
