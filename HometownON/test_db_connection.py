#!/usr/bin/env python3
"""
데이터베이스 연결 테스트 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.database import engine, SessionLocal
    from app.core.config import settings
    print("✅ 모듈 import 성공")
    
    # 설정 확인
    print(f"📋 MySQL 설정:")
    print(f"   Host: {settings.mysql_host}")
    print(f"   Port: {settings.mysql_port}")
    print(f"   User: {settings.mysql_user}")
    print(f"   Database: {settings.mysql_database}")
    
    # 데이터베이스 연결 테스트
    print("\n🔌 데이터베이스 연결 테스트 중...")
    
    # SQLAlchemy 엔진으로 연결 테스트
    from sqlalchemy import text
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1 as test"))
        test_value = result.fetchone()[0]
        if test_value == 1:
            print("✅ 데이터베이스 연결 성공!")
        
        # 데이터베이스 목록 확인
        result = connection.execute(text("SHOW DATABASES"))
        databases = [row[0] for row in result.fetchall()]
        print(f"📊 사용 가능한 데이터베이스: {databases}")
        
        # hometown_on 데이터베이스 존재 확인
        if settings.mysql_database in databases:
            print(f"✅ '{settings.mysql_database}' 데이터베이스가 존재합니다.")
        else:
            print(f"❌ '{settings.mysql_database}' 데이터베이스가 존재하지 않습니다.")
            print("   데이터베이스를 생성해야 합니다.")
            
        # 현재 데이터베이스의 테이블 확인
        try:
            connection.execute(text(f"USE {settings.mysql_database}"))
            result = connection.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 '{settings.mysql_database}' 데이터베이스의 테이블: {tables}")
        except Exception as e:
            print(f"⚠️  테이블 조회 실패: {e}")

except ImportError as e:
    print(f"❌ 모듈 import 실패: {e}")
    print("   필요한 패키지가 설치되지 않았을 수 있습니다.")
except Exception as e:
    print(f"❌ 데이터베이스 연결 실패: {e}")
    print("   MySQL 서버가 실행 중인지 확인하세요.")
    print("   또는 연결 정보(.env 파일)를 확인하세요.")