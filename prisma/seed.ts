// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  // Create some ingredients
  const flour = await prisma.ingredient.create({
    data: { name: "Flour" },
  });

  const sugar = await prisma.ingredient.create({
    data: { name: "Sugar" },
  });

  // Create a recipe
  const recipe = await prisma.recipe.create({
    data: {
      title: "Pancakes",
      description: "Fluffy homemade pancakes.",
      imageUrl: "https://example.com/pancakes.jpg",
      userId: user.id,
      ingredients: {
        create: [
          { ingredientId: flour.id, quantity: "2 cups" },
          { ingredientId: sugar.id, quantity: "1 tbsp" },
        ],
      },
      steps: {
        create: [
          { order: 1, instruction: "Mix ingredients together." },
          { order: 2, instruction: "Pour batter onto pan." },
          { order: 3, instruction: "Cook until golden brown." },
        ],
      },
    },
  });

  console.log("Seeding complete:", recipe);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
