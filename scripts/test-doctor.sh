#!/usr/bin/env bash
# CLI exit-code smoke tests — docs/cli.md (ACK-001+)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/assert.sh
source "${ROOT_DIR}/scripts/lib/assert.sh"

CLI="${ROOT_DIR}/dist/bin/cli.js"
SANDBOX="${ROOT_DIR}/.sandbox/ack-cli"
FIXTURE="${ROOT_DIR}/test/fixtures/ack-dir.config.json"

echo "Building..."
npm run build --silent

rm -rf "${SANDBOX}"
mkdir -p "${SANDBOX}"

run_cli() {
  set +e
  OUTPUT="$(node "${CLI}" "$@" 2>&1)"
  STATUS=$?
  set -e
}

log_test "ACK-001"
run_cli help
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "init"
pass_test "ACK-001"

log_test "ACK-002"
run_cli generate
assert_exit_code "${STATUS}" 2
assert_contains "${OUTPUT}" "--config"
pass_test "ACK-002"

log_test "ACK-003"
run_cli init
assert_exit_code "${STATUS}" 2
assert_contains "${OUTPUT}" "--preset"
pass_test "ACK-003"

log_test "ACK-004"
run_cli not-a-command
assert_exit_code "${STATUS}" 2
pass_test "ACK-004"

log_test "ACK-005"
cp "${FIXTURE}" "${SANDBOX}/ack.config.json"
printf '%s\n' '{"preset":"dir","output":"out.md","pipeline":{"onotFormat":"html"}}' > "${SANDBOX}/bad-ack.config.json"
run_cli generate --config bad-ack.config.json --cwd "${SANDBOX}"
assert_exit_code "${STATUS}" 2
assert_contains "${OUTPUT}" "validation failed"
pass_test "ACK-005"

log_test "ACK-006"
run_cli generate --config ack.config.json --cwd "${SANDBOX}" --dry-run
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "dry-run"
pass_test "ACK-006"

echo ""
echo "All ACK tests passed."
