---
title: 'Backup Issue - ${{ env.DB_NAME }}'
labels: bug, backup
---

## Issue Description

An error occurred while running the backup job for **${{ env.DB_NAME }}**.

### 📌 Affected Database

- Database: **${{ env.DB_NAME }}**
- Time of failure: ${{ github.event.schedule }}

### 🔍 Error Logs

Please check the logs in GitHub Actions for more details.

### 📢 Next Steps

- Investigate the cause of failure.
- Re-run the backup job manually if needed.
