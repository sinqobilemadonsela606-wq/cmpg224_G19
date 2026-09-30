// src/lib/roles.js
// Central definition of CASS roles (FR02 - Role-based access control)
// Using constants prevents typos like "reception" vs "receptionist"

export const ROLES = {
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
};

//helpers
export const isAdmin = (role) => role === ROLES.ADMIN;
export const isReceptionist = (role) => role === ROLES.RECEPTIONIST;