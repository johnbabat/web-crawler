crawler
-----

### Description

crawler is a cli command line tool.
The program crawls the given url for links with same domain as given url and prints to console. It continues crawling all links found and repeats the process till all links are exhausted.

### Setup Instructions

First, install dependencies by running npm install from the program's root directory
```
$ npm install
```

Install package globally to have access from command line anywhere
```
$ npm install -g .
```

Run the program from the command line with the crawler command
```
$ crawler
```

### Usage

Usage: crawler [[arguments] url] [options]

Options:
   --help ------------- Show help

argument:
   -n [Integer] ------ Set Numer of workers (Optional)

Samples:
```
Crawler https://www.amazon.com
```
```
Crawler -n 6 https://www.amazon.com
```

### Testing

For testing, run npm test 
```
$ npm test
```
To check coverage, npm run test-coverage
```
$ npm run test-coverage
```

### Requirements

node v10.5 and above (Required for worker-threads)