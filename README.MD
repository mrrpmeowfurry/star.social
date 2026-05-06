# star.social

# Running with podman

## Prerequisite

- A system running a linux distro with podman quadlets support.
- Some linux knowledge

## Installation step
1. Clone the repo with ```https://github.com/mrrpmeowfurry/star.social```
2. Build the image with ```podman build -t localhost/star-social:latest .```
3. Verify that the image built ```podman images```.
```bash
mrrpmeowfurry@tinypaws:~/star.social $ podman images
REPOSITORY              TAG         IMAGE ID      CREATED        SIZE
localhost/star-social   latest      73d9e560402d  3 seconds ago  580 MB
```
4. Copy ```star-social.container``` to ```~/.config/containers/systemd/```
5. Edit ```JWT_SECRET``` inside ```star-social.container``` to something else.
6. Restart systemd with ```systemctl --user daemon-reload```
7. Start the service with ```systemctl --user enable now star-social```

# Upgrading

1. Pull the repo with ```git pull```
2. Re-built the podman image with ```podman build -t localhost/star-social:latest .```
3. Restart the service with ```systemctl --user restart star-social```

# API Endpoins

## Authentication

```js
POST /auth/register
POST /auth/login
GET  /auth/me
```

### POST /auth/register

Request:
```json
{
    "username": "meow", 
    "email": "example@proton.me",
    "password": "secretpasswords!123" 
}
```
Response:
```json
{
    "id": 1,
    "username": "meow",
    "success": true
}
```

### POST /auth/login
Request:
```json
{
    "username": "meow", 
    "password": "secretpasswords!123" 
}
```
Response:
```json
{
    "token": "jwt_here",
    "success": true
}
```

### GET /auth/me
Header: Authorization: Bearer <token>
```json
{
    "id": 3,
    "username": "meow",
    "description": "I am a meowsie person",
    "email": "velocity.toml@proton.me",
    "created_at": "2026-05-05T14:30:00.000Z",

    "posts": 5,
    "followers": 3,
    "following": 3
}
```

## Users
```js
GET /users/:id
GET /users/:id/followers
GET /users/:id/following
```

### GET /users/:id
```json
{
    "username": "meow",
    "description": "I am a meowsie person",
    "created_at": "2026-05-05T14:30:00.000Z",

    "posts": 5,
    "followers": 3,
    "following": 3
}
```
### GET /users/:id/followers
```json
{
    "id": 1,
    "username": "meow",
    "count": 2,
    "followers": [
        {
            "id": 2,
            "username": "mrrpmeowfurry",
            "since": "2026-05-05T14:30:00.000Z",
            "description": "Rise and shine"
        },
        {
            "id": 3,
            "username": "admin",
            "since": "2026-05-05T14:30:00.000Z",
            "description": "I'm an admin!"
        }
    ]
}
```
### GET /users/:id/following
```json
{
    "id": 0,
    "username": "admin",
    "count": 1,
    "following": [
        {
            "id": 2,
            "username": "mrrpmeowfurry",
            "since": "2026-05-05T14:30:00.000Z",
            "description": "Rise and shine"
        }
    ]
}
```
## Follows
```js
POST   /users/:id/follow
DELETE /users/:id/follow
```

### POST /users/:id/follow
Header: Authorization: Bearer <token>

Reponse:
```json
{
    "id": 1,
    "username": "admin",
    "success": true
}
```

### DELETE /users/:id/follow
Header: Authorization: Bearer <token>

Reponse:
```json
{
    "id": 1,
    "username": "admin",
    "success": true
}
```

## Posts
```js
POST   /posts
GET    /posts/:id
DELETE /posts/:id
```

### POST /posts
Header: Authorization: Bearer <token>

Request:
```json
{
    "content": "First post!"
}
```
Reponse:
```json
{
    "id": 2,
    "success": true
}
```
### GET /posts/:id
Reponse:
```json
{
    "id": 1,
    "content": "I love Free and Open Source software!!!",
    "author": {
        "id": 1,
        "username": "admin"
    },
    "likes": 1,
    "liked": true,
    "created_at": "2026-05-05T14:30:00.000Z"
}
```

## Likes
```js
POST   /posts/:id/like
DELETE /posts/:id/like
```

### POST /posts/:id/like
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 1,
    "liked": true,
    "success": true
}
```

### DELETE /posts/:id/like
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 1,
    "success": true
}
```

## Timeline
```js
GET /timeline?cursor=<id>&limit=<n>
```
### GET /timeline
Response:
```json
{
    "data": [
        {
            "id": 1,
            "content": "I love Free and Open Source software!!!",
            "author": {
                "id": 1,
                "username": "admin"
            },
            "likes": 1,
            "liked": true,
            "created_at": "2026-05-05T14:30:00.000Z"
        }
    ],
    "next_cursor": 0
}
```

## Administration
### Users
```js
POST   /admin/users/:id/ban
DELETE /admin/users/:id/ban

POST   /admin/users/:id/admin
DELETE /admin/users/:id/admin

POST   /admin/users/:id/reset-password
DELETE /admin/users/:id
```
### POST /admin/users/:id/ban
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 2,
    "banned": true
}
```

### DELETE /admin/users/:id/ban
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 2,
    "banned": false
}
```

### POST /admin/users/:id/admin
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 2,
    "is_admin": true
}
```

### DELETE /admin/users/:id/admin
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 2,
    "is_admin": false
}
```

### POST /admin/users/:id/reset-password
Header: Authorization: Bearer <token>

Request:
```json
{
    "new_password": "newpass123"
}
```
Response:
```json
{
    "id": 2,
    "success": true
}
```
### DELETE /admin/users/:id
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 2,
    "success": true
}
```

### Posts
```js
DELETE /admin/posts/:id
```
### DELETE /admin/posts/:id
Header: Authorization: Bearer <token>

Response:
```json
{
    "id": 10,
    "success": true
}
```
### Server
```js
POST   /admin/settings/description
POST   /admin/announcements
GET    /admin/announcements
```
### POST /admin/settings/description
Header: Authorization: Bearer <token>

Request:
```json
{
    "description": "Welcome to star.social!"
}
```
Response:
```json
{
    "success": true
}
```

### POST /admin/announcements
Header: Authorization: Bearer <token>

Request:
```json
{
    "content": "Server maintenance tonight!"
}
```
Response:
```json
{
    "id": 1,
    "success": true
}
```

### GET /admin/announcements
Header: Authorization: Bearer <token>

Response:
```json
[
    {
        "id": 1,
        "content": "Server maintenance tonight!",
        "created_at": "2026-05-07T12:00:00.000Z"
    }
]
```