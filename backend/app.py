from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from werkzeug.utils import secure_filename  # Make sure to import secure_filename
import os
import shutil

app = Flask(__name__)
CORS(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads/audio'  # Define upload folder

# Create the uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)



@app.route('/clear-all', methods=['DELETE'])
@jwt_required()
def clear_all():
    current_user = get_jwt_identity()
    
    # Clear all audio files from the uploads directory
    audio_directory = app.config['UPLOAD_FOLDER']
    if os.path.exists(audio_directory):
        shutil.rmtree(audio_directory)  # Remove the entire directory
    os.makedirs(audio_directory)  # Recreate the directory

    # Clear all audio file records from the database
    AudioFile.query.delete()
    db.session.commit()

    return jsonify({'message': 'All audio files and records cleared successfully!'}), 200

# User model for the database(metadata)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')

# AudioFile model for the database(metadata)
class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Create the database tables and default admin user
with app.app_context():
    db.create_all()

    if not User.query.filter_by(username='admin').first(): #check if there is a username called admin
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
        #create token to maintain secure authentication
        access_token = create_access_token(identity={'id': user.id, 'username': user.username, 'role': user.role})
        return jsonify({'token': access_token, 'role': user.role, 'username': user.username}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Upload audio file route
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    current_user = get_jwt_identity() #based on create access token
    user_id = current_user['id']

    if 'file' not in request.files:
        return jsonify({'message': 'No audio file found'}), 400

    file = request.files['file']

    #Actual file save to filesystem, metadata send to db

    if file and file.filename != '':
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename) #save to uploads\audio
        file.save(filepath)

        #sets the filename and the user_id that upload the file
        new_audio = AudioFile(filename=filename, user_id=user_id)

        #add the new audiofile instance to the current database session
        db.session.add(new_audio)
        db.session.commit()

        return jsonify({'message': 'File uploaded successfully!'}), 201
    return jsonify({'message': 'File upload failed'}), 400

# Get user's audio files
@app.route('/audio-files', methods=['GET'])
@jwt_required()
def get_audio_files():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    audio_files = AudioFile.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': af.id, 'filename': af.filename} for af in audio_files]), 200

# Delete audio file
@app.route('/audio-files/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_audio(file_id):
    current_user = get_jwt_identity()
    audio_file = AudioFile.query.get(file_id)
    if audio_file and audio_file.user_id == current_user['id']:
        db.session.delete(audio_file)
        db.session.commit()
        return jsonify({'message': 'Audio file deleted successfully!'}), 200
    return jsonify({'message': 'Audio file not found or permission denied!'}), 404

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
