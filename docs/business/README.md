# README: Business Documentation

## Purpose
Entry Point cho toàn bộ hệ thống Business Documentation (Single Source of Truth) của SDMS. Không chứa logic nghiệp vụ. Chỉ hướng dẫn cách sử dụng và quản trị tài liệu.

## Scope
Toàn bộ dự án SDMS: Backend, Frontend, Mobile, ESP32, AI Server, Luận văn tốt nghiệp.

## Source of Truth
Mã nguồn Backend tại `sdms-backend/src/main/java/com/sdms/backend/`. Bộ tài liệu này là OUTPUT của quá trình Reverse Engineering — không phải thiết kế tương lai.

## Version
Business Baseline v1.0 — Frozen after final audit 2026-07-04.

## Contents
Bộ tài liệu gồm 10 files:

| # | File | Mô tả |
|---|---|---|
| 1 | `README.md` | Entry point, governance (file này) |
| 2 | `BUSINESS_DOMAIN_SPECIFICATION.md` | Tổng quan Domain, Bounded Context, Capabilities |
| 3 | `BUSINESS_GLOSSARY.md` | Từ điển thuật ngữ — Ubiquitous Language |
| 4 | `BUSINESS_RULES.md` | Các quy tắc nghiệp vụ được enforce trong code |
| 5 | `BUSINESS_WORKFLOWS.md` | Các luồng xử lý theo trình tự |
| 6 | `STATE_MACHINES.md` | Vòng đời trạng thái của các thực thể |
| 7 | `PERMISSION_MATRIX.md` | Ma trận phân quyền RBAC |
| 8 | `BUSINESS_DECISIONS.md` | Quyết định kiến trúc và nghiệp vụ (ADR) |
| 9 | `BUSINESS_ASSUMPTIONS.md` | Giả định thực tế được phản ánh trong code |
| 10 | `BUSINESS_FAQ.md` | Hỏi đáp nghiệp vụ nhanh |

## Reading Order
1. **DOMAIN SPECIFICATION** — Bức tranh tổng thể.
2. **GLOSSARY** — Thống nhất ngôn ngữ.
3. **WORKFLOWS** — Luồng xử lý theo nghiệp vụ.
4. **STATE MACHINES** — Vòng đời trạng thái.
5. **RULES** — Ràng buộc và validation.
6. **PERMISSION MATRIX** — Ai được làm gì.
7. **DECISIONS** — Tại sao hệ thống thiết kế như vậy.
8. **ASSUMPTIONS** — Giới hạn thực tế.
9. **FAQ** — Giải đáp thắc mắc nhanh.

## Governance & Update Policy
- Mọi thay đổi nghiệp vụ phải cập nhật vào bộ tài liệu này **đồng thời** khi sửa source code.
- Mỗi kết luận trong tài liệu **bắt buộc** phải có `Evidence` trỏ đến Source Code.
- Không được phép định nghĩa lại một thuật ngữ đã có trong `BUSINESS_GLOSSARY.md`. Dùng relative link để tham chiếu.
- Không được thêm nghiệp vụ tương lai, roadmap, hoặc đề xuất vào bộ tài liệu này.

## Freeze Policy
Bộ tài liệu này được đóng băng (Frozen) sau khi hoàn tất Final Audit. Mọi thay đổi sau khi Freeze phải được ghi nhận trong một ADR mới tại `BUSINESS_DECISIONS.md`.
