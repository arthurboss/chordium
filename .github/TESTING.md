# Path-based Workflow Testing

To test that the path-based filtering works correctly, you can make changes to specific directories and observe which GitHub Actions workflows run:

## Test Cases

### Test 1: Frontend-only change
```bash
# Make a small change to a frontend file
echo "// Test comment" >> frontend/src/App.tsx
git add frontend/src/App.tsx
git commit -m "test: frontend-only change"
git push
```
**Expected**: Only frontend tests and frontend build should run

### Test 2: Backend-only change  
```bash
# Make a small change to a backend file
echo "// Test comment" >> backend/server.ts
git add backend/server.ts
git commit -m "test: backend-only change"
git push
```
**Expected**: Only backend tests and backend build should run

### Test 3: Shared change
```bash
# Make a change to root package.json
# (or any file in the shared paths list)
git add package.json
git commit -m "test: shared change"
git push
```
**Expected**: Both frontend AND backend tests/builds should run

### Test 4: Documentation-only change
```bash
# Make a change to a file not covered by any paths
echo "Test update" >> README.md
git add README.md
git commit -m "test: docs-only change"
git push
```
**Expected**: No tests or builds should run (workflows skip entirely)

## Monitoring Results

You can verify the path filtering is working by:

1. **GitHub Actions tab**: Check which jobs run vs skip
2. **Job logs**: Look for "Job was skipped" messages
3. **Workflow duration**: Should be much faster for partial runs
4. **Artifacts**: Only relevant build artifacts should be created

## Path Configuration Summary

| Path Pattern | Triggers | Description |
|--------------|----------|-------------|
| `frontend/**` | Frontend jobs | Any file in frontend directory |
| `backend/**` | Backend jobs | Any file in backend directory |
| `package.json` | All jobs | Root package.json changes |
| `package-lock.json` | All jobs | Root lockfile changes |
| `.github/workflows/**` | All jobs | Workflow changes |
| `shared/**` | All jobs | Shared code/types |
