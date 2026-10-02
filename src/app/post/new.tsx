import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/form/form-message';
import { FormTextField } from '@/components/form/form-text-field';
import { AppText, Button, Chip, ListGroup, Screen, ScreenHeader, SwitchRow, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { MediaPicker } from '@/features/community/components/media-picker';
import { RatingStars } from '@/features/community/components/rating-stars';
import { MediaError, pickFromLibrary, takePhoto } from '@/features/community/media.service';
import { createPost } from '@/features/community/posts.service';
import { createPostSchema, type CreatePostValues } from '@/features/community/schemas';
import { MAX_CONTENT_LENGTH, type LocalMedia } from '@/features/community/types';
import { foodRepository } from '@/features/foods/food-repository';
import { useUserData } from '@/features/profile/user-data-provider';
import { haptics } from '@/lib/haptics';
import { spacing } from '@/theme';

function toMessage(error: unknown) {
  if (error instanceof MediaError) return error.message;
  return 'Chưa đăng được bài. Kiểm tra mạng rồi thử lại nhé.';
}

/** Màn Đăng bài (/post/new, dạng modal): chọn ảnh/video, món, chấm sao, viết cảm nhận. */
export default function NewPostScreen() {
  const { user } = useAuth();
  const { profile } = useUserData();
  const queryClient = useQueryClient();
  const [media, setMedia] = useState<LocalMedia[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const { control, handleSubmit, setValue } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { foodName: '', foodSlug: null, rating: 0, content: '', isPrivate: false },
  });
  const [foodName, foodSlug, content] = useWatch({ control, name: ['foodName', 'foodSlug', 'content'] });
  const suggestions = foodSlug ? [] : foodRepository.search(foodName, 5);

  const mutation = useMutation({
    mutationFn: (values: CreatePostValues) =>
      createPost(
        user!,
        profile?.displayName ?? null,
        {
          foodSlug: values.foodSlug,
          foodName: values.foodName,
          rating: values.rating,
          content: values.content,
          visibility: values.isPrivate ? 'PRIVATE' : 'PUBLIC',
          media,
        },
        (done, total) => setProgress({ done, total }),
      ),
    onSuccess: () => {
      haptics.success();
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.back();
    },
    onSettled: () => setProgress(null),
  });

  const runPicker = async (picker: () => Promise<LocalMedia[] | LocalMedia | null>) => {
    setMediaError(null);
    try {
      const result = await picker();
      if (result) setMedia((current) => [...current, ...(Array.isArray(result) ? result : [result])]);
    } catch (error) {
      setMediaError(toMessage(error));
    }
  };

  const submit = handleSubmit((values) => {
    if (!media.length) {
      setMediaError('Thêm ít nhất 1 ảnh hoặc video món ăn nhé.');
      return;
    }
    mutation.mutate(values);
  });

  const submitLabel = progress ? `Đang tải ${progress.done}/${progress.total}…` : 'Đăng bài';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        scroll
        edges={['top']}
        contentStyle={styles.content}
        header={<ScreenHeader title="Bài viết mới" backIcon="close" />}
        footer={<Button label={submitLabel} icon="send" loading={mutation.isPending} onPress={() => void submit()} />}>
        <MediaPicker
          media={media}
          onPickLibrary={() => void runPicker(() => pickFromLibrary(media))}
          onTakePhoto={() => void runPicker(() => takePhoto(media))}
          onRemove={(uri) => setMedia((current) => current.filter((m) => m.uri !== uri))}
        />
        <FormMessage message={mediaError} />

        <View style={styles.field}>
          <Controller
            control={control}
            name="foodName"
            render={({ field, fieldState }) => (
              <TextField
                label="Món ăn"
                icon="restaurant-outline"
                placeholder="Ví dụ: Bún chả"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={(text) => {
                  field.onChange(text);
                  setValue('foodSlug', null);
                }}
                error={fieldState.error?.message}
              />
            )}
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((food) => (
                <Chip
                  key={food.slug}
                  label={food.nameVi}
                  onPress={() => {
                    setValue('foodName', food.nameVi, { shouldValidate: true });
                    setValue('foodSlug', food.slug);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <Controller
          control={control}
          name="rating"
          render={({ field, fieldState }) => (
            <View style={styles.field}>
              <AppText variant="label" color="onSurfaceVariant">
                Chấm điểm
              </AppText>
              <RatingStars value={field.value} size={32} onChange={field.onChange} />
              {fieldState.error && (
                <AppText variant="caption" color="error">
                  {fieldState.error.message}
                </AppText>
              )}
            </View>
          )}
        />

        <View style={styles.field}>
          <FormTextField
            control={control}
            name="content"
            label="Cảm nhận"
            placeholder="Món này ngon ở điểm nào? Quán ở đâu?"
            multiline
            maxLength={MAX_CONTENT_LENGTH}
            style={styles.textarea}
          />
          <AppText variant="caption" color="onSurfaceVariant" align="right" tabular>
            {content.length}/{MAX_CONTENT_LENGTH}
          </AppText>
        </View>

        <Controller
          control={control}
          name="isPrivate"
          render={({ field }) => (
            <ListGroup>
              <SwitchRow
                icon="lock-closed-outline"
                title="Chỉ mình tôi xem"
                subtitle="Bài riêng tư không hiện trên bảng tin cộng đồng"
                value={field.value}
                onValueChange={field.onChange}
              />
            </ListGroup>
          )}
        />

        <FormMessage message={mutation.error ? toMessage(mutation.error) : null} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.lg, paddingTop: spacing.sm },
  field: { gap: spacing.sm },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
});
