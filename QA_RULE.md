# Infinity Castle — Quality Assurance Rule (Permanent)

## Applies to: Every file, every phase, every change

### During Creation
- Test every change as it's written — trace every code path mentally before committing
- Verify each line/function performs **only** its intended purpose — no side effects
- Examine every relevant possibility: null values, empty arrays, unauthenticated users, network failures, concurrent requests, edge inputs
- Change nothing without a real reason — state why each fix was made

### Before Marking Any Phase Complete
- [ ] Fully implemented — no stubs, no TODO comments left in production code
- [ ] Functional — logic is correct end-to-end, not just compiling
- [ ] Free of detected bugs — null deref, race conditions, missing guards
- [ ] Free of unintended behavior — side effects, over-fetching, data leaks
- [ ] No unnecessary code — dead imports, unused vars, redundant checks
- [ ] No overlooked edge cases — empty state, expired session, duplicate submission, network retry storm, storage overflow

### Fix Reporting Format
Every fix must state:
> **Why fixed:** [exact reason — what would break without this fix]
