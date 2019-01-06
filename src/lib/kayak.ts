import { Stream, Readable, Writable, Duplex, Transform, PassThrough } from 'stream'

export interface KayakOptions {
    trackStream?: boolean
}

interface WithName {
    name: string
}

let defaultTrackStream = false

export const activeStreams: Readonly<Array<Stream & WithName>> = []

export function kayak<T extends Stream>(stream: T, name: string, opts: KayakOptions = {}): T & WithName {
    if (![Readable, Writable, Duplex, Transform, PassThrough].some(streamType => stream instanceof streamType)) {
        throw new Error(`${name} is not a Stream!`)
    }

    const str = Object.assign(stream, { name })

    const trackStream = typeof opts.trackStream !== 'undefined' ? opts.trackStream : defaultTrackStream
    if (trackStream) {
        activeStreams.push(str)
        const untrack = () => {
            const ptr = activeStreams.indexOf(str)
            activeStreams.splice(ptr, 1)
        }
        str.on('error', untrack)
        str.on('finish', untrack)
        str.on('end', untrack)
    }

    return str
}

export function printActiveStreams() {
    console.log(activeStreams.map(stream => stream.name))
}

export function setDefaultTrackStream(value: boolean) {
    defaultTrackStream = value
}
