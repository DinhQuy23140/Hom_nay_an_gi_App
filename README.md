# Hôm nay ăn gì

App gợi ý món ăn cho người Việt: gợi ý theo khẩu vị, thời tiết, ngân sách; random bằng máy xèng, vòng quay, vuốt thẻ hoặc lắc máy; chia sẻ món ngon với cộng đồng.

**Stack:** Expo SDK 57 · expo-router · TypeScript · Firebase Auth (email/Google) · Cloud Firestore · Supabase Storage · Reanimated 4 · TanStack Query · Zustand · react-hook-form + zod.

## Cấu trúc thư mục

### Tổng quan

```
Home_nay_an_gi_expose/
├── src/                      # Toàn bộ mã nguồn app (chi tiết bên dưới)
│   ├── app/                  # Route của expo-router: mỗi file là một màn hình
│   ├── components/           # Component dùng chung, không gắn với tính năng cụ thể
│   ├── features/             # Mã theo từng tính năng (auth, foods, community…)
│   ├── hooks/                # Hook dùng chung
│   ├── lib/                  # Khởi tạo SDK và tiện ích hạ tầng (Firebase, Supabase…)
│   ├── theme/                # Design token và ThemeProvider
│   └── utils/                # Hàm thuần: định dạng, xử lý chuỗi
├── assets/                   # Icon app, splash, ảnh tĩnh
├── firebase/
│   ├── firestore.rules       # Luật bảo mật Firestore
│   └── firestore.indexes.json# Index cho các truy vấn feed
├── supabase/storage.sql      # Tạo bucket `media` và policy upload/xóa cho Storage
├── scripts/check-services.mjs# `npm run check:services`: kiểm tra kết nối Firebase + Supabase theo .env
├── android/, ios/            # Sinh tự động khi chạy `npx expo run:*` (đã gitignore, không sửa tay)
├── app.json                  # Cấu hình Expo tĩnh: tên, icon, splash, package, plugin
├── app.config.ts             # Cấu hình động, chạy sau app.json: thêm plugin Google Sign-In từ biến môi trường
├── .env / .env.example       # Biến môi trường thật (gitignore) / mẫu để sao chép
├── firebase.json, .firebaserc# Cấu hình Firebase CLI: file rules/index và project mặc định
├── eslint.config.js          # Cấu hình `npx expo lint`
└── tsconfig.json             # TypeScript strict, alias `@/*` → `src/*`
```

### Nguyên tắc tổ chức

- **`src/app/` chỉ chứa màn hình.** File route lo việc ghép giao diện và điều hướng. Logic nghiệp vụ, gọi API và state nằm trong `src/features/`.
- **Chia theo tính năng (feature-first).** Mỗi thư mục trong `features/` gom đủ những gì tính năng đó cần, theo quy ước đặt tên:
  - `*.service.ts`: đọc/ghi Firebase hoặc Supabase, không phụ thuộc React.
  - `use-*.ts`: hook nối service với UI.
  - `*.store.ts`: state cục bộ bằng Zustand.
  - `types.ts`, `schemas.ts`: kiểu dữ liệu và schema zod.
  - `components/`: component chỉ tính năng đó dùng.
- **Hướng phụ thuộc:** `app` → `features` → `components` / `lib` / `theme` / `utils`. Các thư mục cấp thấp không import ngược lên `features`, trừ khi đọc store cài đặt.
- **File theo nền tảng:** file `*.web.ts` tự thay cho file cùng tên khi chạy trên web (Metro tự chọn).
- **Import tuyệt đối** qua alias `@/`, ví dụ `@/features/foods/food-repository`.

### `src/app/`: màn hình và điều hướng

Expo Router ánh xạ đường dẫn file thành URL:
- `_layout.tsx` định nghĩa navigator cho thư mục chứa nó;
- thư mục trong ngoặc như `(auth)` là nhóm route, không xuất hiện trên URL;
- `[slug]` là tham số động.

| File | Ý nghĩa |
|---|---|
| `_layout.tsx` | Layout gốc. Nạp font Be Vietnam Pro, giữ splash cho tới khi sẵn sàng, bọc các provider (Gesture Handler → React Query → Theme → Auth → UserData). `Stack.Protected` chặn route theo trạng thái phiên: chưa đăng nhập → `(auth)`, chưa làm quiz → `onboarding`, sẵn sàng → `(tabs)` và các màn còn lại. Thiếu `.env` thì hiện màn hướng dẫn cấu hình. |
| `onboarding.tsx` | Quiz khẩu vị 4 bước: dị ứng và chế độ ăn → mức cay và ngân sách → ẩm thực yêu thích → kiểu món. Có thanh tiến trình và hiệu ứng trượt; bước cuối gọi `completeOnboarding`. |
| `filters.tsx` | Bộ lọc dạng bottom sheet (`formSheet`): ngân sách, kiểu món, ẩm thực, mức cay tối đa, độ "phiêu lưu". Nút dưới cùng hiện số món phù hợp. |
| `favorites.tsx` | Danh sách món đã thả tim. |
| `history.tsx` | Lịch sử tương tác (xem, chốt, bỏ qua, không thích…), nhóm theo ngày, lọc theo loại. |
| `taste-profile.tsx` | Sửa hồ sơ khẩu vị sau onboarding; chỉ bật nút lưu khi có thay đổi. |
| `settings.tsx` | Giao diện sáng/tối/hệ thống, giảm chuyển động, rung phản hồi, đăng xuất, phiên bản app. |
| `food/[slug].tsx` | Chi tiết món: ảnh hero parallax, giá, độ cay, calo, cảnh báo dị ứng, nguyên liệu, món ăn kèm, món tương tự, nút "Chốt món này". Ghi sự kiện VIEW khi mở. |
| `result/[slug].tsx` | Màn "Hôm nay ăn…" sau khi random. Hiện lý do gợi ý và ba hành động Ra quán / Tự nấu / Đặt giao (ghi SELECT). "Không thích" loại món khỏi gợi ý trong ngày. |
| `post/new.tsx` | Đăng bài cộng đồng (modal): chọn ảnh/video, chọn món kèm gợi ý tìm kiếm, chấm sao, viết cảm nhận, đặt chế độ riêng tư; hiện tiến độ upload. |

**`(auth)/`: nhóm màn chưa đăng nhập**

| File | Ý nghĩa |
|---|---|
| `_layout.tsx` | Stack cho 4 màn xác thực. |
| `welcome.tsx` | Màn chào 3 slide có parallax và chấm chỉ trang; dẫn sang đăng ký hoặc đăng nhập. |
| `sign-in.tsx` | Đăng nhập email/mật khẩu hoặc Google. |
| `sign-up.tsx` | Đăng ký: tên hiển thị, email, mật khẩu, nhập lại mật khẩu. |
| `forgot-password.tsx` | Gửi email đặt lại mật khẩu. |

**`(tabs)/`: 5 tab chính sau khi đăng nhập**

| File | Ý nghĩa |
|---|---|
| `_layout.tsx` | Khai báo 5 tab, dùng thanh tab tùy biến `AppTabBar` và hiệu ứng fade khi chuyển tab. |
| `index.tsx` | **Trang chủ**: lời chào theo giờ, thời tiết, chọn bữa, thẻ gợi ý chính (Món khác / Chốt món), các hàng món yêu thích, "Cũng hợp bữa này", đồ uống, tráng miệng. |
| `explore.tsx` | **Khám phá**: tìm kiếm không dấu, lọc theo kiểu món, bảng xếp hạng phổ biến, đồ uống và tráng miệng. |
| `random.tsx` | **Random**: ba chế độ máy xèng / vòng quay / vuốt thẻ, chọn bữa, nút bộ lọc, lắc máy để chọn ngay. |
| `community.tsx` | **Cộng đồng**: feed cuộn vô hạn, kéo để làm mới, chuyển giữa "Mới nhất" và "Của tôi", nút đăng bài. |
| `me.tsx` | **Tôi**: thông tin tài khoản, thống kê, lối vào Yêu thích, Lịch sử, Hồ sơ khẩu vị, Cài đặt. |

### `src/components/`: component dùng chung

**`ui/`: design system.** Mọi màn hình dựng từ các khối này để giao diện đồng nhất.

| File | Ý nghĩa |
|---|---|
| `index.ts` | Gom export, cho phép `import { Button, Screen } from '@/components/ui'`. |
| `app-text.tsx` | `Text` có sẵn biến thể typography (display, headline, body, caption…) và màu theo theme. |
| `button.tsx` | Nút chính, có các biến thể `primary` / `secondary` / `text` / `danger`, trạng thái loading, icon và hiệu ứng nhấn. |
| `icon-button.tsx` | Nút tròn chỉ có icon (đóng, quay lại, chia sẻ…). |
| `icon.tsx` | Bọc Ionicons, nhận màu theo tên token của theme. |
| `pressable-scale.tsx` | `Pressable` thu nhỏ nhẹ khi nhấn (Reanimated), có tùy chọn rung. Nền tảng của mọi phần tử bấm được. |
| `chip.tsx` | Chip chọn/bỏ chọn, dùng cho bộ lọc và quiz. |
| `segmented-control.tsx` | Nhóm lựa chọn dạng pill, nền trượt theo mục đang chọn. |
| `text-field.tsx` | Ô nhập có nhãn, icon, viền khi focus, thông báo lỗi, nút hiện/ẩn mật khẩu. |
| `screen.tsx` | Khung màn hình: safe area, nền theo theme, cuộn hoặc không, vùng header/footer cố định. |
| `screen-header.tsx` | Thanh tiêu đề có nút quay lại (về trang chủ nếu không còn màn để back). |
| `section-header.tsx` | Tiêu đề một khu vực, kèm nút "Xem tất cả" tùy chọn. |
| `list-row.tsx` | `ListRow`, `SwitchRow`, `ListGroup`: hàng danh sách kiểu cài đặt. |
| `avatar.tsx` | Ảnh đại diện; thiếu ảnh thì hiện chữ cái đầu của tên. |
| `empty-state.tsx` | Trạng thái trống hoặc lỗi: icon, tiêu đề, mô tả, nút hành động. |
| `skeleton.tsx` | Khối shimmer giữ chỗ khi đang tải, thay cho spinner. |

**Các thư mục khác**

| File | Ý nghĩa |
|---|---|
| `form/form-text-field.tsx` | Nối `TextField` với react-hook-form (`Controller`), tự hiện lỗi validate. |
| `form/form-message.tsx` | Banner báo lỗi/thành công của form, có animation hiện/ẩn. |
| `navigation/app-tab-bar.tsx` | Thanh tab tùy biến: pill nổi dưới tab đang chọn, nút Random tròn nhô lên ở giữa và xoay khi được chọn. |
| `system/status-screens.tsx` | `ConfigMissingScreen` (thiếu `.env`) và `ProfileErrorScreen` (không tải được hồ sơ, có nút đăng xuất). |

### `src/features/`: theo từng tính năng

**`auth/`: đăng nhập, đăng ký, phiên làm việc**

| File | Ý nghĩa |
|---|---|
| `auth-provider.tsx` | Context lắng nghe `onAuthStateChanged`, cung cấp `useAuth()` → `{ user, initializing }`. |
| `use-session-status.ts` | Gộp trạng thái auth và hồ sơ thành `loading` / `signedOut` / `onboarding` / `ready` / `error`; layout gốc dùng giá trị này để chặn route. |
| `schemas.ts` | Schema zod cho form đăng nhập, đăng ký, quên mật khẩu (thông báo lỗi tiếng Việt). |
| `auth-errors.ts` | Đổi mã lỗi Firebase (sai mật khẩu, email đã dùng…) thành câu tiếng Việt dễ hiểu. |
| `services/auth.service.ts` | Đăng nhập/đăng ký email, đặt lại mật khẩu, đăng nhập Google qua credential, đăng xuất (kèm xóa bộ lọc của phiên). |
| `services/google-sign-in.ts` | Bọc `@react-native-google-signin`. Chỉ nạp khi có module native, nên Expo Go không crash mà báo cần development build. |
| `components/auth-layout.tsx` | Khung chung của các màn auth: tiêu đề, phụ đề, footer; kèm `OrDivider` ("hoặc"). |
| `components/google-button.tsx` | Nút "Tiếp tục với Google". |

**`profile/`: hồ sơ và khẩu vị**

| File | Ý nghĩa |
|---|---|
| `types.ts` | `UserProfile`, `TastePreferences` (mức cay, ngân sách, ẩm thực, kiểu món), `DietaryRestrictions` (dị ứng, chế độ ăn) và giá trị mặc định. |
| `profile.service.ts` | Theo dõi `users/{uid}` realtime, tự tạo hồ sơ ở lần đăng nhập đầu; lưu kết quả onboarding, khẩu vị, tên hiển thị. |
| `user-data-provider.tsx` | Một kết nối realtime duy nhất tới hồ sơ, yêu thích và lịch sử của người dùng, chia sẻ cho cả app qua `useUserData()` / `useProfile()`. |
| `components/taste-editors.tsx` | Bộ chọn khẩu vị dùng chung cho onboarding và màn Hồ sơ khẩu vị: `MultiChipSelect`, `SpicyPicker`, `BudgetPicker`, `EditorSection`. |

**`foods/`: dữ liệu món ăn**

| File | Ý nghĩa |
|---|---|
| `types.ts` | Kiểu dữ liệu món: bữa ăn, kiểu món, ẩm thực, vùng miền, dị ứng, chế độ ăn, tag, mức 0–3; `FoodSeed` (dữ liệu gốc) và `Food` (đã bổ sung trường suy ra). |
| `data/foods.ts` | **Danh mục món đóng gói trong app** (76 món): tên, giá, bữa, độ cay, nguyên liệu, calo, mô tả, độ phổ biến, món ăn kèm. Dùng được offline. |
| `data/taxonomy.ts` | Nhãn tiếng Việt và icon cho từng loại phân loại; bảng `INGREDIENT_ALLERGENS` ánh xạ nguyên liệu → chất gây dị ứng. |
| `food-repository.ts` | Cổng truy cập dữ liệu món duy nhất: `all`, `bySlug`, `search` (không dấu), `similar`, `pairings`, `drinks`, `desserts`, `popular`. Tự suy ra dị ứng từ nguyên liệu. |
| `components/food-image.tsx` | Ảnh món từ Supabase (`foods/<slug>-640.webp`); chưa có ảnh thì hiện nền màu và icon kiểu món. |
| `components/food-card.tsx` | Thẻ món dạng dọc (`FoodCard`) và dạng hàng ngang (`FoodCardCompact`). |
| `components/food-row.tsx` | Hàng cuộn ngang các thẻ món. |
| `components/food-meta.tsx` | Dòng giá · kiểu món · biểu tượng độ cay. |
| `components/favorite-button.tsx` | Nút tim có hiệu ứng nảy, bật/tắt yêu thích. |
| `components/allergen-notice.tsx` | Cảnh báo khi món chứa chất mà người dùng dị ứng. |

**`recommendation/`: bộ gợi ý món**

| File | Ý nghĩa |
|---|---|
| `engine.ts` | Thuật toán gợi ý (hàm thuần, không phụ thuộc React). Lọc cứng theo dị ứng/chế độ ăn/bộ lọc → chấm điểm theo độ phổ biến, khẩu vị, độ cay, ngân sách, thời tiết, yêu thích, lịch sử, độ mới lạ → chọn ngẫu nhiên có trọng số; kèm câu giải thích lý do. |
| `context.ts` | Suy ra bữa ăn và lời chào theo giờ; kiểu `WeatherKind`. |
| `filters.store.ts` | Zustand store cho bộ lọc hiện tại (bữa, ngân sách, kiểu món, ẩm thực, độ cay, độ phiêu lưu, món đã loại trong ngày) và các mức ngân sách có sẵn. |
| `use-recommender.ts` | Nối engine với hồ sơ, lịch sử, yêu thích, thời tiết và bộ lọc; trả về `ranked()`, `recommend()`, `recommendInstant()`. |
| `use-suggestion.ts` | Giữ món gợi ý ở Trang chủ cố định cho tới khi người dùng bấm "Món khác" hoặc đổi bữa (ghi SKIP). |
| `components/meal-chips.tsx` | Hàng chip chọn bữa Sáng / Trưa / Tối / Ăn vặt / Ăn đêm… |
| `components/suggestion-hero.tsx` | Thẻ gợi ý lớn ở Trang chủ, chuyển cảnh mượt khi đổi món. |

**`random/`: các trò random**

| File | Ý nghĩa |
|---|---|
| `components/slot-machine.tsx` | Máy xèng: cuộn danh sách món rồi dừng ở món được chọn. |
| `components/spin-wheel.tsx` | Vòng quay vẽ bằng SVG, mỗi lát một món; quay nhiều vòng rồi dừng đúng lát kết quả. |
| `components/swipe-deck.tsx` | Bộ thẻ vuốt kiểu Tinder: phải để chọn, trái để bỏ qua (Gesture Handler). |
| `pool.ts` | Xáo pool món có trọng số (cho bộ thẻ) và xen kẽ món điểm cao/thấp (cho vòng quay). |
| `use-shake.ts` | Phát hiện lắc máy qua gia tốc kế, chỉ bật khi tab Random đang mở. |

**`community/`: cộng đồng**

| File | Ý nghĩa |
|---|---|
| `types.ts` | `Post`, `PostMedia`, `LocalMedia` và giới hạn: tối đa 5 ảnh hoặc 1 video ≤ 60 giây, ≤ 50 MB/file, ≤ 1000 ký tự. |
| `schemas.ts` | Schema zod của form đăng bài. |
| `posts.service.ts` | Firestore: lấy feed phân trang (công khai / của tôi), tạo bài, thích/bỏ thích (batch ghi lượt thích và bộ đếm), xóa bài. |
| `media.service.ts` | Chọn ảnh/video từ thư viện, chụp ảnh, kiểm tra giới hạn, upload lên Supabase vào `posts/<uid>/<postId>/` (tự dọn khi lỗi), xóa file. |
| `use-posts.ts` | Hook React Query: `useFeed` (cuộn vô hạn), `useToggleLike` (cập nhật lạc quan, hoàn tác khi lỗi), `useDeletePost`. |
| `components/post-card.tsx` | Thẻ bài viết: tác giả, thời gian, media, món, số sao, nội dung, nút thích, nút xóa (bài của mình). |
| `components/post-media.tsx` | Carousel ảnh hoặc trình phát video (expo-video). |
| `components/media-picker.tsx` | Khu chọn và xem trước media khi đăng bài. |
| `components/rating-stars.tsx` | Dãy sao: chỉ hiển thị, hoặc bấm được để chấm điểm. |

**Các tính năng nhỏ**

| File | Ý nghĩa |
|---|---|
| `favorites/favorites.service.ts` | Đọc/ghi `users/{uid}/favorites`. |
| `favorites/use-favorites.ts` | `isFavorite()` và `toggle()`; thả tim còn ghi sự kiện LIKE vào lịch sử. |
| `history/types.ts` | Loại sự kiện (VIEW, LIKE, DISLIKE, SKIP, SELECT) và nơi phát sinh (home, random, wheel…). |
| `history/history.service.ts` | Ghi sự kiện và theo dõi 150 sự kiện gần nhất trong `users/{uid}/events`; engine gợi ý dùng dữ liệu này. |
| `history/use-log-interaction.ts` | Hook ghi sự kiện cho người dùng hiện tại, lỗi mạng không làm gián đoạn UI. |
| `weather/weather.service.ts` | Gọi Open-Meteo (miễn phí, không cần key) rồi phân loại Mưa / Lạnh / Nóng / Dễ chịu. |
| `weather/use-weather.ts` | Xin quyền vị trí (expo-location), lấy thời tiết và quận/huyện, cache 30 phút. |
| `weather/components/weather-pill.tsx` | Nhãn thời tiết ở Trang chủ, hoặc nút "Bật vị trí" khi chưa cấp quyền. |
| `places/external-links.ts` | Mở Google Maps tìm quán, YouTube tìm cách nấu, GrabFood đặt giao; chia sẻ món. |
| `places/components/food-actions.tsx` | Ba ô hành động Ra quán / Tự nấu / Đặt giao. |
| `settings/settings.store.ts` | Zustand store lưu bền trên máy: chế độ giao diện, giảm chuyển động, rung phản hồi. |

### `src/hooks/`, `src/lib/`, `src/theme/`, `src/utils/`

| File | Ý nghĩa |
|---|---|
| `hooks/use-async-action.ts` | Chạy một tác vụ async, quản lý `pending` và `error` (đã dịch ra câu thông báo) cho nút bấm và form. |
| `lib/env.ts` | Đọc biến `EXPO_PUBLIC_*` từ `.env` vào object `env`; cờ `isFirebaseConfigured`, `isSupabaseConfigured`, `isGoogleSignInConfigured`. |
| `lib/firebase.ts` | Khởi tạo Firebase App, Auth, Firestore một lần (lazy). Firestore bật long-polling cho ổn định trên React Native. |
| `lib/create-auth.ts` | Native: tạo Auth lưu phiên đăng nhập vào bộ nhớ máy để mở lại app vẫn còn đăng nhập. |
| `lib/create-auth.web.ts` | Web: dùng `getAuth` mặc định của trình duyệt. |
| `lib/supabase.ts` | Supabase client chỉ dùng cho Storage, tự gắn Firebase ID token vào mọi request; `getPublicStorageUrl()` tạo URL ảnh công khai. |
| `lib/kv-storage.ts` | Bộ nhớ key-value bền vững (`expo-sqlite/kv-store`) cho phiên Firebase và cài đặt. |
| `lib/kv-storage.web.ts` | Bản web dùng `localStorage`. |
| `lib/query-client.ts` | Cấu hình TanStack Query dùng chung (staleTime 60 giây, retry 1 lần). |
| `lib/haptics.ts` | Rung phản hồi (`tap`, `impact`, `success`, `warning`), tự tắt khi người dùng tắt trong Cài đặt. |
| `theme/tokens.ts` | Design token: bảng màu sáng/tối tông lạnh, spacing, bo góc, font, typography, thời lượng và easing animation, kích thước chuẩn. |
| `theme/theme-provider.tsx` | Chọn bảng màu theo cài đặt hoặc hệ thống, cung cấp `useAppTheme()` và đồng bộ theme cho thanh điều hướng. |
| `theme/use-motion.ts` | Gộp "Giảm chuyển động" của hệ thống và của app; `pick(animation)` trả `undefined` khi cần tắt hiệu ứng. |
| `theme/index.ts` | Gom export của theme. |
| `utils/format.ts` | Định dạng tiền VND, "45k", khoảng giá, thời gian tương đối ("5 phút trước"). |
| `utils/text.ts` | `normalizeVi()`: bỏ dấu tiếng Việt để tìm kiếm ("Bún chả" → "bun cha"). |

## Cài đặt

### 1. Biến môi trường

```bash
cp .env.example .env
```

Điền các giá trị theo các bước dưới. Khi chưa có `.env`, app hiện màn "Chưa cấu hình Firebase" thay vì crash.

### 2. Firebase

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm **Web app**, chép config vào các biến `EXPO_PUBLIC_FIREBASE_*`.
2. **Authentication → Sign-in method:** bật **Email/Password** và **Google**.
3. **Firestore Database:** tạo database, rồi deploy rules và index:

   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add          # chọn project vừa tạo
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### 3. Google Sign-In

1. Firebase → Authentication → Google → mục **Web SDK configuration**: chép **Web client ID** vào `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. Thêm SHA-1 của keystore debug vào Firebase → Project settings → Android app (package `com.homnayangi.app`):

   ```bash
   cd android && ./gradlew signingReport
   ```

3. iOS: điền `GOOGLE_IOS_URL_SCHEME` (reversed iOS client ID).

Đăng nhập Google dùng module native nên **không chạy trong Expo Go**; cần development build (bước 5). Đăng nhập email chạy được cả trong Expo Go.

### 4. Supabase Storage (ảnh/video)

Supabase chỉ dùng để lưu file; người dùng xác thực bằng Firebase ID token.

1. Tạo project tại [Supabase](https://supabase.com), chép **Project URL** và **anon key** vào `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. **Authentication → Sign In / Providers → Third-party Auth:** thêm **Firebase**, nhập Firebase project ID.
3. Mở **SQL Editor**, dán nội dung `supabase/storage.sql`, thay `<FIREBASE_PROJECT_ID>` rồi chạy. Lệnh này tạo bucket public `media` (≤ 50 MB/file, chỉ ảnh/video) và policy chỉ cho phép người dùng ghi/xóa trong thư mục `posts/<uid>/` của chính mình.
4. (Tùy chọn) Upload ảnh món vào `media/foods/<slug>-640.webp`. Thiếu ảnh thì app hiện placeholder theo loại món.

### 5. Chạy app

```bash
npm install

# Expo Go (không có Google Sign-In)
npx expo start

# Development build — đầy đủ tính năng
npx expo run:android
npx expo run:ios
```

Đổi `.env` xong cần khởi động lại Metro với `npx expo start -c`.

## Kiểm tra mã nguồn

```bash
npx tsc --noEmit
npx expo lint
npm run check:services   # kiểm tra kết nối Firebase + Supabase theo .env
```

## Ghi chú thiết kế

- **Gợi ý món** (`features/recommendation/engine.ts`): lọc cứng theo dị ứng/chế độ ăn → chấm điểm (độ phổ biến, khẩu vị, độ cay, ngân sách, thời tiết, yêu thích, lịch sử, độ mới lạ, đa dạng) → chọn ngẫu nhiên có trọng số (softmax) trong top 12. Món vừa ăn bị giảm điểm và hồi dần trong 7 ngày.
- **Dị ứng** được suy ra từ nguyên liệu (`INGREDIENT_ALLERGENS`), không nhập tay, theo hướng an toàn.
- **Dữ liệu Firestore:** `users/{uid}` (hồ sơ, khẩu vị), `users/{uid}/favorites`, `users/{uid}/events` (lịch sử VIEW/LIKE/DISLIKE/SKIP/SELECT), `posts/{id}` + `posts/{id}/likes/{uid}`.
- **Animation:** 150–300 ms, easing "emphasized decelerate"; tất cả hiệu ứng tắt khi bật "Giảm chuyển động" trong app hoặc hệ thống.
