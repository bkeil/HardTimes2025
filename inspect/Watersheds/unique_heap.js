const module = {};

((module) => {
    class UniqueHeap {
        constructor(comparator) {
            this._heap = [];
            this._set = new Set();
            this._cmp = typeof comparator === 'function'
                ? comparator
                : (a, b) => (a < b ? -1 : a > b ? 1 : 0);
        }

        get size() {
            return this._heap.length;
        }

        has(value) {
            return this._set.has(value);
        }

        clear() {
            this._heap.length = 0;
            this._set.clear();
        }

        // add value if not present, return true if inserted, false if already present
        add(value) {
            if (this._set.has(value)) return false;
            this._set.add(value);
            this._heap.push(value);
            this._siftUp(this._heap.length - 1);
            return true;
        }

        // peek at minimum element without removing it
        peek() {
            return this._heap[0];
        }

        // pop and return minimum element, or undefined if empty
        pop() {
            if (this._heap.length === 0) return undefined;
            const min = this._heap[0];
            const last = this._heap.pop();
            this._set.delete(min);
            if (this._heap.length > 0) {
                this._heap[0] = last;
                this._siftDown(0);
            }
            return min;
        }

        _swap(i, j) {
            const h = this._heap;
            [h[i], h[j]] = [h[j], h[i]];
        }

        _siftUp(idx) {
            const h = this._heap;
            const cmp = this._cmp;
            let i = idx;
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (cmp(h[i], h[p]) < 0) {
                    this._swap(i, p);
                    i = p;
                } else break;
            }
        }

        _siftDown(idx) {
            const h = this._heap;
            const cmp = this._cmp;
            const n = h.length;
            let i = idx;
            while (true) {
                const l = 2 * i + 1;
                const r = l + 1;
                let smallest = i;
                if (l < n && cmp(h[l], h[smallest]) < 0) smallest = l;
                if (r < n && cmp(h[r], h[smallest]) < 0) smallest = r;
                if (smallest === i) break;
                this._swap(i, smallest);
                i = smallest;
            }
        }
    }

    module.exports = { 'UniqueHeap': UniqueHeap };
})(module);

export const UniqueHeap = module.exports.UniqueHeap;