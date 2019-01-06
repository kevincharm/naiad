import { basename } from 'path'
import { spawn, SpawnOptions } from 'child_process'
import log from './logger'

/**
 * Wraps `child_process.spawn` with default error handlers for each stream in stdio.
 * Useful for tracing stream errors like `write EPIPE`.
 */
export default function summon(command: string, args?: string[], opts?: SpawnOptions) {
    const azazel = spawn(command, args, opts)
    const incantation = [basename(command), args && args.join(' ')].filter(s => !!s).join(' ')
    azazel.stdin.on('error', err => {
        log.error(`Stream error:\n${toStackTrace('stdin', incantation, err)}`)
    })
    azazel.stdout.on('error', err => {
        log.error(`Stream error:\n${toStackTrace('stdout', incantation, err)}`)
    })
    azazel.stderr.on('error', err => {
        log.error(`Stream error:\n${toStackTrace('stderr', incantation, err)}`)
    })
    return azazel
}

function toStackTrace(pipe: string, command: string, err: Error) {
    return JSON.stringify(
        {
            pipe,
            command,
            ...err
        },
        null,
        2
    )
}
