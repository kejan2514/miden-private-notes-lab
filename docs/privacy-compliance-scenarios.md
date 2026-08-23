# Privacy + Compliance Scenarios

This file defines concrete test cases for the programmable-privacy extension.

## Policy matrix

| Scenario | Sender approved | Receiver approved | Asset allowed | Jurisdiction allowed | Expected result |
| --- | --- | --- | --- | --- | --- |
| Happy path | yes | yes | yes | yes | allow |
| Blocked sender | no | yes | yes | yes | deny |
| Blocked receiver | yes | no | yes | yes | deny |
| Unsupported asset | yes | yes | no | yes | deny |
| Jurisdiction rule fails | yes | yes | yes | no | deny |
| Zero amount | yes | yes | yes | yes | deny |

## Selective disclosure cases

### Reviewer needs amount-band confirmation

Reveal:
- `amount <= threshold`
- policy version
- verification result

Keep private:
- exact amount
- sender
- receiver
- payment reference

### Reviewer needs asset-policy confirmation

Reveal:
- asset policy passed
- policy version
- verification result

Keep private:
- counterparty metadata
- transfer amount unless separately required

### User declines disclosure

Expected behavior:
- transaction privacy remains unchanged;
- UI explains that disclosure is optional in the educational model;
- no fake proof or reviewer result is displayed.

## UI requirements

Every scenario screen should clearly identify one of these states:

```text
DEMO DATA
SDK-DERIVED DATA
LOCAL POLICY SIMULATION
ON-CHAIN / PROTOCOL-ENFORCED CONDITION
```

The interface must never blur those categories.

## Non-goals

This project does not claim to provide:

- production KYC/AML compliance;
- sanctions screening;
- legal jurisdiction determination;
- an audited stablecoin contract;
- guaranteed confidentiality against browser, endpoint, or operational leakage.

## Contribution checklist

Before extracting this work into an upstream tutorial:

- [ ] Replace illustrative policy logic with actual Miden-compatible logic.
- [ ] Add deterministic test vectors.
- [ ] Add failure-path tests.
- [ ] Document all public and private fields.
- [ ] Explain trusted roles and key ownership.
- [ ] Remove claims that cannot be demonstrated in code.
- [ ] Verify SDK APIs against the current Miden release.
