from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'

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

# AudioFile model for the database
class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(120), nullable=False)
    data = db.Column(db.LargeBinary, nullable=False)
    user = db.relationship('User', backref=db.backref('audio_files', lazy=True))

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
        access_token = create_access_token(identity={'id': user.id, 'username': user.username, 'role': user.role})
        return jsonify({'token': access_token, 'role': user.role, 'username': user.username}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Upload audio file route
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    current_user = get_jwt_identity()
    user_id = current_user['id']
    
    if 'file' not in request.files:
        print("Error: No file part in the request")
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    
    if file.filename == '':
        print("Error: No selected file")
        return jsonify({'message': 'No selected file'}), 400

    print(f"Uploading file: {file.filename}")

    if not allowed_file(file.filename):
        print(f"Error: File type not allowed - {file.filename}")
        return jsonify({'message': 'File type not allowed'}), 400

    try:
        new_audio = AudioFile(user_id=user_id, filename=file.filename, data=file.read())
        db.session.add(new_audio)
        db.session.commit()
        print(f"Success: Audio file uploaded - {file.filename}")
        return jsonify({'message': 'Audio file uploaded successfully!'}), 201
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the exception
        return jsonify({'message': 'An error occurred while uploading the file.'}), 500



def allowed_file(filename):
    # Define allowed file types here
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



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
