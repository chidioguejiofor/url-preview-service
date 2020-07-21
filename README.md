# URL Preview service

This service takes a URL and returns JSON containing the title, description and main image.


### How it works
It does this by first checking if the page implements the  [Open Graph Protocol](https://en.wikipedia.org/wiki/Facebook_Platform#Open_Graph_protocol) which can be done by adding meta tags to head section of your page.


When there these meta tags do not exists, it checks the headings for a title, paragraphs for description and the largest image on the page for the image

### Usage
You use this by making a GET request to `{host}/<your-url-goes-here>`. 

For example, if the app is running on `example.com`, making a GET request to `http://example.com/https://google.com` would return a JSON containing a preview of `https://google.com`.



### Setup 

1. The first thing to do is to clone the repo via:
```bash
git clone https://github.com/chidioguejiofor/url-previewgit-service.git
```
2. Then create a `.env` file and add a value for PORT. This would be the port you want to run on


#### Run app without Docker
To start the app locally:
- install nodeJS
- ensure that you have chrome installed
- install the project all dependencies via: `npm install`
- start the app via: `node index.js`


#### Run app with Docker
To run the app with docker:
- Create the Docker image using the command
```bash
docker build -t [image-name-here] .
```
- Run the Docker Image
```bash
docker run [image-name-here]
```
