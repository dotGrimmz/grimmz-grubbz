/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
import { NextApiRequest, NextApiResponse } from "next";

/**
 *
 *
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();

  const userId = req.headers["user-id"]; // Example: Get the user ID from headers or session

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Query the recipes based on the logged-in userId
    const recipes = await prisma.recipe.findMany({
      where: {
        userId: userId, // Only fetch recipes belonging to the logged-in user
      },
      include: {
        ingredients: {
          include: {
            ingredient: true, // Include ingredient details for each recipe ingredient
          },
        },
        steps: true, // Include steps for each recipe
      },
    });

    // Return the recipes and their related data
    return res.status(200).json({ recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return (
      res
        .status(500)
        //@ts-expect-error
        .json({ message: "Error fetching recipes", error: error.message })
    );
  }
}
