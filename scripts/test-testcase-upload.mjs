import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import axios, { AxiosError } from 'axios';

// Exercise the real upload function and Axios request config, without a server
// or credentials. Only its shared API instance is replaced with an isolated one.
const api = axios.create({ timeout: 10000 });
globalThis.__testcaseUploadApi = api;
const result = await build({
  entryPoints: [fileURLToPath(new URL('../src/services/problemEdit.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', external: ['axios'],
  plugins: [{ name: 'isolated-api', setup(b) {
    b.onResolve({ filter: /\/api\/axios$/ }, () => ({ path: 'api', namespace: 'test' }));
    b.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const api = globalThis.__testcaseUploadApi;' }));
    b.onResolve({ filter: /^@\/services\/endpoints$/ }, () => ({ path: fileURLToPath(new URL('../src/services/endpoints/problem.ts', import.meta.url)) }));
  }}],
});
const module = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
const { uploadProblemTestcases, getTestcaseUploadError } = module.exports;
const file = new File(['synthetic test archive'], 'sample.zip', { type: 'application/zip' });
let request, progress;
const events = [];
api.defaults.adapter = async config => {
  request = config; progress = config.onUploadProgress;
  progress({ loaded: 25, total: 100 });
  progress({ loaded: 100, total: 100 });
  return { status: 200, statusText: 'OK', headers: {}, config, data: { code: 0 } };
};
await uploadProblemTestcases('TEST', file, 'zip', e => events.push(e));
assert.equal(request.timeout, 600000);
assert.equal(api.defaults.timeout, 10000);
assert.equal(request.url, '/api/problem/data/TEST');
assert.equal(request.data.get('file').name, 'sample.zip');
assert.equal(request.data.get('format'), 'zip');
assert.deepEqual(events.map(e => [e.percent, e.stage]), [[25, 'uploading'], [100, 'processing']]);
progress({ loaded: 200, total: 100 });
assert.equal(events.length, 2, 'late events must not replace a completed/error UI state');
api.defaults.adapter = async config => {
  config.onUploadProgress({ loaded: 10 });
  return { status: 200, statusText: 'OK', headers: {}, config, data: { code: 200 } };
};
await uploadProblemTestcases('TEST', file, 'zip', p => assert.equal(p.percent, undefined));
for (const [code, status, expected] of [
  ['ECONNABORTED', undefined, /10 分钟/], ['ETIMEDOUT', undefined, /10 分钟/],
  ['ERR_NETWORK', undefined, /网络连接中断/], ['ERR_BAD_REQUEST', 413, /200 MiB/],
  ['ERR_BAD_REQUEST', 401, /登录已失效/], ['ERR_BAD_REQUEST', 403, /权限/],
  ['ERR_BAD_RESPONSE', 504, /刷新文件树确认结果/],
]) {
  const error = new AxiosError('English transport error', code, undefined, undefined,
    status ? { status, data: '<html>Gateway error</html>' } : undefined);
  assert.match(getTestcaseUploadError(error), expected);
  api.defaults.adapter = async () => { throw error; };
  await assert.rejects(uploadProblemTestcases('TEST', file, 'zip'), expected);
}
api.defaults.adapter = async config => ({ status: 200, headers: {}, config, data: { code: 40000, message: '压缩包包含非法路径' } });
await assert.rejects(uploadProblemTestcases('TEST', file, 'zip'), /非法路径/);
assert.match(getTestcaseUploadError(new Error('timeout of 10000ms exceeded')), /测试数据上传失败/);
// File boundary is inclusive; oversized files are rejected before the adapter.
const exact = new File([], 'exact.zip');
Object.defineProperty(exact, 'size', { value: 200 * 1024 * 1024 });
api.defaults.adapter = async config => ({ status: 200, headers: {}, config, data: { code: 0 } });
await uploadProblemTestcases('TEST', exact, 'zip');
const oversized = new File([], 'oversized.zip');
Object.defineProperty(oversized, 'size', { value: 200 * 1024 * 1024 + 1 });
api.defaults.adapter = async () => { throw Error('Oversized request must not be sent'); };
await assert.rejects(uploadProblemTestcases('TEST', oversized, 'zip'), /200 MiB/);
delete globalThis.__testcaseUploadApi;
console.log('PASS: upload timeout, progress lifecycle, unknown sizes, seven transport failures and server validation (no network or data writes).');
