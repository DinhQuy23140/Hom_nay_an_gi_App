import { z } from 'zod';

const email = z.string().trim().min(1, 'Nhập email của bạn').email('Email không hợp lệ');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Nhập mật khẩu'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên cần ít nhất 2 ký tự').max(40, 'Tên tối đa 40 ký tự'),
    email,
    password: z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại chưa khớp',
  });

export const forgotPasswordSchema = z.object({ email });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
