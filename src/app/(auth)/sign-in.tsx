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
import { signInSchema, type SignInValues } from '@/features/auth/schemas';
import { signInWithEmail } from '@/features/auth/services/auth.service';
import { useAsyncAction } from '@/hooks/use-async-action';

/** Màn Đăng nhập (/sign-in): email/mật khẩu hoặc Google. */
export default function SignInScreen() {
  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const { run, pending, error } = useAsyncAction(getAuthErrorMessage);

  const onSubmit = handleSubmit((values) => run(() => signInWithEmail(values.email, values.password)));

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để xem gợi ý theo khẩu vị của bạn."
      footer={
        <View style={styles.row}>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Chưa có tài khoản?
          </AppText>
          <Button label="Đăng ký" variant="text" compact onPress={() => router.replace('/sign-up')} />
        </View>
      }>
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
        returnKeyType="next"
      />
      <FormTextField
        control={control}
        name="password"
        label="Mật khẩu"
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => void onSubmit()}
      />
      <Button
        label="Quên mật khẩu?"
        variant="text"
        compact
        style={styles.forgot}
        onPress={() => router.push('/forgot-password')}
      />
      <FormMessage message={error} />
      <Button label="Đăng nhập" loading={pending} onPress={() => void onSubmit()} />
      <OrDivider />
      <GoogleButton run={run} disabled={pending} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  forgot: { alignSelf: 'flex-end' },
});
