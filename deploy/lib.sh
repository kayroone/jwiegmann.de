set -euo pipefail

: "${DEPLOY_BASE:=/home/kayro/apps/jwiegmann.de}"
: "${DEPLOY_NODE_BIN:=/home/kayro/.nvm/versions/node/v22.19.0/bin}"
: "${DEPLOY_HEALTH_URL:=http://127.0.0.1:3000/}"
: "${DEPLOY_HEALTH_TRIES:=15}"
: "${DEPLOY_HEALTH_INTERVAL:=1}"
: "${DEPLOY_LOCK:=$DEPLOY_BASE/.deploy.lock}"

PATH="$DEPLOY_NODE_BIN:/usr/local/bin:/usr/bin:/bin"
export PATH

RELEASES="$DEPLOY_BASE/releases"
CURRENT="$DEPLOY_BASE/current"
KEEP=5

valid_id() {
  [[ ${1-} =~ ^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{7}$ ]]
}

take_lock() {
  exec 9>"$DEPLOY_LOCK"
  flock 9
}

current_id() {
  local target
  target=$(readlink "$CURRENT" 2>/dev/null) || return 0
  printf '%s\n' "${target##*/}"
}

list_releases() {
  local entry name
  for entry in "$RELEASES"/*; do
    name=${entry##*/}
    if valid_id "$name"; then
      printf '%s\n' "$name"
    fi
  done | sort
}

switch_current() {
  ln -sfn "$1" "$DEPLOY_BASE/.current.tmp"
  mv -T "$DEPLOY_BASE/.current.tmp" "$CURRENT"
}

reload_pm2() {
  pm2 startOrReload "$CURRENT/ecosystem.config.js" --only jwiegmann --update-env 9>&- >&2
}

release_running() {
  local pid
  pid=$(pm2 pid jwiegmann 9>&- 2>/dev/null || true)
  [[ $pid =~ ^[0-9]+$ ]] || return 1
  [ "$pid" -gt 0 ] || return 1
  [ "$(readlink -f "/proc/$pid/cwd" 2>/dev/null)" = "$(readlink -f "$RELEASES/$1")" ]
}

health_ok() {
  local attempt code
  for ((attempt = 1; attempt <= DEPLOY_HEALTH_TRIES; attempt++)); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$DEPLOY_HEALTH_URL" 9>&- || true)
    if [ "$code" = 200 ] && release_running "$1"; then
      return 0
    fi
    if [ "$attempt" -lt "$DEPLOY_HEALTH_TRIES" ]; then
      sleep "$DEPLOY_HEALTH_INTERVAL"
    fi
  done
  return 1
}

prune_releases() {
  local keep_also=$1 current count=0 id
  current=$(current_id)
  while IFS= read -r id; do
    count=$((count + 1))
    if [ "$count" -le "$KEEP" ] || [ "$id" = "$current" ] || [ "$id" = "$keep_also" ]; then
      continue
    fi
    rm -rf -- "${RELEASES:?}/$id"
  done < <(list_releases | sort -r)
}
