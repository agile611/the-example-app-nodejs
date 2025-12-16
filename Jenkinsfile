pipeline {
    agent any
    stages{
     stage('Checkout código'){
         steps {
             git 'https://github.com/agile611/the-example-app-nodejs.git'
         }
      }   
      stage('Docker stop'){
         steps {
             sh 'docker stop the-example-app'
             sh 'docker rm the-example-app'
         }
      } 
      stage('Docker build'){
         steps {
             sh 'docker build -t the-example-app.nodejs .'
             sh 'docker tag the-example-app.nodejs:latest the-example-app'
         }
      }
      stage('Docker Run'){
         steps {
             sh 'docker run --name the-example-app -p 3000:3000 -d the-example-app'
         }
      }
    }
    post {
        always  { echo 'ALWAYS: Siempre pasa' }
        success { echo 'SUCCESS: Pasa si hay' }
        failure { echo 'FAILURE: Pasa si hay' }
        aborted { echo 'ABORTED: Pasa si alguien me cancela el build a medias'}
    }
}