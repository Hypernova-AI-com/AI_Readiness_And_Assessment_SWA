# Azure — environment & secrets

Stack: Vite SPA + **Azure Functions** (v4, TypeScript) in `/api`. Target host:
**Azure Static Web Apps (SWA)** — global CDN for the SPA + managed Functions for
`/api`, wired via `staticwebapp.config.json`.

## SWA build settings
| Setting | Value |
|---|---|
| `app_location` | `/` |
| `api_location` | `api` |
| `output_location` | `dist` |

## The one rule
`VITE_*` vars are **PUBLIC** — Vite inlines them into the browser bundle at build
time. Everything else is a **SERVER SECRET** and must live in **Azure Key Vault**
(referenced from SWA application settings), never in the bundle, never in the
repo. **Never deploy `.env` or `api/local.settings.json`** — both are dev-only
and git-ignored.

## Variable map
| Var | Type | Azure handling |
|---|---|---|
| `VITE_CALCOM_LINK` | public (build-time) | build env in the deploy pipeline, present at `vite build` |
| `VITE_STRIPE_ENABLED` | public (build-time) | build env in the deploy pipeline |
| `GRAPH_TENANT_ID` / `GRAPH_CLIENT_ID` | config | plain SWA app setting |
| `GRAPH_CLIENT_SECRET` | secret | Key Vault → app setting via Key Vault reference |
| `GRAPH_MAIL_SENDER` / `LEAD_TO_EMAIL` | config | plain SWA app setting |
| `CALCOM_API_KEY` | secret | Key Vault |
| `STRIPE_SECRET_KEY` | secret | Key Vault |
| `RESEND_API_KEY` | secret | Key Vault (only if used as fallback) |
| `ASSESSMENT_PRICE_CENTS` / `STRIPE_PRICE_ID` | config | plain SWA app setting |

## Steps
1. Create a vault and add secrets:
   ```bash
   az keyvault create -n hna-kv -g <rg> -l eastus
   az keyvault secret set --vault-name hna-kv --name GRAPH-CLIENT-SECRET --value <secret>
   ```
2. Enable a system-assigned **Managed Identity** on the Static Web App.
3. Grant it **Key Vault Secrets User** (RBAC) on the vault.
4. Reference secrets from the SWA application settings:
   ```
   GRAPH_CLIENT_SECRET=@Microsoft.KeyVault(SecretUri=https://hna-kv.vault.azure.net/secrets/GRAPH-CLIENT-SECRET/)
   ```
5. Set every `VITE_*` var as **build-time** env in the deploy pipeline (they must
   exist when `vite build` runs, not at runtime).
6. The Functions read secrets from `process.env` (populated from app settings).

## Recommended: drop the Graph client secret with a managed identity
Once running on Azure, the Static Web App's **managed identity** can obtain Graph
tokens directly — no client secret to store or rotate:
1. Assign the SWA managed identity the Graph **Mail.Send** app role
   (`New-MgServicePrincipalAppRoleAssignment`, Graph app-role id
   `b633e1c5-b582-4048-a93e-9f11b44c7e96`).
2. In `api/src/core/lead.ts`, swap the client-credentials fetch for a token from
   `DefaultAzureCredential` (`@azure/identity`) — the `sendMail` call is unchanged.
3. Remove `GRAPH_CLIENT_SECRET` from settings and delete the app registration
   secret.

## Notes
- **Rotate `CALCOM_API_KEY`** before go-live — it was shared in chat.
- App registration: **"HyperNova AI - Graph Automations"**
  (client `8f9a73bc-b2ea-4c5f-8bb0-e118429b6660`), Graph `Mail.Send`, admin-consented.
- Sender `noreply@hypernova-ai.com` is a shared mailbox (no license required).
- Tenant `ebdcecc9-9ae4-49e4-b260-20ca00848238` (hypernova-ai.com), subscription "Azure subscription 1".
- Local real values live in the root `.env` and `api/local.settings.json` — both
  git-ignored; never commit or deploy them.
