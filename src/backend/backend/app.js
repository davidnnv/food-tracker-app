import express from "express";
import cors from "cors";
import NonAuthenticatedRoutesRouter from "./routes/non-authenticated-routes-router.js";
import AuthenticatedRoutesRouter from "./routes/authenticated-routes-router.js";
import AuthRouter from "./routes/auth-router.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(AuthRouter);
app.use(NonAuthenticatedRoutesRouter);
app.use(AuthenticatedRoutesRouter);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
