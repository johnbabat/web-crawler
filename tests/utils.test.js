const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

const { 
    urlExtractor, checkInputArgs, getDomainName, getPageData, crawler, isUrl
} = require('../bin/utils');

beforeEach(() => {
    fetch.resetMocks();
  });

test('Check if url returns true', () => {
    expect(isUrl('https://crossover.com')).toBe(true);
});

test('Check if url returns false', () => {
    expect(isUrl('randomsite.com')).toBe(false);
});

test('Should return domain name from url', () => {
    expect(getDomainName('https://www.amazon.com')).toBe('amazon');
});

test('Check input args, valid input returns number of workers', () => {
    expect(checkInputArgs(['-n', 4, 'https://crossover.com'], 'https://crossover.com')).toBe(4);
    expect(checkInputArgs([], 'https://crossover.com')).toBe(0);
})

test('Check input args, invalid command returns undefined', () => {
    console.log = jest.fn();
    const result = checkInputArgs(['g', 4, 'www.google.com', 'www.testsite.com'], 'https://crossover.com')
    expect(console.log).toHaveBeenCalledWith('Crawler: Invalid command. See crawler --help');
    expect(result).toBe(undefined);
})

test('Check input args, invalid url returns undefined', () => {
    console.log = jest.fn();
    const result = checkInputArgs(['-n', 4, 'crossover.com'], 'crossover.com');
    expect(console.log).toHaveBeenCalledWith('crossover.com not a valid url');
    expect(result).toBe(undefined);
});

test('Check input args, logs help information and returns undefined', () => {
    console.log = jest.fn();
    const result = checkInputArgs(['--help'], '--help');
    expect(console.log).toHaveBeenCalledWith('Usage: crawler [[arguments] url] [options]\n\nOptions:\n   --help          Show help\n\nargument:\n   -n <Integer>    Set Numer of workers (Optional)\n\nSamples:\nCrawler https://www.amazon.com\nCrawler -n 6 https://www.amazon.com');
    expect(result).toBe(undefined);
});

test('Check input args, logs warning and returns zero', () => {
    console.log = jest.fn();
    const result = checkInputArgs(['-n', -4, 'https://www.crossover.com'], 'https://www.crossover.com');
    expect(console.log).toHaveBeenCalledWith('Warning: Workers cannot be less than 0. Value automatically changed to 0');
    expect(result).toBe(0);
});

test('Check input args, invalid command returns undefined', () => {
    console.log = jest.fn();
    const result = checkInputArgs(['www.crossover.com', 'help'], 'help');
    expect(console.log).toHaveBeenCalledWith('Crawler: Invalid command. See crawler --help');
    expect(result).toBe(undefined);
});

test('Should return valid url from string with relative url', () => {
    expect(urlExtractor('https://amazon.com/', 'href="/jobs/"')).toBe('https://amazon.com/jobs');
});

test('Should return empty string from string with relative url already present in url', () => {
    expect(urlExtractor('https://amazon.com/jobs/', 'href="/jobs/"')).toBe('');
});

test('Should return valid url from string with absolute url', () => {
    expect(urlExtractor('https://crossover.com/', "href='https://crossover.com/jobs/'")).toBe('https://crossover.com/jobs');
});

test('Should return page data from given url', async () => {

    let catchFn = jest.fn()
    let ourUrl = 'https://crossover.com'
    let textVal = '<head></head> <body><a href="https://www.google.com/another-link">Link</a></body>'

    const response = Promise.resolve({
        status: 200,
        ok: true,
        url: "https://crossover.com",
        text: () => textVal
    });

    fetch.mockImplementation(() => response);
    await response

    const data = await getPageData(ourUrl).catch(catchFn);

    expect(fetch).toHaveBeenCalledWith(ourUrl);
    expect(catchFn).not.toHaveBeenCalled();
    expect(data.text).toBe(textVal);
    expect(data.url).toBe('https://crossover.com');
});

test('Should return undefined from unaccessible url', async () => {

    let catchFn = jest.fn()
    let ourUrl = 'unaccessiblesite.com'

    const response = Promise.reject('Error');

    fetch.mockImplementation(() => response)
    await response.catch(catchFn);

    const data = await getPageData(ourUrl)

    expect(fetch).toHaveBeenCalledWith(ourUrl);
    expect(catchFn).toHaveBeenCalled();
    expect(data).toBe(undefined);
});

test('Should return valid urls given valid inputs', () => {

    let domainName = 'google'
    let url = 'https://www.google.com/test'
    let seenUrls = new Set()
    let data = {
        url: 'https://www.google.com/test',
        text: '<head></head> <body><a href="https://www.google.com/another-link">Link</a></body>',
    }

    const response = crawler(url, domainName, data, seenUrls);

    expect(response.length).toBe(['https://www.google.com/another-link'].length);
    expect(response.join()).toBe(['https://www.google.com/another-link'].join());
});

test('Should return undefined, seen urls contains data url', () => {

    let domainName = 'google'
    let url = 'https://www.google.com/test'
    let seenUrls = new Set(['https://www.google.com/test'])
    let data = {
        url: 'https://www.google.com/test',
        text: '<head></head> <body><a href="https://www.google.com/another-link">Link</a></body>',
    }

    const response = crawler(url, domainName, data, seenUrls);

    expect(response).toBe(undefined);
});

test('Should return undefined, data is undefined', () => {

    let domainName = 'google'
    let url = 'https://www.google.com/test'
    let seenUrls = new Set(['https://www.google.com/test'])
    let data = undefined

    const response = crawler(url, domainName, data, seenUrls);

    expect(response).toBe(undefined);
});

test('Should return undefined, data text is not string', () => {

    let domainName = 'google'
    let url = 'https://www.google.com/test'
    let seenUrls = new Set(['https://www.google.com/test'])
    let data = undefined

    const response = crawler(url, domainName, data, seenUrls);

    expect(response).toBe(undefined);
});