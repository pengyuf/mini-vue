const queue: any[] = []

const p = Promise.resolve()

// 标志是否已经创建了一个微任务
let isFlushPending = false


export function nextTick(fn) {
    return fn ? p.then(fn) : p
}

export function queueJobs(job) {
    // 收集job
    if (!queue.includes(job)) {
        queue.push(job)
    }
    // 执行job
    queueFlush()
}

function queueFlush() {
    if (isFlushPending) return
    isFlushPending = true

    nextTick(flushJobs)
}

function flushJobs() {
    Promise.resolve().then(() => {
        isFlushPending = false
        let job
        while ((job = queue.shift())) {
            job && job()
        }
    })
}