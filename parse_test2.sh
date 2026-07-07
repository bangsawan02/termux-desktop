#!/bin/bash
func1() {
  local x="$1"
  if my_command "a" "b"; then
     echo ok
  fi
}
typeset -f func1 > out.sh
cat out.sh
