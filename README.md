## Installation

```
# install dependencies using npm
$ npm install

# Run the app
$ npm start
```

## Usage

`GET /` check the application is available

`POST /launch_lti` LTI launch URL. This receives a `application/x-www-form-urlencoded` POST request, with the parameters passed according to the LTI specification.

## Test without Canvas sandbox

- Go to https://lti.tools/saltire/tc
- Select **Tool Provider** option from left menu
- Enter required parameters:
  - Message URL: http://localhost:4000/launch_lti?videosrc=http://localhost 
  - Consumer key: {CONSUMER_KEY}
  - Shared secret: {SHARED_SECRET}
  - Signature method: HMAC-SHA1
- Click **Save**
- Click Connect's drop down
- Select **Open in new window**

![Screenshot 1](https://i.imgur.com/vePUKL7.png)

![Screenshot 2](https://i.imgur.com/NjBWBRp.png)