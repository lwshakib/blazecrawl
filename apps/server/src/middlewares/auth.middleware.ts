import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error(\"JWT_SECRET environment variable is required.\")
}
const JWT_SECRET = process.env.JWT_SECRET

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies?.session

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." })
  }
}
