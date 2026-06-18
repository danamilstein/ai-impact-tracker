import { Router, type IRouter } from "express";
import { GetGridIntensitiesResponse } from "@workspace/api-zod";
import { getGridIntensities } from "../services/gridIntensity";

const router: IRouter = Router();

router.get("/grid/intensities", async (_req, res): Promise<void> => {
  const data = await getGridIntensities();
  res.json(GetGridIntensitiesResponse.parse(data));
});

export default router;
