#!/usr/bin/env bash

assert_exit_code() {
  local actual="$1"
  local expected="$2"
  if [[ "${actual}" -ne "${expected}" ]]; then
    echo "FAIL: expected exit ${expected}, got ${actual}"
    exit 1
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  if [[ "${haystack}" != *"${needle}"* ]]; then
    echo "FAIL: output missing: ${needle}"
    echo "----- output -----"
    echo "${haystack}"
    exit 1
  fi
}

log_test() {
  echo ""
  echo "== ${1} =="
}

pass_test() {
  echo "PASS ${1}"
}
