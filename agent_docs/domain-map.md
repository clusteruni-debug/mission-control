# Mission Control — CC/CX File Ownership

| Domain | File/Directory | Owner | Rationale |
|--------|---------------|:-----:|-----------|
| API Routes | src/app/api/** | CC | Server logic, external API integration |
| Library | src/lib/* | CC | Data layer |
| Type Definitions | src/types/* | CC | Shared interfaces |
| UI Components | src/components/* | CX | Dashboard widgets |
| Custom Hooks | src/hooks/* | CX | Single files |
| Pages | src/app/page.tsx, src/app/project/** | CX | UI-centric |
| Environment Config | .env* | Manual | — |
