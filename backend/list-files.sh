#!/bin/bash
# Complete file list for Smart Agriculture API Backend

echo "📁 Smart Agriculture API - Project Structure"
echo "=============================================="
echo ""

echo "📂 Root Directory Files:"
ls -lah | grep -E "^-" | awk '{print "   " $NF}'

echo ""
echo "📂 Source Code (src/):"
find src -type f -name "*.js" | sort | sed 's/^/   /'

echo ""
echo "📂 Middleware Files:"
ls -lah src/middleware/*.js | awk '{print "   " $NF}'

echo ""
echo "📂 Models:"
ls -lah src/models/*.js | awk '{print "   " $NF}'

echo ""
echo "📂 Controllers:"
ls -lah src/controllers/*.js | awk '{print "   " $NF}'

echo ""
echo "📂 Services:"
ls -lah src/services/*.js | awk '{print "   " $NF}'

echo ""
echo "📂 Routes:"
ls -lah src/routes/*.js | awk '{print "   " $NF}'

echo ""
echo "📂 Configuration:"
ls -lah src/config/*.js | awk '{print "   " $NF}'

echo ""
echo "✅ Project setup complete!"
