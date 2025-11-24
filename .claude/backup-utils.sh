#!/bin/bash

# Claude Code Backup Utilities
# Manual backup system for file safety during development

# Create backup of a file before editing
# Usage: backup_file <file_path>
backup_file() {
    local file_path="$1"
    local backup_path="${file_path}.bak"

    if [[ -f "$file_path" ]]; then
        echo "🔒 Creating backup: $file_path -> $backup_path"
        cp "$file_path" "$backup_path"
        return 0
    else
        echo "❌ Error: File not found: $file_path"
        return 1
    fi
}

# Restore file from backup
# Usage: restore_backup <file_path>
restore_backup() {
    local file_path="$1"
    local backup_path="${file_path}.bak"

    if [[ -f "$backup_path" ]]; then
        echo "🔄 Restoring from backup: $backup_path -> $file_path"
        cp "$backup_path" "$file_path"
        return 0
    else
        echo "❌ Error: Backup not found: $backup_path"
        return 1
    fi
}

# List all current backup files
# Usage: list_backups
list_backups() {
    echo "📁 Current backups:"
    find . -name "*.bak" -type f 2>/dev/null | head -20
    local count=$(find . -name "*.bak" -type f 2>/dev/null | wc -l)
    echo "Total: $count backup files"
}

# Clean up all backup files
# Usage: clean_backups
clean_backups() {
    echo "🧹 Cleaning up all .bak files..."
    local count=$(find . -name "*.bak" -type f -delete 2>/dev/null | wc -l)
    echo "✅ Backup cleanup complete. Removed $count backup files."
}

# Check if file has changes that need backup
# Usage: needs_backup <file_path>
needs_backup() {
    local file_path="$1"

    # Check if file has unstaged changes
    if git status --porcelain "$file_path" 2>/dev/null | grep -q "^ M"; then
        return 0  # File has modifications, needs backup
    else
        return 1  # File is clean, no backup needed
    fi
}

# Main backup workflow
# Usage: safe_edit <file_path>
safe_edit() {
    local file_path="$1"

    if needs_backup "$file_path"; then
        echo "⚠️  File has unstaged changes - creating backup..."
        backup_file "$file_path"
    else
        echo "✅ File is clean - no backup needed"
    fi
}