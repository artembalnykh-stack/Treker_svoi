/**
 * Непрозрачный случайный идентификатор демо-сессии.
 * Он не содержит персональных данных и служит только ключом изоляции доски.
 */
export function createSessionToken(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
}
