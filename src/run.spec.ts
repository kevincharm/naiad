import test from 'ava'
import run from './run'

test('run hello world js program from source string', async t => {
    const source = `console.log('Hello world!')`
    const execResult = await run(source)

    t.true(execResult.stdout.includes('Hello world!'))
})
