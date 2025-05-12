#!/bin/bash
# This script checks tree shaking effectiveness by comparing development and production builds

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tree Shaking and Build Optimization Validation ===${NC}"
echo -e "${BLUE}This script will build dev and prod versions and compare their sizes${NC}"
echo -e "${BLUE}It will also check for removal of test attributes${NC}"
echo

# Build the development version
echo -e "${YELLOW}Building development version...${NC}"
npm run build:dev
echo

# Get sizes of dev build files
DEV_SIZE=$(du -sh dist | cut -f1)
DEV_ASSETS_SIZE=$(du -sh dist/assets | cut -f1)

# Build the production version
echo -e "${YELLOW}Building production version...${NC}"
npm run build
echo

# Get sizes of prod build files
PROD_SIZE=$(du -sh dist | cut -f1)
PROD_ASSETS_SIZE=$(du -sh dist/assets | cut -f1)

# Check for various test attributes in dev build
echo -e "${YELLOW}Checking for test attributes in development build...${NC}"
DEV_TESTID=$(grep -r "data-testid=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
DEV_TEST=$(grep -r "data-test=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
DEV_CY=$(grep -r "data-cy=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
DEV_MARKER=$(grep -r "TEST_ATTRIBUTE_MARKER" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
DEV_TESTIDS=$((DEV_TESTID + DEV_TEST + DEV_CY + DEV_MARKER))

# Check for various test attributes in prod build  
echo -e "${YELLOW}Checking for test attributes in production build...${NC}"
PROD_TESTID=$(grep -r "data-testid=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
PROD_TEST=$(grep -r "data-test=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
PROD_CY=$(grep -r "data-cy=" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
PROD_MARKER=$(grep -r "TEST_ATTRIBUTE_MARKER" dist/assets/*.js | grep -v "map" | wc -l | tr -d ' ')
PROD_TESTIDS=$((PROD_TESTID + PROD_TEST + PROD_CY + PROD_MARKER))

echo
echo -e "${BLUE}=== Results ===${NC}"
echo -e "${BLUE}Development build size:${NC} $DEV_SIZE (assets: $DEV_ASSETS_SIZE)"
echo -e "${BLUE}Production build size:${NC} $PROD_SIZE (assets: $PROD_ASSETS_SIZE)"
echo
echo -e "${BLUE}Test attributes in development:${NC} $DEV_TESTIDS"
echo -e "${BLUE}Test attributes in production:${NC} $PROD_TESTIDS"

# Check if test attributes were stripped
if [ "$PROD_TESTIDS" -eq 0 ] && [ "$DEV_TESTIDS" -gt 0 ]; then
  echo -e "${GREEN}✓ Test attribute stripping is working correctly!${NC}"
elif [ "$DEV_TESTIDS" -eq 0 ]; then
  echo -e "${YELLOW}⚠ No test attributes found in either build${NC}"
else
  echo -e "${RED}✗ Test attributes were NOT stripped from production build!${NC}"
fi

# Check if tree shaking reduced bundle size
if [ "$PROD_ASSETS_SIZE" != "$DEV_ASSETS_SIZE" ]; then
  echo -e "${GREEN}✓ Tree shaking appears to be working - bundle size is different between dev and prod${NC}"
else
  echo -e "${RED}✗ Bundle size is identical - tree shaking may not be effective${NC}"
fi

echo
echo -e "${BLUE}For detailed bundle analysis, run:${NC} npm run analyze-bundle"
