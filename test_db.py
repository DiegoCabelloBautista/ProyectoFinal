import pymysql
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='8326',
        database='gymtrack_pro'
    )
    print("Connection successful")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
