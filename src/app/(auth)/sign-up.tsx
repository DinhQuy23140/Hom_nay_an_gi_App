import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/form/form-message';
import { FormTextField } from '@/components/form/form-text-field';
import { AppText, Button } from '@/components/ui';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { AuthLayout, OrDivider } from '@/features/auth/components/auth-layout';
import { GoogleButton } from '@/features/auth/components/google-button';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';
import { signUpWithEmail } from '@/features/auth/services/auth.service';
import { useAsyncAction } from '@/hooks/use-async-action';

/** Màn Đăng ký (/sign-up): tên hiển thị, email, mật khẩu. */
export default function SignUpScreen() {
  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const { run, pending, error } = useAsyncAction(getAuthErrorMessage);

  const onSubmit = handleSubmit((v) => run(() => signUpWithEmail(v.name, v.email, v.password)));

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Chỉ mất một phút, sau đó mình sẽ hỏi bạn vài câu về khẩu vị."
      footer={
        <View style={styles.row}>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Đã có tài khoản?
          </AppText>
          <Button label="Đăng nhập" variant="text" compact onPress={() => router.replace('/sign-in')} />
        </View>
      }>
      <FormTextField
        control={control}
        name="name"
        label="Tên hiển thị"
        icon="person-outline"
        placeholder="Ví dụ: Minh Anh"
        autoComplete="name"
        textContentType="name"
      />
      <FormTextField
        control={control}
        name="email"
        label="Email"
        icon="mail-outline"
        placeholder="ban@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormTextField
        control={control}
        name="password"
        label="Mật khẩu"
        icon="lock-closed-outline"
        placeholder="Ít nhất 8 ký tự"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormTextField
        control={control}
        name="confirmPassword"
        label="Nhập lại mật khẩu"
        icon="lock-closed-outline"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={() => void onSubmit()}
      />
      <FormMessage message={error} />
      <Button label="Đăng ký" loading={pending} onPress={() => void onSubmit()} />
      <OrDivider />
      <GoogleButton run={run} disabled={pending} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
