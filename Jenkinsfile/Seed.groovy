def label = "jenkins-node-${UUID.randomUUID().toString()}"
podTemplate(label: label, containers: [
        containerTemplate(name: 'node', image: '086658912680.dkr.ecr.eu-west-1.amazonaws.com/cvs/nodejs-builder:latest', ttyEnabled: true, alwaysPullImage: true, command: 'cat'),]){
    node(label) {

        stage('checkout') {
            checkout scm
        }
        
        container('node'){    
            withFolderProperties{
                LBRANCH="${env.BRANCH}".toLowerCase()
            } 
                
            sh "cp -r /tmp/seed ."
            
            dir('seed'){
                
                stage ("npm deps") {
                    sh "npm install"
                }

                stage ("credentials") {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'jenkins-np-iam', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "sls config credentials --provider aws --key ${AWS_ACCESS_KEY_ID} --secret ${AWS_SECRET_ACCESS_KEY}"
                    }
                }
                
                stage ("delete-table") {
    
                    sh "aws dynamodb delete-table --table-name cvs-${LBRANCH}-technical-records --region=eu-west-1 || true"
                    sh "aws dynamodb wait table-not-exists --table-name cvs-${LBRANCH}-technical-records --region=eu-west-1"

                }
                
                stage ("create-table") {
                    sh """
                        aws dynamodb create-table \
                        --region=eu-west-1 \
                        --endpoint-url http://localhost:8003 \
                        --table-name cvs-local-technical-records \
                        --attribute-definitions AttributeName=partialVin,AttributeType=S AttributeName=vin,AttributeType=S AttributeName=primaryVrm,AttributeType=S --key-schema AttributeName=partialVin,KeyType=HASH AttributeName=vin,KeyType=RANGE --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --global-secondary-indexes IndexName=VRMIndex,KeySchema=[{AttributeName=primaryVrm,KeyType=HASH}],Projection={ProjectionType=INCLUDE,NonKeyAttributes=[secondaryVrms,vin,techRecord]},ProvisionedThroughput="{ReadCapacityUnits=1,WriteCapacityUnits=1}"
                        """
                    sh "aws dynamodb wait table-exists --table-name cvs-${LBRANCH}-technical-records --region=eu-west-1"

                }
                
                stage ("seed-table") {
                        sh "./seed.js cvs-${LBRANCH}-technical-records ../tests/resources/techRecords.json"
                }
            }
        }
    }
}
