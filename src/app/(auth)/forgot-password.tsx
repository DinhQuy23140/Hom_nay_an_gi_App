import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormMessage } from '@/components/form/form-message';
import { FormTextField } from '@/components/form/form-text-field';
import { Button } from '@/components/ui';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas';
import { sendPasswordReset } from '@/features/auth/services/auth.service';
import { useAsyncAction } from '@/hooks/use-async-action';

/** Màn Quên mật khẩu (/forgot-password): gửi email đặt lại mật khẩu. */
export default function ForgotPasswordScreen() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const { run, pending, error } = useAsyncAction(getAuthErrorMessage);

  const onSubmit = handleSubmit(async ({ email }) => {
    setSentTo(null);
    await run(async () => {
      await sendPasswordReset(email);
      setSentTo(email);
    });
  });

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Nhập email đã đăng ký, mình sẽ gửi link đặt lại mật khẩu.">
      <FormTextField
        control={control}
        name="email"
        label="Email"
        icon="mail-outline"
        placeholder="ban@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={() => void onSubmit()}
      />
      <FormMessage message={error} />
      <FormMessage
        tone="success"
        message={sentTo && `Đã gửi email tới ${sentTo}. Kiểm tra cả hộp thư rác nhé.`}
      />
      <Button label="Gửi link đặt lại" loading={pending} onPress={() => void onSubmit()} />
    </AuthLayout>
  );
}
