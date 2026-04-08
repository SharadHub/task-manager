#!/bin/bash

# Professional script to commit each file with descriptive messages based on content analysis

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting professional commit process for TaskFlow project...${NC}"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${CYAN}📁 Initializing Git repository...${NC}"
    git init
    git branch -M main
fi

# Add all files (respecting .gitignore)
echo -e "${CYAN}📋 Adding all files to staging area...${NC}"
git add .

# Get all staged files
files=$(git diff --cached --name-only | sort)

if [ -z "$files" ]; then
    echo -e "${YELLOW}⚠️  No files to commit or all files are up to date.${NC}"
    exit 0
fi

echo -e "${GREEN}📊 Found $(echo "$files" | wc -l) files to commit${NC}"

# Function to generate professional commit message based on file analysis
generate_commit_message() {
    local file="$1"
    local filename=$(basename "$file")
    
    case "$file" in
        "README.md")
            echo "docs: add comprehensive project documentation and setup guide"
            ;;
        "server/package.json")
            echo "feat: initialize Express.js backend with core dependencies"
            ;;
        "client/package.json")
            echo "feat: initialize Next.js frontend with React and Tailwind CSS"
            ;;
        "server/index.js")
            echo "feat: set up Express server with MongoDB connection and API routes"
            ;;
        "server/models/Task.js")
            echo "feat: create Task model with time tracking and status management"
            ;;
        "server/models/Project.js")
            echo "feat: create Project model with color coding and metadata"
            ;;
        "server/routes/tasks.js")
            echo "feat: implement CRUD API endpoints for task management"
            ;;
        "server/routes/projects.js")
            echo "feat: implement CRUD API endpoints for project management"
            ;;
        "server/routes/stats.js")
            echo "feat: add analytics endpoints for productivity insights"
            ;;
        "client/app/layout.js")
            echo "feat: create Next.js app layout with responsive design"
            ;;
        "client/app/page.js")
            echo "feat: implement main dashboard with task overview"
            ;;
        "client/app/globals.css")
            echo "style: add global CSS variables and base styling"
            ;;
        "client/components/Dashboard.js")
            echo "feat: build dashboard component with real-time statistics"
            ;;
        "client/components/TasksView.js")
            echo "feat: create task management interface with filtering"
            ;;
        "client/components/TaskCard.js")
            echo "feat: implement task card component with priority indicators"
            ;;
        "client/components/TaskModal.js")
            echo "feat: add modal for creating and editing tasks"
            ;;
        "client/components/ProjectsView.js")
            echo "feat: build project management interface with progress tracking"
            ;;
        "client/components/AnalyticsView.js")
            echo "feat: create analytics dashboard with charts and insights"
            ;;
        "client/components/HistoryView.js")
            echo "feat: implement task history view with chronological display"
            ;;
        "client/components/Sidebar.js")
            echo "feat: add navigation sidebar with project links"
            ;;
        "client/components/StatCard.js")
            echo "feat: create reusable statistics card component"
            ;;
        "client/lib/api.js")
            echo "feat: implement API client with axios for backend communication"
            ;;
        "client/lib/utils.js")
            echo "feat: add utility functions for date formatting and helpers"
            ;;
        "client/next.config.js")
            echo "config: configure Next.js build settings"
            ;;
        "client/tailwind.config.js")
            echo "config: set up Tailwind CSS with custom theme"
            ;;
        "client/postcss.config.js")
            echo "config: configure PostCSS for CSS processing"
            ;;
        "server/package-lock.json"|"client/package-lock.json")
            echo "chore: update dependency lock file"
            ;;
        "server/.env"|"client/.env.local")
            echo "chore: add environment configuration file"
            ;;
        *)
            # Generic messages based on file type
            if [[ "$file" == *.js ]]; then
                echo "feat: add JavaScript module - $(basename "$file" .js | sed 's/_/ /g' | sed 's/\([A-Z]\)/ \1/g')"
            elif [[ "$file" == *.json ]]; then
                echo "config: add JSON configuration - $filename"
            elif [[ "$file" == *.css ]]; then
                echo "style: add CSS styling - $filename"
            elif [[ "$file" == *.md ]]; then
                echo "docs: add documentation - $filename"
            else
                echo "feat: add $filename"
            fi
            ;;
    esac
}

# Commit each file individually
commit_count=0
for file in $files; do
    if [ -f "$file" ]; then
        # Reset staging and stage only this file
        git reset
        git add "$file"
        
        # Generate professional commit message
        commit_msg=$(generate_commit_message "$file")
        
        # Commit with the generated message
        git commit -m "$commit_msg"
        commit_count=$((commit_count + 1))
        
        echo -e "${GREEN}✅ [$commit_count] Committed: $commit_msg${NC}"
        echo -e "${CYAN}   📁 File: $file${NC}"
        echo ""
    fi
done

if [ $commit_count -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No files were committed.${NC}"
    exit 0
fi

# Check if remote exists, if not, prompt user to add remote
if ! git remote get-url origin >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  No remote 'origin' found.${NC}"
    echo -e "${CYAN}Please add your GitHub repository as remote:${NC}"
    echo -e "${CYAN}git remote add origin <your-github-repo-url>${NC}"
    echo -e "${CYAN}Then run this script again.${NC}"
    exit 1
fi

# Push all commits to remote
echo -e "${BLUE}📤 Pushing $commit_count commits to remote repository...${NC}"
git push -u origin main --force

echo -e "${GREEN}🎉 Successfully committed and pushed $commit_count files to GitHub!${NC}"
echo -e "${CYAN}📊 Commit summary: Each file was committed with a descriptive message based on its purpose.${NC}"
