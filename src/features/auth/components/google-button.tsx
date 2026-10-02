import { Button } from '@/components/ui';

import { signInWithGoogle } from '../services/auth.service';

interface GoogleButtonProps {
  run: <T>(task: () => Promise<T>) => Promise<T | undefined>;
  disabled?: boolean;
}

/** Nút "Tiếp tục với Google". */
export function GoogleButton({ run, disabled }: GoogleButtonProps) {
  return (
    <Button
      label="Tiếp tục với Google"
      variant="secondary"
      icon="logo-google"
      disabled={disabled}
      onPress={() => void run(signInWithGoogle)}
    />
  );
}
