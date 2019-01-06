import * as uuid from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import summon from './lib/summon'
import log from './lib/logger'

const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

export interface ExecResult {
    stdout: string
    stderr: string
}

export default async function run(source: string): Promise<ExecResult> {
    await pull()
    const result = await exec(source)
    return result
}

async function exec(source: string): Promise<ExecResult> {
    const sourceFilename = 'index.js'
    const tempDir = await createTempDir()
    const tempSourcePath = path.join(tempDir, sourceFilename)
    log.info(`Created temporary source file: ${tempSourcePath}`)

    // Write source to the temp directory
    await writeFile(tempSourcePath, source, { encoding: 'utf8' })

    const dockerOpts = ['run', '--rm', '-v', `${tempDir}:/app`, 'node:lts-alpine', 'node', `/app/${sourceFilename}`]
    log.info(`Launching docker with args: ${JSON.stringify(dockerOpts)}`)
    const docker = summon('docker', dockerOpts)

    const stdoutPromise = new Promise<string>((resolve, reject) => {
        let stdout = ''
        docker.stdout.on('error', reject)
        docker.stdout.on('data', (chunk: Buffer) => {
            stdout += chunk.toString()
        })
        docker.stdout.on('close', () => {
            log.info(`stdout closed:\n${stdout}`)
            resolve(stdout)
        })
    })

    const stderrPromise = new Promise<string>((resolve, reject) => {
        let stderr = ''
        docker.stderr.on('error', reject)
        docker.stderr.on('data', (chunk: Buffer) => {
            stderr += chunk.toString()
        })
        docker.stderr.on('close', () => {
            log.info(`stderr closed:\n${stderr}`)
            resolve(stderr)
        })
    })

    const exitPromise = new Promise<void>((resolve, reject) => {
        docker.on('error', reject)
        docker.on('close', (code, signal) => {
            if (code !== 0) {
                reject(new Error(`Docker pull failed with code ${code}, signal ${signal}`))
                return
            }
            resolve()
        })
    })

    const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise, exitPromise])

    return {
        stdout,
        stderr
    }
}

async function createTempDir() {
    const uid = uuid.v4()
    const tempDir = `/tmp/${uid}`
    await mkdir(tempDir)
    return tempDir
}

function pull() {
    return new Promise((resolve, reject) => {
        const dockerImage = 'node:lts-alpine'
        log.info(`Pulling docker image: ${dockerImage}`)
        const docker = summon('docker', ['pull', dockerImage])

        docker.on('error', reject)
        docker.on('close', (code, signal) => {
            if (code !== 0) {
                reject(new Error(`Docker pull failed with code ${code}, signal ${signal}`))
                return
            }

            resolve()
        })
    })
}
