# Targeted Comprehensive QA Testing Guidelines with Playwright MCP

## Autonomy Guidelines
Proceed without asking for user input unless one of the following applies:

- **Exhaustive Research**: All available tools (file_search, code analysis, web search, logs, development log review, interactive browser testing) have been used without resolution.
- **Conflicting Evidence**: Multiple authoritative sources disagree with no clear default.
- **Missing Resources**: Required credentials, permissions, or files are unavailable.
- **High-Risk/Irreversible Actions**: The next step could cause unrecoverable changes (data loss, production deploys).

## 1. Reset & Refocus

- Discard previous hypotheses and assumptions.
- **Identify the specific problem domain** - narrow focus to affected functionality
- **Kill existing terminal sessions** to ensure clean testing environment.

## 2. Problem-Scoped Architecture Mapping

- **Review development log** for recent changes, known issues, and context around the problem
- Use tools (list_dir, file_search, codebase_search, read_file) to map **only the affected system components**
- Identify **critical dependency paths** related to the issue
- Map **user journey touchpoints** that intersect with the problem area
- **Cross-reference** development log entries with affected components

## 3. Risk-Based Hypothesis Generation

Generate targeted hypotheses based on:
- **Development log analysis** - recent changes, deployment notes, known issues
- **Problem symptoms** and their likely technical causes
- **Component criticality** - focus on high-impact areas first
- **Change recency** - recent modifications that could cause issues
- **User impact severity** - prioritize user-facing problems
- **Historical patterns** - similar issues documented in development log

## 4. Strategic Investigation

### Quick Reconnaissance
- **Review development log** for context around the specific issue
- **Rapid static analysis** of problem-adjacent code
- **Targeted log analysis** for error patterns
- **Dependency verification** for critical components only
- **Correlate findings** with development log entries

### Smart Browser Testing Setup
- **Kill terminal** → **Launch new terminal**
- **Start application** in appropriate mode for the specific issue
- **Navigate directly** to problem area (skip irrelevant flows)

## 5. Targeted Interactive Testing

### Problem-Focused Navigation
- **Direct navigation** to affected functionality
- **Take baseline snapshot** of current state
- **Check console** for immediate errors
- **Test minimal reproduction** of the reported issue

### Expanding Circle Testing
Once problem is reproduced:

#### Inner Circle (Critical Path)
- **Core functionality** directly related to the issue
- **Immediate dependencies** that could cause the problem
- **Error boundaries** and fallback mechanisms

#### Middle Circle (Adjacent Systems)
- **Related features** that share components
- **Integration points** with the problematic area
- **Upstream/downstream** processes

#### Outer Circle (Regression Check)
- **Previously working features** that might be affected
- **Edge cases** in the problem domain
- **Cross-browser compatibility** for the specific issue

### Context-Aware Testing
- **Test only relevant components** based on the specific issue
- **Skip unrelated functionality** unless it's in the dependency path
- **Expand testing scope** only when evidence suggests broader impact

## 6. Evidence-Based Root Cause Analysis

- **Correlate browser testing** with static analysis findings
- **Prioritize console errors** that align with the problem symptoms
- **Map error patterns** to specific code sections
- **Confirm hypotheses** with targeted testing

## 7. Surgical Fix Design

- **Minimal viable fix** that addresses the root cause
- **Impact assessment** on adjacent functionality
- **Rollback strategy** if the fix causes new issues
- **Test-driven fix validation** approach

## 8. Targeted Verification Strategy

### Problem-Specific Testing
- **Reproduce original issue** to confirm it's fixed
- **Test fix robustness** with edge cases
- **Verify error handling** improvements

### Blast Radius Testing
- **Test adjacent features** that share code/dependencies
- **Validate integration points** that might be affected
- **Check regression** in previously working functionality

### Selective Broader Testing
Only expand testing if:
- Fix touches shared/critical infrastructure
- Multiple user flows could be affected
- Risk assessment suggests broader impact

## 9. Implement & Validate with Precision

### Incremental Implementation
- **Small, testable changes** with immediate validation
- **Console monitoring** during each change
- **Snapshot comparison** before/after each increment

### Targeted Validation
- **Kill terminal** → **Restart application**
- **Direct test** of the specific fix
- **Verify console** shows error resolution
- **Test critical path** functionality
- **Selective regression testing** based on change impact

## 10. Focused Outcome Report

- **Root Cause**: Specific technical issue and user impact
- **Fix Applied**: Precise changes made
- **Targeted Testing Results**: 
  - Problem reproduction and resolution
  - Critical path verification
  - Selective regression testing outcomes
- **Risk Assessment**: Confidence level and remaining risks
- **Monitoring Recommendations**: Specific areas to watch

## Smart Testing Decision Framework

### Issue Assessment
```
Issue Reported
    ↓
Can I reproduce it quickly?
    ↓
Yes → Focus on that specific flow
No → Expand search systematically
    ↓
What's the scope of impact?
    ↓
Single Component → Test component + direct dependencies
Feature-wide → Test feature + integration points
System-wide → Test core flows + critical paths
```

### Testing Scope Decisions
- **Test only what's necessary** to understand and fix the issue
- **Expand scope incrementally** based on evidence
- **Skip unrelated functionality** unless risk assessment suggests testing
- **Prioritize user-facing impacts** over internal system testing

## Example: Targeted Testing Pattern

**Problem**: Specific functionality not working

1. **Kill terminal** → **Start new terminal** → **Launch app**
2. **Navigate directly** to problematic area → **Take snapshot**
3. **Check console** for immediate errors
4. **Reproduce issue** → **Monitor console** → **Identify patterns**
5. **Test variations** to understand scope
6. **Fix identified issue** based on evidence
7. **Verify fix** with direct testing
8. **Selective testing** of related functionality based on fix impact

This approach ensures maximum efficiency while maintaining confidence through strategic, evidence-based testing decisions.