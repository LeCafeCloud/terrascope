![CI](https://github.com/LeCafeCloud/terrascope/actions/workflows/ci.yml/badge.svg)

# Terrascope

Turn your **IaC state into an interactive constellation**.  
Resources become planets, modules become galaxies, and dependencies form orbital links.

### Visual Mappings

| Terraform Concept | TerraScope Metaphor | Example Visualization |
|-------------------|---------------------|-----------------------|
| Provider          | Star type           | Color or spectrum per provider |
| Module            | Galaxy              | Grouped cluster with faint halo |
| Resource          | Planet              | Size by importance or cost hint |
| Data source       | Moon                | Smaller orbiting body |
| Dependency edge   | Orbit/Link          | Line with arrow and weight |
| Drift or taint    | Storm cloud         | Particle effect or outline |

### Views

- **Constellation view**: force-directed graph of resources and modules  
- **Orbit view**: module-centric “solar system” where resources orbit modules  
- **Timeline**: play changes across commits or releases  
- **Policy lens**: highlight resources violating tagging or compliance rules

### Interactions

- Click to open a resource panel: type, provider, attributes (sanitized), lifecycle, dependencies  
- Filter by provider, module, tag, environment  
- Search bar with fuzzy search on addresses (`module.app.aws_s3_bucket.assets`)  
- Snapshot compare: diff two states and highlight adds/changes/destroys

---

## Guidelines (for project contributors)

1. **Conventional commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `ci:`, `build:`, `test:`  
2. Keep the service **stateless**; use object storage for optional snapshots  
3. Use **IaC** for deployment (Terraform, Pulumi, or Helm)  
4. Implement **CI/CD** with automated tests and image builds  
5. Enforce **least privilege** for any backend reads  
6. Provide clear **docs** for local dev, cloud deploy, and supported backends  
7. Add **redaction** options to mask sensitive attributes before rendering

---

## Architecture

```
Terraform State (local upload or remote backend)
=> Parser / Normalizer (API)
=> Graph Builder (nodes, edges, metadata)
=> REST / WebSocket
=> Frontend (React + Three.js)
=> Interactive Constellation UI
```

---

## Data Sources

- `terraform.tfstate` JSON (local or remote backend)  
- Optional: `terraform plan -json` for planned changes  
- Optional: `terraform graph -json` for explicit dependency graph
