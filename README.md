# Audio-app

Description:
A simple app to showcase user authentication and database usage for upload audio files.

## Setup:

Pull Docker images:

```bash
docker pull jchkiyo/audio-app-backend:latest
docker pull jchkiyo/audio-app-frontend:latest
```

Docker compose and remove container when exit:

```bash
docker-compose up --abort-on-container-exit
```

It will run on localhost:3000

## For development(not needed if already have images )

Rebuild images:

Backend:

````bash
cd backend
docker build -t audio-app-backend .

Frontend:
```bash

cd ../frontend
docker build -t audio-app-frontend .
````

After building, you can verify the images with:

```bash
docker images
```

User:

1. User can register a account.
2. User can login a account to upload their audios
3. User can add audio.
4. User can delete audio
5. User can play audio.

Admin:

1. Create a account
2. Delete a account
3. Update a account
4. Create new admins
5. Create new users

Test cases cleared:

Login page:

1. When typed in wrong username or password, prompt error on incorrect credentials.

2. When user click on "Register", it will navigate to register page.

3. If user login with admin account, it will navigate to admin dashboard page.

Default admin account: (case sensitive)
Username: admin
Password: password

4. If user login with user account, it will navigate to user dashboard page.

Register page:

1. When user creates account, it will always be given the "user" role, hence the account cannot access the admin dashboard

2. If user tries to regiser with a username that has been used, user will be prompt with the error "Username has been used"

3. User can create different accounts with the same password

4. User can click back to navigate back to login page

Things to improve:
password should have minimum characters
password should be alphanumerical
password should contain symbols

Admin Dashboard:

1. Admin can click create user. This will allow users to create either admin/user accounts. If user tries to create a account using a username that has been used, a error will occur.

2. Admin can click edit on any row, to change the password of that user.

3. Admin can use the search bar to search for specific user account using keywords.

4. Admin can delete user/admin accounts.

5. If admin tries to delete but it is the only admin account left, user will be prompted with an error.

6. Admin can logout by pressing the red button lying on the top right of the view port. Once press, it will loss its token. This means if anyone tries to go back to /dashboard url. They will be prompted with an error.

Things to improve:

Username cant be changed with edit feature. Have to delete the account completely and recreate a new account.

User Dashboard:

1. User can upload an audio file here. User will be asked to fill in the description and category but it is optional. If the file is not an audio file, user will be prompted an error. So far I have tested on audio formats such as mp3, wac and ogg.

2. There are two icons on the right side of the drag box. The 1st icon allows users to upload its file, The 2nd icon allow users to see what audio file they have uploaded.

3. User can choose which audio files to play/delete. When deleted, it will be removed from the list. When play is pressed, a audio player will pop up to play the audio file.

4. User can logout and will be navigated back to /login page, if they try to access the user-dashboard by other means other than the login method, no token will be made and they cant see the audio files.

Things to improve:

1. User can sort by description, category.

2. Implement a search bar

3. When navigate back to upload view, the audio player will be removed and audio will stop plying.

# Uploading Docker Images to Docker Hub

To upload your Docker images to Docker Hub, follow these steps:

## Step 1: Log in to Docker Hub

First, log in to your Docker Hub account:

```bash
docker login
```

```bash
docker tag audio-app-frontend jchkiyo/audio-app-frontend:latest
docker tag audio-app-backend jchkiyo/audio-app-backend:latest
```

```bash
docker push jchkiyo/audio-app-frontend:latest
docker push jchkiyo/audio-app-backend:latest
```

docker run -p 5000:5000 \
 -e JWT_SECRET_KEY='your-secure-key' \
 -e UPLOAD_FOLDER='uploads/audio' \
 audio-app-backend

docker exec -it <frontend_container_id> /bin/sh

$env:BACKEND_PORT=6000; $env:FRONTEND_PORT=4000; docker-compose up
