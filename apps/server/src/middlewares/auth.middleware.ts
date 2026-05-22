import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
