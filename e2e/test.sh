#!/bin/bash
set -e

echo "=== CYBERTANTRA E2E TEST ==="
echo ""

# 1. Menu - initial state
echo "1. Menu (initial)"
agent-browser open http://localhost:31337
sleep 3
agent-browser screenshot /tmp/e2e-01-menu.png

# 2. Menu - navigate down
echo "2. Menu (select rituals)"
agent-browser press ArrowDown
sleep 0.5
agent-browser screenshot /tmp/e2e-02-menu-rituals.png

# 3. Menu - navigate back up
echo "3. Menu (select invocation)"
agent-browser press ArrowUp
sleep 0.5
agent-browser screenshot /tmp/e2e-03-menu-invocation.png

# 4. Enter invocation - opening screen
echo "4. Invocation opening"
agent-browser press Space
sleep 2
agent-browser screenshot /tmp/e2e-04-invocation-opening.png

# 5. Start content
echo "5. Invocation content start"
agent-browser press Space
sleep 3
agent-browser screenshot /tmp/e2e-05-invocation-content.png

# 6. Advance with space
echo "6. Advance lines"
agent-browser press Space
sleep 1
agent-browser screenshot /tmp/e2e-06-invocation-advance1.png

agent-browser press Space
sleep 1
agent-browser screenshot /tmp/e2e-07-invocation-advance2.png

agent-browser press Space
sleep 1
agent-browser screenshot /tmp/e2e-08-invocation-advance3.png

# 7. Wait for section to complete
echo "7. Wait for section"
sleep 5
agent-browser screenshot /tmp/e2e-09-section-complete.png

# 8. Go to next section
echo "8. Next section"
agent-browser press Space
sleep 3
agent-browser screenshot /tmp/e2e-10-section2.png

# 9. Go back with Enter
echo "9. Go back"
agent-browser press Enter
sleep 1
agent-browser screenshot /tmp/e2e-11-back.png

# 10. Go back to menu
echo "10. Back to menu"
agent-browser press Escape
sleep 1
agent-browser screenshot /tmp/e2e-12-menu-return.png

agent-browser close
echo ""
echo "=== ALL SCREENSHOTS SAVED TO /tmp/e2e-*.png ==="
