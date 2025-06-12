import { db } from "./drizzle";
import { profiles, subscriptionPlans, transactions, tasks, taskResults } from "./schemas";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

async function seed() {
  // 1. Get the first user
  const [firstUser] = await db.select().from(profiles).limit(1);
  if (!firstUser) {
    throw new Error("No users found");
  }
  const userID = firstUser.id;

  // 4. Create Tasks (20 entries)
  const tasksData = [];
  const taskStatuses = ["pending", "processing", "completed", "failed", "cancelled"];
  for (let i = 0; i < 20; i++) {
    tasksData.push({
      id: uuidv4(),
      userId: userID,
      type: faker.lorem.word(),
      status: faker.helpers.arrayElement(taskStatuses),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      progress: faker.number.int({ min: 0, max: 100 }),
      startedAt: faker.date.past(),
      endedAt: faker.date.future(),
      checkInterval: faker.number.int({ min: 5, max: 60 }),
      message: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }
  await db.insert(tasks).values(tasksData).onConflictDoNothing();
  console.log("Tasks seeded.");

  // 6. Create Task Results (40 entries)
  const taskResultsData = [];
  const taskResultStatuses = ["pending", "processing", "completed", "failed", "cancelled", "rejected", "rejected_nsfw"];
  const taskResultTypes = ["text", "image", "video", "audio", "3d"];
  const allTaskIds = tasksData.map((t) => t.id);

  for (let i = 0; i < 40; i++) {
    taskResultsData.push({
      id: uuidv4(),
      userId: userID,
      taskId: faker.helpers.arrayElement(allTaskIds),
      type: faker.helpers.arrayElement(taskResultTypes),
      status: faker.helpers.arrayElement(taskResultStatuses),
      message: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      mimeType: faker.system.mimeType(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }
  await db.insert(taskResults).values(taskResultsData).onConflictDoNothing();
  console.log("Task Results seeded.");
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
