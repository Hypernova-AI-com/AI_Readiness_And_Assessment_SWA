# Azure migration — environment & secrets

Current stack: Vite SPA + serverless `/api` functions (Vercel-style). Target: Azure.

## Recommended host
**Azure Static Web Apps (SWA)** — native fit: global CDN for the SPA + managed
Azure Functions for `/api`. Alternatives: App Service (Node) or Container Apps.

## The one rule
`VITE_*` vars are **PUBLIC** — Vite inlines them into the browser bundle at build
time. Everything else is a **SERVER SECRET** and must live in **Azure Key Vault**,
never in the bundle, never in the repo. **Never deploy the `.env` file** — it is
dev-only and git-ignored.

## Variable map
| Var | Type | Azure handling |
|---|---|---|
| `VITE_CALCOM_LINK` | public (build-time) | build env in the CI / GitHub Action, present at `vite build` |
| `CALCOM_API_KEY` | secret | Key Vault → app setting via Key Vault reference |
| `STRIPE_SECRET_KEY` | secret | Key Vault |
| `RESEND_API_KEY` | secret | Key Vault |
| `LEAD_TO_EMAIL` / `LEAD_FROM_EMAIL` | config | plain app setting |
| `ASSESSMENT_PRICE_CENTS` / `STRIPE_PRICE_ID` | config | plain app setting |

## Steps
1. Create a vault and add secrets:
   ```bash
   az keyvault create -n hna-kv -g <rg> -l eastus
   az keyvault secret set --vault-name hna-kv --name CALCOM-API-KEY --value <key>
   ```
2. Enable a system-assigned **Managed Identity** on the SWA / App Service.
3. Grant it **Key Vault Secrets User** (RBAC) on the vault.
4. Reference secrets from the app's application settings:
   ```
   CALCOM_API_KEY=@Microsoft.KeyVault(SecretUri=https://hna-kv.vault.azure.net/secrets/CALCOM-API-KEY/)
   ```
5. Set every `VITE_*` var as **build-time** env in the deploy workflow (they must
   exist when `vite build` runs, not at runtime).
6. `/api` functions read secrets from `process.env` (populated from app settings).

## Notes
- **Rotate `CALCOM_API_KEY`** before go-live — it was shared in chat.
- Tenant `ebdcecc9-9ae4-49e4-b260-20ca00848238` (hypernova-ai.com), subscription "Azure subscription 1".
- The local `.env` in the project root holds the current real values as the
  migration reference. It is git-ignored and must not be committed or deployed.
