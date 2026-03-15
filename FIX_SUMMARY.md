# Khắc phục Lỗi Màn Hình Đen - MindTrace

## Vấn đề gốc
Ứng dụng web hiển thị màn hình đen hoàn toàn khi tải lên.

## Nguyên nhân
1. **Import Map lỗi trong index.html** - Cấu hình ESM.sh importmap không tương thích với Vite module resolution, gây lỗi tải module React

2. **Thiếu cấu hình Gemini API Key** - File `.env.local` không tồn tại, làm cho API initialization thất bại

## Các thay đổi đã thực hiện

### 1. Xóa importmap từ index.html
**Trước:**
```html
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.4/",
    "react": "https://esm.sh/react@^19.2.4",
    "react-dom/": "https://esm.sh/react-dom@^19.2.4/",
    "@google/genai": "https://esm.sh/@google/genai@^1.40.0"
  }
}
</script>
```

**Sau:** Xóa hoàn toàn (Vite sẽ xử lý module resolution tự động)

### 2. Cập nhật geminiService.ts
Thêm kiểm tra null cho Gemini API client:

```typescript
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured. AI features will be limited.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAI();
```

Tất cả các hàm AI đều có fallback an toàn khi API không khả dụng.

### 3. Tạo file .env.local
```
GEMINI_API_KEY=your-gemini-api-key-here
```

## Để hoạt động đầy đủ

### Lấy Gemini API Key:
1. Truy cập [Google AI Studio](https://ai.google.dev)
2. Click "Get API Key"
3. Chọn hoặc tạo project Google Cloud
4. Sao chép API key

### Cập nhật .env.local:
```bash
GEMINI_API_KEY=your-actual-key-from-google-ai
```

## Giờ ứng dụng:
✅ Tải được hoàn toàn mà không có lỗi
✅ Hiển thị trang chủ bình thường
✅ Hoạt động được ngay cả khi chưa có API key (với dữ liệu mock)
✅ Đầy đủ tính năng khi có API key (AI seeding data, CV evaluation, etc.)

## Các lệnh hữu ích:
```bash
npm run dev      # Khởi động dev server
npm run build    # Build cho production
npm run preview  # Xem preview build
npm run lint     # Kiểm tra TypeScript
```

## Cấu trúc dự án:
- `/src` - Source code React
- `/src/components` - React components
- `/src/services` - Services (API, Gemini, etc.)
- `/index.html` - Entry point HTML
- `/vite.config.ts` - Cấu hình Vite

---
Cập nhật: 13/03/2026
