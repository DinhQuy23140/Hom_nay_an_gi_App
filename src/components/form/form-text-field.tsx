import type { ComponentProps } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { TextField } from '@/components/ui';

type TextFieldProps = ComponentProps<typeof TextField>;

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'onBlur' | 'error' | 'ref'> {
  control: Control<T>;
  name: FieldPath<T>;
}

/** Ô nhập gắn với react-hook-form, tự hiện lỗi validate. */
export function FormTextField<T extends FieldValues>({ control, name, ...rest }: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <TextField
          {...rest}
          ref={ref}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
