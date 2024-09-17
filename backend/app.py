from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Configure the SQLAlchemy part of the application
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a strong secret key

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Create a User model for the database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')  # Default role is 'user'

# Create the database tables (only the first time)
with app.app_context():
    db.create_all()

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

# Login route
# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Fetch the user from the database based on the username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if the user exists and if the password is correct
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        
        # If the username is 'admin' and the password is 'password', mark the user as admin
        if data['username'] == 'admin' and data['password'] == 'password':
            user.role = 'admin'  # Update the role of this user to 'admin' in the database
            db.session.commit()  # Commit the role update to the database

        return jsonify({'token': access_token, 'role': user.role}), 200

    # If login fails, return an unauthorized message
    return jsonify({'message': 'Invalid credentials'}), 401


# User dashboard route (user only)
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def user_dashboard():
    current_user = get_jwt_identity()
    return jsonify({'username': current_user['username'], 'role': current_user['role']}), 200

# Admin dashboard route (admin only)
@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403
    users = User.query.all()
    user_list = [{'id': u.id, 'username': u.username, 'role': u.role} for u in users]
    return jsonify(user_list), 200

# Delete user route (admin only)
@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403
    
    user_to_delete = User.query.get(user_id)
    if not user_to_delete:
        return jsonify({'message': 'User not found'}), 404
    
    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({'message': f'User {user_to_delete.username} deleted successfully.'}), 200

if __name__ == '__main__':
    app.run(debug=True)
