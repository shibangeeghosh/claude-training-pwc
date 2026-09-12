import yaml
import fnmatch
from datetime import datetime, timedelta

def load_allowlist(path):
    with open(path) as f:
        return yaml.safe_load(f)

def check_target(target, allowlist):
    for entry in allowlist.get("sources", []):
        pattern = entry.get("pattern", "")
        if fnmatch.fnmatch(target, pattern):
            return True, entry
    return False, None

def is_stale(entry, months=12):
    last_reviewed = datetime.strptime(entry["last_reviewed"], "%Y-%m-%d")
    threshold = datetime.now() - timedelta(days=30*months)
    return last_reviewed < threshold
