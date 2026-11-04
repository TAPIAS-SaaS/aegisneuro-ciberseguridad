import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeVMCommand,
  resetVMNodeState,
  runSecurityScriptSandbox,
  MODULE_TO_VM_NODE,
  VM_NODES,
} from './vmEngine';
import { MODULE_DEEP_EXTRAS } from '../data/roomTasksData';

test('VM engine differentiates SUID discovery from Linux Capabilities and enforces stateful chmod u-s patching', () => {
  resetVMNodeState('linux-target');

  const findRes = executeVMCommand(
    'mod-02',
    'linux-target',
    'find / -perm -4000 2>/dev/null',
    '/home/auditor',
    'auditor'
  );
  assert.equal(findRes.exitCode, 0);
  assert.ok(findRes.output.includes('/usr/local/bin/sysdiag'));
  assert.ok(
    !findRes.output.includes('python3.10'),
    'find -perm -4000 must NOT list python3.10 (which uses capabilities, not SUID)'
  );

  const capRes = executeVMCommand(
    'mod-02',
    'linux-target',
    'getcap -r / 2>/dev/null',
    '/home/auditor',
    'auditor'
  );
  assert.equal(capRes.exitCode, 0);
  assert.ok(capRes.output.includes('/usr/bin/python3.10 cap_setuid+ep'));

  // Exploit while SUID is active
  const exploitRes = executeVMCommand(
    'mod-02',
    'linux-target',
    '/usr/local/bin/sysdiag --root-shell',
    '/home/auditor',
    'auditor'
  );
  assert.equal(exploitRes.newUser, 'root');
  assert.equal(exploitRes.capturedFlag, 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}');

  // Now revoke SUID bit with chmod u-s
  const patchRes = executeVMCommand(
    'mod-02',
    'linux-target',
    'chmod u-s /usr/local/bin/sysdiag',
    '/home/auditor',
    'root'
  );
  assert.equal(patchRes.exitCode, 0);
  assert.equal(patchRes.capturedFlag, undefined, 'chmod u-s must patch the binary, not trigger the exploit');
  assert.ok(patchRes.output.includes('-rwxr-xr-x'));

  // Re-running exploit after patching must fail to escalate
  const postPatchExploit = executeVMCommand(
    'mod-02',
    'linux-target',
    '/usr/local/bin/sysdiag --root-shell',
    '/home/auditor',
    'auditor'
  );
  assert.equal(postPatchExploit.exitCode, 13);
  assert.equal(postPatchExploit.capturedFlag, undefined);
});

test('VM engine separates realistic /proc/self/maps from checksec binary mitigation analysis', () => {
  resetVMNodeState('linux-target');

  const mapsRes = executeVMCommand(
    'mod-01',
    'linux-target',
    'cat /proc/self/maps',
    '/home/auditor',
    'auditor'
  );
  assert.equal(mapsRes.exitCode, 0);
  assert.ok(mapsRes.output.includes('[stack]'));
  assert.ok(!mapsRes.output.includes('RELRO'), '/proc/self/maps must not contain checksec output');
  assert.equal(mapsRes.capturedFlag, undefined);

  const checksecRes = executeVMCommand(
    'mod-01',
    'linux-target',
    'checksec --file=/usr/local/bin/sysdiag',
    '/home/auditor',
    'auditor'
  );
  assert.equal(checksecRes.exitCode, 0);
  assert.equal(checksecRes.capturedFlag, 'FLAG{CPU_MEMORY_ASLR_NX_VERIFIED}');
});

test('VM engine enforces node isolation and supports standard shell navigation (cd, ls, sudo -l)', () => {
  resetVMNodeState('linux-target');

  const wrongNode = executeVMCommand(
    'mod-02',
    'linux-target',
    'kubectl get pods',
    '/home/auditor',
    'auditor'
  );
  assert.equal(wrongNode.exitCode, 127);

  const cdRes = executeVMCommand(
    'mod-02',
    'linux-target',
    'cd /var/log',
    '/home/auditor',
    'auditor'
  );
  assert.equal(cdRes.exitCode, 0);
  assert.equal(cdRes.newCwd, '/var/log');

  const sudoRes = executeVMCommand(
    'mod-02',
    'linux-target',
    'sudo -l',
    '/home/auditor',
    'auditor'
  );
  assert.equal(sudoRes.exitCode, 0);
  assert.ok(sudoRes.output.includes('User auditor may run'));
});

test('All 13 curriculum rooms capture their exact expected flag when executing their labCommands', () => {
  resetVMNodeState();

  const modIds = Object.keys(MODULE_DEEP_EXTRAS);
  assert.equal(modIds.length, 13, 'Must test all 13 modules (mod-00 through mod-12)');

  for (const modId of modIds) {
    resetVMNodeState();
    const extra = MODULE_DEEP_EXTRAS[modId];
    const nodeId = MODULE_TO_VM_NODE[modId] || 'linux-target';
    const node = VM_NODES[nodeId];

    let captured: string | undefined;
    for (const cmdObj of extra.labCommands) {
      const res = executeVMCommand(modId, nodeId, cmdObj.command, node.cwd, node.user);
      if (res.capturedFlag) {
        captured = res.capturedFlag;
      }
    }

    assert.equal(
      captured,
      extra.labFlagAnswer,
      `Module ${modId} labCommands must capture ${extra.labFlagAnswer}, got ${captured}`
    );
  }
});

test('Static script analyzer rejects comment-only and syntax-broken scripts while rewarding defensive code', () => {
  const commentOnly = runSecurityScriptSandbox('python', '# solo un comentario\n# otro comentario');
  assert.equal(commentOnly.success, false);
  assert.equal(commentOnly.securityScore, 0);

  const brokenTry = runSecurityScriptSandbox('python', 'import socket\ntry:\n  s = socket.socket()');
  assert.equal(brokenTry.success, false);

  const validDefensive = runSecurityScriptSandbox(
    'python',
    'import socket\nimport sys\ntry:\n  s = socket.socket()\n  s.settimeout(2.0)\nexcept Exception as e:\n  sys.exit(1)'
  );
  assert.equal(validDefensive.success, true);
  assert.ok(validDefensive.securityScore >= 80);
});
