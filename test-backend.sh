#!/bin/bash

echo "🔍 Testing Backend Connection..."
echo ""

# Test token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGY4YTFiMmMzZDRlNWY2YTdiOGM5ZDAiLCJlbWFpbCI6ImFkbWluQG5ld3RvbmJvdGljcy5jb20iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyIqIl0sImlhdCI6MTczNTczODA5MiwiZXhwIjoxNzM1ODI0NDkyfQ.test"

# Test ports
for PORT in 3001 3005; do
    echo "📡 Testing port $PORT..."
    
    # Test GET events
    echo "  GET /api/events..."
    GET_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:$PORT/api/events")
    HTTP_CODE="${GET_RESPONSE: -3}"
    RESPONSE_BODY="${GET_RESPONSE%???}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        EVENT_COUNT=$(echo "$RESPONSE_BODY" | grep -o '"items":\[.*\]' | grep -o '"_id"' | wc -l)
        echo "  ✅ GET /api/events - SUCCESS ($EVENT_COUNT events)"
        
        # Get first event ID for delete test
        FIRST_EVENT_ID=$(echo "$RESPONSE_BODY" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ ! -z "$FIRST_EVENT_ID" ]; then
            echo "  🗑️  Testing DELETE /api/events/$FIRST_EVENT_ID..."
            DELETE_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE -H "Authorization: Bearer $TOKEN" "http://localhost:$PORT/api/events/$FIRST_EVENT_ID")
            DELETE_HTTP_CODE="${DELETE_RESPONSE: -3}"
            
            if [ "$DELETE_HTTP_CODE" = "200" ]; then
                echo "  ✅ DELETE /api/events/$FIRST_EVENT_ID - SUCCESS"
            else
                echo "  ❌ DELETE /api/events/$FIRST_EVENT_ID - FAILED ($DELETE_HTTP_CODE)"
            fi
        fi
    else
        echo "  ❌ GET /api/events - FAILED ($HTTP_CODE)"
    fi
    echo ""
done

# Check environment file
echo "📄 Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local content: $(cat .env.local)"
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "🔧 Recommendations:"
echo "1. If port 3005 works but frontend calls 3001, restart Next.js dev server"
echo "2. If both ports fail, check if backend is running"
echo "3. If authentication fails, check token format"
