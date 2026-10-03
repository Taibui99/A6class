import { HUB_PATH } from "@/lib/apps";

/**
 * Trang chính của web lớp là KHO CÔNG CỤ (`/apps`): vào web thấy danh
 * sách công cụ, chọn cái cần dùng rồi chuyển tới — thi đua nằm trong
 * lớp, các web app khác mở ở tab mới.
 *
 * Mọi luồng vào của web (đăng nhập, đăng ký, logo, `/`, vô hiệu hoá form)
 * đều dẫn về đây.
 */
export const HOME_PATH = HUB_PATH;

/** Trang thi đua — nhiệm vụ trọng tâm, nằm trong kho công cụ. */
export const COMPETITION_PATH = "/competition";