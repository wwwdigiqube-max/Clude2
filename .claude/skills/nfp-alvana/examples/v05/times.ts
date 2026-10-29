// All visual events are keyed to narration word times (seconds) from words.json.
import words from "./words.json";
import { sentEnd, sentStart, Word, wordAt } from "../styles/receipt-ui/kit";

export const WORDS = words as Word[];
const w = (si: number, needle: string, nth = 0) => wordAt(WORDS, si, needle, nth);
export const S = (si: number) => sentStart(WORDS, si);
export const E = (si: number) => sentEnd(WORDS, si);

export const TM = {
  deploy: w(0, "بسازی"), sale: w(0, "فروشت"), legal: w(0, "حقوقی"),
  behind: w(1, "پشتش"), product: w(1, "محصوله"), promo: w(5, "تبلیغاتی"),
  form: w(2, "فرم"), limit: w(2, "محدودیتی"), age13: w(2, "۱۳"),
  font: w(3, "لود"), ip: w(3, "IP"), leak: w(3, "منتقل"),
  sess: w(4, "Session"), behav: w(4, "رفتار"), rec: w(4, "ضبط"),
  unsub: w(5, "عضویت"), orStripe: w(5, "یا"), have: w(5, "داری", 1), terms: w(5, "شرایط"), notShown: w(5, "نشده"),
  upload: w(6, "آپلود"), dmca: w(6, "DMCA"), bad: w(6, "مشکل"),
  scary: w(7, "ترسناک"), revenue: w(7, "درآمدت"), relate: w(7, "ربطی"),
  dollar: w(8, "دلار"), user: w(8, "کاربر"), email: w(8, "ایمیل"), sess2: w(8, "سشن"),
  forget: w(9, "فراموش"),
  fast: w(10, "سریع"), guar: w(10, "تضمین"),
  claude: w(11, "Claude"), fixEnd: E(11),
  comment: w(12, "«قانون»"),
  end: E(12),
};

// fixes during sentence 12 (index 11), evenly between "Claude" and its end
export const FIX = Array.from({ length: 6 }, (_, i) => TM.claude + 0.6 + (i * (TM.fixEnd - TM.claude - 1.2)) / 5);
