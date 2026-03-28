# MES Infratech - Technician Assignment Feature

## Current State
- Bookings stored in backend; assignedTechnician NOT in backend (localStorage only)
- Technician list is hardcoded in AdminPage.tsx

## Requested Changes (Diff)

### Add
- Technician type and store in backend
- addTechnician / getTechnicians backend methods
- assignTechnicianToBooking backend method
- assignedTechnician field on Booking type
- Frontend hooks: useGetTechnicians, useAssignTechnician

### Modify
- Booking type: add assignedTechnician field
- postupgrade migration to include empty assignedTechnician
- AdminPage: use backend for technician list and assignment

### Remove
- localStorage-based technician assignment

## Implementation Plan
1. Update main.mo: add Technician type/store, methods, update Booking type
2. Update backend.did.d.ts with new types/methods
3. Add hooks to useQueries.ts
4. Update AdminPage.tsx to use backend
