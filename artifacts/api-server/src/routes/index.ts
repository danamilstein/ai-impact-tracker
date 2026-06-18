import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import sessionsRouter from "./sessions";
import statsRouter from "./stats";
import goalsRouter from "./goals";
import reportRouter from "./report";
import meRouter from "./me";
import gridRouter from "./grid";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(sessionsRouter);
router.use(statsRouter);
router.use(goalsRouter);
router.use(reportRouter);
router.use(meRouter);
router.use(gridRouter);

export default router;
