let Deque = require('../bin/deque');

test('Deque methods all behave as expected', () => {
    let urlsQueue = new Deque

    urlsQueue.preppend('https://testsite.com')
    urlsQueue.popLast()
    urlsQueue.append('https://www.google.com')
    urlsQueue.append('https://www.crossover.com')
    urlsQueue.preppend('https://www.amazon.com')
    urlsQueue.preppend('https://www.meta.com')


    expect(urlsQueue.size()).toBe(4)
    expect(urlsQueue.popLast()).toBe('https://www.crossover.com')
    expect(urlsQueue.popFirst()).toBe('https://www.meta.com')
    expect(urlsQueue.peekLast()).toBe('https://www.google.com')
    expect(urlsQueue.peekFirst()).toBe('https://www.amazon.com')
    expect(urlsQueue.popFirst()).toBe('https://www.amazon.com')
    expect(urlsQueue.popFirst()).toBe('https://www.google.com')
    expect(urlsQueue.popLast()).toBe(undefined)
    expect(urlsQueue.popFirst()).toBe(undefined)
    expect(urlsQueue.size()).toBe(0)
})