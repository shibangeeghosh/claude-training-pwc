import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
ALLOWLIST_PATH = os.path.join(ROOT, "allowlist.yaml")
DOMAINS_PATH = os.path.join(ROOT, "domains.yaml")
