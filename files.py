from flask import Flask, request, jsonify
import psycopg2
import datetime

app = Flask(__name__)

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="5ctkENqK6gbW3Nm",
    host="connectec.cdgae8oqycgc.us-east-2.rds.amazonaws.com",
    port="5432"
)
cur = conn.cursor()

@app.route('/files', methods=['GET'])
def get_all_files():
    cur.execute('SELECT * FROM "File"')
    rows = cur.fetchall()
    files = []
    for row in rows:
        files.append({
            "id": row[0],
            "UID": row[1],
            "name": row[2],
            "type": row[3],
            "size": row[4],
            "url": row[5],
            "upload_time": row[6]
        })
    return jsonify(files)

@app.route('/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    cur.execute('SELECT * FROM "File" WHERE id = %s', (file_id,))
    row = cur.fetchone()
    if row:
        file = {
            "id": row[0],
            "UID": row[1],
            "name": row[2],
            "type": row[3],
            "size": row[4],
            "url": row[5],
            "upload_time": row[6]
        }
        return jsonify(file)
    return jsonify({'error': 'File not found'}), 404

@app.route('/files', methods=['POST'])
def add_file():
    data = request.get_json()
    cur.execute(
        'INSERT INTO "File" (id, "UID", name, type, size, url, upload_time) VALUES (%s, %s, %s, %s, %s, %s, %s)',
        (
            data['id'],
            data.get('UID'),
            data['name'],
            data['type'],
            data['size'],
            data['url'],
            data.get('upload_time', datetime.datetime.now())
        )
    )
    conn.commit()
    return jsonify({'message': 'File added successfully'}), 201

@app.route('/files/<int:file_id>', methods=['PUT'])
def update_file(file_id):
    data = request.get_json()
    cur.execute(
        'UPDATE "File" SET "UID"=%s, name=%s, type=%s, size=%s, url=%s, upload_time=%s WHERE id=%s',
        (
            data.get('UID'),
            data['name'],
            data['type'],
            data['size'],
            data['url'],
            data.get('upload_time', datetime.datetime.now()),
            file_id
        )
    )
    conn.commit()
    return jsonify({'message': 'File updated successfully'})

@app.route('/files/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    cur.execute('DELETE FROM "File" WHERE id = %s', (file_id,))
    conn.commit()
    return jsonify({'message': 'File deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
