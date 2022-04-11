#!/usr/bin/env node

const { exit } = require('process');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const { getDomainName, crawler, checkInputArgs, getPageData } = require('./utils');
const Deque = require('./deque');


(async () => {
    if (isMainThread) {
        // In Main thread

        // Get args
        const [,, ...args] = process.argv;

        const mainUrl = args[args.length - 1]
        const numWorkers = checkInputArgs(args, mainUrl)
        numWorkers == undefined && exit(0)

        const domainName = getDomainName(mainUrl)

        const urlsQueue = new Deque
        urlsQueue.append(mainUrl)
        const seenUrls = new Set([mainUrl])
        const workerQueue = []
        const workers = {}

        // No workers specified, this block runs and exits on completion
        if(numWorkers == 0) {
            (async () => {
                while (urlsQueue.size() > 0) {
                    let curUrl = urlsQueue.popFirst()
                    let pageData = await getPageData(curUrl)
                    const validUrls = crawler(curUrl, domainName, pageData, seenUrls);

                    if (validUrls && validUrls.length > 0) {
                        for(let i = 0; i < validUrls.length; i++){
                            if (!seenUrls.has(validUrls[i])) {
                                console.log(validUrls[i])
                                seenUrls.add(validUrls[i])
                                urlsQueue.append(validUrls[i])
                            }
                        }
                    }
                }
                // Exit once urlqueue is empty
                exit(0);
            })();
        }

        // If number of workers are specified    
        for (let i = 0; i < numWorkers; i++) {  
            const worker = new Worker(__filename);
            worker.on('message', ({validUrls, id}) => {
                workerQueue.push(id)
                if (validUrls && validUrls.length > 0) {
                    for(let i = 0; i < validUrls.length; i++) {
                        if (!seenUrls.has(validUrls[i])) {
                            console.log(validUrls[i])
                            seenUrls.add(validUrls[i]);
                            urlsQueue.append(validUrls[i]);
                        }
                    }
                }
            });
            worker.on('error', console.error);
            worker.on('exit', (code) => {
            if (code !== 0)
                console.error(new Error(`Worker stopped with exit code ${code}`));
            });
            // Identify wrokers by their ids in workers object
            workers[worker.threadId] = worker;
            workerQueue.push(worker.threadId)
        }
    
        while (true) {
            // While all workers are occupied sleep for 200 milliseconds
            while (workerQueue.length == 0) {
                await new Promise(r => setTimeout(r, 200));
            }
            const curUrl = urlsQueue.popFirst();
            // send next url to next available worker
            if (curUrl) {
                const id = workerQueue.shift();
                workers[id].postMessage({ curUrl, domainName, id, seenUrls });
            }
            // Sleep for 500 milliseconds
            await new Promise(r => setTimeout(r, 500));

            // If no urls left and no workers currently working, exit
            if ((urlsQueue.size() == 0) && (workerQueue.length == numWorkers)) {
                exit(0);
            }
        }
        
    } else {
        // In worker thread
        parentPort.on('message', async (data) => {
            let pageData = await getPageData(data.curUrl);
            parentPort.postMessage({validUrls: crawler( data.curUrl, data.domainName, pageData, data.seenUrls), id: data.id });
        })
    }
})();