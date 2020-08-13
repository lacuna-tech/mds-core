pipeline {

  agent any

  stages {


    stage('Build') {
      steps {
        setBuildStatus('Build Pending... 🥱', 'PENDING')
        nvm('version': 'v14.2.0') {
          sh 'yarn clean'
          sh 'yarn build'
        }
      }
    }

    stage('Test') {
      steps {
        setBuildStatus('Tests Pending... 🥱', 'PENDING')
        nvm('version': 'v14.2.0') {
          sh '''
            randport() {
                local port=$((($RANDOM%8000)+1024));
                while nc -zv localhost $port > /dev/null 2>&1; do
                    port=$((($RANDOM%8000)+1024));
                done;
                echo $port
            }

            export PG_PORT=$(randport)
            export REDIS_PORT=$(randport)

            PG_ID=$(docker run -d -e POSTGRES_HOST_AUTH_METHOD=trust -p $PG_PORT:5432 postgres:10-alpine)
            REDIS_ID=$(docker run -d -p $REDIS_PORT:6379 redis:5-alpine)

            PG_NAME=postgres PG_HOST=localhost PG_USER=postgres REDIS_HOST=localhost yarn test

            docker stop $PG_ID
            docker stop $REDIS_ID
          '''
        }
      }
    }

  }

  post {

    success {
      setBuildStatus('Build and tests succeeded! 🤓', 'SUCCESS')
    }

    failure {
      setBuildStatus('Build or tests failed. 😢', 'FAILURE')
    }

  }
}
