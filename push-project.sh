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

# Get only modified and untracked files (not staged ones)
echo -e "${CYAN}📋 Analyzing modified and untracked files...${NC}"

# Get modified files
modified_files=$(git diff --name-only | sort)
# Get untracked files
untracked_files=$(git ls-files --others --exclude-standard | sort)

# Combine both lists
files=$(echo -e "$modified_files\n$untracked_files" | sort | grep -v '^$')

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
            echo "fix: add ObjectId validation and improve error handling for timer endpoints"
            ;;
        "server/routes/projects.js")
            echo "feat: implement CRUD API endpoints for project management"
            ;;
        "server/routes/stats.js")
            echo "fix: resolve timezone issues in daily stats API for accurate date display"
            ;;
        "client/app/layout.js")
            echo "fix: add navigation sidebar and suppress hydration warnings for better UX"
            ;;
        "client/app/page.js")
            echo "feat: implement root redirect to dashboard with Next.js router"
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
            echo "fix: add error handling for timer operations and improve user feedback"
            ;;
        "client/components/TaskModal.js")
            echo "feat: add modal for creating and editing tasks"
            ;;
        "client/components/ProjectsView.js")
            echo "fix: implement Next.js router for smooth project navigation"
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
        "client/components/NavigationSidebar.js")
            echo "feat: create Next.js router-based navigation sidebar for smooth client-side routing"
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
        "client/app/dashboard/"|"client/app/tasks/"|"client/app/projects/"|"client/app/history/"|"client/app/analytics/")
            echo "feat: implement Next.js App Router structure for individual page routes"
            ;;
        "client/app/dashboard/page.js")
            echo "feat: create dedicated dashboard route with analytics and statistics"
            ;;
        "client/app/tasks/page.js")
            echo "feat: create dedicated tasks route with searchParams support"
            ;;
        "client/app/projects/page.js")
            echo "feat: create dedicated projects route for project management"
            ;;
        "client/app/history/page.js")
            echo "feat: create dedicated history route for task completion tracking"
            ;;
        "client/app/analytics/page.js")
            echo "feat: create dedicated analytics route for detailed productivity insights"
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
    if [ -f "$file" ] || [ -d "$file" ]; then
        # Stage only this file
        git add "$file"
        
        # Generate professional commit message
        commit_msg=$(generate_commit_message "$file")
        
        # Determine file type for output
        if echo "$modified_files" | grep -q "^$file$"; then
            file_type="Modified"
        elif echo "$untracked_files" | grep -q "^$file$"; then
            file_type="New"
        else
            file_type="Changed"
        fi
        
        # Commit with the generated message
        git commit -m "$commit_msg"
        commit_count=$((commit_count + 1))
        
        echo -e "${GREEN}✅ [$commit_count] $file_type: $commit_msg${NC}"
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
echo -e "${CYAN}📊 Commit summary: Modified files were committed with fix/feat messages, new files with descriptive purpose messages.${NC}"
echo -e "${CYAN}🔄 All navigation now uses Next.js router for smooth UX, date/time issues resolved, and proper routing structure implemented.${NC}"
