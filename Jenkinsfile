pipeline {
    agent {
        label 'NativeDocker' // Este agente necesita ejecutar Docker de forma nativa
    }

    stages {
        stage('Checkout') {
            steps {
                // Obtener el código desde el repositorio de GitHub
                git branch: 'master', url: 'https://github.com/Gromenaware/the-example-app-nodejs.git'
            }
        }
        
        stage('Clean') {
            steps {
                // Limpiar contenedores anteriores para construir desde cero
                sh 'docker stop the-example-app || true'
                sh 'docker rm the-example-app || true'
            }
        }
        
        stage('Build') {
            steps {
                // Construir la imagen de Docker
                sh 'docker build -t the-example-app.nodejs .'
            }
        }
        
        stage('Deployment') {
            steps {
                // Desplegar el contenedor con la imagen recién creada
                sh 'docker run -p 3000:3000 --name the-example-app -d the-example-app.nodejs'
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
