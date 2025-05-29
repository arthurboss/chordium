# Git-Tree Standalone Repository Plan

> **Status**: Planning Phase  
> **Priority**: Future Enhancement  
> **Created**: May 29, 2025  

## 🎯 Vision

Transform git-tree from a project-specific script into a standalone, reusable tool that can be installed and used across different projects, platforms, and CI/CD environments.

## Rationale

Have you ever ran out of RAM memory browsing or reviewing a large pull request?
I have. Many times.
This project aims to provide a quick overview of files affected by changes in the PR, which may prove specially useful for:

- cross-team work, where teams are responsible for different parts of the codebase, and it is not always possible to review all changes in a PR.
You got no time to read through all the changes, right? But a quick glance at the file tree can help you understand the scope of changes and identify potential issues.

- the AI-dev workflow, where developers have become the new product managers/inspectors, and need to quickly understand the changes made by AI-generated code.

## 🏗️ Proposed Architecture

### Core Philosophy: **Hybrid Approach**
- **Shared Core**: Pure, environment-agnostic functions (rendering, tree generation, markdown)
- **Separate Adapters**: Environment-specific data sources (git, GitHub API, GitLab API)
- **Modular Integrations**: Platform-specific implementations (GitHub Actions, GitLab CI, CLI)

### Repository Structure

```
git-tree/
├── README.md
├── package.json
├── LICENSE
├── .git-tree.json              # Default configuration
│
├── bin/                        # Entry points
│   ├── git-tree                # Main CLI executable
│   ├── git-tree-setup          # Setup/configuration helper
│   └── git-tree-validate       # Validation utility
│
├── lib/
│   ├── core/                   # 🔄 Pure, reusable functions
│   │   ├── render/            # Tree rendering logic
│   │   │   ├── tree-builder.js
│   │   │   ├── markdown-generator.js
│   │   │   ├── file-processor.js
│   │   │   └── header-generator.js
│   │   ├── files/             # File processing utilities
│   │   │   ├── status-detector.js
│   │   │   ├── path-calculator.js
│   │   │   └── file-counter.js
│   │   └── markdown/          # Markdown generation
│   │       ├── blockquote-formatter.js
│   │       ├── link-generator.js
│   │       └── details-section.js
│   │
│   ├── adapters/              # 🔌 Data source adapters
│   │   ├── git/              # Local git operations
│   │   │   ├── branch-detector.js
│   │   │   ├── diff-fetcher.js
│   │   │   ├── file-lister.js
│   │   │   └── repo-analyzer.js
│   │   ├── github/           # GitHub API operations
│   │   │   ├── api-client.js
│   │   │   ├── pr-fetcher.js
│   │   │   ├── url-generator.js
│   │   │   └── branch-formatter.js
│   │   ├── gitlab/           # GitLab API operations
│   │   │   ├── api-client.js
│   │   │   ├── mr-fetcher.js
│   │   │   └── url-generator.js
│   │   └── bitbucket/        # Bitbucket API operations
│   │       ├── api-client.js
│   │       └── pr-fetcher.js
│   │
│   └── integrations/         # 🚀 Platform integrations
│       ├── cli/             # Command-line interface
│       │   ├── commands/
│       │   ├── config/
│       │   └── output/
│       ├── github-actions/  # GitHub Actions workflow
│       │   ├── action.yml
│       │   ├── adapter.js
│       │   └── comment-formatter.js
│       ├── gitlab-ci/       # GitLab CI integration
│       │   ├── .gitlab-ci.yml
│       │   └── integration.js
│       └── vscode/          # VS Code extension
│           ├── extension.js
│           └── commands/
│
├── templates/               # Configuration templates
│   ├── github-actions.yml
│   ├── gitlab-ci.yml
│   └── config-examples/
│
├── docs/                   # Documentation
│   ├── installation.md
│   ├── configuration.md
│   ├── integrations/
│   └── api/
│
└── tests/                  # Test suite
    ├── unit/
    ├── integration/
    └── fixtures/
```

## 📦 Installation Options

### Option 1: NPM Global Installation
```bash
# Core package with CLI
npm install -g git-tree

# Platform-specific packages (optional)
npm install -g @git-tree/github-actions
npm install -g @git-tree/gitlab-ci
```

### Option 2: Homebrew (macOS/Linux)
```bash
brew install git-tree
```

### Option 3: Binary Downloads
```bash
# Download platform-specific binaries
curl -L https://github.com/git-tree/releases/latest/download/git-tree-linux
```

## 🔧 Usage Examples

### CLI Usage
```bash
# Basic usage (git-based)
git-tree --base main --target feature-branch

# Output to file
git-tree --base main --target feature-branch --output changes.md

# GitHub API mode
git-tree --github --pr 123 --token $GITHUB_TOKEN

# Custom configuration
git-tree --config .git-tree.json

# Setup integrations
git-tree setup github-actions
git-tree setup gitlab-ci
```

### GitHub Actions Integration
```yaml
name: PR File Tree
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  file-tree:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: git-tree/github-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          pr-number: ${{ github.event.number }}
```

### Programmatic Usage
```javascript
import { GitTreeGenerator } from 'git-tree';
import { GitHubAdapter } from 'git-tree/adapters/github';

const generator = new GitTreeGenerator({
  adapter: new GitHubAdapter({ token: process.env.GITHUB_TOKEN }),
  config: { style: 'tree', icons: true }
});

const result = await generator.generate({
  source: 'github',
  prNumber: 123,
  repository: 'owner/repo'
});

console.log(result.markdown);
```

## ⚙️ Configuration System

### Global Configuration (`.git-tree.json`)
```json
{
  "version": "1.0",
  "output": {
    "format": "markdown",
    "style": "tree",
    "icons": true,
    "blockquotes": true
  },
  "sources": {
    "git": {
      "enabled": true,
      "defaultBase": "main"
    },
    "github": {
      "enabled": false,
      "token": "${GITHUB_TOKEN}",
      "apiUrl": "https://api.github.com"
    },
    "gitlab": {
      "enabled": false,
      "token": "${GITLAB_TOKEN}",
      "apiUrl": "https://gitlab.com/api/v4"
    }
  },
  "integrations": {
    "github-actions": {
      "stickyComments": true,
      "commentHeader": "## 📁 File Tree Changes"
    },
    "cli": {
      "autoOpen": false,
      "colorOutput": true
    }
  },
  "templates": {
    "header": "## 🔄 File Tree of Changed Files",
    "summaryHeader": "## 📊 File Summary ({total} total files changed)"
  }
}
```

### Project-specific Configuration (`.git-tree.local.json`)
```json
{
  "extends": "~/.git-tree.json",
  "output": {
    "directory": "./docs/changes/"
  },
  "sources": {
    "git": {
      "defaultBase": "develop"
    }
  }
}
```

## 🚀 Migration Path

### Phase 1: Extract Core Functions
- [ ] Move rendering logic to `lib/core/render/`
- [ ] Create pure file processing functions
- [ ] Extract markdown generation utilities
- [ ] Establish plugin architecture

### Phase 2: Create Adapters
- [ ] Git adapter (`lib/adapters/git/`)
- [ ] GitHub adapter (`lib/adapters/github/`)
- [ ] Abstract adapter interface
- [ ] Configuration system

### Phase 3: Build CLI
- [ ] Command-line interface (`lib/integrations/cli/`)
- [ ] Configuration management
- [ ] Multi-format output support
- [ ] Error handling and validation

### Phase 4: Platform Integrations
- [ ] GitHub Actions package (`lib/integrations/github-actions/`)
- [ ] GitLab CI package (`lib/integrations/gitlab-ci/`)
- [ ] VS Code extension (`lib/integrations/vscode/`)
- [ ] Template system

### Phase 5: Distribution
- [ ] NPM package publishing
- [ ] Homebrew formula
- [ ] Binary releases (GitHub Actions)
- [ ] Documentation website

## 🎯 Benefits

### For Users
- **✅ Simple Installation**: One command to get started
- **✅ Multiple Platforms**: Works everywhere (CLI, GitHub, GitLab, etc.)
- **✅ Consistent Output**: Same beautiful format across all platforms
- **✅ Flexible Configuration**: Customize to project needs
- **✅ Zero Dependencies**: Self-contained with minimal requirements

### For Maintainers
- **✅ Single Source of Truth**: Core logic in one place
- **✅ Easy Testing**: Pure functions are easily testable
- **✅ Modular Development**: Add platforms without touching core
- **✅ Clear Separation**: Platform code vs. business logic
- **✅ Community Contributions**: Others can add new adapters/integrations

## 🔍 Technical Considerations

### Language Choice
**Recommendation: TypeScript/Node.js**
- Cross-platform compatibility
- Rich ecosystem (CLI libraries, API clients)
- Easy distribution via NPM
- Type safety for better maintainability
- Existing GitHub Actions ecosystem

### Alternative: Go
- Single binary distribution
- Fast execution
- Good for CLI tools
- Cross-compilation support

### Backward Compatibility
- Maintain current Bash script for existing users
- Provide migration guide
- Support both old and new formats during transition

### Testing Strategy
- **Unit Tests**: Core functions with mock data
- **Integration Tests**: Real API calls (with rate limiting)
- **E2E Tests**: Full workflows in CI environments
- **Platform Tests**: Each integration tested separately

## 📋 TODO Checklist

### Research & Planning
- [ ] Analyze similar tools (tree, exa, git-summary)
- [ ] Survey potential users for requirements
- [ ] Define API contracts between components
- [ ] Create detailed technical specifications

### Development
- [ ] Set up monorepo structure
- [ ] Implement core rendering engine
- [ ] Create adapter pattern and interfaces
- [ ] Build CLI with configuration system
- [ ] Develop GitHub Actions integration
- [ ] Add GitLab CI support

### Distribution
- [ ] NPM package configuration
- [ ] GitHub Actions for CI/CD
- [ ] Documentation website
- [ ] Homebrew formula
- [ ] VS Code marketplace submission

### Community
- [ ] Open source license selection
- [ ] Contribution guidelines
- [ ] Issue templates
- [ ] Community Discord/discussions

## 🤝 Potential Collaborators

- **Frontend Developers**: Need visual change summaries
- **DevOps Engineers**: CI/CD integration specialists
- **Open Source Maintainers**: Code review workflow improvements
- **Documentation Teams**: Change visualization for docs

## 📚 References

- Current implementation: `scripts/git-tree/`
- GitHub Actions integration: `.github/scripts/git-tree-pr-adapter.sh`
- Similar tools: [git-summary](https://github.com/albenik/git-summary), [onefetch](https://github.com/o2sh/onefetch)
- Package inspiration: [commitizen](https://github.com/commitizen/cz-cli), [semantic-release](https://github.com/semantic-release/semantic-release)

---

**Next Steps**: 
1. Validate concept with potential users
2. Create detailed technical specification
3. Set up repository structure
4. Begin Phase 1 implementation

**Estimated Timeline**: 3-6 months for MVP, 6-12 months for full feature set
