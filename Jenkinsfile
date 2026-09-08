pipeline {
    agent any
    parameters {
        string(name: 'CUSTOM_PATH', defaultValue: '.', description: 'Manual workspace path / root directory')
        booleanParam(name: 'AUTH', defaultValue: false, description: 'Build auth-service')
        booleanParam(name: 'EXPENSE', defaultValue: false, description: 'Build expense-service')
        booleanParam(name: 'FRONTEND', defaultValue: false, description: 'Build frontend')
        booleanParam(name: 'VISION', defaultValue: false, description: 'Build vision-service')
        booleanParam(name: 'NOTIFICATION', defaultValue: false, description: 'Build notification-service')
        booleanParam(name: 'CONFIG', defaultValue: false, description: 'Build config-server')
        booleanParam(name: 'DISCOVERY', defaultValue: false, description: 'Build discovery-server')
    }
    stages {
        stage('Checkout Code') {
            steps { 
                git branch: 'main', url: 'https://github.com/eawolf/ExpenseAnalyzer.git' 
            }
        }
        stage('CI: Build Auth') {
            when { expression { params.AUTH } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    sh 'docker compose -f docker-compose.prod.yml build auth-service' 
                }
            }
        }
        stage('CI: Build Expense') {
            when { expression { params.EXPENSE } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    sh 'docker compose -f docker-compose.prod.yml build expense-service' 
                }
            }
        }
        stage('CI: Build Frontend') {
            when { expression { params.FRONTEND } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    sh 'docker compose -f docker-compose.prod.yml build frontend' 
                }
            }
        }
        stage('CI: Build Vision') {
            when { expression { params.VISION } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    sh 'docker compose -f docker-compose.prod.yml build vision-service' 
                }
            }
        }
        stage('CI: Build Notification') {
            when { expression { params.NOTIFICATION } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    sh 'docker compose -f docker-compose.prod.yml build notification-service' 
                }
            }
        }
        stage('CI: Build Config/Discovery') {
            when { expression { params.CONFIG || params.DISCOVERY } }
            steps { 
                dir(params.CUSTOM_PATH) {
                    script {
                        if (params.CONFIG) sh 'docker compose -f docker-compose.prod.yml build config-server'
                        if (params.DISCOVERY) sh 'docker compose -f docker-compose.prod.yml build discovery-server'
                    }
                }
            }
        }
        stage('Trigger Deployment Pipeline') {
            steps {
                build job: 'ExpenseAnalyzer-CD', parameters: [
                    string(name: 'CUSTOM_PATH', value: params.CUSTOM_PATH),
                    booleanParam(name: 'AUTH', value: params.AUTH),
                    booleanParam(name: 'EXPENSE', value: params.EXPENSE),
                    booleanParam(name: 'FRONTEND', value: params.FRONTEND),
                    booleanParam(name: 'VISION', value: params.VISION),
                    booleanParam(name: 'NOTIFICATION', value: params.NOTIFICATION),
                    booleanParam(name: 'CONFIG', value: params.CONFIG),
                    booleanParam(name: 'DISCOVERY', value: params.DISCOVERY)
                ]
            }
        }
    }
}
