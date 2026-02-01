#!/bin/bash

# AutoSense Analytics - Deployment Script
# This script automates the deployment process to various platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing=0
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        missing=1
    else
        print_success "Docker is installed"
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        missing=1
    else
        print_success "Git is installed"
    fi
    
    if [[ $missing -eq 1 ]]; then
        print_error "Please install missing prerequisites"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Build Docker images locally
build_images() {
    print_header "Building Docker Images"
    
    print_info "Building backend image..."
    docker build -t autosense-backend:latest ./backend
    print_success "Backend image built"
    
    print_info "Building frontend image..."
    docker build -t autosense-frontend:latest ./frontend
    print_success "Frontend image built"
}

# Run with Docker Compose
run_local() {
    print_header "Running Locally with Docker Compose"
    
    print_info "Starting services..."
    docker-compose up -d
    
    sleep 5
    
    print_info "Checking service health..."
    
    if docker-compose ps | grep -q "healthy"; then
        print_success "Backend service is healthy"
    else
        print_warning "Backend service may not be ready yet"
    fi
    
    if docker-compose ps | grep -q "healthy"; then
        print_success "Frontend service is healthy"
    else
        print_warning "Frontend service may not be ready yet"
    fi
    
    echo ""
    print_success "Services are running!"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend API: http://localhost:8000${NC}"
    echo -e "${BLUE}API Docs: http://localhost:8000/docs${NC}"
}

# Push to Docker Hub
push_docker_hub() {
    print_header "Pushing Images to Docker Hub"
    
    read -p "Enter Docker Hub username: " docker_user
    
    print_info "Logging in to Docker Hub..."
    docker login
    
    print_info "Tagging backend image..."
    docker tag autosense-backend:latest "$docker_user/autosense-backend:latest"
    
    print_info "Tagging frontend image..."
    docker tag autosense-frontend:latest "$docker_user/autosense-frontend:latest"
    
    print_info "Pushing backend image..."
    docker push "$docker_user/autosense-backend:latest"
    print_success "Backend image pushed"
    
    print_info "Pushing frontend image..."
    docker push "$docker_user/autosense-frontend:latest"
    print_success "Frontend image pushed"
    
    echo ""
    print_success "Images pushed successfully!"
    echo -e "${BLUE}Backend: $docker_user/autosense-backend:latest${NC}"
    echo -e "${BLUE}Frontend: $docker_user/autosense-frontend:latest${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    print_header "Deploying Frontend to Vercel"
    
    print_info "Checking if Vercel CLI is installed..."
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm i -g vercel
    fi
    
    print_info "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
    echo ""
    print_info "Next steps:"
    echo "1. Go to vercel.com dashboard"
    echo "2. Configure NEXT_PUBLIC_API_URL environment variable"
    echo "3. Set it to your backend URL (e.g., https://your-backend.railway.app)"
}

# Deploy to Railway
deploy_railway() {
    print_header "Deploying Backend to Railway"
    
    print_info "Ensure you have:"
    echo "1. Railway account (railway.app)"
    echo "2. Railway CLI installed (npm i -g @railway/cli)"
    echo "3. GitHub repository pushed"
    
    echo ""
    print_info "Steps:"
    echo "1. Go to railway.app dashboard"
    echo "2. Click 'New Project' → 'Deploy from GitHub'"
    echo "3. Select your autosense-analytics repository"
    echo "4. Configure backend service (set root directory to ./backend)"
    echo "5. Railway will auto-detect and deploy the Dockerfile"
    
    echo ""
    print_warning "This is a manual process. Please follow the steps above."
}

# GitHub push
push_github() {
    print_header "Pushing to GitHub"
    
    print_info "Checking git status..."
    if [[ -z $(git status -s) ]]; then
        print_warning "No changes to commit"
        return
    fi
    
    read -p "Enter commit message: " commit_msg
    
    print_info "Adding files..."
    git add .
    
    print_info "Committing changes..."
    git commit -m "$commit_msg"
    
    print_info "Pushing to GitHub..."
    git push origin main
    
    print_success "Changes pushed to GitHub!"
}

# Show menu
show_menu() {
    echo ""
    echo -e "${BLUE}=== AutoSense Analytics Deployment Menu ===${NC}"
    echo "1. Check Prerequisites"
    echo "2. Build Docker Images Locally"
    echo "3. Run Locally with Docker Compose"
    echo "4. Push to Docker Hub"
    echo "5. Deploy Frontend to Vercel"
    echo "6. Deploy Backend to Railway"
    echo "7. Push to GitHub"
    echo "8. Full Deployment (GitHub → Vercel → Railway)"
    echo "9. Clean Up (Stop and Remove Containers)"
    echo "0. Exit"
    echo ""
    read -p "Select an option [0-9]: " choice
}

# Clean up
cleanup() {
    print_header "Cleaning Up"
    
    print_info "Stopping Docker Compose services..."
    docker-compose down
    
    print_info "Removing images..."
    docker rmi autosense-backend:latest || true
    docker rmi autosense-frontend:latest || true
    
    print_success "Cleanup completed!"
}

# Full deployment
full_deployment() {
    print_header "Full Deployment Pipeline"
    
    echo ""
    print_info "Step 1: Pushing to GitHub"
    push_github
    
    echo ""
    print_info "Step 2: Deploy Frontend to Vercel"
    print_warning "This requires manual setup. Please follow the prompt."
    deploy_vercel
    
    echo ""
    print_info "Step 3: Deploy Backend to Railway"
    print_warning "This requires manual setup. Please follow the steps above."
    deploy_railway
    
    echo ""
    print_success "Full deployment pipeline started!"
    echo -e "${BLUE}Monitor your deployments at:${NC}"
    echo "- Vercel: https://vercel.com/dashboard"
    echo "- Railway: https://railway.app/dashboard"
}

# Main loop
main() {
    print_header "AutoSense Analytics - Deployment Tool"
    
    while true; do
        show_menu
        
        case $choice in
            1)
                check_prerequisites
                ;;
            2)
                build_images
                ;;
            3)
                run_local
                ;;
            4)
                push_docker_hub
                ;;
            5)
                deploy_vercel
                ;;
            6)
                deploy_railway
                ;;
            7)
                push_github
                ;;
            8)
                full_deployment
                ;;
            9)
                cleanup
                ;;
            0)
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
    done
}

# Run main function
main
