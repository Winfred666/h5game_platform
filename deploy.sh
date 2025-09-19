#!/bin/bash

# H5 Game Platform - Production Deployment Script
# Linux/macOS version of deploy.ps1

set -e  # Exit on any error

# Default values
COMMAND="deploy"
PUBLIC_FRONT_URL="http://localhost:3000/h5game"
PUBLIC_MINIO_URL="http://localhost:9000"
ADMIN_NAME="h5game_admin"
FRONT_PORT=3000
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
SKIP_BUILD=false
FORCE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  clean     Clean up deployment"
    echo ""
    echo "Options:"
    echo "  --public-front-url URL      Public frontend URL (default: http://localhost:3000/h5game)"
    echo "  --public-minio-url URL      Public MinIO URL (default: http://localhost:9000)"
    echo "  --admin-name NAME           Admin username (default: h5game_admin)"
    echo "  --front-port PORT           Frontend port (default: 3000)"
    echo "  --minio-port PORT           MinIO port (default: 9000)"
    echo "  --minio-console-port PORT   MinIO console port (default: 9001)"
    echo "  --skip-build                Skip Docker build"
    echo "  --force                     Force overwrite existing env files"
    echo "  --help                      Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            deploy|clean)
                COMMAND="$1"
                shift
                ;;
            --public-front-url)
                PUBLIC_FRONT_URL="$2"
                shift 2
                ;;
            --public-minio-url)
                PUBLIC_MINIO_URL="$2"
                shift 2
                ;;
            --admin-name)
                ADMIN_NAME="$2"
                shift 2
                ;;
            --front-port)
                FRONT_PORT="$2"
                shift 2
                ;;
            --minio-port)
                MINIO_PORT="$2"
                shift 2
                ;;
            --minio-console-port)
                MINIO_CONSOLE_PORT="$2"
                shift 2
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Create production environment configuration
create_production_env() {
    local public_front_url="$1"
    local public_minio_url="$2"
    local admin_name="$3"
    local front_port="$4"
    local minio_port="$5"
    local minio_console_port="$6"
    
    print_color $CYAN "🔧 Creating production environment configuration..."
    
    # Generate secure passwords and keys
    local minio_password=$(openssl rand -hex 16)
    local default_password="$(openssl rand -base64 12)1a"
    local auth_secret=$(openssl rand -base64 32)
    local admin_qq=$((RANDOM % 9999999 + 10000000))
    
    # Create .env.production file
    cat > .env.production << EOF
# Production Environment Configuration
# Generated on $(date '+%Y-%m-%d %H:%M:%S')

# Application URLs
NEXT_PUBLIC_FRONT_URL=${public_front_url}
NEXT_PUBLIC_MINIO_URL=${public_minio_url}

# in dev we use localhost, but in production
# use the bridge network like http://minio:9000
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=${minio_password}

# NextAuth Configuration
AUTH_SECRET=${auth_secret}
AUTH_TRUST_HOST=true
NEXTAUTH_URL=${public_front_url}

# Admin Configuration
ADMIN_QQ=${admin_qq}
ADMIN_NAME=${admin_name}
DEFAULT_PASSWORD=${default_password}

# internal ports
FRONT_PORT=${front_port}
MINIO_PORT=${minio_port}
MINIO_CONSOLE_PORT=${minio_console_port}
EOF
    
    print_color $GREEN "✅ Created .env.production with secure credentials"
    print_color $WHITE "   Username: $admin_name"
    print_color $WHITE "   QQ: $admin_qq"
    print_color $WHITE "   Password: $default_password for all new users"
}

# Build Docker image
build_docker_image() {
    print_color $CYAN "🏗️  Building Docker image..."
    
    if docker build --force-rm -t h5game_platform-frontend:v2.0 .; then
        print_color $GREEN "✅ Docker image built successfully"
    else
        print_color $RED "❌ Failed to build Docker image"
        exit 1
    fi
}

# Start services
start_services() {
    print_color $CYAN "🚀 Starting services..."
    
    # Stop existing services
    print_color $BLUE "Stopping existing services..."
    docker compose --env-file .env.production down -v --remove-orphans || true
    
    # Start services
    print_color $BLUE "Starting new services..."
    if docker compose --env-file .env.production up -d; then
        return 0
    else
        print_color $RED "❌ Failed to start services"
        exit 1
    fi
}

# Main deployment function
deploy_production() {
    print_color $MAGENTA "🚀 H5 Game Platform - Production Deployment"
    print_color $MAGENTA "==========================================="
    
    if [[ "$SKIP_BUILD" != "true" ]]; then
        # Check if production environment file exists
        if [[ -f ".env.production" && "$FORCE" != "true" ]]; then
            echo -n "Production environment file already exists. Overwrite? (y/N): "
            read -r response
            if [[ "$response" != "y" && "$response" != "Y" ]]; then
                print_color $YELLOW "Using existing .env.production file"
            else
                create_production_env "$PUBLIC_FRONT_URL" "$PUBLIC_MINIO_URL" "$ADMIN_NAME" "$FRONT_PORT" "$MINIO_PORT" "$MINIO_CONSOLE_PORT"
            fi
        else
            create_production_env "$PUBLIC_FRONT_URL" "$PUBLIC_MINIO_URL" "$ADMIN_NAME" "$FRONT_PORT" "$MINIO_PORT" "$MINIO_CONSOLE_PORT"
        fi

        # Build image
        build_docker_image
    else
        print_color $YELLOW "⏭️ Skipping Docker build"
    fi
    
    # Start services
    start_services
    
    # Show status
    echo ""
    print_color $GREEN "✅ Deployment completed successfully!"
    print_color $BLUE "💡 To stop services, run: docker compose --env-file .env.production down"
}

# Clean deployment
clean_deployment() {
    print_color $CYAN "🧹 Cleaning up deployment..."
    
    # Stop and remove containers
    docker compose --env-file .env.production down --remove-orphans --volumes || true
    
    # Remove images
    echo -n "Do you want to remove Docker images as well? (y/N): "
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        docker image rm h5game_platform-frontend:v2.0 -f || true
        print_color $GREEN "✅ Docker images removed"
    fi
    
    print_color $GREEN "✅ Cleanup completed"
}

# Main execution
main() {
    # Parse command line arguments
    parse_args "$@"
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_color $RED "❌ Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker compose is available
    if ! docker compose version &> /dev/null; then
        print_color $RED "❌ Docker Compose is not available"
        exit 1
    fi
    
    # Execute command
    case "$COMMAND" in
        "deploy")
            deploy_production
            ;;
        "clean")
            clean_deployment
            ;;
        *)
            echo "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
