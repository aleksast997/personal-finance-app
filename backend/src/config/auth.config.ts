export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-fallback-secret-change-in-production',
  expiresIn: '7d',
};

export const authConfig = {
  jwt: jwtConfig,
  saltRounds: 12,
  // Dummy hash for consistent timing during authentication
  dummyPasswordHash:
    '$2b$12$dummyHashToPreventTimingAttacksWithConsistentLength',
};
