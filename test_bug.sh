#!/bin/bash
source setup-termux-desktop 2>/dev/null & PID=$!
sleep 1
kill -9 $PID
typeset -f download_and_extract > test_out.txt
cat test_out.txt | grep -A 2 -B 2 'download_file'
