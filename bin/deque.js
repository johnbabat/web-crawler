class Deque {
    constructor() {
        this.front = this.back = undefined;
        this.length = 0;
    }
    append(value) {
        if (!this.front) this.front = this.back = { value };
        else this.front = this.front.next = { value, prev: this.front };
        this.length +=1
    }
    preppend(value) {
        if (!this.front) this.front = this.back = { value };
        else this.back = this.back.prev = { value, next: this.back };
        this.length +=1
    }
    popLast() {
        if (!this.length) return
        let value = this.peekLast();
        if (this.front === this.back) this.front = this.back = undefined;
        else {
            this.front = this.front.prev
            this.front.next = undefined
        }
        this.length -=1
        return value;
    }
    popFirst() {
        if (!this.length) return
        let value = this.peekFirst();
        if (this.front === this.back) this.front = this.back = undefined;
        else {
            this.back = this.back.next
            this.back.prev = undefined
        }
        this.length -=1
        return value;
    }
    peekLast() { 
        return this.front && this.front.value;
    }
    peekFirst() { 
        return this.back && this.back.value;
    }
    size() {
        return this.length;
    }
}

module.exports = Deque;