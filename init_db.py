import pymysql
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='8326'
    )
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS gymtrack_pro")
    print("Database ensured")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
