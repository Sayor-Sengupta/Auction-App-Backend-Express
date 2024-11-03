import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import prisma from "../db/prisma";
import { generateCookie } from "../utils/generateCookie";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, confirmPassword, fullName, role } = req.body;

    if (!email || !password || !confirmPassword || !fullName) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const findUser = await prisma.user.findUnique({ where: { email: email } });
    if (findUser) {
      return res.status(400).json({
        message:
          "User already exists with this email.Try logging in instead or use a different email",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        role: role,
      },
    });
    if (newUser) {
      generateCookie(newUser.id, res);
      res.status(201).json({
        message: "User created successfully",
        data: { id: newUser.id, email, fullName, role: newUser.role },
      });
    }
  } catch (error: any) {
    console.log(error.message);

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    generateCookie(user.id, res);
    res.status(200).json({
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const logout = async (req: Request, res: Response): Promise<any> => {
  res.cookie("jwt", "", {
    maxAge: 0,
  });

  res.status(200).json({ message: "Logged out successfully" });
};
// export const addBio = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { bio } = req.body;
//     if (!bio) {
//       return res.status(400).json({ message: "Please fill up the bio" });
//     }

//     await prisma.profile.upsert({
//       where: {
//         userId: req.user.id,
//       },
//       update: {
//         bio,
//       },
//       create: { userId: req.user.id, bio },
//     });
//     res.status(200).json({ message: "Bio updated successfully" });
//   } catch (error: any) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };
