const fetch = require('node-fetch');

const isUrl = (url) => {
    return url.startsWith('http://') || url.startsWith('https://');
}


const getDomainName = (url) => {
    return url.replace(/.+\/\/|www.|\..+/g, '');
}


const checkInputArgs = (args, mainUrl) => {

    let numWorkers = 0;

    if (!mainUrl || (mainUrl && mainUrl == "--help")) {
        console.log('Usage: crawler [[arguments] url] [options]\n\nOptions:\n   --help          Show help\n\nargument:\n   -n <Integer>    Set Numer of workers (Optional)\n\nSamples:\nCrawler https://www.amazon.com\nCrawler -n 6 https://www.amazon.com')
        return
    }
    args.pop()

    if (args && args.length == 2 && args[0] == "-n" && Number.isInteger(Number(args[1]))) {
        numWorkers = Number(args[1])
        if (numWorkers < 0) {
            console.log('Warning: Workers cannot be less than 0. Value automatically changed to 0');
        }
        numWorkers = numWorkers < 0 ? 0 : numWorkers;

    } else if (args && args.length > 0) {
        console.log('Crawler: Invalid command. See crawler --help');
        return
    }

    if (!isUrl(mainUrl)) {
        console.log(`${mainUrl} not a valid url`);
        return
    }
    
    return numWorkers;
}


const urlExtractor = (curUrl, url) => {
    var urlString = url.includes('"') ? url.split('"')[1] : url.split("'")[1]
    curUrl = curUrl.endsWith('/') ? curUrl.slice(0, curUrl.length - 1) : curUrl;
    urlString = urlString.endsWith('/') ? urlString.slice(0, urlString.length - 1) : urlString;

    if(curUrl.length > urlString.length 
        && urlString == curUrl.slice(curUrl.length - urlString.length)) {
        return ''
    }

    urlString = urlString.startsWith('/') ? curUrl + urlString : urlString
    return urlString
}


const getPageData = async (url) => {
    const response = await fetch(url).catch(e => {return})
    
    if (!response || (response && !response.ok)) {
        return
    }
    const text = await response.text()
    const pageData = { text, url: response.url }
    return pageData
}


const crawler = (curUrl, domainName, pageData, seenUrls) => {
    if (!pageData || seenUrls.has(pageData.url)) {
        return
    }

    seenUrls.add(pageData.url);
    const pageText = pageData.text.toLowerCase();
    const urls = pageText.match(/href=('|")[^\s,>"?'#]+('|"|>)/g);

    validUrls = urls && urls
    .map(url => urlExtractor(curUrl, url))
    .filter(url => url.includes('.' + domainName + '.'))

    return validUrls;
}

module.exports = {
    urlExtractor,
    getDomainName,
    getPageData,
    crawler,
    checkInputArgs,
    isUrl
}