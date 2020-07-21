# URL Preview service

This service takes a URL and returns JSON containing the title, description and main image.


### How it works
It does this by first checking if the page implements the  [Open Graph Protocol](https://en.wikipedia.org/wiki/Facebook_Platform#Open_Graph_protocol) which can be done by adding meta tags to head section of your page.


When there these meta tags do not exists, it checks the headings for a title, paragraphs for description and the largest image on the page for the image


### Setup 

In order to setup the first step is to clone the repo
#### Without Docker
You can setup the project locally by
