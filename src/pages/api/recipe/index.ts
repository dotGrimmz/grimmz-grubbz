import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { includeIngredients, includeSteps } = req.query;
      const userId = req.query["userId"] as string;

      handleAuth(userId, res);

      // Get all recipes for the logged-in user
      const recipes = await prisma.recipe.findMany({
        where: { userId },
        include: {
          ingredients:
            includeIngredients === "true"
              ? { include: { ingredient: true } }
              : false,
          steps: includeSteps === "true" ? true : false,
        },
      });
      return res.status(200).json({ recipes });
    }

    if (req.method === "POST") {
      const userId = req.query["userId"] as string;

      // Create a new recipe
      const { title, description, imageUrl, ingredients, steps } = req.body;
      handleAuth(userId, res);

      const recipe = await prisma.recipe.create({
        data: {
          title,
          description,
          imageUrl,
          userId,
          ingredients: {
            create: ingredients?.map(
              (ing: { name: string; quantity: string }) => ({
                quantity: ing.quantity,
                ingredient: {
                  connectOrCreate: {
                    where: { name: ing.name },
                    create: { name: ing.name },
                  },
                },
              })
            ),
          },
          steps: {
            create: steps?.map(
              (step: { order: number; instruction: string }) => ({
                order: step.order,
                instruction: step.instruction,
              })
            ),
          },
        },
        include: {
          ingredients: { include: { ingredient: true } },
          steps: true,
        },
      });

      return res.status(201).json({ recipe });
    }

    res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error(error);
    return (
      res
        .status(500)
        //@ts-expect-error no idea why TS is going this dumb stuff
        .json({ message: "Internal Server Error", error: error.message })
    );
  }
}

function handleAuth(
  userId: string | undefined | string[],
  res: NextApiResponse
) {
  if (!userId || typeof userId !== "string") {
    return res
      .status(401)
      .json({ message: "Unauthorized: User ID is required" });
  }
}
