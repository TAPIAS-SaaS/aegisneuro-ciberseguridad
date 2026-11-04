import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskAnswer } from './validation';

test('validateTaskAnswer rejects repeated character spam and generic filler words', () => {
  const spamRes = validateTaskAnswer(
    'aaaaaaaaaaaa',
    { mode: 'exact', acceptedAnswers: ['auditor'] },
    []
  );
  assert.equal(spamRes.valid, false);

  const fillerRes = validateTaskAnswer(
    'comprendido',
    { mode: 'exact', acceptedAnswers: ['auditor'] },
    []
  );
  assert.equal(fillerRes.valid, false);
});

test('validateTaskAnswer regex mode accepts chmod 755 or chmod u-s but rejects chmod 4755', () => {
  const spec = {
    mode: 'regex' as const,
    pattern: '^chmod\\s+(u-s|0?755)(\\s+/usr/local/bin/sysdiag)?$',
    flags: 'i',
  };

  assert.equal(validateTaskAnswer('chmod u-s /usr/local/bin/sysdiag', spec, []).valid, true);
  assert.equal(validateTaskAnswer('chmod 755 /usr/local/bin/sysdiag', spec, []).valid, true);
  assert.equal(
    validateTaskAnswer('chmod 4755 /usr/local/bin/sysdiag', spec, []).valid,
    false,
    'chmod 4755 keeps the SUID bit and must be rejected'
  );
});

test('validateTaskAnswer flag mode requires both matching flag string and prior capture in the VM', () => {
  const spec = {
    mode: 'flag' as const,
    expectedFlag: 'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
  };

  const withoutVM = validateTaskAnswer(
    'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
    spec,
    []
  );
  assert.equal(
    withoutVM.valid,
    false,
    'Submitting a flag without capturing it in the VM session must be rejected'
  );

  const withVM = validateTaskAnswer(
    'FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}',
    spec,
    ['FLAG{LINUX_SUID_CAPABILITIES_MASTERED_2026}']
  );
  assert.equal(withVM.valid, true);
});
