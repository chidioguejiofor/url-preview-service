const puppeteer = require('puppeteer');
const fs = require('fs');
const CACHE_PATH = './cache.json'


class URLPreviewParser {
    constructor(page) {
        this.PAGE = page;
    }

    async openURL(url) {
        await this.PAGE.goto(url);
    }

    async title() {
        return await this.PAGE.evaluate(async () => {

            // Checking <meta property="og:title"> and <meta property="twitter:title">
            // If it finds the title then it returns it.

            const metaQuery = 'meta[property="og:title"], meta[name="twitter:title"]'
            let title = await document.querySelector(metaQuery);
            if (title && title.contentlength > 0) {
                return title.content;
            }

            // Here it checks the document title to see if it can find a title
            if (document.title) return document.title;


            // The last resort is to check for h1s or h2s for the title
            const h1 = document.querySelector('h1');
            if (h1 && h1.textContent.length > 0) {
                return h1.textContent;
            }

            const h2 = document.querySelector('h2');
            if (h2 && h2.textContent.length > 0) {
                return h2.textContent;
            }

            return null;

        });
    }

    async description() {
        return await this.PAGE.evaluate(async () => {

            // Checking <meta property="og:title"> and <meta property="twitter:title">
            // If it finds the title then it returns it.

            const metaQuery = 'meta[property="og:description"], meta[name="twitter:description"]'
            let description = await document.querySelector(metaQuery);
            if (description && description.contentlength > 0) {
                return description.content;
            }

            // If there's no description in the meta then the last resort is to check for a p 
            // visible tags that and return the textContent

            const paragraph = await document.querySelector('p:first-of-type');

            if (paragraph) return paragraph.textContent;

            return null;

        });
    }

    async mainImage() {
        return await this.PAGE.evaluate(async () => {
            const metaQuery = 'meta[property="og:og:image"], meta[name="twitter:image"], meta[name="twitter:image:src"]'
            let image = await document.querySelector(metaQuery);
            if (image && image.contentlength > 0) {
                return image.content;
            }


            image = document.querySelector('link[rel="image_src"]');

            if (image && image.href.length > 0) return image.href;


            // If there's no image in the meta then the last resort is to 
            // checking for the image with the highest are(width * height)

            const imgQuery = 'img, [style*="background-image"]'
            const allImgs = Array.from(document.querySelectorAll(imgQuery));


            // this reduce returns the largest element with an image in the DOM
            // note that this may be an <img> tag or may not 
            const largestImgInDOM = allImgs.reduce((largestImg, currentImage) => {
                if (currentImage.tagName.toLowerCase() !== 'img') {
                    if (!currentImage.style.backgroundImage.includes('url(')) return largestImg;
                }
                if (!largestImg) return currentImage;
                const largestImgSize = largestImg.clientHeight * largestImg.clientWidth;
                const currentImageSize = currentImage.clientHeight * currentImage.clientWidth;
                if (currentImageSize > largestImgSize) return currentImage;
                return largestImg;

            }, null);


            if (largestImgInDOM) {
                if (largestImgInDOM.tagName.toLowerCase() === 'img') return largestImgInDOM.src;

                const backgroundImageCSS = largestImgInDOM.style.backgroundImage;
                const splittedCSSValue = backgroundImageCSS.split(/url\("|url\('|"\)|'\)/);
                return splittedCSSValue.find(text => text.includes('http'));

            };

            // This would mean that there is no <img> in the DOM
            return null;

        });
    }
}


class URLPreviewFactory {
    static async getPreviewObject() {
        let browser = this.browser;
        if (!browser) {
            this.browser = browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
        }

        if (this.previewObject) return this.previewObject;
        const page = await browser.newPage();
        this.previewObject = new URLPreviewParser(page);
        return this.previewObject;
    }

    static async getPreviewJSONFromURL(url) {
        /**
         * This function returns the preview JSON value using a URLPreviewParser 
         * singleton object.
         * This then stores the value returned in a cache. 
         * 
         * Whenever a request is made it first checks for the url in the cache and returns
         * the value if it exists. If not it generates the preview JSON and cache it.
         */
        let cacheData = {};
        try {
            if (fs.existsSync(CACHE_PATH)) {
                cacheData = JSON.parse(fs.readFileSync(CACHE_PATH));
            }
        } catch (error) {
            cacheData = {};
        }


        if (cacheData[url]) {
            return cacheData[url];
        }

        const parser = await this.getPreviewObject();
        await parser.openURL(url);
        const jsonRes = {
            title: await parser.title(),
            description: await parser.description(),
            mainImage: await parser.mainImage(),
        };

        cacheData[url] = jsonRes;

        fs.writeFile(CACHE_PATH, JSON.stringify(cacheData), (err) => {
            if (err) console.log("Error while writing to cache", err);
        });
        return jsonRes
    }
}


module.exports = URLPreviewFactory;

