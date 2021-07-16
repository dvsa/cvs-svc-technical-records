lsof -i:8003 | awk '{print $2}' | grep -v '^PID'
