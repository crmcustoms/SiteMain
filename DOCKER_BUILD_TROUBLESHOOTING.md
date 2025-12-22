# Docker Build Troubleshooting

## Problem: Missing Static Files (404 on CSS/JS/Fonts)

**Symptoms:**
- Application loads but no styling
- Browser console shows 404 errors on `/_next/static/css/*.css`
- All `.js`, `.woff2`, and other static files return 404

**Root Cause:**
Next.js 15 with `output: 'standalone'` creates static files in `/app/.next/static/` during the build, but this directory is NOT included in `/app/.next/standalone/` output.

The builder creates:
- `/app/.next/static/` ← **Static files (CSS, JS, fonts)**
- `/app/.next/standalone/` ← **Only application code, not static files**

### Why This Happens

When Next.js runs with `output: 'standalone'`:
1. It creates a standalone build in `.next/standalone/` with minimal dependencies
2. Static files (CSS, JS chunks) are created separately in `.next/static/`
3. Only `.next/standalone/` is typically copied to production image
4. Result: Static files are missing from the container

## Solution

In `Dockerfile`, explicitly copy the static files directory:

```dockerfile
# Copy application from standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ /app/

# ⚠️ CRITICAL: Copy static files separately (they're not in .next/standalone/)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static /app/.next/static

# Copy public files
COPY --from=builder --chown=nextjs:nodejs /app/public /app/public
```

## Debugging Commands

To verify static files are being built:

```bash
# In builder stage, check if .next/static exists
[ -d .next/static ] && echo "✓ .next/static found" || echo "✗ .next/static NOT found"

# List files in static directory
ls -la .next/static/

# In runner stage, verify static files were copied
docker exec <container-id> ls -la /app/.next/static/
```

## Related Files

- `Dockerfile` - Lines 54-57 contain the critical COPY commands
- `next.config.mjs` - Line 4 has `output: 'standalone'`
- `docker-compose.yaml` - Environment configuration

## Prevention Checklist

- [ ] Dockerfile copies both `/app/.next/standalone/` AND `/app/.next/static`
- [ ] When changing Next.js output mode, verify static files are included
- [ ] Test deployment by checking browser DevTools Network tab for static file requests
- [ ] Docker build logs should show files being copied to image
