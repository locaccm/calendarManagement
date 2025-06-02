#!/bin/bash
# Fix the status code in the test file for the invalid accommodation ID format test
# Replace 500 with 400 at line 715
sed -i '715 s/500/400/' /home/eno/calendarManagement/src/tests/eventController.coverage.test.ts
echo "Fixed status code expectation at line 715"
