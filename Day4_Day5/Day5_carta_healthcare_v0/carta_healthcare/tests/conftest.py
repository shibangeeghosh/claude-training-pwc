import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest

from src import exception_queue


@pytest.fixture(autouse=True)
def _reset_exception_queue():
    exception_queue.reset()
    yield
    exception_queue.reset()
