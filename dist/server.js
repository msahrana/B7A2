

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.routes.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connectionString: process.env.DATABASE_URL,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY, 
            title VARCHAR(150) UNIQUE NOT NULL,
            description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
            type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("DevPulse Database connected successfully !");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var registerUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 8);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4,'contributor'))
        RETURNING *
        `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
            `);
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Password does not match!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { token, user };
};
var authService = {
  registerUserIntoDB,
  loginUserIntoDB,
  getAllUsersFromDB
};

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var registerUser = async (req, res) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUser = async (req, res) => {
  try {
    const result = await authService.getAllUsersFromDB();
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "All Users received successfully",
      data: result.rows
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  registerUser,
  loginUser,
  getAllUser
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const jwt_token = req.headers.authorization;
      if (!jwt_token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access !!!"
        });
      }
      const decoded = jwt2.verify(
        jwt_token,
        config_default.secret
      );
      const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
            `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found in database !"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!!; This role have no access !"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/auth/auth.routes.ts
var router = Router();
router.post("/signup", authController.registerUser);
router.post("/login", authController.loginUser);
router.get(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  authController.getAllUser
);
var authRoute = router;

// src/modules/issues/issues.routes.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const user = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User not exists!");
  }
  const result = await pool.query(
    `
            INSERT INTO issues (title, description, type, reporter_id) VALUES($1, $2, $3, $4) RETURNING *
            `,
    [title, description, type, reporter_id]
  );
  return result.rows[0];
};
var getAllIssuesIntoDB = async () => {
  const issuesResult = await pool.query(`
        SELECT * FROM issues ORDER BY created_at DESC
    `);
  const issues = issuesResult.rows;
  if (issues.length === 0) return [];
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const usersResult = await pool.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = ANY($1)
        `,
    [reporterIds]
  );
  const users = usersResult.rows;
  const userMap = /* @__PURE__ */ new Map();
  users.forEach((u) => userMap.set(u.id, u));
  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id) || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};
var getSingleIssueFromDB = async (id) => {
  const issuesResult = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
    `,
    [id]
  );
  if (issuesResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issues = issuesResult.rows[0];
  const usersResult = await pool.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = ($1)
        `,
    [issues.reporter_id]
  );
  return {
    id: issues.id,
    title: issues.title,
    description: issues.description,
    type: issues.type,
    status: issues.status,
    reporter: usersResult.rows[0] || null,
    created_at: issues.created_at,
    updated_at: issues.updated_at
  };
};
var updateSingleIssueFromDB = async (payload, id) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
        UPDATE issues 
        SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        reporter_id = COALESCE($5, reporter_id),
        updated_at = NOW()
        WHERE id = $6
        RETURNING *
        `,
    [title, description, type, status, reporter_id, id]
  );
  delete result.rows[0].password;
  return result;
};
var getIssueById = async (id) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  return result.rows[0];
};
var deleteIssueIntoDB = async (id) => {
  const result = await pool.query(
    `
            DELETE FROM issues WHERE id = $1
            `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesIntoDB,
  getSingleIssueFromDB,
  updateSingleIssueFromDB,
  getIssueById,
  deleteIssueIntoDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user?.id;
    const payload = {
      ...req.body,
      reporter_id
    };
    const result = await issueService.createIssueIntoDB(payload);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesIntoDB();
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized");
    }
    const issue = await issueService.getIssueById(id);
    if (!issue) {
      throw new Error("Issue not found");
    }
    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        throw new Error("You can only update your own issues");
      }
      if (issue.status !== "open") {
        throw new Error("You can only update open issues");
      }
    }
    const result = await issueService.updateSingleIssueFromDB(
      req.body,
      id
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized");
    }
    if (user.role !== "maintainer") {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Only maintainer can delete issues"
      });
    }
    const deletedIssue = await issueService.deleteIssueIntoDB(id);
    if (!deletedIssue) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issues.routes.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.createIssue
);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.updateIssue
);
router2.delete(
  "/:id",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/middleware/logger.ts
var logger = (req, res, next) => {
  next();
};
var logger_default = logger;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger_default);
app.get("/", (req, res) => {
  res.send(`<h1 style="
            color: black;
            background-color: cyan;
            font-size: 45px;
            text-align: center;
            padding: 20px;
        ">
            Welcome Our 
            <span style="color: yellow;">Dev</span><span style="color: red;">Pulse</span>
            Site ...!
        </h1>`);
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Express app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map