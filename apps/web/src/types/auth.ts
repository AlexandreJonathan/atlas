import type { z } from "zod";
import type { forgotPasswordSchema } from "../validations/forgotPasswordSchema";
import type { loginSchema } from "../validations/loginSchema";
import type { registerSchema } from "../validations/registerSchema";
import type { resetPasswordSchema } from "../validations/resetPasswordSchema";

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
