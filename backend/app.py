from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure SQLAlchemy and file uploads
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads/audio'  # Replace with the folder to store audio files

# Create the uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)



# User model for the database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')
    audio_files = db.relationship('AudioFile', backref='user', lazy=True)

# AudioFile model for storing uploaded audio metadata
class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Create the database tables and default admin user
with app.app_context():
    db.create_all()

    # Check if admin user exists, if not, create one
    if not User.query.filter_by(username='admin').first():
        hashed_password = bcrypt.generate_password_hash('password').decode('utf-8')
        admin_user = User(username='admin', password=hashed_password, role='admin')
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created: username='admin', password='password'")

# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 400
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify({'token': access_token, 'role': user.role}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# User dashboard route (user only)
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def user_dashboard():
    current_user = get_jwt_identity()
    return jsonify({'username': current_user['username'], 'role': current_user['role']}), 200

# Route to upload audio files with metadata
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    current_user = get_jwt_identity()
    user_id = User.query.filter_by(username=current_user['username']).first().id

    if 'audio' not in request.files:
        return jsonify({'message': 'No audio file found'}), 400

    file = request.files['audio']
    description = request.form.get('description')
    category = request.form.get('category')

    if file and file.filename != '':
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        new_audio = AudioFile(filename=filename, description=description, category=category, user_id=user_id)
        db.session.add(new_audio)
        db.session.commit()

        return jsonify({'message': 'File uploaded successfully!'}), 201
    return jsonify({'message': 'File upload failed'}), 400

# Route to view user-uploaded audio files
@app.route('/user/audio', methods=['GET'])
@jwt_required()
def get_user_audio_files():
    current_user = get_jwt_identity()
    user_id = User.query.filter_by(username=current_user['username']).first().id

    audio_files = AudioFile.query.filter_by(user_id=user_id).all()
    files = [{'id': audio.id, 'filename': audio.filename, 'description': audio.description, 'category': audio.category} for audio in audio_files]

    return jsonify(files), 200

# Route to play specific audio file
@app.route('/audio/play/<int:audio_id>', methods=['GET'])
@jwt_required()
def play_audio_file(audio_id):
    current_user = get_jwt_identity()
    user_id = User.query.filter_by(username=current_user['username']).first().id

    audio_file = AudioFile.query.filter_by(id=audio_id, user_id=user_id).first()
    if not audio_file:
        return jsonify({'message': 'Audio file not found or unauthorized access'}), 404

    return send_from_directory(app.config['UPLOAD_FOLDER'], audio_file.filename)

# Admin routes (admin-only)
@app.route('/admin', methods=['GET'])
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403
    users = User.query.all()
    user_list = [{'id': u.id, 'username': u.username, 'role': u.role} for u in users]
    return jsonify(user_list), 200

@app.route('/admin/users', methods=['POST'])
@jwt_required()
def create_user():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403

    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password, role=data.get('role', 'user'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully!'}), 201

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

@app.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found!'}), 404

    data = request.get_json()
    if 'username' in data:
        user.username = data['username']
    if 'role' in data:
        user.role = data['role']
    if 'password' in data:
        user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    db.session.commit()

    return jsonify({'message': 'User updated successfully!'}), 200

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Admins only!'}), 403

    users = User.query.all()
    user_list = [{'id': u.id, 'username': u.username, 'role': u.role} for u in users]
    return jsonify(user_list), 200

if __name__ == '__main__':
    app.run(debug=True)
