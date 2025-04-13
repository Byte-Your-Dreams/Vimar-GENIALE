#!/bin/bash 
if [ -z "$1" ] || [ -z "$2" ]; then 
    echo "Uso: $0 {up|down|build|reset} {nvidia|amd}" 
    exit 1 
fi

case "$1" in 
    up) 
        cd ./docker 
        docker-compose -f docker-compose.supabase.yml up -d
        case "$2" in 
            nvidia) 
                docker-compose -f docker-compose.ollama.nvidia.yml up -d
                ;;
            amd) 
                docker-compose -f docker-compose.ollama.amd.yml up -d
                ;;
            *) 
                echo "Uso: $0 {up|down} {nvidia|amd}" 
                exit 1 
                ;;
        esac 
        docker-compose -f docker-compose.scraper.yml up -d
        docker-compose -f docker-compose.app.yml up -d
        ;; 
    build)
        cd ./docker 
        docker-compose -f docker-compose.supabase.yml up -d 
        case "$2" in 
            nvidia) 
                docker-compose -f docker-compose.ollama.nvidia.yml up -d
                ;;
            amd) 
                docker-compose -f docker-compose.ollama.amd.yml up -d
                ;;
            *) 
                echo "Uso: $0 {up|down} {nvidia|amd}" 
                exit 1 
                ;;
        esac 
        docker-compose -f docker-compose.scraper.yml up -d
        docker-compose -f docker-compose.app.yml up --build -d
        ;; 
    down)
        cd ./docker
        docker-compose -f docker-compose.supabase.yml down 
        case "$2" in 
            nvidia) 
                docker-compose -f docker-compose.ollama.nvidia.yml down
                ;;
            amd) 
                docker-compose -f docker-compose.ollama.amd.yml down
                ;;
            *) 
                echo "Uso: $0 {up|down} {nvidia|amd}" 
                exit 1 
                ;;
        esac 
        docker-compose -f docker-compose.scraper.yml down
        docker-compose -f docker-compose.app.yml down
        ;;
    reset)
        cd ./docker
        docker-compose -f docker-compose.supabase.yml down -v 
        case "$2" in 
            nvidia) 
                docker-compose -f docker-compose.ollama.nvidia.yml down -v
                ;;
            amd) 
                docker-compose -f docker-compose.ollama.amd.yml down -v
                ;;
            *) 
                echo "Uso: $0 {up|down} {nvidia|amd}" 
                exit 1 
                ;;
        esac 
        docker-compose -f docker-compose.scraper.yml down -v
        docker-compose -f docker-compose.app.yml down -v
        rm -rf volumes/db/data
        rm -rf volumes/storage
        rm -rf volumes/ollama
        
        ;;
    *) 
        echo "Uso: $0 {up|down} {nvidia|amd}" 
        exit 1 
        ;; 
esac