/**
 * LootLoom — Zod Validation Schemas
 * Frontend validation for all user-facing forms.
 *
 * Usage with react-hook-form:
 *   import { zodResolver } from "@hookform/resolvers/zod";
 *   import { loginSchema } from "@/lib/validation";
 *
 *   const form = useForm({ resolver: zodResolver(loginSchema) });
 *
 * Backend should re-validate using the same schemas (shared via @/lib/validation).
 */
import { z } from "zod";

/* ============================================================
   Shared validators
   ============================================================ */

/** Email format (RFC 5322 simplified). */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(254, "Email is too long")
  .transform((v) => v.trim().toLowerCase());

/** Password: 8+ chars, at least 1 letter + 1 digit. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

/** Strong password: 12+ chars, upper + lower + digit + symbol (for password change). */
export const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

/** Username: 3-20 alphanumeric + underscore. */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
  .transform((v) => v.trim().toLowerCase());

/** Phone: 10-15 digits (optional country code). */
export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^[+]?[\d\s-]{10,15}$/.test(v),
    "Enter a valid phone number (10-15 digits)"
  );

/** Full name: 2-50 chars, letters + spaces + basic punctuation. */
export const fullNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .transform((v) => v.trim());

/** OTP code: exactly 6 digits. */
export const otpCodeSchema = z
  .string()
  .length(6, "Code must be 6 digits")
  .regex(/^\d{6}$/, "Code must contain only digits");

/* ============================================================
   Form Schemas
   ============================================================ */

/** Login form schema. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(true),
});
export type LoginFormData = z.infer<typeof loginSchema>;

/** Signup form schema. */
export const signupSchema = z
  .object({
    fullName: fullNameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: phoneSchema,
    terms: z
      .boolean()
      .refine((v) => v === true, "You must agree to the Terms of Service and Privacy Policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupFormData = z.infer<typeof signupSchema>;

/** Forgot password form schema. */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Reset password form schema. */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/** OTP verification form schema. */
export const verifyOtpSchema = z.object({
  code: otpCodeSchema,
});
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

/** Profile update form schema. */
export const profileUpdateSchema = z.object({
  fullName: fullNameSchema,
  username: usernameSchema,
  bio: z
    .string()
    .max(200, "Bio must be at most 200 characters")
    .optional()
    .transform((v) => v?.trim() || undefined),
  phone: phoneSchema,
});
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

/** Password change form schema. */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/** Support ticket creation form schema. */
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be at most 100 characters")
    .transform((v) => v.trim()),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be at most 2000 characters")
    .transform((v) => v.trim()),
});
export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

/** Support ticket reply form schema. */
export const ticketReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(2000, "Reply must be at most 2000 characters")
    .transform((v) => v.trim()),
});
export type TicketReplyFormData = z.infer<typeof ticketReplySchema>;

/** Redeem request form schema. */
export const redeemRequestSchema = z.object({
  rewardId: z.string().min(1, "Reward is required"),
  userMessage: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .optional()
    .transform((v) => v?.trim() || undefined),
});
export type RedeemRequestFormData = z.infer<typeof redeemRequestSchema>;

/** CEO login form schema. */
export const ceoLoginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Enter your email or username")
    .max(254, "Identifier is too long"),
  password: z.string().min(1, "Password is required"),
  otp: otpCodeSchema.optional(),
});
export type CeoLoginFormData = z.infer<typeof ceoLoginSchema>;

/** CEO redeem approval/rejection form schema. */
export const redeemApprovalSchema = z
  .object({
    requestId: z.string().min(1, "Request ID is required"),
    action: z.enum(["approve", "reject"]),
    adminMessage: z
      .string()
      .max(500, "Message must be at most 500 characters")
      .optional()
      .transform((v) => v?.trim() || undefined),
  })
  .refine(
    (data) => data.action !== "reject" || (data.adminMessage && data.adminMessage.length > 0),
    {
      message: "A rejection reason is required",
      path: ["adminMessage"],
    }
  );
export type RedeemApprovalFormData = z.infer<typeof redeemApprovalSchema>;

/** CEO profile update form schema. */
export const ceoProfileUpdateSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
});
export type CeoProfileUpdateFormData = z.infer<typeof ceoProfileUpdateSchema>;
