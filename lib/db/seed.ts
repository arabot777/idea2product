import { db } from "./drizzle";
import { profiles, subscriptionPlans, premiumPackages, transactions, tasks, taskResults } from "./schemas";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

async function seed() {
  // 1. Get the first user
  const [firstUser] = await db.select().from(profiles).limit(1);
  if (!firstUser) {
    throw new Error("No users found");
  }
  const userID = firstUser.id;


  // 2. Create Subscription Plans (4 entries)
  const subscriptionPlansData = [];
  for (let i = 0; i < 4; i++) {
    subscriptionPlansData.push({
      id: uuidv4(),
      name: faker.commerce.productName() + ` Plan ${i + 1}`,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.finance.amount({ min: 10, max: 100, dec: 2 })),
      currency: faker.helpers.arrayElement(["usd", "cny"]),
      billingCycle: faker.helpers.arrayElement(["monthly", "annual"]),
      isActive: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await db.insert(subscriptionPlans).values(subscriptionPlansData).onConflictDoNothing();
  console.log("Subscription Plans seeded.");

  // 3. Create Premium Packages (4 entries)
  const premiumPackagesData = [];
  for (let i = 0; i < 4; i++) {
    premiumPackagesData.push({
      id: uuidv4(),
      name: faker.commerce.productName() + ` Package ${i + 1}`,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.finance.amount({ min: 5, max: 50, dec: 2 })),
      currency: faker.helpers.arrayElement(["usd", "cny"]),
      isActive: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await db.insert(premiumPackages).values(premiumPackagesData).onConflictDoNothing();
  console.log("Premium Packages seeded.");

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

  // 5. Create Transactions (30 entries)
  const transactionsData = [];
  const transactionStatuses = ["pending", "completed", "failed", "refunded", "canceled"]; // Directly use enum values
  const allAssociatedIds = [...subscriptionPlansData.map((p) => p.id), ...premiumPackagesData.map((p) => p.id)];

  for (let i = 0; i < 30; i++) {
    const associatedId = faker.helpers.arrayElement(allAssociatedIds);
    const type = subscriptionPlansData.some((p) => p.id === associatedId) ? "subscription" : "premium_package";

    transactionsData.push({
      id: uuidv4(),
      userId: userID,
      externalId: faker.string.uuid(),
      associatedId: associatedId,
      type: type,
      amount: parseFloat(faker.finance.amount({ min: 1, max: 200, dec: 2 })),
      currency: faker.helpers.arrayElement(["usd", "cny"]),
      status: faker.helpers.arrayElement(transactionStatuses),
      description: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }
  await db.insert(transactions).values(transactionsData).onConflictDoNothing();
  console.log("Transactions seeded.");

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
