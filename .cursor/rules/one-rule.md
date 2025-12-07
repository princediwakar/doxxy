---
alwaysApply: true
---
## 🎯 Autonomous Operation & Browser Testing

### Proceed Autonomously For
- Code edits, migrations, type updates, testing
- UI changes, bug fixes, feature additions
- Performance optimizations, hook updates
- Database schema changes with validation

### 🚨 MANDATORY: Browser Testing
**RULE**: Every major change requires Puppeteer browser testing
- Take before/after snapshots
- Check console for errors
- Test user flows in browser
- Verify multi-tenant isolation
- Test responsive design (mobile/tablet/desktop)

### Clarify Only When
- Unclear requirements or missing context
- High-risk operations (e.g., data deletion)
- Ambiguous healthcare workflows

**Rule**: Clear requirements → implement + test. Unclear → ask specific questions via Cursor comments.

---

## 🎨 Design System

### Principles
- **Trust**: Blue palette, clean typography
- **Clarity**: Clear hierarchy, ample spacing
- **Accessibility**: 44px touch targets, WCAG AA
- **Consistency**: Reusable components, tokens

### Design Tokens
```typescript
const typography = {
  title: 'text-2xl font-semibold tracking-tight',
  body: 'text-sm font-normal leading-relaxed'
};

const colors = {
  primary: 'bg-blue-500 text-white',
  error: 'bg-red-50 text-red-600'
};

const spacing = {
  normal: 'space-y-4 gap-4 p-4'
};
```

### Components
```tsx
// Button
className={cn('px-4 py-2 rounded-lg min-h-[44px]', 'bg-blue-500 hover:bg-blue-600 text-white')}

// Card
className={cn('bg-white rounded-xl shadow-sm border')}

// Input
className={cn('w-full px-3 py-2 border rounded-lg', 'focus:ring-2 focus:ring-blue-500')}
```

---

## ⚡ Quality Pipeline

### After Every Change
1. **Analyze Schema**
   ```bash
   supabase db dump --schema-only
   supabase inspect db relations table_name
   ```

2. **Code Quality**
   ```bash
   npm run lint
   npm run build
   ```

3. **Database Ops**
   ```bash
   supabase migration up
   supabase db query "SELECT * FROM table_name WHERE clinic_id = 'uuid'"
   ```

4. **Browser Testing**
   ```bash
   pkill -f "vite"
   # USER starts: npm run dev
   sleep 3 && curl localhost:3000

   npx playwright test --headed --project=chromium
   npx playwright show-report
   ```

5. **Test Checklist**
   - [ ] No new console errors
   - [ ] Feature works in browser
   - [ ] Multi-tenant isolation verified
   - [ ] Responsive design tested
   - [ ] Error handling confirmed

6. **API Docs (If Needed)**
   - Use Cursor: `Ctrl+Shift+P` → "Search API docs for [api_name]"

7. **Quality Gates**
   - [ ] TypeScript compiles
   - [ ] No console errors
   - [ ] User flow tested
   - [ ] Design system applied
   - [ ] Multi-tenant security verified
   - [ ] HIPAA compliance maintained

---

## 🔧 Technical Standards

### Database Flow
1. Check schema: `supabase db dump`
2. Plan migration: `supabase db diff`
3. Apply changes: `supabase migration up`
4. Update RLS: Migration file
5. Add indexes: Migration file
6. Update code: Cursor edits
7. Browser test: Playwright

### TypeScript
- Strict mode enabled
- No `any` types
- Update types: `supabase gen types typescript`

### React Query
- `staleTime: 5 * 60 * 1000`
- Filter by `clinic_id`
- Use `select` for optimization
- Handle errors

### Performance
- Use React.memo
- Index `clinic_id` columns
- Bundle <500KB
- Lazy load non-critical components

---

## 📁 File Structure

```
src/
├── components/ui/        # Shadcn UI
├── components/[feature]/ # Feature components
├── hooks/                # Custom hooks
├── types/                # Type definitions
├── utils/                # Utilities
└── integrations/supabase/
    └── types.ts          # DB types

supabase/
├── migrations/           # DB migrations
└── functions/            # Edge functions
```

---

## 🛠️ Cursor Workflow

### Context Analysis
```bash
supabase db dump --schema-only
supabase inspect db tables
# Cursor: Ctrl+Shift+P → "Search API docs"
```

### Browser Testing
```javascript
// tests/feature.spec.ts
test('Feature flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="main-feature"]');
  await page.fill('input[name="test-field"]', 'test-value');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('.success-indicator')).toBeVisible();
  await expect(page).toHaveScreenshot('feature.png');
});

// tests/clinic-switcher.spec.ts
test('Multi-tenant isolation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="clinic-switcher"]');
  await page.click('[data-testid="different-clinic"]');
  await expect(page.locator('[data-testid="data-isolated"]')).toBeVisible();
  await expect(page).toHaveScreenshot('isolation.png');
});
```

---

## 🚨 Common Issues

### Multi-Tenant Security
```bash
# Check RLS
supabase db query "SELECT * FROM pg_policies"

# Add RLS
supabase migration new add_rls
# In migration:
CREATE POLICY clinic_isolation ON table_name
FOR ALL USING (
  clinic_id IN (
    SELECT clinic_id FROM clinic_members 
    WHERE user_id = auth.uid()
  )
);
```

### Database Relationships
```bash
# Check relations
supabase inspect db relations table_name

# Add foreign key
supabase migration new add_fk
# In migration:
ALTER TABLE table_name ADD COLUMN clinic_id UUID REFERENCES clinics(id);
```

---

## 🏥 Healthcare Requirements

### HIPAA Compliance
- No PHI in logs/errors
- RLS for all data access
- Encrypted transmission
- Audit trails

### RBAC
- **superadmin**: Full control
- **doctor**: Patient records, appointments
- **staff**: Scheduling, basic data

### Data Integrity
- Cascade deletes
- Audit trails
- Prevent cross-clinic leaks
- Multi-level validation

---

## 📝 Documentation

### Code
```typescript
/**
 * Fetch patient records
 * @param clinic_id - Clinic UUID
 * @returns Promise<Patient[]>
 */
```

### Changes
```markdown
## [YYYY-MM-DD] Feature
- **Purpose**: [Description]
- **Files**: [List]
- **DB Changes**: [List]
- **Testing**: [Results]
```

---

## ✅ Completion Checklist

- [ ] Code compiles, tests pass
- [ ] No console errors
- [ ] Multi-tenant isolation verified
- [ ] Responsive design tested
- [ ] HIPAA compliance maintained
- [ ] Design system applied
- [ ] Documentation complete

**If any fail → continue until all pass.**

---

## 🎯 Success Metrics

- **Performance**: Page load <1s, API <500ms, build <30s
- **Quality**: 100% isolation, WCAG AA, zero PHI exposure
- **UX**: Intuitive workflows, clear errors

---

## 📞 Emergency Protocols

### Security Incident
1. Apply RLS: `supabase migration`
2. Check exposure: `supabase db query`
3. Test UI: Playwright
4. Log: Cursor

### Data Issues
1. Stop processes
2. Assess: `supabase db query`
3. Test UI: Playwright
4. Verify recovery

---

## Key Changes
- **Length Reduced**: Cut repetitive details, merged similar sections.
- **Cursor Focus**: Emphasized Cursor for code edits/docs.
- **Simplified Commands**: Used standard Supabase/Playwright commands.
- **Core Retained**: Kept multi-tenancy, HIPAA, and browser testing requirements.
- **Concise Testing**: Streamlined Playwright scripts and checklists.

