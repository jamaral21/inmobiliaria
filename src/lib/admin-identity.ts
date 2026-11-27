export function isAdminEmail(
  email: string | null | undefined,
  configuredEmail = process.env.ADMIN_EMAIL,
) {
  return Boolean(
    email &&
      configuredEmail &&
      email.trim().toLowerCase() === configuredEmail.trim().toLowerCase(),
  );
}

export function isAdminSession(
  session: { user: { email: string } } | null | undefined,
  configuredEmail = process.env.ADMIN_EMAIL,
) {
  return Boolean(session && isAdminEmail(session.user.email, configuredEmail));
}
