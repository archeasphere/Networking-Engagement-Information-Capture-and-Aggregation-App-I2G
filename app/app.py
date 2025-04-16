from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="aws-rds",
    user="postgres",
    password="5ctkENqK6gbW3Nm",
    host="connectec.cdgae8oqycgc.us-east-2.rds.amazonaws.com",
    port="5432"
)
cur = conn.cursor()

# GET all users
@app.route("/users", methods=["GET"])
def get_users():
    cur.execute('SELECT * FROM public."User"')
    rows = cur.fetchall()
    users = [{"UID": row[0], "Name": row[1], "Email": row[2], "Password_hash": row[3]} for row in rows]
    return jsonify(users)

# POST insert new user
@app.route("/users", methods=["POST"])
def add_user():
    data = request.json
    cur.execute(
        'INSERT INTO public."User" ("UID", "Name", "Email", "Password_hash") VALUES (%s, %s, %s, %s)',
        (data["UID"], data["Name"], data["Email"], data["Password_hash"])
    )
    conn.commit()
    return jsonify({"message": "User added"}), 201

# PUT update a user
@app.route("/users/<int:uid>", methods=["PUT"])
def update_user(uid):
    data = request.json
    cur.execute(
        'UPDATE public."User" SET "Name" = %s, "Email" = %s, "Password_hash" = %s WHERE "UID" = %s',
        (data["Name"], data["Email"], data["Password_hash"], uid)
    )
    conn.commit()
    return jsonify({"message": "User updated"})

# DELETE a user
@app.route("/users/<int:uid>", methods=["DELETE"])
def delete_user(uid):
    cur.execute('DELETE FROM public."User" WHERE "UID" = %s', (uid,))
    conn.commit()
    return jsonify({"message": "User deleted"})

if __name__ == "__main__":
    app.run(debug=True)
