import { createDemoBoard } from "../lib/demo-data";
import { prisma } from "../lib/prisma";

/**
 * Автоматический сид для локальной разработки.
 * В самом приложении доска создаётся и наполняется автоматически при первом
 * визите — этот скрипт нужен, чтобы получить готовую доску для отладки.
 *
 *   SEED_SESSION_TOKEN=local-showcase npm run db:seed
 */
async function main() {
  const token = process.env.SEED_SESSION_TOKEN ?? "local-showcase";

  await prisma.board.deleteMany({ where: { sessionToken: token } });
  const board = await createDemoBoard(token);

  console.log("Демо-доска создана.");
  console.log(`sessionToken: ${board.sessionToken}`);
  console.log(`participants: ${board.participants.length}`);
  console.log(
    "Чтобы открыть её в браузере, установите cookie svoi_demo с этим значением.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
