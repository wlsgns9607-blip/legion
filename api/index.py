import sys
import os

# 루트 디렉토리의 server.py 모듈 임포트 가능하도록 경로 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app
