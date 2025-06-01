## Code Structure
- **Routes**: `/auth` (public), `/create-clinic` (protected, for users without a clinic), `/` (protected; acts as Clinic Selection Page if no active clinic, or Dashboard if active clinic). Main application routes (`/patients`, `/doctors`, `/appointments`, etc.) are now root-level paths rendered within the `Layout` component when an active clinic is selected. Role-specific components (`SuperadminDashboard`, `StaffDashboard`, `DoctorDashboard`) are rendered based on `AuthContext` role and `clinic_id` within the relevant root-level page components.
- **Components**: `src/components/ui/NavBar.tsx` (with clinic switcher), `src/components/ui/Layout.tsx` (main app layout), `src/components/role/RoleComponent.tsx` (role-specific dashboard content), `src/pages/ClinicSelectionPage.tsx` (for users to select/create a clinic), `src/components/PrivateRoute.tsx` (route protection and conditional rendering).
- **Naming**:
// ... existing code ...
- **Routing**:
  - Protect routes requiring authentication using `PrivateRoute.tsx`. This component is placed at the root of the protected route tree.
  - `PrivateRoute` checks for an authenticated `user` from `AuthContext`.
  - If no `user`, redirects to `/auth`.
  - If `user` exists but there is no `activeClinic` set in `AuthContext`:
    - If the path is `/create-clinic`, it renders the `CreateClinicPage` via `<Outlet />`.
    - For any other path (including the root `/`), it directly renders the `ClinicSelectionPage`.
  - If `user` and `activeClinic` exist, `PrivateRoute` renders its `<Outlet />`, allowing the nested routes (like the `Layout` component and its children: `/`, `/patients`, `/doctors`, etc.) to be matched and rendered at the root level.
  - The root path (`/`) within the `Layout` component tree is set as the `index` route, rendering the `Dashboard` when an active clinic is present.
  - Example `PrivateRoute` (conceptual, actual implementation reflects logic based on `user` and `activeClinic`): 
// ... existing code ...
    return user ? <Outlet /> : <Navigate to="/login" />;
  };
- **UI**:
// ... existing code ... 